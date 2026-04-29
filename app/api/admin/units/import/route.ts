import { NextRequest } from "next/server";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireAdminSession, logAudit } from "@/lib/auth";

interface UnitRow {
  code_unite: string;
  libelle_unite: string;
}

interface ImportReport {
  total: number;
  upserted: number;
  skipped: number;
  errors: string[];
}

async function parseCSV(text: string): Promise<UnitRow[]> {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });
  return result.data.map((row) => ({
    code_unite: (row["code_unite"] ?? row["code"] ?? "").trim(),
    libelle_unite: (row["libelle_unite"] ?? row["libelle"] ?? row["label"] ?? "").trim(),
  }));
}

async function parseXLSX(buffer: ArrayBuffer): Promise<UnitRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  const sheet = workbook.worksheets[0];
  const rows: UnitRow[] = [];

  const headerRow = sheet.getRow(1);
  const headers: Record<number, string> = {};
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = String(cell.value ?? "").trim().toLowerCase();
  });

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const rowData: Record<string, string> = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber];
      if (header) rowData[header] = String(cell.value ?? "").trim();
    });
    rows.push({
      code_unite: (rowData["code_unite"] ?? rowData["code"] ?? "").trim(),
      libelle_unite: (rowData["libelle_unite"] ?? rowData["libelle"] ?? rowData["label"] ?? "").trim(),
    });
  });

  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("Fichier requis", 400);
    }

    const fileName = file.name.toLowerCase();
    let rows: UnitRow[] = [];

    if (fileName.endsWith(".csv")) {
      const text = await file.text();
      rows = await parseCSV(text);
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      rows = await parseXLSX(await file.arrayBuffer());
    } else {
      return apiError("Format de fichier non supporté. Utilisez CSV ou XLSX.", 400);
    }

    if (rows.length === 0) {
      return apiError("Le fichier est vide ou ne contient pas de données valides.", 400);
    }

    const report: ImportReport = {
      total: rows.length,
      upserted: 0,
      skipped: 0,
      errors: [],
    };

    for (const row of rows) {
      if (!row.code_unite || !row.libelle_unite) {
        report.skipped++;
        report.errors.push(
          `Ligne ignorée: code_unite ou libelle_unite manquant (code="${row.code_unite}")`
        );
        continue;
      }

      try {
        await prisma.unit.upsert({
          where: { code: row.code_unite },
          create: {
            code: row.code_unite,
            label: row.libelle_unite,
            isActive: true,
          },
          update: {
            label: row.libelle_unite,
            isActive: true,
          },
        });
        report.upserted++;
      } catch {
        report.skipped++;
        report.errors.push(`Erreur pour l'unité "${row.code_unite}"`);
      }
    }

    await logAudit({
      action: "UNITS_IMPORTED",
      entity: "Unit",
      adminId: session.id,
      details: { total: report.total, upserted: report.upserted },
    });

    return apiSuccess(report);
  } catch (error) {
    return handleApiError(error);
  }
}
