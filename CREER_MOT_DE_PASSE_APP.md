# 🔐 Créer un Mot de Passe d'Application Office 365

## Pourquoi un Mot de Passe d'Application ?

Microsoft Office 365 **bloque l'authentification par mot de passe normal** pour les applications tierces par défaut. Vous devez créer un **mot de passe d'application** spécifique.

---

## 📝 Étapes pour Créer un Mot de Passe d'Application

### Méthode 1 : Via le Portail Microsoft 365 (Recommandé)

1. **Ouvrez votre navigateur** et allez sur :
   ```
   https://account.microsoft.com/security
   ```

2. **Connectez-vous** avec : `ak.camara@stat.plan.gouv.ci`

3. **Cliquez sur** : **"Paramètres de sécurité avancés"**

4. **Cherchez** : **"Mots de passe des applications"** ou **"App passwords"**

5. **Cliquez sur** : **"Créer un mot de passe d'application"**

6. **Nommez-le** : `Collecte DCN SMTP`

7. **Copiez le mot de passe généré** (format : `xxxx-xxxx-xxxx-xxxx`)
   - ⚠️ **Attention** : Il ne sera affiché qu'une seule fois !
   - Sauvegardez-le immédiatement

---

### Méthode 2 : Via Outlook Web (Alternative)

1. Allez sur : https://outlook.office365.com

2. **Cliquez sur** : Icône ⚙️ (Paramètres) → **Afficher tous les paramètres**

3. **Sécurité et confidentialité** → **Sécurité supplémentaire**

4. **Vérification de sécurité** → **Mots de passe d'application**

5. Créez un nouveau mot de passe pour **"Collecte DCN"**

---

### Méthode 3 : Demander à l'Administrateur

Si vous n'avez pas accès aux paramètres de sécurité :

1. Contactez l'administrateur IT de **stat.plan.gouv.ci**

2. Demandez-lui de :
   - **Activer SMTP AUTH** pour votre compte : `ak.camara@stat.plan.gouv.ci`
   - Ou vous créer un **mot de passe d'application**

3. Ou demandez-lui d'exécuter cette commande PowerShell :
   ```powershell
   Set-CASMailbox -Identity ak.camara@stat.plan.gouv.ci -SmtpClientAuthenticationDisabled $false
   ```

---

## 🧪 Tester le Mot de Passe d'Application

Une fois que vous avez le mot de passe d'application (format : `xxxx-xxxx-xxxx-xxxx`) :

### Étape 1 : Test rapide

```bash
cd /Users/mac/Desktop/camara_bureau/Projets/dcn_collete_app/collecte-dcn-app
node test-with-app-password.js
```

Quand demandé, **entrez le mot de passe d'application**.

### Étape 2 : Si le test réussit

Modifiez le fichier `.env` :

```bash
nano .env
```

Remplacez la ligne :
```env
SMTP_PASSWORD="#devCode21#"
```

Par :
```env
SMTP_PASSWORD="xxxx-xxxx-xxxx-xxxx"
```

Sauvegardez : `Ctrl+O` puis `Enter`, puis `Ctrl+X`

### Étape 3 : Redémarrer l'application

L'application devrait déjà tourner. Testez l'envoi d'email :

1. Allez sur : http://localhost:3000/admin/login
2. Connectez-vous :
   - Email : `admin@collecte-dcn.gov`
   - Mot de passe : `Admin@123456`
3. Allez dans **Entreprises** → **Nouvelle entreprise**
4. Créez une entreprise de test
5. L'email sera envoyé automatiquement !

---

## ⚠️ Si Vous N'Avez Pas Accès aux Paramètres

Si vous ne pouvez pas créer de mot de passe d'application, **deux options** :

### Option A : Utiliser un Service SMTP Tiers

**Brevo (gratuit 300 emails/jour)** :

1. Créez un compte sur : https://www.brevo.com
2. Allez dans **SMTP & API** → **SMTP**
3. Copiez vos identifiants SMTP
4. Modifiez `.env` :
   ```env
   SMTP_HOST="smtp-relay.brevo.com"
   SMTP_PORT="587"
   SMTP_USER="votre-email@brevo.com"
   SMTP_PASSWORD="votre_cle_smtp_brevo"
   SMTP_FROM="ak.camara@stat.plan.gouv.ci"
   SMTP_SECURE="false"
   ```

### Option B : Utiliser Gmail

1. Créez un compte Gmail dédié
2. Activez "Mots de passe d'application" Gmail
3. Configurez dans `.env` :
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="votre-email@gmail.com"
   SMTP_PASSWORD="mot_de_passe_application_gmail"
   SMTP_FROM="ak.camara@stat.plan.gouv.ci"
   SMTP_SECURE="false"
   ```

---

## 📞 Support

Pour toute aide, contactez :
- **Support Microsoft 365** : https://admin.microsoft.com/AdminPortal/Home#/support
- **Administrateur IT** : stat.plan.gouv.ci
