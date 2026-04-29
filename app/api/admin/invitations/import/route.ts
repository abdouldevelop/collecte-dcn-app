import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireAdminSession, logAudit } from "@/lib/auth";
import { sendInvitationEmail } from "@/lib/mail";

interface InvitationRow {
  name_entreprise: string;
  email: string;
  rccm: string;
  ncc: string;
}

interface ImportReport {
  total: number;
  created: number;
  skipped: number;
  errors: string[];
}

async function parseCSV(text: string): Promise<InvitationRow[]> {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });
  return result.data.map((row) => ({
    name_entreprise: (row["name_entreprise"] ?? row["nom_entreprise"] ?? "").trim(),
    email: (row["email"] ?? "").trim(),
    rccm: (row["rccm"] ?? "").trim(),
    ncc: (row["ncc"] ?? "").trim(),
  }));
}

async function parseXLSX(buffer: ArrayBuffer): Promise<InvitationRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  const sheet = workbook.worksheets[0];
  const rows: InvitationRow[] = [];

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
      name_entreprise: (rowData["name_entreprise"] ?? rowData["nom_entreprise"] ?? "").trim(),
      email: rowData["email"] ?? "",
      rccm: rowData["rccm"] ?? "",
      ncc: rowData["ncc"] ?? "",
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
    let rows: InvitationRow[] = [];

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
      if (!row.name_entreprise || !row.email) {
        report.skipped++;
        report.errors.push(
          `Ligne ignorée: nom_entreprise ou email manquant (email="${row.email}")`
        );
        continue;
      }

      // Basic email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        report.skipped++;
        report.errors.push(`Email invalide: "${row.email}"`);
        continue;
      }

      try {
        // Check for existing pending invitation
        const existingInvitation = await prisma.companyInvitation.findFirst({
          where: { email: row.email, status: "PENDING" },
        });
        if (existingInvitation) {
          report.skipped++;
          report.errors.push(`Invitation déjà en cours pour: "${row.email}"`);
          continue;
        }

        // Check for existing company
        const existingCompany = await prisma.company.findUnique({
          where: { email: row.email },
        });
        if (existingCompany) {
          report.skipped++;
          report.errors.push(`Compte déjà existant pour: "${row.email}"`);
          continue;
        }

        const token = uuidv4();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const invitation = await prisma.companyInvitation.create({
          data: {
            token,
            companyName: row.name_entreprise,
            email: row.email,
            rccm: row.rccm || null,
            ncc: row.ncc || null,
            expiresAt,
            adminId: session.id,
            status: "PENDING",
          },
        });

        // Send invitation email
        try {
          await sendInvitationEmail({
            to: row.email,
            companyName: row.name_entreprise,
            token,
          });
        } catch (mailErr) {
          console.error(`Failed to send email to ${row.email}:`, mailErr);
        }

        await logAudit({
          action: "INVITATION_BULK_CREATED",
          entity: "CompanyInvitation",
          entityId: invitation.id,
          adminId: session.id,
          details: { email: row.email, companyName: row.name_entreprise },
        });

        report.created++;
      } catch {
        report.skipped++;
        report.errors.push(`Erreur lors du traitement de "${row.email}"`);
      }
    }

    return apiSuccess(report);
  } catch (error) {
    return handleApiError(error);
  }
}
