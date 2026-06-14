import { PrismaClient, Role, ProductType, ProductSource } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Super Admin
  const superAdminHash = await bcrypt.hash("Admin@123456", 12);
  const superAdmin = await prisma.admin.upsert({
    where: { email: "superadmin@collecte-dcn.gov" },
    update: {},
    create: {
      email: "superadmin@collecte-dcn.gov",
      passwordHash: superAdminHash,
      firstName: "Super",
      lastName: "Admin",
      role: Role.SUPER_ADMIN,
    },
  });

  // Admin
  const adminHash = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@collecte-dcn.gov" },
    update: {},
    create: {
      email: "admin@collecte-dcn.gov",
      passwordHash: adminHash,
      firstName: "Administrateur",
      lastName: "Principal",
      role: Role.ADMIN,
    },
  });

  // Units
  const unitsData = [
    { code: "02", label: "KILOGRAMME NET" },
    { code: "04", label: "TONNE NETTE" },
    { code: "10", label: "LITRE" },
    { code: "21", label: "UNITE" },
    { code: "22", label: "PAIRE" },
    { code: "23", label: "DOUZAINE" },
    { code: "30", label: "METRE CARRE" },
    { code: "31", label: "METRE LINEAIRE" },
    { code: "32", label: "METRE CUBE" },
  ];

  for (const unit of unitsData) {
    await prisma.unit.upsert({
      where: { code: unit.code },
      update: {},
      create: unit,
    });
  }

  // Products (admin-loaded)
  const productsData = [
    { code: "0101", designation: "Chevaux vivants", type: ProductType.IMPORT },
    { code: "0201", designation: "Viandes bovines fraîches", type: ProductType.IMPORT },
    { code: "0301", designation: "Poissons vivants", type: ProductType.IMPORT },
    { code: "0401", designation: "Lait et crème de lait", type: ProductType.IMPORT },
    { code: "0701", designation: "Légumes frais", type: ProductType.IMPORT },
    { code: "0901", designation: "Café vert", type: ProductType.EXPORT },
    { code: "1001", designation: "Blé et méteil", type: ProductType.IMPORT },
    { code: "1501", designation: "Huile de palme", type: ProductType.IMPORT },
    { code: "2701", designation: "Huiles brutes de pétrole", type: ProductType.IMPORT },
    { code: "8471", designation: "Machines de traitement de l'information", type: ProductType.IMPORT },
  ];

  for (const product of productsData) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: {},
      create: {
        ...product,
        source: ProductSource.ADMIN,
      },
    });
  }

  // Active period (current month)
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];

  await prisma.period.upsert({
    where: { year_month: { year, month } },
    update: { isActive: true },
    create: {
      year,
      month,
      label: `${monthNames[month - 1]} ${year}`,
      isActive: true,
      dueDate: new Date(year, month, 15),
    },
  });

  // Demo company invitation
  const demoInvitation = await prisma.companyInvitation.upsert({
    where: { token: "demo-invitation-token-2024" },
    update: {},
    create: {
      token: "demo-invitation-token-2024",
      companyName: "Entreprise Demo SARL",
      email: "demo@entreprise.com",
      rccm: "CD/KIN/RCCM/22-A-01234",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      adminId: admin.id,
    },
  });

  console.log("✅ Database seeded successfully.");
  console.log("");
  console.log("Admin credentials:");
  console.log("  Super Admin: superadmin@collecte-dcn.gov / Admin@123456");
  console.log("  Admin:       admin@collecte-dcn.gov / Admin@123456");
  console.log("");
  console.log("Demo invitation token:", demoInvitation.token);
  console.log("Invitation URL: http://localhost:3000/onboarding?token=demo-invitation-token-2024");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
