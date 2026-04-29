import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError, getClientIp } from "@/lib/api";
import { signAdminToken, setAdminCookie, logAudit } from "@/lib/auth";
import { loginSchema } from "@/validators";

// In-memory rate limiter for admin logins
const adminLoginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkAdminRateLimit(email: string): boolean {
  const now = Date.now();
  const entry = adminLoginAttempts.get(email);
  if (!entry || now > entry.resetAt) {
    adminLoginAttempts.set(email, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}

function resetAdminRateLimit(email: string): void {
  adminLoginAttempts.delete(email);
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const input = loginSchema.parse(body);

    if (!checkAdminRateLimit(input.email)) {
      return apiError("Trop de tentatives. Veuillez réessayer dans 15 minutes.", 429);
    }

    const admin = await prisma.admin.findUnique({
      where: { email: input.email },
    });

    if (!admin || !admin.isActive) {
      return apiError("Identifiants incorrects", 401);
    }

    const passwordValid = await bcrypt.compare(input.password, admin.passwordHash);
    if (!passwordValid) {
      return apiError("Identifiants incorrects", 401);
    }

    resetAdminRateLimit(input.email);

    const token = await signAdminToken({
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role as "ADMIN" | "SUPER_ADMIN",
    });

    await setAdminCookie(token);

    await logAudit({
      action: "ADMIN_LOGIN",
      entity: "Admin",
      entityId: admin.id,
      adminId: admin.id,
      ipAddress: getClientIp(request),
    });

    return apiSuccess({
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
