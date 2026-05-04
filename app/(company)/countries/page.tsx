import { requireCompanySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CountriesClient from "./CountriesClient";

export default async function CountriesPage() {
  const session = await requireCompanySession();

  const [companyCountries, allCountries] = await Promise.all([
    prisma.companyCountry.findMany({
      where: { companyId: session.id, isActive: true },
      include: { country: true },
      orderBy: { country: { name: "asc" } },
    }),
    prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, code: true, name: true },
    }),
  ]);

  return <CountriesClient initialCompanyCountries={companyCountries} allCountries={allCountries} />;
}
