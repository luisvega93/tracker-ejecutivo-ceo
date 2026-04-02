import * as XLSX from "xlsx";

import { TRACKER_HEADERS, TRACKER_SHEET_NAME } from "@/lib/tracker/constants";
import type {
  ImportWorkbookResult,
  TrackerStatus,
  TrackerTaskUpsert,
} from "@/lib/tracker/types";
import { normalizeWhitespace } from "@/lib/utils";

const EXCEL_ERROR_PATTERN =
  /^#(NAME\?|N\/A|VALUE!|REF!|DIV\/0!|NUM!|NULL!|SPILL!|CALC!|FIELD!|GETTING_DATA)$/i;

const MONTH_MAP: Record<string, number> = {
  ENE: 1,
  ENERO: 1,
  JAN: 1,
  JANUARY: 1,
  FEB: 2,
  FEBRERO: 2,
  FEBRUARY: 2,
  MAR: 3,
  MARZO: 3,
  APR: 4,
  ABR: 4,
  ABRIL: 4,
  APRIL: 4,
  MAY: 5,
  MAYO: 5,
  JUN: 6,
  JUNIO: 6,
  JUL: 7,
  JULIO: 7,
  AUG: 8,
  AGO: 8,
  AGOSTO: 8,
  SEP: 9,
  SEPT: 9,
  SEPTIEMBRE: 9,
  OCT: 10,
  OCTUBRE: 10,
  NOV: 11,
  NOVIEMBRE: 11,
  DEC: 12,
  DIC: 12,
  DICIEMBRE: 12,
};

function normalizeHeaderValue(value: string) {
  return normalizeWhitespace(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function sanitizeCellText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const stringValue = normalizeWhitespace(String(value).replace(/\u00a0/g, " "));

  if (EXCEL_ERROR_PATTERN.test(stringValue)) {
    return "";
  }

  return stringValue;
}

function getCell(sheet: XLSX.WorkSheet, rowIndex: number, columnIndex: number) {
  const address = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
  return sheet[address];
}

function getCellDisplayText(cell?: XLSX.CellObject) {
  if (!cell) {
    return "";
  }

  if (cell.t === "e") {
    return "";
  }

  if (typeof cell.w === "string") {
    return sanitizeCellText(cell.w);
  }

  return sanitizeCellText(cell.v);
}

function inferHeaderMap(sheet: XLSX.WorkSheet) {
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1:A1");
  const normalizedHeaders = TRACKER_HEADERS.map(normalizeHeaderValue);

  for (
    let rowIndex = range.s.r;
    rowIndex <= Math.min(range.e.r, range.s.r + 10);
    rowIndex += 1
  ) {
    const map = new Map<string, number>();

    for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex += 1) {
      const headerText = normalizeHeaderValue(
        getCellDisplayText(getCell(sheet, rowIndex, columnIndex)),
      );

      if (headerText) {
        map.set(headerText, columnIndex);
      }
    }

    if (normalizedHeaders.every((header) => map.has(header))) {
      return { headerRow: rowIndex, headerMap: map };
    }
  }

  throw new Error("No se encontraron los encabezados esperados en la hoja Tracker.");
}

