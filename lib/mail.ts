import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: false,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
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
            Ce lien est valable 7 jours.
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
