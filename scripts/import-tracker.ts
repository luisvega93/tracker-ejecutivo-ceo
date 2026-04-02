import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";
import * as XLSX from "xlsx";

import { getSeedExcelPath } from "@/lib/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { extractTrackerRows } from "@/lib/tracker/importer";

dotenv.config({ path: ".env.local" });
dotenv.config();

function getCliArg(flag: string) {
  const index = process.argv.findIndex((value) => value === flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

async function main() {
  const filePath = path.resolve(process.cwd(), getCliArg("--file") ?? getSeedExcelPath());

  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontro el archivo de Excel en ${filePath}`);
  }

  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const importResult = extractTrackerRows(workbook);

  const { error } = await supabase.from("tracker_tasks").upsert(importResult.rows, {
    onConflict: "source_row",
    ignoreDuplicates: false,
  });

  if (error) {
    throw new Error(`No fue posible importar las tareas: ${error.message}`);
  }

  console.log(
    JSON.stringify(
      {
        filePath,
        headerRow: importResult.headerRow,
        importedRows: importResult.rows.length,
        skippedRows: importResult.skippedRows,
        activeCount: importResult.activeCount,
        completedCount: importResult.completedCount,
        inferredYear: importResult.inferredYear,
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
