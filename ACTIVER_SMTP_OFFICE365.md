# 🔧 Guide d'Activation SMTP AUTH Office365 - Côte d'Ivoire

## ✅ Étape 1 : Activer SMTP AUTH au Niveau Organisation

### Via le Centre d'administration Exchange (Recommandé)

1. **Connectez-vous au Centre d'administration Exchange** :
   - URL : https://admin.exchange.microsoft.com
   - Utilisez vos identifiants admin Microsoft 365

2. **Allez dans "Boîtes aux lettres"** :
   - Menu : **Destinataires** → **Boîtes aux lettres**
   - Ou directement : https://admin.exchange.microsoft.com/#/mailboxes

3. **Sélectionnez la boîte mail** :
   - Cherchez et cliquez sur : `ak.camara@stat.plan.gouv.ci`

4. **Modifier les paramètres de protocole** :
   - Cliquez sur l'onglet **"Messagerie e-mail"** (ou "Mail")
   - Descendez jusqu'à **"Gérer les paramètres de protocole du client de messagerie"**
   - Cliquez sur **"Gérer les paramètres de protocole du client de messagerie"**

5. **Activer SMTP AUTH** :
   - Cochez la case **"Authenticated SMTP"** (SMTP authentifié)
   - Cliquez sur **"Enregistrer"**

---

## ✅ Étape 2 : Vérifier les Paramètres de Sécurité

### Option A : Via PowerShell (Plus rapide)

Si vous avez accès à PowerShell Exchange Online :

```powershell
# 1. Installer le module (si pas déjà fait)
Install-Module -Name ExchangeOnlineManagement

# 2. Se connecter
Connect-ExchangeOnline -UserPrincipalName admin@votre-domaine.com

# 3. Vérifier l'état actuel
Get-CASMailbox -Identity ak.camara@stat.plan.gouv.ci | Select SmtpClientAuthenticationDisabled

# 4. Activer SMTP AUTH
Set-CASMailbox -Identity ak.camara@stat.plan.gouv.ci -SmtpClientAuthenticationDisabled $false

# 5. Vérifier que c'est activé
Get-CASMailbox -Identity ak.camara@stat.plan.gouv.ci | Select SmtpClientAuthenticationDisabled
# Résultat attendu : SmtpClientAuthenticationDisabled = False
```

### Option B : Via le Portail Azure (Alternative)

1. **Connectez-vous au portail Azure** : https://portal.azure.com
2. **Azure Active Directory** → **Utilisateurs**
3. Cherchez : `ak.camara@stat.plan.gouv.ci`
4. **Propriétés** → **Paramètres de boîte aux lettres**
5. Vérifiez que **SMTP AUTH** est autorisé

---

## ✅ Étape 3 : Vérifier les Stratégies d'Authentification

### Dans le Centre d'administration Microsoft 365

1. **Connectez-vous** : https://admin.microsoft.com
2. **Paramètres** → **Paramètres de l'organisation**
3. **Sécurité et confidentialité** → **Authentification moderne**
4. Assurez-vous que **"Authentification de base"** est autorisée pour SMTP

OU

1. **Exchange Admin Center** : https://admin.exchange.microsoft.com
2. **Paramètres** → **Stratégies d'authentification**
3. Vérifiez que SMTP AUTH n'est pas bloqué dans les stratégies

---

## ✅ Étape 4 : Délai de Propagation

⏱️ **Attention** : Après avoir activé SMTP AUTH, attendez **5 à 15 minutes** pour que les changements se propagent.

---

## 🧪 Étape 5 : Tester la Connexion

Après avoir attendu 5-15 minutes :

```bash
cd /Users/mac/Desktop/camara_bureau/Projets/dcn_collete_app/collecte-dcn-app
node test-email.js
```

### Résultat Attendu :
```
✅ Connexion SMTP réussie !
📧 Envoi d'un email de test...
✅ Email envoyé avec succès !
```

---

## 🔍 Si Ça Ne Fonctionne Toujours Pas

### Vérification 1 : Le Mot de Passe est-il Correct ?

```bash
# Vérifiez le mot de passe dans .env
cat .env | grep SMTP_PASSWORD
```

Doit afficher : `SMTP_PASSWORD="#devCode21#"`

### Vérification 2 : Le Compte a-t-il MFA Activé ?

Si l'authentification multifacteur est activée :
1. Allez sur : https://account.microsoft.com/security
2. **Paramètres de sécurité avancés** → **Mots de passe des applications**
3. Créez un nouveau mot de passe d'application nommé **"Collecte DCN"**
4. Copiez le mot de passe généré (format : `xxxx-xxxx-xxxx-xxxx`)
5. Modifiez le fichier `.env` :
   ```bash
   nano .env
   # Remplacez la ligne SMTP_PASSWORD par :
   SMTP_PASSWORD="xxxx-xxxx-xxxx-xxxx"
   ```
6. Testez à nouveau : `node test-email.js`

### Vérification 3 : Tester avec Telnet

```bash
telnet smtp.office365.com 587
# Tapez : EHLO test
# Cherchez dans la réponse : "250-AUTH LOGIN"
# Pour quitter : Ctrl+] puis "quit"
```

---

## 📧 Après Configuration Réussie

Une fois que `node test-email.js` fonctionne, testez dans l'application :

1. **Connectez-vous en admin** : http://localhost:3000/admin/login
   - Email : `admin@collecte-dcn.gov`
   - Mot de passe : `Admin@123456`

2. **Créez une nouvelle entreprise** :
   - Menu : **Entreprises** → **Nouvelle entreprise**
   - Remplissez le formulaire
   - Cliquez sur **"Créer l'entreprise"**

3. **Vérifiez l'email** :
   - Un email sera envoyé automatiquement à l'adresse de l'entreprise
   - Vérifiez aussi le **dossier SPAM** si besoin

---

## ⚠️ Limites Office365 SMTP

- **10,000 emails par jour** maximum
- **30 emails par minute** maximum
- Première utilisation peut être marquée comme spam (normal)

---

## 🆘 Support

Si après toutes ces étapes ça ne fonctionne pas, contactez :
- Support Microsoft 365 de votre organisation
- Administrateur IT de stat.plan.gouv.ci

Ou utilisez l'**Option C : Brevo** (gratuit 300 emails/jour) comme alternative rapide.
