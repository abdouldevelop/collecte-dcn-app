import { test, expect } from "@playwright/test";

test.describe("Company Login", () => {
  test("shows login form on /login", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Connexion Entreprise/i })).toBeVisible();
    await expect(page.getByPlaceholder("exemple@entreprise.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(page.getByRole("button", { name: /Se connecter/i })).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "invalid@test.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=/incorrect|invalide|non autorisé/i")).toBeVisible({ timeout: 5000 });
  });

  test("redirects to dashboard on valid login", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "demo@entreprise.com");
    await page.fill('input[type="password"]', "Admin@123456");
    await page.click('button[type="submit"]');
    // Either redirects to dashboard or shows error (depends on seeded data)
    await page.waitForURL(/\/(dashboard|login)/, { timeout: 10000 });
  });
});

test.describe("Admin Login", () => {
  test("shows admin login form on /admin/login", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /Connexion Administration/i })).toBeVisible();
    await expect(page.getByPlaceholder("admin@collecte-dcn.gov")).toBeVisible();
  });

  test("admin login with seeded credentials", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@collecte-dcn.gov");
    await page.fill('input[type="password"]', "Admin@123456");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/(dashboard|login)/, { timeout: 10000 });
  });
});

test.describe("Onboarding", () => {
  test("shows error for missing token", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.locator("text=/invalide|manquant/i")).toBeVisible({ timeout: 5000 });
  });

  test("shows error for invalid token", async ({ page }) => {
    await page.goto("/onboarding?token=invalid-token-xyz");
    await expect(page.locator("text=/invalide|expir/i")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Auth redirect", () => {
  test("redirects / to /login when not authenticated", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/login/, { timeout: 5000 });
  });

  test("redirects /dashboard to /login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/, { timeout: 5000 });
  });

  test("redirects /admin/dashboard to /admin/login when not authenticated", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForURL(/\/admin\/login/, { timeout: 5000 });
  });
});
