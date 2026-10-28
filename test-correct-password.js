const nodemailer = require("nodemailer");

console.log("═══════════════════════════════════════════════════════════");
console.log("  Test SMTP avec le BON mot de passe : #devCode2021#");
console.log("═══════════════════════════════════════════════════════════\n");

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: "ak.camara@stat.plan.gouv.ci",
    pass: "#devCode2021#",  // LE BON MOT DE PASSE !
  },
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
});

async function testEmail() {
  try {
    console.log("🔧 Test de connexion SMTP Office365...");
    await transporter.verify();
    console.log("✅ CONNEXION RÉUSSIE !\n");

    console.log("📧 Envoi d'un email de test...");
    const info = await transporter.sendMail({
      from: '"Collecte DCN" <ak.camara@stat.plan.gouv.ci>',
      to: "ak.camara@stat.plan.gouv.ci",
      cc: "mmeite@yahoo.fr",
      subject: "✅ Test SMTP Réussi - Collecte DCN",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #496559; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0;">Collecte DCN</h1>
          </div>
          <div style="padding: 32px; background: #ffffff; border: 1px solid #E5E7EB;">
            <h2 style="color: #16A34A;">✅ Configuration SMTP Validée !</h2>
            <p style="color: #374151;">
              Félicitations ! La configuration SMTP Office365 fonctionne correctement.
            </p>
            <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Serveur :</strong> smtp.office365.com</p>
              <p style="margin: 8px 0 0 0;"><strong>Port :</strong> 587</p>
              <p style="margin: 8px 0 0 0;"><strong>Utilisateur :</strong> ak.camara@stat.plan.gouv.ci</p>
              <p style="margin: 8px 0 0 0;"><strong>Mot de passe :</strong> #devCode2021# ✅</p>
            </div>
            <p style="color: #6B7280; font-size: 14px;">
              Date du test : ${new Date().toLocaleString('fr-FR')}
            </p>
          </div>
          <div style="padding: 16px 32px; background: #F8F9FA; text-align: center;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              Email envoyé automatiquement par la plateforme Collecte DCN
            </p>
          </div>
        </div>
      `,
    });

    console.log("✅ EMAIL ENVOYÉ AVEC SUCCÈS !");
    console.log("📬 Message ID:", info.messageId);
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  🎉 TOUT FONCTIONNE PARFAITEMENT ! 🎉");
    console.log("═══════════════════════════════════════════════════════════\n");
    console.log("⚠️  Vérifiez vos boîtes mail :");
    console.log("   - ak.camara@stat.plan.gouv.ci (destinataire principal)");
    console.log("   - mmeite@yahoo.fr (en copie)");
    console.log("   (Vérifiez aussi les dossiers SPAM)\n");
    console.log("✅ L'application peut maintenant envoyer des emails !\n");

  } catch (error) {
    console.log("❌ ERREUR lors du test :");
    console.log("   ", error.message);
    console.log("\n⚠️  Si l'erreur persiste, vérifiez que le mot de passe");
    console.log("    #devCode2021# est bien correct.\n");
  }
}

testEmail();
