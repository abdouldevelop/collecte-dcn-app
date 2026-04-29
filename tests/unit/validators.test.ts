import { declarationLineSchema, loginSchema, onboardingSchema } from "@/validators";

describe("loginSchema", () => {
  it("validates correct email and password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "secret123" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret123" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("declarationLineSchema", () => {
  it("accepts valid line with all fields", () => {
    const result = declarationLineSchema.safeParse({
      companyProductId: "cp-123",
      priceMin: 100,
      priceMax: 200,
      quantity: 50,
      unitId: "unit-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects priceMin > priceMax", () => {
    const result = declarationLineSchema.safeParse({
      companyProductId: "cp-123",
      priceMin: 300,
      priceMax: 100,
      quantity: 50,
      unitId: "unit-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Prix min doit être <= prix max");
    }
  });

  it("rejects quantity > 0 without unit", () => {
    const result = declarationLineSchema.safeParse({
      companyProductId: "cp-123",
      priceMin: 100,
      priceMax: 200,
      quantity: 50,
      unitId: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Unité obligatoire si quantité > 0");
    }
  });

  it("accepts null quantity without unit (no obligation)", () => {
    const result = declarationLineSchema.safeParse({
      companyProductId: "cp-123",
      priceMin: null,
      priceMax: null,
      quantity: null,
      unitId: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts quantity=0 without unit", () => {
    const result = declarationLineSchema.safeParse({
      companyProductId: "cp-123",
      priceMin: 0,
      priceMax: 0,
      quantity: 0,
      unitId: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("onboardingSchema", () => {
  const validData = {
    token: "valid-token",
    password: "Password1",
    confirmPassword: "Password1",
  };

  it("accepts valid onboarding data", () => {
    const result = onboardingSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = onboardingSchema.safeParse({ ...validData, confirmPassword: "Different1" });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = onboardingSchema.safeParse({ ...validData, password: "password1", confirmPassword: "password1" });
    expect(result.success).toBe(false);
  });

  it("rejects password without digit", () => {
    const result = onboardingSchema.safeParse({ ...validData, password: "PasswordOnly", confirmPassword: "PasswordOnly" });
    expect(result.success).toBe(false);
  });
});
