import fs from "node:fs";
import path from "node:path";

import * as XLSX from "xlsx";

import { extractTrackerRows } from "@/lib/tracker/importer";
import type { TrackerTask } from "@/lib/tracker/types";

function getCliArg(flag: string) {
  const index = process.argv.findIndex((value) => value === flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function buildSeedTasks() {
  const filePath = path.resolve(
    process.cwd(),
    getCliArg("--file") ?? "./TRACKER CEO.xlsx",
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontro el archivo de Excel en ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const importResult = extractTrackerRows(workbook);
  const generatedAt = new Date().toISOString();

  const tasks: TrackerTask[] = importResult.rows.map((row) => ({
    id: `seed-${row.source_row ?? "manual"}`,
    source_row: row.source_row ?? null,
    order_number: row.order_number ?? null,
    concepto: row.concepto,
    responsable: row.responsable ?? "",
    status: row.status ?? "atencion",
    comentarios: row.comentarios ?? "",
    fecha_raw: row.fecha_raw ?? "",
    fecha_iso: row.fecha_iso ?? null,
    created_at: generatedAt,
    updated_at: generatedAt,
  }));

  return {
    filePath,
    generatedAt,
    headerRow: importResult.headerRow,
    importedRows: importResult.rows.length,
    skippedRows: importResult.skippedRows,
    activeCount: importResult.activeCount,
    completedCount: importResult.completedCount,
    inferredYear: importResult.inferredYear,
    tasks,
  };
}

async function main() {
  const seed = buildSeedTasks();
  const outputPath = path.resolve(process.cwd(), "data", "tracker-public.json");

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(
      {
        generatedAt: seed.generatedAt,
        tasks: seed.tasks,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(
    JSON.stringify(
      {
        outputPath,
        filePath: seed.filePath,
        headerRow: seed.headerRow,
        importedRows: seed.importedRows,
        skippedRows: seed.skippedRows,
        activeCount: seed.activeCount,
        completedCount: seed.completedCount,
        inferredYear: seed.inferredYear,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