function parseExcelSerialDate(serial: number) {
  const parsed = XLSX.SSF.parse_date_code(serial);

  if (!parsed || !parsed.y || !parsed.m || !parsed.d) {
    return null;
  }

  return `${parsed.y.toString().padStart(4, "0")}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
}

function getIsoFromCell(cell?: XLSX.CellObject) {
  if (!cell) {
    return null;
  }

  if (cell.t === "d" && cell.v instanceof Date) {
    return cell.v.toISOString().slice(0, 10);
  }

  if (cell.t === "n" && typeof cell.v === "number") {
    return parseExcelSerialDate(cell.v);
  }

  return null;
}

function getInferredYear(
  sheet: XLSX.WorkSheet,
  fechaColumnIndex: number,
  startRow: number,
  endRow: number,
) {
  const counts = new Map<number, number>();

  for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
    const iso = getIsoFromCell(getCell(sheet, rowIndex, fechaColumnIndex));

    if (!iso) {
      continue;
    }

    const year = Number(iso.slice(0, 4));
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }

  let dominantYear: number | null = null;
  let maxCount = 0;

  counts.forEach((count, year) => {
    if (count > maxCount) {
      dominantYear = year;
      maxCount = count;
    }
  });

  return dominantYear;
}

export function mapExcelStatus(rawStatus: string): TrackerStatus {
  const normalized = normalizeHeaderValue(rawStatus);

  if (!normalized || normalized === "PENDIENTE" || normalized === "NECESITA ATENCION") {
    return "atencion";
  }

  if (normalized === "PROCESO" || normalized === "ACCION" || normalized === "EN AVANCE") {
    return "en_avance";
  }

  if (normalized === "CERRADO" || normalized === "COMPLETADO") {
    return "completado";
  }

  if (normalized === "ATORADO") {
    return "atorado";
  }

  return "atencion";
}

export function parseSingleDateText(displayValue: string, fallbackYear: number | null) {
  const cleaned = normalizeHeaderValue(displayValue).replace(/\./g, "");

  if (
    !cleaned ||
    cleaned.includes("SIN FECHA") ||
    cleaned.includes("AVANCES SEMANALES")
  ) {
    return null;
  }

  if (/^\d{1,2}\s*-\s*\d{1,2}\s+[A-Z]+$/.test(cleaned)) {
    return null;
  }

  const match = cleaned.match(/^(\d{1,2})\s*[-/ ]\s*([A-Z]+)$/);

  if (!match || !fallbackYear) {
    return null;
  }

  const [, dayValue, monthToken] = match;
  const month = MONTH_MAP[monthToken];

  if (!month) {
    return null;
  }

  const day = Number(dayValue);

  if (day < 1 || day > 31) {
    return null;
  }

  return `${fallbackYear.toString().padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function resolveFechaIso(
  cell: XLSX.CellObject | undefined,
  fechaRaw: string,
  fallbackYear: number | null,
) {
  return getIsoFromCell(cell) ?? parseSingleDateText(fechaRaw, fallbackYear);
}

export function extractTrackerRows(
  workbook: XLSX.WorkBook,
  sheetName = TRACKER_SHEET_NAME,
): ImportWorkbookResult {
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`No se encontro la hoja "${sheetName}" en el archivo de Excel.`);
  }

  const { headerRow, headerMap } = inferHeaderMap(sheet);
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1:A1");
  const fechaColumnIndex = headerMap.get(normalizeHeaderValue("FECHA COMPROMISO"));

  if (fechaColumnIndex === undefined) {
    throw new Error("No se pudo ubicar la columna FECHA COMPROMISO.");
  }

  const inferredYear =
    getInferredYear(sheet, fechaColumnIndex, headerRow + 1, range.e.r) ??
    new Date().getUTCFullYear();

  const rows: TrackerTaskUpsert[] = [];
  let skippedRows = 0;
  let activeCount = 0;
  let completedCount = 0;

  for (let rowIndex = headerRow + 1; rowIndex <= range.e.r; rowIndex += 1) {
    const conceptoCell = getCell(
      sheet,
      rowIndex,
      headerMap.get(normalizeHeaderValue("ASUNTO"))!,
    );
    const concepto = sanitizeCellText(getCellDisplayText(conceptoCell));

    if (!concepto) {
      skippedRows += 1;
      continue;
    }

    const orderNumber = sanitizeCellText(
      getCellDisplayText(
        getCell(sheet, rowIndex, headerMap.get(normalizeHeaderValue("#"))!),
      ),
    );
    const responsable = sanitizeCellText(
      getCellDisplayText(
        getCell(sheet, rowIndex, headerMap.get(normalizeHeaderValue("RESPONSABLE"))!),
      ),
    );
    const rawStatus = sanitizeCellText(
      getCellDisplayText(
        getCell(sheet, rowIndex, headerMap.get(normalizeHeaderValue("ESTATUS"))!),
      ),
    );
    const comentarios = sanitizeCellText(
      getCellDisplayText(
        getCell(sheet, rowIndex, headerMap.get(normalizeHeaderValue("COMENTARIOS"))!),
      ),
    );
    const fechaCell = getCell(sheet, rowIndex, fechaColumnIndex);
    const fechaRaw = sanitizeCellText(getCellDisplayText(fechaCell));
    const status = mapExcelStatus(rawStatus);
    const fechaIso = resolveFechaIso(fechaCell, fechaRaw, inferredYear);

    if (status === "completado") {
      completedCount += 1;
    } else {
      activeCount += 1;
    }

    rows.push({
      source_row: rowIndex + 1,
      order_number: orderNumber || null,
      concepto,
      responsable,
      status,
      comentarios,
      fecha_raw: fechaRaw,
      fecha_iso: fechaIso,
    });
  }

  return {
    rows,
    headerRow: headerRow + 1,
    skippedRows,
    activeCount,
    completedCount,
    inferredYear,
  };
}
