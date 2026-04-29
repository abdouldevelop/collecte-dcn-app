# Référentiel Interfaces — Application de Collecte Secondaire

## Charte graphique obligatoire
- Vert principal : `#496559`
- Orange accent : `#f39221`
- Fond général : `#F8F9FA`
- Texte principal : `#1F2937`
- Bordure : `#E5E7EB`
- Succès : `#16A34A`
- Avertissement : `#F59E0B`
- Erreur : `#DC2626`

## Règles UI générales
- Interface professionnelle, sobre, institutionnelle.
- Labels visibles sur tous les champs.
- États obligatoires : chargement, vide, erreur, succès.
- Responsive desktop, tablette et mobile.
- Les tableaux doivent proposer recherche, filtres et pagination si nécessaire.

---

# Page 4 — `/profil`
# Interface : Profil Entreprise

## Objectif métier
Permettre à l’entreprise de consulter et mettre à jour ses informations administratives et de contact. Ces informations identifient officiellement l’entreprise dans le système.

## Sections
### Identité entreprise
- Nom officiel
- Sigle
- RCCM
- NCC
- Numéro interne système
- Date création compte
- Statut du compte

Les champs sensibles comme RCCM et NCC peuvent être en lecture seule.

### Coordonnées
- Email principal
- Téléphone principal
- Téléphone secondaire
- Adresse
- Ville / Commune
- Pays

### Responsable principal
- Nom
- Fonction
- Email
- Téléphone

### Sécurité du compte
- Changer mot de passe
- Dernière connexion
- Dernier changement de mot de passe

### Préférences
- Notifications email
- Rappels mensuels
- Confirmations de soumission

## Actions
- Modifier
- Enregistrer
- Annuler

## Validations
Email valide, téléphone conforme, champs obligatoires, unicité email si modifiable.

## API
- `GET /api/company/me`
- `PATCH /api/company/me`
- `POST /api/auth/change-password`

## Prompt IA UI
Créer une page Profil Entreprise en cartes structurées : identité, coordonnées, responsable, sécurité, préférences. Champs sensibles en lecture seule, boutons modifier/enregistrer, design institutionnel et responsive.
