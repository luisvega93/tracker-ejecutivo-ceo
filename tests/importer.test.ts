import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";

import {
  extractTrackerRows,
  mapExcelStatus,
  parseSingleDateText,
  resolveFechaIso,
} from "@/lib/tracker/importer";

describe("tracker importer helpers", () => {
  it("maps legacy Excel statuses to the new enum", () => {
    expect(mapExcelStatus("PROCESO")).toBe("en_avance");
    expect(mapExcelStatus("ACCIÓN")).toBe("en_avance");
    expect(mapExcelStatus("PENDIENTE")).toBe("atencion");
    expect(mapExcelStatus("")).toBe("atencion");
    expect(mapExcelStatus("CERRADO")).toBe("completado");
    expect(mapExcelStatus("ATORADO")).toBe("atorado");
  });

  it("parses only safe single-date labels", () => {
    expect(parseSingleDateText("18-Mar", 2026)).toBe("2026-03-18");
    expect(parseSingleDateText("31 MARZO", 2026)).toBe("2026-03-31");
    expect(parseSingleDateText("23-27 MARZO", 2026)).toBeNull();
    expect(parseSingleDateText("SIN FECHA", 2026)).toBeNull();
    expect(parseSingleDateText("AVANCES SEMANALES", 2026)).toBeNull();
    expect(parseSingleDateText("", 2026)).toBeNull();
  });

  it("prefers real excel dates and keeps label-only values as raw text", () => {
    const realDateCell: XLSX.CellObject = {
      t: "n",
      v: 46099,
      w: "18-Mar",
    };

    expect(resolveFechaIso(realDateCell, "18-Mar", 2026)).toBe("2026-03-18");
    expect(resolveFechaIso(undefined, "23-27 MARZO", 2026)).toBeNull();
  });

  it("extracts rows, trims whitespace and skips blank asuntos", () => {
    const worksheet = XLSX.utils.aoa_to_sheet(
      [
        ["", "", "", "", "", ""],
        ["#", "ASUNTO", "RESPONSABLE", "ESTATUS", "COMENTARIOS", "FECHA COMPROMISO"],
        [1, "  CARTERA VENCIDA  ", " ANA - ELOISA ", "ACCIÓN", " #NAME? ", new Date(Date.UTC(2026, 2, 18))],
        [2, "BB - HOLDING ", " JC-DR ", "PENDIENTE", " Seguimiento ", "23-27 MARZO"],
        [3, "   ", "LUIS", "PROCESO", "No debe entrar", ""],
        [4, "DOCUMENTO", "JC", "CERRADO", "Listo", "9-Mar"],
        [5, "AVANCE SEMANAL", "BM", "", "", "SIN FECHA"],
      ],
      { cellDates: true },
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tracker");

    const result = extractTrackerRows(workbook);

    expect(result.headerRow).toBe(2);
    expect(result.rows).toHaveLength(4);
    expect(result.skippedRows).toBe(1);
    expect(result.activeCount).toBe(3);
    expect(result.completedCount).toBe(1);

    expect(result.rows[0]).toMatchObject({
      source_row: 3,
      concepto: "CARTERA VENCIDA",
      responsable: "ANA - ELOISA",
      comentarios: "",
      status: "en_avance",
      fecha_iso: "2026-03-18",
    });

    expect(result.rows[1]).toMatchObject({
      concepto: "BB - HOLDING",
      status: "atencion",
      fecha_raw: "23-27 MARZO",
      fecha_iso: null,
    });

    expect(result.rows[2]).toMatchObject({
      concepto: "DOCUMENTO",
      status: "completado",
      fecha_iso: "2026-03-09",
    });

    expect(result.rows[3]).toMatchObject({
      concepto: "AVANCE SEMANAL",
      status: "atencion",
      fecha_raw: "SIN FECHA",
      fecha_iso: null,
    });
  });
});
