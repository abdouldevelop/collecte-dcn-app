import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const COMPANY_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "fallback-secret-change-me"
);
const ADMIN_SECRET = new TextEncoder().encode(
  (process.env.NEXTAUTH_SECRET ?? "fallback-secret-change-me") + "-admin"
);

export interface CompanySession {
  id: string;
  email: string;
  name: string;
  role: "COMPANY";
}

export interface AdminSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

export async function signCompanyToken(payload: CompanySession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(COMPANY_SECRET);
}

export async function signAdminToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(ADMIN_SECRET);
}

export async function verifyCompanyToken(token: string): Promise<CompanySession | null> {
  try {
    const { payload } = await jwtVerify(token, COMPANY_SECRET);
    return payload as unknown as CompanySession;
  } catch {
    return null;
  }
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_SECRET);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function getCompanySession(): Promise<CompanySession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("company-token")?.value;
  if (!token) return null;
  return verifyCompanyToken(token);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function requireCompanySession(): Promise<CompanySession> {
  const session = await getCompanySession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function setCompanyCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("company-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function setAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("admin-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function clearCompanyCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("company-token");
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin-token");
}

export async function logAudit(params: {
  action: string;
  entity: string;
  entityId?: string;
  details?: Prisma.InputJsonValue;
  companyId?: string;
  adminId?: string;
  ipAddress?: string;
}): Promise<void> {
  const { companyId, adminId, ...rest } = params;
  await prisma.auditLog.create({
    data: {
      ...rest,
      ...(companyId ? { company: { connect: { id: companyId } } } : {}),
      ...(adminId ? { admin: { connect: { id: adminId } } } : {}),
    },
  });
}
