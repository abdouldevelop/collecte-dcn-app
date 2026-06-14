/**
 * Seed exhaustif de tous les pays du monde, groupés par continent.
 * Codes ISO 3166-1 alpha-2. Noms en français.
 *
 * Continents utilisés : Afrique, Amériques, Asie, Europe, Océanie, Antarctique.
 *
 * Lancer :
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-countries.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CountryDef {
  code: string;
  name: string;
}

const COUNTRIES_BY_CONTINENT: Record<string, CountryDef[]> = {
  Afrique: [
    { code: "DZ", name: "Algérie" },
    { code: "AO", name: "Angola" },
    { code: "BJ", name: "Bénin" },
    { code: "BW", name: "Botswana" },
    { code: "BF", name: "Burkina Faso" },
    { code: "BI", name: "Burundi" },
    { code: "CM", name: "Cameroun" },
    { code: "CV", name: "Cap-Vert" },
    { code: "CF", name: "République centrafricaine" },
    { code: "TD", name: "Tchad" },
    { code: "KM", name: "Comores" },
    { code: "CG", name: "Congo" },
    { code: "CD", name: "République démocratique du Congo" },
    { code: "CI", name: "Côte d'Ivoire" },
    { code: "DJ", name: "Djibouti" },
    { code: "EG", name: "Égypte" },
    { code: "GQ", name: "Guinée équatoriale" },
    { code: "ER", name: "Érythrée" },
    { code: "SZ", name: "Eswatini" },
    { code: "ET", name: "Éthiopie" },
    { code: "GA", name: "Gabon" },
    { code: "GM", name: "Gambie" },
    { code: "GH", name: "Ghana" },
    { code: "GN", name: "Guinée" },
    { code: "GW", name: "Guinée-Bissau" },
    { code: "KE", name: "Kenya" },
    { code: "LS", name: "Lesotho" },
    { code: "LR", name: "Libéria" },
    { code: "LY", name: "Libye" },
    { code: "MG", name: "Madagascar" },
    { code: "MW", name: "Malawi" },
    { code: "ML", name: "Mali" },
    { code: "MR", name: "Mauritanie" },
    { code: "MU", name: "Maurice" },
    { code: "YT", name: "Mayotte" },
    { code: "MA", name: "Maroc" },
    { code: "MZ", name: "Mozambique" },
    { code: "NA", name: "Namibie" },
    { code: "NE", name: "Niger" },
    { code: "NG", name: "Nigéria" },
    { code: "RE", name: "La Réunion" },
    { code: "RW", name: "Rwanda" },
    { code: "SH", name: "Sainte-Hélène, Ascension et Tristan da Cunha" },
    { code: "ST", name: "Sao Tomé-et-Principe" },
    { code: "SN", name: "Sénégal" },
    { code: "SC", name: "Seychelles" },
    { code: "SL", name: "Sierra Leone" },
    { code: "SO", name: "Somalie" },
    { code: "ZA", name: "Afrique du Sud" },
    { code: "SS", name: "Soudan du Sud" },
    { code: "SD", name: "Soudan" },
    { code: "TZ", name: "Tanzanie" },
    { code: "TG", name: "Togo" },
    { code: "TN", name: "Tunisie" },
    { code: "UG", name: "Ouganda" },
    { code: "EH", name: "Sahara occidental" },
    { code: "ZM", name: "Zambie" },
    { code: "ZW", name: "Zimbabwe" },
  ],

  Amériques: [
    { code: "AI", name: "Anguilla" },
    { code: "AG", name: "Antigua-et-Barbuda" },
    { code: "AR", name: "Argentine" },
    { code: "AW", name: "Aruba" },
    { code: "BS", name: "Bahamas" },
    { code: "BB", name: "Barbade" },
    { code: "BZ", name: "Belize" },
    { code: "BM", name: "Bermudes" },
    { code: "BO", name: "Bolivie" },
    { code: "BQ", name: "Pays-Bas caribéens (Bonaire, Saint-Eustache et Saba)" },
    { code: "BR", name: "Brésil" },
    { code: "CA", name: "Canada" },
    { code: "KY", name: "Îles Caïmans" },
    { code: "CL", name: "Chili" },
    { code: "CO", name: "Colombie" },
    { code: "CR", name: "Costa Rica" },
    { code: "CU", name: "Cuba" },
    { code: "CW", name: "Curaçao" },
    { code: "DM", name: "Dominique" },
    { code: "DO", name: "République dominicaine" },
    { code: "EC", name: "Équateur" },
    { code: "SV", name: "Salvador" },
    { code: "FK", name: "Îles Malouines" },
    { code: "GF", name: "Guyane française" },
    { code: "GL", name: "Groenland" },
    { code: "GD", name: "Grenade" },
    { code: "GP", name: "Guadeloupe" },
    { code: "GT", name: "Guatemala" },
    { code: "GY", name: "Guyana" },
    { code: "HT", name: "Haïti" },
    { code: "HN", name: "Honduras" },
    { code: "JM", name: "Jamaïque" },
    { code: "MQ", name: "Martinique" },
    { code: "MX", name: "Mexique" },
    { code: "MS", name: "Montserrat" },
    { code: "NI", name: "Nicaragua" },
    { code: "PA", name: "Panama" },
    { code: "PY", name: "Paraguay" },
    { code: "PE", name: "Pérou" },
    { code: "PR", name: "Porto Rico" },
    { code: "BL", name: "Saint-Barthélemy" },
    { code: "KN", name: "Saint-Kitts-et-Nevis" },
    { code: "LC", name: "Sainte-Lucie" },
    { code: "MF", name: "Saint-Martin (partie française)" },
    { code: "PM", name: "Saint-Pierre-et-Miquelon" },
    { code: "VC", name: "Saint-Vincent-et-les-Grenadines" },
    { code: "SX", name: "Saint-Martin (partie néerlandaise)" },
    { code: "SR", name: "Suriname" },
    { code: "TT", name: "Trinité-et-Tobago" },
    { code: "TC", name: "Îles Turques-et-Caïques" },
    { code: "US", name: "États-Unis" },
    { code: "UY", name: "Uruguay" },
    { code: "VE", name: "Venezuela" },
    { code: "VG", name: "Îles Vierges britanniques" },
    { code: "VI", name: "Îles Vierges américaines" },
  ],

  Asie: [
    { code: "AF", name: "Afghanistan" },
    { code: "AM", name: "Arménie" },
    { code: "AZ", name: "Azerbaïdjan" },
    { code: "BH", name: "Bahreïn" },
    { code: "BD", name: "Bangladesh" },
    { code: "BT", name: "Bhoutan" },
    { code: "BN", name: "Brunei" },
    { code: "KH", name: "Cambodge" },
    { code: "CN", name: "Chine" },
    { code: "CY", name: "Chypre" },
    { code: "GE", name: "Géorgie" },
    { code: "HK", name: "Hong Kong" },
    { code: "IN", name: "Inde" },
    { code: "ID", name: "Indonésie" },
    { code: "IR", name: "Iran" },
    { code: "IQ", name: "Irak" },
    { code: "IL", name: "Israël" },
    { code: "JP", name: "Japon" },
    { code: "JO", name: "Jordanie" },
    { code: "KZ", name: "Kazakhstan" },
    { code: "KW", name: "Koweït" },
    { code: "KG", name: "Kirghizistan" },
    { code: "LA", name: "Laos" },
    { code: "LB", name: "Liban" },
    { code: "MO", name: "Macao" },
    { code: "MY", name: "Malaisie" },
    { code: "MV", name: "Maldives" },
    { code: "MN", name: "Mongolie" },
    { code: "MM", name: "Birmanie (Myanmar)" },
    { code: "NP", name: "Népal" },
    { code: "KP", name: "Corée du Nord" },
    { code: "OM", name: "Oman" },
    { code: "PK", name: "Pakistan" },
    { code: "PS", name: "Palestine" },
    { code: "PH", name: "Philippines" },
    { code: "QA", name: "Qatar" },
    { code: "SA", name: "Arabie saoudite" },
    { code: "SG", name: "Singapour" },
    { code: "KR", name: "Corée du Sud" },
    { code: "LK", name: "Sri Lanka" },
    { code: "SY", name: "Syrie" },
    { code: "TW", name: "Taïwan" },
    { code: "TJ", name: "Tadjikistan" },
    { code: "TH", name: "Thaïlande" },
    { code: "TL", name: "Timor oriental" },
    { code: "TR", name: "Turquie" },
    { code: "TM", name: "Turkménistan" },
    { code: "AE", name: "Émirats arabes unis" },
    { code: "UZ", name: "Ouzbékistan" },
    { code: "VN", name: "Viêt Nam" },
    { code: "YE", name: "Yémen" },
  ],

  Europe: [
    { code: "AL", name: "Albanie" },
    { code: "AD", name: "Andorre" },
    { code: "AT", name: "Autriche" },
    { code: "BY", name: "Biélorussie" },
    { code: "BE", name: "Belgique" },
    { code: "BA", name: "Bosnie-Herzégovine" },
    { code: "BG", name: "Bulgarie" },
    { code: "HR", name: "Croatie" },
    { code: "CZ", name: "République tchèque" },
    { code: "DK", name: "Danemark" },
    { code: "EE", name: "Estonie" },
    { code: "FO", name: "Îles Féroé" },
    { code: "FI", name: "Finlande" },
    { code: "FR", name: "France" },
    { code: "DE", name: "Allemagne" },
    { code: "GI", name: "Gibraltar" },
    { code: "GR", name: "Grèce" },
    { code: "GG", name: "Guernesey" },
    { code: "HU", name: "Hongrie" },
    { code: "IS", name: "Islande" },
    { code: "IE", name: "Irlande" },
    { code: "IM", name: "Île de Man" },
    { code: "IT", name: "Italie" },
    { code: "JE", name: "Jersey" },
    { code: "XK", name: "Kosovo" },
    { code: "LV", name: "Lettonie" },
    { code: "LI", name: "Liechtenstein" },
    { code: "LT", name: "Lituanie" },
    { code: "LU", name: "Luxembourg" },
    { code: "MT", name: "Malte" },
    { code: "MD", name: "Moldavie" },
    { code: "MC", name: "Monaco" },
    { code: "ME", name: "Monténégro" },
    { code: "NL", name: "Pays-Bas" },
    { code: "MK", name: "Macédoine du Nord" },
    { code: "NO", name: "Norvège" },
    { code: "PL", name: "Pologne" },
    { code: "PT", name: "Portugal" },
    { code: "RO", name: "Roumanie" },
    { code: "RU", name: "Russie" },
    { code: "SM", name: "Saint-Marin" },
    { code: "RS", name: "Serbie" },
    { code: "SK", name: "Slovaquie" },
    { code: "SI", name: "Slovénie" },
    { code: "ES", name: "Espagne" },
    { code: "SJ", name: "Svalbard et Jan Mayen" },
    { code: "SE", name: "Suède" },
    { code: "CH", name: "Suisse" },
    { code: "UA", name: "Ukraine" },
    { code: "GB", name: "Royaume-Uni" },
    { code: "VA", name: "Vatican" },
    { code: "AX", name: "Îles Åland" },
  ],

  Océanie: [
    { code: "AS", name: "Samoa américaines" },
    { code: "AU", name: "Australie" },
    { code: "CX", name: "Île Christmas" },
    { code: "CC", name: "Îles Cocos" },
    { code: "CK", name: "Îles Cook" },
    { code: "FJ", name: "Fidji" },
    { code: "PF", name: "Polynésie française" },
    { code: "GU", name: "Guam" },
    { code: "KI", name: "Kiribati" },
    { code: "MH", name: "Îles Marshall" },
    { code: "FM", name: "Micronésie" },
    { code: "NR", name: "Nauru" },
    { code: "NC", name: "Nouvelle-Calédonie" },
    { code: "NZ", name: "Nouvelle-Zélande" },
    { code: "NU", name: "Niue" },
    { code: "NF", name: "Île Norfolk" },
    { code: "MP", name: "Îles Mariannes du Nord" },
    { code: "PW", name: "Palaos" },
    { code: "PG", name: "Papouasie-Nouvelle-Guinée" },
    { code: "PN", name: "Îles Pitcairn" },
    { code: "WS", name: "Samoa" },
    { code: "SB", name: "Îles Salomon" },
    { code: "TK", name: "Tokelau" },
    { code: "TO", name: "Tonga" },
    { code: "TV", name: "Tuvalu" },
    { code: "VU", name: "Vanuatu" },
    { code: "WF", name: "Wallis-et-Futuna" },
  ],

  Antarctique: [
    { code: "AQ", name: "Antarctique" },
    { code: "BV", name: "Île Bouvet" },
    { code: "TF", name: "Terres australes et antarctiques françaises" },
    { code: "HM", name: "Îles Heard-et-MacDonald" },
    { code: "GS", name: "Géorgie du Sud-et-les Îles Sandwich du Sud" },
  ],
};

async function main() {
  let created = 0;
  let updated = 0;

  for (const [continent, list] of Object.entries(COUNTRIES_BY_CONTINENT)) {
    for (const c of list) {
      const existing = await prisma.country.findUnique({ where: { code: c.code } });
      if (existing) {
        await prisma.country.update({
          where: { code: c.code },
          data: { name: c.name, continent },
        });
        updated++;
      } else {
        await prisma.country.create({
          data: { code: c.code, name: c.name, continent, isActive: true },
        });
        created++;
      }
    }
  }

  // Summary per continent
  const summary = await prisma.country.groupBy({
    by: ["continent"],
    _count: { _all: true },
    orderBy: { continent: "asc" },
  });

  console.log("\nSeed pays terminé.");
  console.log(`   - Créés:    ${created}`);
  console.log(`   - Mis à jour: ${updated}`);
  console.log("\nRépartition par continent :");
  for (const row of summary) {
    console.log(`   ${row.continent.padEnd(15)} : ${row._count._all}`);
  }
  const total = summary.reduce((acc, r) => acc + r._count._all, 0);
  console.log(`   ${"TOTAL".padEnd(15)} : ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
