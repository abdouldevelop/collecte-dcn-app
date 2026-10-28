const nodemailer = require("nodemailer");

console.log("🔧 Test 1 : Configuration Standard\n");

// Test 1 : Configuration standard
const transporter1 = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: "ak.camara@stat.plan.gouv.ci",
    pass: "#devCode21#",
  },
});

// Test 2 : Avec authMethod spécifique
const transporter2 = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    type: "login",
    user: "ak.camara@stat.plan.gouv.ci",
    pass: "#devCode21#",
  },
  authMethod: "LOGIN",
});

async function test() {
  console.log("📧 Test 1 : Configuration standard...");
  try {
    await transporter1.verify();
    console.log("✅ Test 1 : SUCCÈS !\n");

    // Essayer d'envoyer un email
    const info = await transporter1.sendMail({
      from: '"Collecte DCN" <ak.camara@stat.plan.gouv.ci>',
      to: "ak.camara@stat.plan.gouv.ci",
      subject: "Test Office365 - Configuration 1",
      text: "Email de test envoyé avec succès !",
    });
    console.log("✅ Email envoyé ! Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.log("❌ Test 1 : ÉCHEC");
    console.log("Erreur:", error.message, "\n");
  }

  console.log("📧 Test 2 : Avec authMethod LOGIN...");
  try {
    await transporter2.verify();
    console.log("✅ Test 2 : SUCCÈS !\n");

    const info = await transporter2.sendMail({
      from: '"Collecte DCN" <ak.camara@stat.plan.gouv.ci>',
      to: "ak.camara@stat.plan.gouv.ci",
      subject: "Test Office365 - Configuration 2",
      text: "Email de test envoyé avec succès !",
    });
    console.log("✅ Email envoyé ! Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.log("❌ Test 2 : ÉCHEC");
    console.log("Erreur:", error.message, "\n");
  }

  console.log("\n⚠️  DIAGNOSTIC :");
  console.log("════════════════════════════════════════════════════════");
  console.log("Tous les tests ont échoué avec l'erreur 535 (Authentication unsuccessful).");
  console.log("\nCela signifie que l'un des problèmes suivants existe :");
  console.log("");
  console.log("1. ❌ SMTP AUTH est désactivé pour ce compte");
  console.log("   → Activez-le dans Exchange Admin Center");
  console.log("");
  console.log("2. ❌ Le mot de passe est incorrect");
  console.log("   → Mot de passe utilisé : #devCode21#");
  console.log("   → Vérifiez si c'est le bon mot de passe");
  console.log("");
  console.log("3. ❌ Authentification Multifacteur (MFA) activée");
  console.log("   → Créez un mot de passe d'application");
  console.log("   → https://account.microsoft.com/security");
  console.log("");
  console.log("4. ❌ Politique de sécurité bloque les connexions");
  console.log("   → Vérifiez les stratégies d'authentification Exchange");
  console.log("");
  console.log("════════════════════════════════════════════════════════");
  console.log("\n💡 SOLUTION RAPIDE :");
  console.log("Puisque vous dites que ça fonctionne pour d'autres apps,");
  console.log("vérifiez quel mot de passe vous utilisez dans ces apps.");
  console.log("\nSi c'est un mot de passe d'application (xxxx-xxxx-xxxx-xxxx),");
  console.log("utilisez celui-là dans le fichier .env");
}

test().catch(console.error);
