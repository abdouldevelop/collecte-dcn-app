const nodemailer = require("nodemailer");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("═══════════════════════════════════════════════════════════");
console.log("  Test SMTP Office365 avec Mot de Passe d'Application");
console.log("═══════════════════════════════════════════════════════════\n");

console.log("Si vous avez MFA activée, vous devez utiliser un mot de passe");
console.log("d'application au lieu du mot de passe normal.\n");

console.log("Pour créer un mot de passe d'application :");
console.log("1. Allez sur : https://account.microsoft.com/security");
console.log("2. Cliquez sur 'Mots de passe des applications'");
console.log("3. Créez un nouveau mot de passe pour 'Collecte DCN'");
console.log("4. Copiez le mot de passe (format: xxxx-xxxx-xxxx-xxxx)\n");

rl.question("Entrez le mot de passe à tester (ou appuyez sur Enter pour utiliser '#devCode21#'): ", async (password) => {
  const testPassword = password.trim() || "#devCode21#";

  console.log("\n🔧 Test avec le mot de passe :", testPassword.substring(0, 4) + "****");
  console.log("📧 Tentative de connexion...\n");

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: "ak.camara@stat.plan.gouv.ci",
      pass: testPassword,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ CONNEXION RÉUSSIE !\n");

    console.log("📨 Envoi d'un email de test...");
    const info = await transporter.sendMail({
      from: '"Collecte DCN Test" <ak.camara@stat.plan.gouv.ci>',
      to: "ak.camara@stat.plan.gouv.ci",
      subject: "Test SMTP Réussi - Collecte DCN",
      html: `
        <h2 style="color: #496559;">✅ Configuration SMTP Validée</h2>
        <p>Félicitations ! Votre configuration SMTP fonctionne correctement.</p>
        <p><strong>Mot de passe utilisé :</strong> ${testPassword.substring(0, 4)}****</p>
        <p>Vous pouvez maintenant utiliser ce mot de passe dans votre fichier .env</p>
      `,
    });

    console.log("✅ EMAIL ENVOYÉ AVEC SUCCÈS !");
    console.log("📬 Message ID:", info.messageId);
    console.log("\n⚠️  Vérifiez votre boîte mail : ak.camara@stat.plan.gouv.ci");
    console.log("    (Vérifiez aussi le dossier SPAM)\n");

    console.log("═══════════════════════════════════════════════════════════");
    console.log("  PROCHAINE ÉTAPE : Mettre à jour le fichier .env");
    console.log("═══════════════════════════════════════════════════════════\n");
    console.log("Modifiez la ligne dans .env :");
    console.log(`SMTP_PASSWORD="${testPassword}"`);
    console.log("\nPuis relancez l'application : npm run dev\n");

  } catch (error) {
    console.log("❌ ÉCHEC DE LA CONNEXION");
    console.log("\nErreur :", error.message);

    if (error.message.includes("535")) {
      console.log("\n⚠️  Le mot de passe est incorrect ou SMTP AUTH est désactivé.");
      console.log("\nVérifiez :");
      console.log("1. Le mot de passe est-il correct ?");
      console.log("2. SMTP AUTH est-il activé dans Exchange Admin Center ?");
      console.log("3. Utilisez-vous un mot de passe d'application si MFA est activée ?");
    }
  }

  rl.close();
});
