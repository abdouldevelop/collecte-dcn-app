import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { apiError, handleApiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("periodId");

    if (!periodId) {
      return apiError("periodId requis", 400);
    }

    const period = await prisma.period.findUnique({ where: { id: periodId } });
    if (!period) {
      return apiError("Période introuvable", 404);
    }

    // Fetch all import declarations for the period
    const importDeclarations = await prisma.importDeclaration.findMany({
      where: { periodId },
      include: {
        company: { select: { id: true, name: true, email: true, rccm: true } },
        lines: {
          include: {
            companyProduct: {
              include: {
                product: {
                  select: { code: true, designation: true, type: true },
                },
              },
            },
            unit: { select: { code: true, label: true } },
          },
        },
      },
    });

    // Fetch all export declarations for the period
    const exportDeclarations = await prisma.exportDeclaration.findMany({
      where: { periodId },
      include: {
        company: { select: { id: true, name: true, email: true, rccm: true } },
        lines: {
          include: {
            companyProduct: {
              include: {
                product: {
                  select: { code: true, designation: true, type: true },
                },
              },
            },
            unit: { select: { code: true, label: true } },
          },
        },
      },
    });

    // Build Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Collecte DCN";
    workbook.created = new Date();

    // ── Import Sheet ──────────────────────────────────────────────────────────
    const importSheet = workbook.addWorksheet("Déclarations Import");
    importSheet.columns = [
      { header: "Entreprise", key: "companyName", width: 30 },
      { header: "Email", key: "companyEmail", width: 25 },
      { header: "RCCM", key: "rccm", width: 15 },
      { header: "Statut", key: "status", width: 15 },
      { header: "Code Produit", key: "productCode", width: 15 },
      { header: "Désignation", key: "designation", width: 30 },
      { header: "Prix Min", key: "priceMin", width: 12 },
      { header: "Prix Max", key: "priceMax", width: 12 },
      { header: "Quantité", key: "quantity", width: 12 },
      { header: "Unité", key: "unit", width: 10 },
      { header: "Soumis le", key: "submittedAt", width: 20 },
    ];

    // Style header row
    const importHeaderRow = importSheet.getRow(1);
    importHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    importHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF496559" },
    };

    for (const decl of importDeclarations) {
      if (decl.lines.length === 0) {
        importSheet.addRow({
          companyName: decl.company.name,
          companyEmail: decl.company.email,
          rccm: decl.company.rccm ?? "",
          status: decl.status,
          productCode: "",
          designation: "",
          priceMin: "",
          priceMax: "",
          quantity: "",
          unit: "",
          submittedAt: decl.submittedAt
            ? new Date(decl.submittedAt).toLocaleString("fr-FR")
            : "",
        });
      } else {
        for (const line of decl.lines) {
          importSheet.addRow({
            companyName: decl.company.name,
            companyEmail: decl.company.email,
            rccm: decl.company.rccm ?? "",
            status: decl.status,
            productCode: line.companyProduct.product.code,
            designation: line.companyProduct.product.designation,
            priceMin: line.priceMin !== null ? Number(line.priceMin) : "",
            priceMax: line.priceMax !== null ? Number(line.priceMax) : "",
            quantity: line.quantity !== null ? Number(line.quantity) : "",
            unit: line.unit ? `${line.unit.code} - ${line.unit.label}` : "",
            submittedAt: decl.submittedAt
              ? new Date(decl.submittedAt).toLocaleString("fr-FR")
              : "",
          });
        }
      }
    }

    // ── Export Sheet ──────────────────────────────────────────────────────────
    const exportSheet = workbook.addWorksheet("Déclarations Export");
    exportSheet.columns = [
      { header: "Entreprise", key: "companyName", width: 30 },
      { header: "Email", key: "companyEmail", width: 25 },
      { header: "RCCM", key: "rccm", width: 15 },
      { header: "Statut", key: "status", width: 15 },
      { header: "Code Produit", key: "productCode", width: 15 },
      { header: "Désignation", key: "designation", width: 30 },
      { header: "Prix Min", key: "priceMin", width: 12 },
      { header: "Prix Max", key: "priceMax", width: 12 },
      { header: "Quantité", key: "quantity", width: 12 },
      { header: "Unité", key: "unit", width: 10 },
      { header: "Soumis le", key: "submittedAt", width: 20 },
    ];

    const exportHeaderRow = exportSheet.getRow(1);
    exportHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    exportHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFf39221" },
    };

    for (const decl of exportDeclarations) {
      if (decl.lines.length === 0) {
        exportSheet.addRow({
          companyName: decl.company.name,
          companyEmail: decl.company.email,
          rccm: decl.company.rccm ?? "",
          status: decl.status,
          productCode: "",
          designation: "",
          priceMin: "",
          priceMax: "",
          quantity: "",
          unit: "",
          submittedAt: decl.submittedAt
            ? new Date(decl.submittedAt).toLocaleString("fr-FR")
            : "",
        });
      } else {
        for (const line of decl.lines) {
          exportSheet.addRow({
            companyName: decl.company.name,
            companyEmail: decl.company.email,
            rccm: decl.company.rccm ?? "",
            status: decl.status,
            productCode: line.companyProduct.product.code,
            designation: line.companyProduct.product.designation,
            priceMin: line.priceMin !== null ? Number(line.priceMin) : "",
            priceMax: line.priceMax !== null ? Number(line.priceMax) : "",
            quantity: line.quantity !== null ? Number(line.quantity) : "",
            unit: line.unit ? `${line.unit.code} - ${line.unit.label}` : "",
            submittedAt: decl.submittedAt
              ? new Date(decl.submittedAt).toLocaleString("fr-FR")
              : "",
          });
        }
      }
    }

    // Write workbook to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = `declarations_${period.label.replace(/\s+/g, "_")}_${periodId}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
