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

# Page 15 — `/admin/entreprises`
# Interface : Gestion des Entreprises

## Objectif métier
Permettre à l’administration de consulter, rechercher, filtrer et suivre toutes les entreprises.

## Header
Titre `Gestion des Entreprises`, total entreprises, total filtré, boutons Envoyer invitation, Importer entreprises.

## Recherche
Par nom, sigle, email, RCCM, NCC.

## Filtres
Statut compte (Actif, Non activé, Suspendu, Invité uniquement), statut invitation, statut déclaration mensuelle, date création, présence point focal.

## Tableau
Colonnes : nom entreprise, sigle, email principal, RCCM, NCC, point focal, statut compte, invitation, déclaration du mois, dernière connexion, actions.

## Actions
Voir fiche, renvoyer invitation, envoyer rappel, suspendre, réactiver. Actions massives : rappels, invitations, export sélection, changement statut si autorisé.

## API
- `GET /api/admin/companies`
- `POST /api/admin/companies/import`
- `POST /api/admin/invitations/{id}/resend`
- `PATCH /api/admin/companies/{id}/status`

## Prompt IA UI
Créer une page back-office Entreprises avec tableau avancé, recherche, filtres, badges, actions individuelles/massives, pagination et design dense mais lisible.
