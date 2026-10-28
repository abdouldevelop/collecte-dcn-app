import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import { ProductType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireAdminSession, logAudit } from "@/lib/auth";
import { sendInvitationEmail } from "@/lib/mail";

interface InvitationRow {
  name_entreprise: string;
  email: string;
  rccm: string;
  ncc: string;
  code_produit: string;
  designation_produit: string;
  type_produit: string;
}

interface ImportReport {
  total: number;
  created: number;
  existingCompanies: number;
  productsLinked: number;
  skipped: number;
  errors: string[];
}

function normalizeType(value: string): ProductType {
  return value.trim().toUpperCase() === "EXPORT" ? "EXPORT" : "IMPORT";
}

function mapRow(row: Record<string, string>): InvitationRow {
  return {
    name_entreprise: (row.name_entreprise ?? row.nom_entreprise ?? row.raison_sociale ?? "").trim(),
    email: (row.email ?? "").trim().toLowerCase(),
    rccm: (row.rccm ?? row.nrc ?? "").trim(),
    ncc: (row.ncc ?? "").trim(),
    code_produit: (row.code_produit ?? row.code ?? "").trim(),
    designation_produit: (row.designation_produit ?? row.designation ?? "").trim(),
    type_produit: (row.type_produit ?? row.type ?? "IMPORT").trim(),
  };
}

async function parseCSV(text: string): Promise<InvitationRow[]> {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });
  return result.data.map(mapRow);
}

async function parseXLSX(buffer: ArrayBuffer): Promise<InvitationRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];
  const headers: Record<number, string> = {};
  sheet.getRow(1).eachCell((cell, column) => {
    headers[column] = String(cell.value ?? "").trim().toLowerCase();
  });
  const rows: InvitationRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values: Record<string, string> = {};
    row.eachCell((cell, column) => {
      if (headers[column]) values[headers[column]] = String(cell.value ?? "").trim();
    });
    rows.push(mapRow(values));
  });
  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return apiError("Fichier requis", 400);

    const fileName = file.name.toLowerCase();
    const rows = fileName.endsWith(".csv")
      ? await parseCSV(await file.text())
      : fileName.endsWith(".xlsx") || fileName.endsWith(".xls")
        ? await parseXLSX(await file.arrayBuffer())
        : null;
    if (!rows) return apiError("Format non supporté. Utilisez CSV ou XLSX.", 400);
    if (rows.length === 0) return apiError("Le fichier est vide.", 400);

    const report: ImportReport = { total: rows.length, created: 0, existingCompanies: 0, productsLinked: 0, skipped: 0, errors: [] };
    const groups = new Map<string, InvitationRow[]>();
    for (const row of rows) {
      if (!row.name_entreprise || (!row.email && !row.ncc)) {
        report.skipped++;
        report.errors.push("Ligne ignorée : raison sociale manquante, ou email et NCC tous deux absents.");
        continue;
      }
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        report.skipped++;
        report.errors.push(`Email invalide : ${row.email}`);
        continue;
      }
      const groupKey = row.email || `ncc:${row.ncc}`;
      groups.set(groupKey, [...(groups.get(groupKey) ?? []), row]);
    }

    for (const companyRows of groups.values()) {
      const companyInfo = companyRows[0];
      const email = companyInfo.email;
      try {
        const existingCompany = email ? await prisma.company.findUnique({ where: { email } }) : null;
        let invitationId: string | null = null;
        let invitationToken: string | null = null;
        if (existingCompany) {
          report.existingCompanies++;
        } else {
          const token = randomUUID();
          const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
          const existingInvitation = await prisma.companyInvitation.findFirst({
            where: email
              ? { email, status: { in: ["PENDING", "EXPIRED"] } }
              : { ncc: companyInfo.ncc, isDraft: true },
            orderBy: { createdAt: "desc" },
          });
          const invitation = existingInvitation
            ? await prisma.companyInvitation.update({
                where: { id: existingInvitation.id },
                data: { token, email: email || null, expiresAt, status: email ? "PENDING" : "CANCELLED", isDraft: !email, companyName: companyInfo.name_entreprise, rccm: companyInfo.rccm || null, ncc: companyInfo.ncc || null, adminId: session.id },
              })
            : await prisma.companyInvitation.create({
                data: { token, expiresAt, status: email ? "PENDING" : "CANCELLED", isDraft: !email, companyName: companyInfo.name_entreprise, email: email || null, rccm: companyInfo.rccm || null, ncc: companyInfo.ncc || null, adminId: session.id },
              });
          invitationId = invitation.id;
          invitationToken = email ? token : null;
          if (!existingInvitation) report.created++;
        }

        for (const row of companyRows) {
          if (!row.code_produit && !row.designation_produit) continue;
          if (!row.code_produit || !row.designation_produit) {
            report.skipped++;
            report.errors.push(`${email} : code ou désignation produit manquant.`);
            continue;
          }
          const product = await prisma.product.upsert({
            where: { code: row.code_produit },
            update: { designation: row.designation_produit, type: normalizeType(row.type_produit), source: "ADMIN", isActive: true },
            create: { code: row.code_produit, designation: row.designation_produit, type: normalizeType(row.type_produit), source: "ADMIN" },
          });
          if (existingCompany) {
            await prisma.companyProduct.upsert({
              where: { companyId_productId: { companyId: existingCompany.id, productId: product.id } },
              update: { isActive: true },
              create: { companyId: existingCompany.id, productId: product.id },
            });
          } else if (invitationId) {
            await prisma.companyInvitationProduct.upsert({
              where: { invitationId_productId: { invitationId, productId: product.id } },
              update: {},
              create: { invitationId, productId: product.id },
            });
          }
          report.productsLinked++;
        }

        if (invitationToken && email) {
          await sendInvitationEmail({ to: email, companyName: companyInfo.name_entreprise, token: invitationToken });
        }
      } catch (error) {
        report.skipped += companyRows.length;
        report.errors.push(`${email} : ${error instanceof Error ? error.message : "erreur inattendue"}`);
      }
    }

    await logAudit({
      action: "INVITATIONS_WITH_PRODUCTS_IMPORTED",
      entity: "CompanyInvitation",
      adminId: session.id,
      details: { created: report.created, existingCompanies: report.existingCompanies, productsLinked: report.productsLinked },
    });
    return apiSuccess(report);
  } catch (error) {
    return handleApiError(error);
  }
}
