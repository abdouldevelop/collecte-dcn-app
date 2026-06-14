import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

export const onboardingSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  sector: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const focalPointSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  position: z.string().optional(),
});

export const productSchema = z.object({
  code: z.string().min(1, "Code requis"),
  designation: z.string().min(1, "Désignation requise"),
  type: z.enum(["IMPORT", "EXPORT"]),
});

export const declarationLineSchema = z.object({
  companyProductId: z.string(),
  priceMin: z.number().min(0, "Prix minimum >= 0").nullable(),
  priceMax: z.number().min(0, "Prix maximum >= 0").nullable(),
  quantity: z.number().min(0, "Quantité >= 0").nullable(),
  unitId: z.string().nullable(),
}).refine(
  (d) => {
    if (d.priceMin !== null && d.priceMax !== null) {
      return d.priceMin <= d.priceMax;
    }
    return true;
  },
  { message: "Prix min doit être <= prix max", path: ["priceMax"] }
).refine(
  (d) => {
    if (d.quantity !== null && d.quantity > 0) {
      return d.unitId !== null;
    }
    return true;
  },
  { message: "Unité obligatoire si quantité > 0", path: ["unitId"] }
);

export const declarationSubmitSchema = z.object({
  lines: z.array(declarationLineSchema),
});

export const invitationSchema = z.object({
  companyName: z.string().min(1, "Nom entreprise requis"),
  email: z.string().email("Email invalide"),
  rccm: z.string().optional(),
  ncc: z.string().optional(),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(1, "Sujet requis").max(200, "Sujet trop long"),
  message: z.string().min(10, "Message trop court").max(5000, "Message trop long"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export const profileUpdateSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  sector: z.string().optional(),
});

export const adminCreateSchema = z.object({
  firstName: z.string().min(2, "Prénom requis").max(80),
  lastName: z.string().min(2, "Nom requis").max(80),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).default("ADMIN"),
});

export const periodCreateSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  label: z.string().min(1, "Label requis").max(50).optional(),
  dueDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const periodUpdateSchema = z.object({
  label: z.string().min(1).max(50).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const adminProfileSchema = z.object({
  firstName: z.string().min(2).max(80).optional(),
  lastName: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre")
    .optional(),
}).refine(
  (data) => !data.newPassword || !!data.currentPassword,
  { message: "Mot de passe actuel requis pour changer le mot de passe", path: ["currentPassword"] }
);

export const adminUpdateSchema = z.object({
  firstName: z.string().min(2).max(80).optional(),
  lastName: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type FocalPointInput = z.infer<typeof focalPointSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type DeclarationLineInput = z.infer<typeof declarationLineSchema>;
export type DeclarationSubmitInput = z.infer<typeof declarationSubmitSchema>;
export type InvitationInput = z.infer<typeof invitationSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AdminCreateInput = z.infer<typeof adminCreateSchema>;
export type AdminUpdateInput = z.infer<typeof adminUpdateSchema>;
export type PeriodCreateInput = z.infer<typeof periodCreateSchema>;
export type PeriodUpdateInput = z.infer<typeof periodUpdateSchema>;
export type AdminProfileInput = z.infer<typeof adminProfileSchema>;
