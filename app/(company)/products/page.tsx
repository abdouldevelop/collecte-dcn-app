import { Metadata } from "next";
import { requireCompanySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductsClient } from "./ProductsClient";

export const metadata: Metadata = { title: "Produits — Collecte DCN" };

export default async function ProductsPage() {
  const session = await requireCompanySession();

  const companyProducts = await prisma.companyProduct.findMany({
    where: { companyId: session.id, isActive: true },
    include: {
      product: true,
    },
    orderBy: { product: { code: "asc" } },
  });

  const allAdminProducts = await prisma.product.findMany({
    where: { source: "ADMIN", isActive: true },
    orderBy: { code: "asc" },
  });

  const myProductIds = new Set(companyProducts.map((cp) => cp.productId));
  const availableProducts = allAdminProducts.filter((p) => !myProductIds.has(p.id));

  return (
    <ProductsClient
      companyId={session.id}
      companyProducts={companyProducts.map((cp) => ({
        id: cp.id,
        productId: cp.productId,
        code: cp.product.code,
        designation: cp.product.designation,
        type: cp.product.type,
        source: cp.product.source,
        observation: cp.observation,
      }))}
      availableAdminProducts={availableProducts.map((p) => ({
        id: p.id,
        code: p.code,
        designation: p.designation,
        type: p.type,
      }))}
    />
  );
}
