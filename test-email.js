const nodemailer = require("nodemailer");

// Configuration Office365 standard
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "ak.camara@stat.plan.gouv.ci",
    pass: "#devCode21#",
  },
  tls: {
    // Ne pas forcer SSLv3, utiliser les défauts modernes
    rejectUnauthorized: false,
  },
  // Timeouts plus longs pour Office365
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  debug: true,
  logger: true,
});

async function testEmail() {
  console.log("🔧 Test de connexion SMTP Office365...\n");

  try {
    // Test de vérification de connexion
    await transporter.verify();
    console.log("✅ Connexion SMTP réussie !\n");

    // Envoi d'un email de test
    console.log("📧 Envoi d'un email de test...");
    const info = await transporter.sendMail({
      from: '"Collecte DCN Test" <ak.camara@stat.plan.gouv.ci>',
      to: "ak.camara@stat.plan.gouv.ci",
      subject: "Test Email - Collecte DCN",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #496559;">Test Email Réussi !</h2>
          <p>Ceci est un email de test envoyé depuis l'application Collecte DCN.</p>
          <p>Si vous recevez cet email, la configuration SMTP fonctionne correctement.</p>
          <p style="color: #666; font-size: 12px;">
            Envoyé le : ${new Date().toLocaleString('fr-FR')}
          </p>
        </div>
      `,
    });

    console.log("✅ Email envoyé avec succès !");
    console.log("📬 Message ID:", info.messageId);
    console.log("📨 Response:", info.response);
    console.log("\n⚠️ Vérifiez votre boîte de réception : ak.camara@stat.plan.gouv.ci");
    console.log("⚠️ Vérifiez aussi le dossier SPAM/Courrier indésirable !");
  } catch (error) {
    console.error("❌ Erreur lors du test email :");
    console.error(error.message);
    if (error.code) console.error("Code d'erreur:", error.code);
    if (error.command) console.error("Commande:", error.command);
  }
}

testEmail();
