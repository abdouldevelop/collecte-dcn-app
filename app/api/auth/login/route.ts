import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError, getClientIp } from "@/lib/api";
import { signCompanyToken, setCompanyCookie, logAudit } from "@/lib/auth";
import { loginSchema } from "@/validators";

// In-memory rate limiter: email -> { count, resetAt }
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(email);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(email, { count: 1, resetAt: now + WINDOW_MS });
    return true; // allowed
  }
  if (entry.count >= MAX_ATTEMPTS) return false; // blocked
  entry.count++;
  return true;
}

function resetRateLimit(email: string): void {
  loginAttempts.delete(email);
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const input = loginSchema.parse(body);

    // Rate limit check
    if (!checkRateLimit(input.email)) {
      return apiError("Trop de tentatives. Veuillez réessayer dans 15 minutes.", 429);
    }

    const company = await prisma.company.findUnique({
      where: { email: input.email },
    });

    if (!company || !company.isActive) {
      return apiError("Identifiants incorrects", 401);
    }

    const passwordValid = await bcrypt.compare(input.password, company.passwordHash);
    if (!passwordValid) {
      return apiError("Identifiants incorrects", 401);
    }

    // Successful login — reset rate limit
    resetRateLimit(input.email);

    const token = await signCompanyToken({
      id: company.id,
      email: company.email,
      name: company.name,
      role: "COMPANY",
    });

    await setCompanyCookie(token);

    await logAudit({
      action: "LOGIN",
      entity: "Company",
      entityId: company.id,
      companyId: company.id,
      ipAddress: getClientIp(request),
    });

    return apiSuccess({
      id: company.id,
      email: company.email,
      name: company.name,
      isOnboarded: company.isOnboarded,
      role: "COMPANY",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
