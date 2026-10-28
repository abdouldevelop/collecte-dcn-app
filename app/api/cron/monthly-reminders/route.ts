import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMonthlyReminderEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

function utcDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

async function run(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return Response.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }

  const today = utcDay(new Date());
  const configuredOffsets = (process.env.REMINDER_DAYS_BEFORE ?? "7,3,1,0")
    .split(",")
    .map(Number)
    .filter(Number.isFinite);

  const periods = await prisma.period.findMany({
    where: { isActive: true, dueDate: { not: null } },
    include: {
      importDeclarations: { select: { companyId: true, status: true } },
      exportDeclarations: { select: { companyId: true, status: true } },
    },
  });
  const companies = await prisma.company.findMany({
    where: { isActive: true, isOnboarded: true },
    include: { companyProducts: { include: { product: { select: { type: true } } } } },
  });

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const period of periods) {
    if (!period.dueDate) continue;
    const daysRemaining = Math.round((utcDay(period.dueDate).getTime() - today.getTime()) / 86_400_000);
    if (daysRemaining >= 0 && !configuredOffsets.includes(daysRemaining)) continue;

    for (const company of companies) {
      const requiresImport = company.companyProducts.some((item) => item.product.type === "IMPORT");
      const requiresExport = company.companyProducts.some((item) => item.product.type === "EXPORT");
      const importDone = !requiresImport || period.importDeclarations.some((item) => item.companyId === company.id && item.status === "SUBMITTED");
      const exportDone = !requiresExport || period.exportDeclarations.some((item) => item.companyId === company.id && item.status === "SUBMITTED");
      if (importDone && exportDone) {
        skipped++;
        continue;
      }

      try {
        await prisma.reminderEmail.create({
          data: { companyId: company.id, periodId: period.id, reminderDay: today },
        });
      } catch (error) {
        if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
          skipped++;
          continue;
        }
        throw error;
      }

      try {
        await sendMonthlyReminderEmail({
          to: company.email,
          companyName: company.name,
          periodLabel: period.label,
          dueDate: period.dueDate,
          daysRemaining,
        });
        sent++;
      } catch (error) {
        await prisma.reminderEmail.delete({
          where: { companyId_periodId_reminderDay: { companyId: company.id, periodId: period.id, reminderDay: today } },
        });
        errors.push(`${company.email}: ${error instanceof Error ? error.message : "échec SMTP"}`);
      }
    }
  }

  return Response.json({ success: errors.length === 0, sent, skipped, errors });
}

export const GET = run;
export const POST = run;
