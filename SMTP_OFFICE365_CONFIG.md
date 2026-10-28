# Configuration SMTP Office365 pour Côte d'Ivoire

## Problème actuel
```
Error: 535 5.7.139 Authentication unsuccessful
```

Microsoft Office365 a **désactivé SMTP AUTH par défaut** depuis octobre 2022.

## ✅ Solution 1 : Activer SMTP AUTH (Recommandé)

### Étape 1 : Activer SMTP AUTH au niveau Organisation
1. Connectez-vous au **Centre d'administration Microsoft 365** : https://admin.microsoft.com
2. Allez dans **Paramètres** > **Paramètres de l'organisation** > **Sécurité et confidentialité**
3. Cliquez sur **Authentification moderne**
4. Cochez **Autoriser SMTP AUTH**

### Étape 2 : Activer SMTP AUTH pour la boîte mail spécifique
1. Allez dans **Exchange Admin Center** : https://admin.exchange.microsoft.com
2. **Destinataires** > **Boîtes aux lettres**
3. Sélectionnez la boîte `ak.camara@stat.plan.gouv.ci`
4. Cliquez sur l'onglet **Paramètres de messagerie**
5. Sous **Authentification du client mail**, activez **Authenticated SMTP (SMTP AUTH)**
6. Enregistrez

### Étape 3 : Tester
```bash
node test-email.js
```

---

## ✅ Solution 2 : Utiliser un Mot de Passe d'Application

Si **l'authentification multifacteur (MFA)** est activée :

1. Allez sur https://account.microsoft.com/security
2. Sous **Sécurité avancée** > **Mots de passe des applications**
3. Créez un nouveau mot de passe d'application nommé "Collecte DCN SMTP"
4. Copiez le mot de passe généré (format : xxxx-xxxx-xxxx-xxxx)
5. Mettez à jour le fichier `.env` :
   ```env
   SMTP_PASSWORD="xxxx-xxxx-xxxx-xxxx"
   ```

---

## ✅ Solution 3 : Utiliser un Service SMTP Alternatif

Si vous ne pouvez pas modifier les paramètres Office365, utilisez un service tiers :

### Option A : Gmail
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre-email@gmail.com"
SMTP_PASSWORD="mot-de-passe-application"
SMTP_FROM="votre-email@gmail.com"
SMTP_SECURE="false"
```

### Option B : SendGrid (Gratuit jusqu'à 100 emails/jour)
1. Créez un compte sur https://sendgrid.com
2. Créez une clé API
3. Configuration :
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="votre_cle_api_sendgrid"
SMTP_FROM="ak.camara@stat.plan.gouv.ci"
SMTP_SECURE="false"
```

### Option C : Brevo (ex-Sendinblue) - Gratuit 300 emails/jour
1. Créez un compte sur https://www.brevo.com
2. Configuration :
```env
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_USER="votre-email-brevo"
SMTP_PASSWORD="cle_smtp_brevo"
SMTP_FROM="ak.camara@stat.plan.gouv.ci"
SMTP_SECURE="false"
```

---

## 🔍 Vérifier l'état actuel

### Test 1 : Connexion SMTP
```bash
node test-email.js
```

### Test 2 : Vérifier avec telnet
```bash
telnet smtp.office365.com 587
# Si connexion OK, vous verrez : 220 smtp.office365.com Microsoft ESMTP
```

---

## 📧 Après Configuration

Une fois SMTP configuré, testez l'envoi depuis l'application :
1. Connectez-vous en tant qu'admin : http://localhost:3000/admin/login
2. Créez une nouvelle entreprise
3. L'email de bienvenue sera envoyé automatiquement
4. Vérifiez la boîte mail (et le dossier spam)

---

## ⚠️ Notes Importantes

- **Office365 limite SMTP** : 10,000 emails/jour, 30 emails/minute
- Vérifiez le **dossier SPAM** après le premier envoi
- L'adresse `ak.camara@stat.plan.gouv.ci` doit être **vérifiée** dans Office365
- Pour la production, utilisez un **SPF record** pour éviter le spam
