import { NextRequest } from "next/server";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireAdminSession, logAudit } from "@/lib/auth";
import { ProductType } from "@prisma/client";

interface ProductRow {
  code: string;
  designation: string;
  type: string;
}

interface ImportReport {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

function normalizeType(raw: string): ProductType {
  const upper = raw.toUpperCase().trim();
  if (upper === "EXPORT") return "EXPORT";
  return "IMPORT";
}

async function parseCSV(text: string): Promise<ProductRow[]> {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });
  return result.data.map((row) => ({
    code: (row["code"] ?? "").trim(),
    designation: (row["designation"] ?? "").trim(),
    type: (row["type"] ?? "IMPORT").trim(),
  }));
}

async function parseXLSX(buffer: ArrayBuffer): Promise<ProductRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  const sheet = workbook.worksheets[0];
  const rows: ProductRow[] = [];

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
      code: rowData["code"] ?? "",
      designation: rowData["designation"] ?? "",
      type: rowData["type"] ?? "IMPORT",
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
    let rows: ProductRow[] = [];

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
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    for (const row of rows) {
      if (!row.code || !row.designation) {
        report.skipped++;
        report.errors.push(
          `Ligne ignorée: code ou désignation manquant (code="${row.code}")`
        );
        continue;
      }

      try {
        const existing = await prisma.product.findUnique({
          where: { code: row.code },
        });

        if (existing) {
          // Update existing product (even if it was company-created, admin overrides)
          await prisma.product.update({
            where: { code: row.code },
            data: {
              designation: row.designation,
              type: normalizeType(row.type),
              source: "ADMIN",
              isActive: true,
            },
          });
          report.updated++;
        } else {
          await prisma.product.create({
            data: {
              code: row.code,
              designation: row.designation,
              type: normalizeType(row.type),
              source: "ADMIN",
              isActive: true,
            },
          });
          report.created++;
        }
      } catch {
        report.skipped++;
        report.errors.push(`Erreur pour le produit "${row.code}"`);
      }
    }

    await logAudit({
      action: "ADMIN_PRODUCTS_IMPORTED",
      entity: "Product",
      adminId: session.id,
      details: { total: report.total, created: report.created, updated: report.updated },
    });

    return apiSuccess(report);
  } catch (error) {
    return handleApiError(error);
  }
}
