const nodemailer = require("nodemailer");

const configs = [
  {
    name: "Config 1: Standard Office365",
    settings: {
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: "ak.camara@stat.plan.gouv.ci",
        pass: "#devCode21#",
      },
    },
  },
  {
    name: "Config 2: Sans TLS custom",
    settings: {
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: "ak.camara@stat.plan.gouv.ci",
        pass: "#devCode21#",
      },
      tls: {
        rejectUnauthorized: false,
      },
    },
  },
  {
    name: "Config 3: Avec minVersion TLS1.2",
    settings: {
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: "ak.camara@stat.plan.gouv.ci",
        pass: "#devCode21#",
      },
      tls: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: false,
      },
    },
  },
  {
    name: "Config 4: Port 465 SSL direct",
    settings: {
      host: "smtp.office365.com",
      port: 465,
      secure: true,
      auth: {
        user: "ak.camara@stat.plan.gouv.ci",
        pass: "#devCode21#",
      },
      tls: {
        rejectUnauthorized: false,
      },
    },
  },
  {
    name: "Config 5: Sans ciphers SSLv3",
    settings: {
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: "ak.camara@stat.plan.gouv.ci",
        pass: "#devCode21#",
      },
      tls: {
        minVersion: "TLSv1.2",
        maxVersion: "TLSv1.3",
      },
    },
  },
  {
    name: "Config 6: Authentication method PLAIN",
    settings: {
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        type: "login",
        user: "ak.camara@stat.plan.gouv.ci",
        pass: "#devCode21#",
      },
      authMethod: "PLAIN",
      tls: {
        minVersion: "TLSv1.2",
      },
    },
  },
];

async function testConfig(config) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`🧪 TEST: ${config.name}`);
  console.log("=".repeat(70));

  const transporter = nodemailer.createTransport(config.settings);

  try {
    console.log("⏳ Tentative de connexion...");
    await transporter.verify();
    console.log("✅ CONNEXION RÉUSSIE !");

    console.log("📧 Envoi d'un email de test...");
    const info = await transporter.sendMail({
      from: '"Collecte DCN" <ak.camara@stat.plan.gouv.ci>',
      to: "ak.camara@stat.plan.gouv.ci",
      subject: `Test réussi - ${config.name}`,
      text: `Cette configuration fonctionne !\n\n${JSON.stringify(config.settings, null, 2)}`,
      html: `
        <h2 style="color: green;">✅ Configuration Validée</h2>
        <h3>${config.name}</h3>
        <p>Cette configuration SMTP fonctionne correctement !</p>
        <pre>${JSON.stringify(config.settings, null, 2)}</pre>
      `,
    });

    console.log("✅ EMAIL ENVOYÉ AVEC SUCCÈS !");
    console.log("📬 Message ID:", info.messageId);
    console.log("\n🎉 CETTE CONFIGURATION FONCTIONNE ! 🎉");
    return { success: true, config };
  } catch (error) {
    console.log("❌ ÉCHEC");
    console.log("Erreur:", error.message.split("\n")[0]);
    return { success: false, config, error: error.message };
  }
}

async function runAllTests() {
  console.log("\n╔════════════════════════════════════════════════════════════════════╗");
  console.log("║   TEST DE TOUTES LES CONFIGURATIONS SMTP OFFICE365                ║");
  console.log("╚════════════════════════════════════════════════════════════════════╝\n");

  const results = [];

  for (const config of configs) {
    const result = await testConfig(config);
    results.push(result);

    // Si on trouve une config qui marche, on s'arrête
    if (result.success) {
      console.log("\n" + "=".repeat(70));
      console.log("🎯 CONFIGURATION GAGNANTE TROUVÉE !");
      console.log("=".repeat(70));
      console.log("\n📋 Utilisez cette configuration dans lib/mail.ts :\n");
      console.log(JSON.stringify(result.config.settings, null, 2));
      break;
    }

    // Attendre un peu entre les tests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Résumé final
  console.log("\n\n╔════════════════════════════════════════════════════════════════════╗");
  console.log("║                         RÉSUMÉ DES TESTS                           ║");
  console.log("╚════════════════════════════════════════════════════════════════════╝\n");

  results.forEach((result, index) => {
    const status = result.success ? "✅ SUCCÈS" : "❌ ÉCHEC";
    console.log(`${index + 1}. ${status} - ${result.config.name}`);
  });

  const successCount = results.filter((r) => r.success).length;
  console.log(`\n📊 Résultat: ${successCount}/${results.length} configurations réussies\n`);

  if (successCount === 0) {
    console.log("⚠️  AUCUNE CONFIGURATION N'A FONCTIONNÉ");
    console.log("\nPossibles causes :");
    console.log("1. SMTP AUTH désactivé pour ce compte");
    console.log("2. Mot de passe incorrect (même si vous dites qu'il marche ailleurs)");
    console.log("3. MFA activée - besoin d'un mot de passe d'application");
    console.log("4. IP bloquée par Office365");
    console.log("\n💡 Contactez l'administrateur Office365 de stat.plan.gouv.ci");
  }
}

runAllTests().catch(console.error);
