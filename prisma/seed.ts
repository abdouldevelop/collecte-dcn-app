import { PrismaClient, Role, ProductType, ProductSource, FlowType, DeclarationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ============ ADMINS ============
  console.log("📌 Creating admins...");
  const superAdminHash = await bcrypt.hash("Admin@123456", 12);
  await prisma.admin.upsert({
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

  // ============ COUNTRIES ============
  console.log("🌍 Creating countries...");
  const countriesData = [
    { code: "FR", name: "France", continent: "Europe" },
    { code: "BE", name: "Belgique", continent: "Europe" },
    { code: "DE", name: "Allemagne", continent: "Europe" },
    { code: "CN", name: "Chine", continent: "Asie" },
    { code: "IN", name: "Inde", continent: "Asie" },
    { code: "JP", name: "Japon", continent: "Asie" },
    { code: "US", name: "États-Unis", continent: "Amérique" },
    { code: "CA", name: "Canada", continent: "Amérique" },
    { code: "BR", name: "Brésil", continent: "Amérique" },
    { code: "ZA", name: "Afrique du Sud", continent: "Afrique" },
    { code: "KE", name: "Kenya", continent: "Afrique" },
    { code: "NG", name: "Nigéria", continent: "Afrique" },
    { code: "AE", name: "Émirats Arabes Unis", continent: "Asie" },
    { code: "GB", name: "Royaume-Uni", continent: "Europe" },
  ];

  const countries = [];
  for (const country of countriesData) {
    const c = await prisma.country.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });
    countries.push(c);
  }

  // ============ UNITS ============
  console.log("📏 Creating units...");
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

  const units = [];
  for (const unit of unitsData) {
    const u = await prisma.unit.upsert({
      where: { code: unit.code },
      update: {},
      create: unit,
    });
    units.push(u);
  }

  // ============ PRODUCTS ============
  console.log("📦 Creating products...");
  const productsData = [
    { code: "0101", designation: "Chevaux vivants", type: ProductType.IMPORT },
    { code: "0201", designation: "Viandes bovines fraîches", type: ProductType.IMPORT },
    { code: "0301", designation: "Poissons vivants", type: ProductType.IMPORT },
    { code: "0401", designation: "Lait et crème de lait", type: ProductType.IMPORT },
    { code: "0701", designation: "Légumes frais", type: ProductType.IMPORT },
    { code: "0901", designation: "Café vert", type: ProductType.EXPORT },
    { code: "1001", designation: "Blé et méteil", type: ProductType.IMPORT },
    { code: "1201", designation: "Fèves de soja", type: ProductType.IMPORT },
    { code: "1501", designation: "Huile de palme", type: ProductType.IMPORT },
    { code: "1701", designation: "Sucre de canne", type: ProductType.IMPORT },
    { code: "2203", designation: "Bières de malt", type: ProductType.IMPORT },
    { code: "2701", designation: "Huiles brutes de pétrole", type: ProductType.IMPORT },
    { code: "2710", designation: "Gazole", type: ProductType.IMPORT },
    { code: "3004", designation: "Médicaments", type: ProductType.IMPORT },
    { code: "4011", designation: "Pneumatiques neufs", type: ProductType.IMPORT },
    { code: "6203", designation: "Costumes pour hommes", type: ProductType.IMPORT },
    { code: "7108", designation: "Or sous formes brutes", type: ProductType.EXPORT },
    { code: "7403", designation: "Cuivre affiné", type: ProductType.EXPORT },
    { code: "8471", designation: "Machines de traitement de l'information", type: ProductType.IMPORT },
    { code: "8517", designation: "Téléphones portables", type: ProductType.IMPORT },
    { code: "8703", designation: "Voitures de tourisme", type: ProductType.IMPORT },
    { code: "9401", designation: "Sièges et meubles", type: ProductType.IMPORT },
  ];

  const products = [];
  for (const product of productsData) {
    const p = await prisma.product.upsert({
      where: { code: product.code },
      update: {},
      create: {
        ...product,
        source: ProductSource.ADMIN,
      },
    });
    products.push(p);
  }

  // ============ PERIODS ============
  console.log("📅 Creating periods...");
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];

  const periods = [];
  // Create 5 periods: January to May 2026
  const year = 2026;
  for (let month = 1; month <= 5; month++) {
    const period = await prisma.period.upsert({
      where: { year_month: { year, month } },
      update: { isActive: month === 5 }, // May is active
      create: {
        year,
        month,
        label: `${monthNames[month - 1]} ${year}`,
        isActive: month === 5, // May is active
        dueDate: new Date(year, month, 15),
      },
    });
    periods.push(period);
  }

  // ============ EXCHANGE RATES ============
  console.log("💱 Creating exchange rates...");
  const currencies = ["USD", "EUR"] as const;
  const rates: Record<string, number> = {
    USD: 610,  // USD -> XOF (Franc CFA)
    EUR: 655,  // EUR -> XOF (Franc CFA)
  };

  // Create exchange rates for January to May 2026
  for (const currency of currencies) {
    for (let month = 1; month <= 5; month++) {
      const daysInMonth = new Date(2026, month, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(2026, month - 1, day);
        const variation = (Math.random() - 0.5) * 100;

        await prisma.exchangeRate.upsert({
          where: {
            currency_date: {
              currency,
              date,
            },
          },
          update: {},
          create: {
            currency,
            rate: rates[currency] + variation,
            date,
            source: "BCC",
          },
        });
      }
    }
  }

  // ============ COMPANIES ============
  console.log("🏢 Creating companies...");
  const companiesData = [
    {
      name: "SARL CONGO IMPORT",
      email: "contact@congo-import.cd",
      rccm: "CD/KIN/RCCM/23-A-00125",
      ncc: "01-N234-N12345",
      phone: "+243 81 123 4567",
      address: "15 Avenue du Port, Kinshasa",
      sector: "Commerce général",
      isOnboarded: true,
    },
    {
      name: "SOCIÉTÉ MINIÈRE DU KATANGA",
      email: "info@minier-katanga.cd",
      rccm: "CD/LUA/RCCM/22-B-00856",
      ncc: "01-N345-N23456",
      phone: "+243 82 234 5678",
      address: "Boulevard Lumumba, Lubumbashi",
      sector: "Exploitation minière",
      isOnboarded: true,
    },
    {
      name: "EXPORT CAFÉ RDC SARL",
      email: "export@cafe-rdc.cd",
      rccm: "CD/KIN/RCCM/23-A-00234",
      ncc: "01-N456-N34567",
      phone: "+243 83 345 6789",
      address: "Avenue des Aviateurs, Kinshasa",
      sector: "Exportation agricole",
      isOnboarded: true,
    },
  ];

  const companies = [];
  const companyHash = await bcrypt.hash("Company@123", 12);

  for (const companyData of companiesData) {
    const company = await prisma.company.upsert({
      where: { email: companyData.email },
      update: {},
      create: {
        ...companyData,
        passwordHash: companyHash,
      },
    });
    companies.push(company);
  }

  // ============ FOCAL POINTS ============
  console.log("👥 Creating focal points...");
  const focalPointHash = await bcrypt.hash("Focal@123", 12);

  const focalPointsData = [
    // SARL CONGO IMPORT - 3 focal points
    { firstName: "Jean", lastName: "Kabongo", email: "j.kabongo@congo-import.cd", position: "Directeur Commercial", phone: "+243 81 111 2222", companyId: companies[0].id },
    { firstName: "Marie", lastName: "Tshombe", email: "m.tshombe@congo-import.cd", position: "Responsable Logistique", phone: "+243 81 222 3333", companyId: companies[0].id },
    { firstName: "André", lastName: "Mulamba", email: "a.mulamba@congo-import.cd", position: "Chef Comptable", phone: "+243 81 333 4444", companyId: companies[0].id },

    // SOCIÉTÉ MINIÈRE DU KATANGA - 3 focal points
    { firstName: "Pierre", lastName: "Mwamba", email: "p.mwamba@minier-katanga.cd", position: "Directeur des Opérations", phone: "+243 82 111 2222", companyId: companies[1].id },
    { firstName: "Christelle", lastName: "Kabila", email: "c.kabila@minier-katanga.cd", position: "Responsable Export", phone: "+243 82 222 3333", companyId: companies[1].id },
    { firstName: "Daniel", lastName: "Tshisekedi", email: "d.tshisekedi@minier-katanga.cd", position: "Analyste Commerce", phone: "+243 82 333 4444", companyId: companies[1].id },

    // EXPORT CAFÉ RDC - 2 focal points
    { firstName: "Fatima", lastName: "Ngoy", email: "f.ngoy@cafe-rdc.cd", position: "Responsable Export", phone: "+243 83 111 2222", companyId: companies[2].id },
    { firstName: "Joseph", lastName: "Kasongo", email: "j.kasongo@cafe-rdc.cd", position: "Responsable Qualité", phone: "+243 83 222 3333", companyId: companies[2].id },
  ];

  for (const fpData of focalPointsData) {
    await prisma.focalPoint.upsert({
      where: { email: fpData.email },
      update: {},
      create: {
        ...fpData,
        passwordHash: focalPointHash,
        isOnboarded: true,
      },
    });
  }

  // ============ COMPANY PRODUCTS ============
  console.log("🔗 Linking products to companies...");

  // Congo Import: Import products
  const importProducts = products.filter(p => p.type === ProductType.IMPORT).slice(0, 8);
  for (const product of importProducts) {
    await prisma.companyProduct.upsert({
      where: {
        companyId_productId: {
          companyId: companies[0].id,
          productId: product.id,
        },
      },
      update: {},
      create: {
        companyId: companies[0].id,
        productId: product.id,
        observation: "Produit régulièrement importé",
      },
    });
  }

  // Minière Katanga: Export products
  const exportProducts = products.filter(p => p.type === ProductType.EXPORT);
  for (const product of exportProducts) {
    await prisma.companyProduct.upsert({
      where: {
        companyId_productId: {
          companyId: companies[1].id,
          productId: product.id,
        },
      },
      update: {},
      create: {
        companyId: companies[1].id,
        productId: product.id,
        observation: "Produit minier exporté",
      },
    });
  }

  // Café RDC: Export coffee
  const coffeeProduct = products.find(p => p.code === "0901");
  if (coffeeProduct) {
    await prisma.companyProduct.upsert({
      where: {
        companyId_productId: {
          companyId: companies[2].id,
          productId: coffeeProduct.id,
        },
      },
      update: {},
      create: {
        companyId: companies[2].id,
        productId: coffeeProduct.id,
        observation: "Café arabica de haute qualité",
      },
    });
  }

  // ============ COMPANY COUNTRIES ============
  console.log("🌐 Linking countries to companies...");

  // Congo Import: Import from multiple countries
  const importCountries = [countries[0], countries[1], countries[3], countries[12]]; // FR, BE, CN, AE
  for (const country of importCountries) {
    await prisma.companyCountry.upsert({
      where: {
        companyId_countryId_flowType: {
          companyId: companies[0].id,
          countryId: country.id,
          flowType: FlowType.IMPORT,
        },
      },
      update: {},
      create: {
        companyId: companies[0].id,
        countryId: country.id,
        flowType: FlowType.IMPORT,
      },
    });
  }

  // Minière Katanga: Export to multiple countries
  const exportCountries = [countries[3], countries[13], countries[6]]; // CN, GB, US
  for (const country of exportCountries) {
    await prisma.companyCountry.upsert({
      where: {
        companyId_countryId_flowType: {
          companyId: companies[1].id,
          countryId: country.id,
          flowType: FlowType.EXPORT,
        },
      },
      update: {},
      create: {
        companyId: companies[1].id,
        countryId: country.id,
        flowType: FlowType.EXPORT,
      },
    });
  }

  // Café RDC: Export coffee
  await prisma.companyCountry.upsert({
    where: {
      companyId_countryId_flowType: {
        companyId: companies[2].id,
        countryId: countries[0].id, // FR
        flowType: FlowType.EXPORT,
      },
    },
    update: {},
    create: {
      companyId: companies[2].id,
      countryId: countries[0].id,
      flowType: FlowType.EXPORT,
    },
  });

  // ============ DECLARATIONS ============
  console.log("📋 Creating declarations...");

  // Get company products
  const congoImportProducts = await prisma.companyProduct.findMany({
    where: { companyId: companies[0].id },
  });

  const minerieProducts = await prisma.companyProduct.findMany({
    where: { companyId: companies[1].id },
  });

  const cafeProducts = await prisma.companyProduct.findMany({
    where: { companyId: companies[2].id },
  });

  // Create import declarations for Congo Import for ALL 5 periods (Jan-May 2026)
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    // Jan, Feb, Mar, Apr = SUBMITTED; May = DRAFT
    const status = i < 4 ? DeclarationStatus.SUBMITTED : DeclarationStatus.DRAFT;

    const declaration = await prisma.importDeclaration.upsert({
      where: {
        companyId_periodId: {
          companyId: companies[0].id,
          periodId: period.id,
        },
      },
      update: {},
      create: {
        companyId: companies[0].id,
        periodId: period.id,
        status,
        freightAmount: 12000 + Math.random() * 8000,
        insuranceAmount: 4000 + Math.random() * 3000,
        submittedAt: status === DeclarationStatus.SUBMITTED
          ? new Date(2026, period.month - 1, 8 + Math.floor(Math.random() * 5))
          : null,
      },
    });

    // Add declaration lines for each product
    for (let j = 0; j < congoImportProducts.length; j++) {
      const cp = congoImportProducts[j];
      await prisma.importDeclarationLine.upsert({
        where: {
          declarationId_companyProductId: {
            declarationId: declaration.id,
            companyProductId: cp.id,
          },
        },
        update: {},
        create: {
          declarationId: declaration.id,
          companyProductId: cp.id,
          unitId: units[Math.floor(Math.random() * units.length)].id,
          countryId: importCountries[j % importCountries.length].id,
          quantity: 80 + Math.random() * 920,
          priceMin: 40 + Math.random() * 260,
          priceMax: 250 + Math.random() * 850,
        },
      });
    }
  }

  // Create export declarations for Minière Katanga for ALL 5 periods
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    // Jan, Feb, Mar, Apr = SUBMITTED; May = DRAFT
    const status = i < 4 ? DeclarationStatus.SUBMITTED : DeclarationStatus.DRAFT;

    const declaration = await prisma.exportDeclaration.upsert({
      where: {
        companyId_periodId: {
          companyId: companies[1].id,
          periodId: period.id,
        },
      },
      update: {},
      create: {
        companyId: companies[1].id,
        periodId: period.id,
        status,
        submittedAt: status === DeclarationStatus.SUBMITTED
          ? new Date(2026, period.month - 1, 10 + Math.floor(Math.random() * 5))
          : null,
      },
    });

    // Add declaration lines
    for (let j = 0; j < minerieProducts.length; j++) {
      const cp = minerieProducts[j];
      await prisma.exportDeclarationLine.upsert({
        where: {
          declarationId_companyProductId: {
            declarationId: declaration.id,
            companyProductId: cp.id,
          },
        },
        update: {},
        create: {
          declarationId: declaration.id,
          companyProductId: cp.id,
          unitId: units[1].id, // Tonnes
          countryId: exportCountries[j % exportCountries.length].id,
          quantity: 40 + Math.random() * 460,
          priceMin: 4500 + Math.random() * 5500,
          priceMax: 12000 + Math.random() * 13000,
        },
      });
    }
  }

  // Create export declarations for Café RDC for ALL 5 periods
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    // Jan, Feb, Mar, Apr = SUBMITTED; May = DRAFT
    const status = i < 4 ? DeclarationStatus.SUBMITTED : DeclarationStatus.DRAFT;

    const declaration = await prisma.exportDeclaration.upsert({
      where: {
        companyId_periodId: {
          companyId: companies[2].id,
          periodId: period.id,
        },
      },
      update: {},
      create: {
        companyId: companies[2].id,
        periodId: period.id,
        status,
        submittedAt: status === DeclarationStatus.SUBMITTED
          ? new Date(2026, period.month - 1, 7 + Math.floor(Math.random() * 6))
          : null,
      },
    });

    // Add declaration lines
    if (cafeProducts.length > 0) {
      await prisma.exportDeclarationLine.upsert({
        where: {
          declarationId_companyProductId: {
            declarationId: declaration.id,
            companyProductId: cafeProducts[0].id,
          },
        },
        update: {},
        create: {
          declarationId: declaration.id,
          companyProductId: cafeProducts[0].id,
          unitId: units[1].id, // Tonnes
          countryId: countries[0].id, // France
          quantity: 200 + Math.random() * 150,
          priceMin: 1800 + Math.random() * 500,
          priceMax: 3000 + Math.random() * 1000,
        },
      });
    }
  }

  // ============ INVITATIONS ============
  console.log("✉️ Creating invitations...");
  await prisma.companyInvitation.upsert({
    where: { token: "demo-invitation-token-2024" },
    update: {},
    create: {
      token: "demo-invitation-token-2024",
      companyName: "Nouvelle Entreprise SARL",
      email: "nouvelle@entreprise.cd",
      rccm: "CD/KIN/RCCM/24-A-01234",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      adminId: admin.id,
    },
  });

  console.log("");
  console.log("✅ Database seeded successfully!");
  console.log("");
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║              COMPTES DE CONNEXION                      ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log("");
  console.log("🔐 ADMINISTRATEURS:");
  console.log("  • Super Admin: superadmin@collecte-dcn.gov / Admin@123456");
  console.log("  • Admin:       admin@collecte-dcn.gov / Admin@123456");
  console.log("");
  console.log("🏢 ENTREPRISES:");
  console.log("  • Congo Import:  contact@congo-import.cd / Company@123");
  console.log("  • Minière:       info@minier-katanga.cd / Company@123");
  console.log("  • Café RDC:      export@cafe-rdc.cd / Company@123");
  console.log("");
  console.log("👤 POINTS FOCAUX (8 au total):");
  console.log("");
  console.log("  SARL CONGO IMPORT:");
  console.log("    • Jean Kabongo:   j.kabongo@congo-import.cd / Focal@123");
  console.log("    • Marie Tshombe:  m.tshombe@congo-import.cd / Focal@123");
  console.log("    • André Mulamba:  a.mulamba@congo-import.cd / Focal@123");
  console.log("");
  console.log("  SOCIÉTÉ MINIÈRE DU KATANGA:");
  console.log("    • Pierre Mwamba:      p.mwamba@minier-katanga.cd / Focal@123");
  console.log("    • Christelle Kabila:  c.kabila@minier-katanga.cd / Focal@123");
  console.log("    • Daniel Tshisekedi:  d.tshisekedi@minier-katanga.cd / Focal@123");
  console.log("");
  console.log("  EXPORT CAFÉ RDC:");
  console.log("    • Fatima Ngoy:     f.ngoy@cafe-rdc.cd / Focal@123");
  console.log("    • Joseph Kasongo:  j.kasongo@cafe-rdc.cd / Focal@123");
  console.log("");
  console.log("📊 DONNÉES CRÉÉES:");
  console.log(`  • ${countries.length} pays`);
  console.log(`  • ${units.length} unités`);
  console.log(`  • ${products.length} produits`);
  console.log(`  • ${periods.length} périodes (Janvier à Mai 2026)`);
  console.log(`  • ${companies.length} entreprises`);
  console.log("  • 8 points focaux");
  console.log("  • 15 déclarations (5 par entreprise)");
  console.log("  • Lignes de détail complètes pour chaque déclaration");
  console.log("  • Taux de change quotidiens (USD, EUR) pour 5 mois");
  console.log("");
  console.log("📋 STATUT DES DÉCLARATIONS:");
  console.log("  • Janvier à Avril 2026: SUBMITTED (soumises)");
  console.log("  • Mai 2026: DRAFT (en cours)");
  console.log("");
  console.log("🌐 APPLICATION:");
  console.log("  URL: http://localhost:3000");
  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
