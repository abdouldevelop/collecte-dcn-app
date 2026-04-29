import { NextRequest } from "next/server";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";
import { ProductType } from "@prisma/client";

interface ProductRow {
  code: string;
  designation: string;
  type: string;
}

interface ImportReport {
  total: number;
  created: number;
  skipped: number;
  errors: string[];
}

function normalizeType(raw: string): ProductType {
  const upper = raw.toUpperCase().trim();
  if (upper === "IMPORT") return "IMPORT";
  if (upper === "EXPORT") return "EXPORT";
  return "IMPORT_EXPORT";
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
    type: (row["type"] ?? "IMPORT_EXPORT").trim(),
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
      type: rowData["type"] ?? "IMPORT_EXPORT",
    });
  });

  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireCompanySession();

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
      skipped: 0,
      errors: [],
    };

    for (const row of rows) {
      if (!row.code || !row.designation) {
        report.skipped++;
        report.errors.push(`Ligne ignorée: code ou désignation manquant (code="${row.code}")`);
        continue;
      }

      try {
        // Check if product code already exists
        const existingProduct = await prisma.product.findUnique({
          where: { code: row.code },
        });

        if (existingProduct) {
          // Check if CompanyProduct exists
          const existingCP = await prisma.companyProduct.findUnique({
            where: {
              companyId_productId: {
                companyId: session.id,
                productId: existingProduct.id,
              },
            },
          });

          if (existingCP) {
            report.skipped++;
            report.errors.push(`Produit ignoré: code "${row.code}" déjà associé à votre entreprise`);
          } else {
            // Associate existing product
            await prisma.companyProduct.create({
              data: {
                companyId: session.id,
                productId: existingProduct.id,
              },
            });
            report.created++;
          }
          continue;
        }

        await prisma.$transaction(async (tx) => {
          const product = await tx.product.create({
            data: {
              code: row.code,
              designation: row.designation,
              type: normalizeType(row.type),
              source: "COMPANY",
            },
          });
          await tx.companyProduct.create({
            data: {
              companyId: session.id,
              productId: product.id,
            },
          });
        });

        report.created++;
      } catch {
        report.skipped++;
        report.errors.push(`Erreur pour le produit "${row.code}": erreur inattendue`);
      }
    }

    return apiSuccess(report);
  } catch (error) {
    return handleApiError(error);
  }
}
