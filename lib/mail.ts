import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS ?? "",
      }
    : undefined,
  // Office365 and other STARTTLS providers
  requireTLS: true,
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 15000,
});

const FROM = process.env.SMTP_FROM ?? "noreply@collecte-dcn.gov";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendInvitationEmail(params: {
  to: string;
  companyName: string;
  token: string;
}): Promise<void> {
  const url = `${APP_URL}/onboarding?token=${params.token}`;
  await transporter.sendMail({
    from: `"Collecte DCN" <${FROM}>`,
    to: params.to,
    subject: "Invitation à rejoindre la plateforme de collecte",
    html: `
      <div style="font-family: 'Public Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #496559; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Collecte DCN</h1>
        </div>
        <div style="padding: 32px; background: #ffffff;">
          <h2 style="color: #1F2937;">Invitation à déclarer</h2>
          <p style="color: #374151;">Bonjour,</p>
          <p style="color: #374151;">
            Vous êtes invité(e) à créer votre compte sur la plateforme de collecte de données
            statistiques pour l'entreprise <strong>${params.companyName}</strong>.
          </p>
          <p style="color: #374151;">
            Cliquez sur le bouton ci-dessous pour finaliser votre inscription.
            Ce lien personnel et sécurisé est valable 72 heures.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}"
               style="background: #496559; color: white; padding: 12px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Créer mon compte
            </a>
          </div>
          <p style="color: #6B7280; font-size: 14px;">
            Si vous ne pouvez pas cliquer sur le bouton, copiez ce lien dans votre navigateur :<br/>
            <a href="${url}" style="color: #496559;">${url}</a>
          </p>
        </div>
        <div style="padding: 16px 32px; background: #F8F9FA; text-align: center;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            Cet email a été envoyé automatiquement par la plateforme de collecte statistique.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendFocalPointInvitationEmail(params: {
  to: string;
  companyName: string;
  firstName: string;
  token: string;
}): Promise<void> {
  const url = `${APP_URL}/focal-point/onboarding?token=${params.token}`;
  await transporter.sendMail({
    from: `"Collecte DCN" <${FROM}>`,
    to: params.to,
    subject: `Invitation Point Focal — ${params.companyName}`,
    html: `
      <div style="font-family: 'Public Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #496559; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Collecte DCN</h1>
        </div>
        <div style="padding: 32px; background: #ffffff;">
          <h2 style="color: #1F2937;">Vous êtes invité(e) comme Point Focal</h2>
          <p style="color: #374151;">Bonjour ${params.firstName},</p>
          <p style="color: #374151;">
            Vous avez été désigné(e) comme point focal de l'entreprise
            <strong>${params.companyName}</strong> sur la plateforme de collecte statistique.
          </p>
          <p style="color: #374151;">
            Cliquez sur le bouton ci-dessous pour créer votre accès. Ce lien est valable 7 jours.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}"
               style="background: #f39221; color: white; padding: 12px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Créer mon accès Point Focal
            </a>
          </div>
          <p style="color: #6B7280; font-size: 14px;">
            Lien : <a href="${url}" style="color: #496559;">${url}</a>
          </p>
        </div>
        <div style="padding: 16px 32px; background: #F8F9FA; text-align: center;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            Plateforme de collecte statistique — Accès réservé aux points focaux désignés.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  token: string;
}): Promise<void> {
  const url = `${APP_URL}/reset-password?token=${params.token}`;
  await transporter.sendMail({
    from: `"Collecte DCN" <${FROM}>`,
    to: params.to,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family: 'Public Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #496559; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Collecte DCN</h1>
        </div>
        <div style="padding: 32px; background: #ffffff;">
          <h2 style="color: #1F2937;">Réinitialisation du mot de passe</h2>
          <p style="color: #374151;">
            Vous avez demandé la réinitialisation de votre mot de passe.
            Cliquez sur le lien ci-dessous (valable 1 heure) :
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}"
               style="background: #496559; color: white; padding: 12px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendWelcomeEmailWithCredentials(params: {
  to: string;
  companyName: string;
  email: string;
  temporaryPassword: string;
}): Promise<void> {
  const loginUrl = `${APP_URL}/login`;
  await transporter.sendMail({
    from: `"Collecte DCN" <${FROM}>`,
    to: params.to,
    subject: "Bienvenue sur la plateforme de collecte statistique",
    html: `
      <div style="font-family: 'Public Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #496559; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Collecte DCN</h1>
        </div>
        <div style="padding: 32px; background: #ffffff;">
          <h2 style="color: #1F2937;">Bienvenue sur la plateforme !</h2>
          <p style="color: #374151;">Bonjour,</p>
          <p style="color: #374151;">
            Votre compte a été créé avec succès pour l'entreprise <strong>${params.companyName}</strong>.
          </p>
          <p style="color: #374151;">
            Voici vos identifiants de connexion :
          </p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 8px 0; color: #374151;">
              <strong>Email :</strong> ${params.email}
            </p>
            <p style="margin: 8px 0; color: #374151;">
              <strong>Mot de passe temporaire :</strong>
              <span style="font-family: 'Courier New', monospace; background: #E5E7EB; padding: 4px 8px; border-radius: 4px;">
                ${params.temporaryPassword}
              </span>
            </p>
          </div>
          <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #92400E; font-size: 14px;">
              <strong>⚠️ Important :</strong> Vous devrez changer ce mot de passe lors de votre première connexion.
            </p>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${loginUrl}"
               style="background: #496559; color: white; padding: 12px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Se connecter
            </a>
          </div>
          <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 24px 0;">
            <h3 style="margin: 0 0 8px 0; color: #1E40AF; font-size: 16px;">Prochaines étapes :</h3>
            <ol style="margin: 8px 0; padding-left: 20px; color: #1E40AF;">
              <li style="margin: 4px 0;">Connectez-vous avec vos identifiants</li>
              <li style="margin: 4px 0;">Changez votre mot de passe temporaire</li>
              <li style="margin: 4px 0;">Ajoutez vos points focaux</li>
              <li style="margin: 4px 0;">Commencez à soumettre vos déclarations mensuelles</li>
            </ol>
          </div>
        </div>
        <div style="padding: 16px 32px; background: #F8F9FA; text-align: center;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            Cet email a été envoyé automatiquement par la plateforme de collecte statistique.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendMonthlyReminderEmail(params: {
  to: string;
  companyName: string;
  periodLabel: string;
  dueDate: Date;
  daysRemaining: number;
}): Promise<void> {
  const declarationsUrl = `${APP_URL}/declarations`;
  const dueDate = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: "Africa/Abidjan",
  }).format(params.dueDate);
  const timing = params.daysRemaining > 0
    ? `Il vous reste ${params.daysRemaining} jour${params.daysRemaining > 1 ? "s" : ""}.`
    : params.daysRemaining === 0
      ? "L’échéance est aujourd’hui."
      : `L’échéance est dépassée de ${Math.abs(params.daysRemaining)} jour${Math.abs(params.daysRemaining) > 1 ? "s" : ""}.`;

  await transporter.sendMail({
    from: `"Collecte DCN" <${FROM}>`,
    to: params.to,
    subject: `Rappel de déclaration — ${params.periodLabel}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #496559; padding: 28px; text-align: center; color: white;">
          <h1>Collecte DCN</h1>
        </div>
        <div style="padding: 30px;">
          <p>Bonjour,</p>
          <p>La déclaration mensuelle de <strong>${params.companyName}</strong> pour la période
             <strong>${params.periodLabel}</strong> n’est pas encore complète.</p>
          <p>Date limite : <strong>${dueDate}</strong>. ${timing}</p>
          <p style="text-align: center; margin: 30px;">
            <a href="${declarationsUrl}" style="background: #f39221; color: white; padding: 12px 26px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Compléter ma déclaration
            </a>
          </p>
          <p style="color: #6B7280; font-size: 13px;">Ce rappel est envoyé automatiquement par la plateforme DCN.</p>
        </div>
      </div>
    `,
  });
}
