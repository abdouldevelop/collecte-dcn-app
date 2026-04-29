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

# Page 14 — `/admin/dashboard`
# Interface : Dashboard Administration

## Objectif métier
Servir de tour de contrôle administrative : suivre collecte, entreprises, déclarations, invitations, anomalies, imports produits et import des unités.

## KPI
Entreprises enregistrées, comptes activés, invitations en attente, déclarations reçues, retardataires, taux de complétion.

## Invitations entreprises
### Invitation unitaire
Champs : nom entreprise, email, RCCM optionnel, NCC optionnel. Bouton `Envoyer invitation`. Le système génère un token, envoie l’email et enregistre le statut.

### Invitation en masse
Bouton `Importer fichier entreprises`. Colonnes : nom_entreprise, email, rccm, ncc. Support upload classique, drag and drop, aperçu, rapport erreurs, envoi massif.

## Import des unités côté admin
### Objectif
Charger la liste officielle des unités disponibles dans les formulaires Import et Export. Les entreprises ne saisissent pas les unités librement : elles les sélectionnent dans cette liste.

### Bouton
`Importer unités`

### Modes
Upload classique et drag and drop. Formats : xlsx, xls, csv.

### Colonnes attendues
- `code_unite`
- `libelle_unite`

Exemples : `02 - KILOGRAMME NET`, `04 - TONNE NETTE`, `10 - LITRE`, `21 - UNITE`.

### Fonctionnalités
Télécharger modèle Excel, prévisualiser lignes, détecter doublons, afficher erreurs, confirmer import, journaliser opération. Les unités importées alimentent `/declarations/import` et `/declarations/export`.

## Suivi invitations
Tableau : entreprise, email, date envoi, statut, action relancer. Actions : renvoyer lien, copier lien, annuler invitation.

## Alertes
Invitations expirées, entreprises non activées, retardataires, erreurs import fichiers, unités non chargées, nouveaux produits ajoutés par entreprises.

## API
- `GET /api/admin/dashboard`
- `POST /api/admin/invitations`
- `POST /api/admin/invitations/import`
- `POST /api/admin/units/import`
- `GET /api/admin/units`

## Prompt IA UI
Créer un dashboard admin complet avec KPI, invitations, suivi invitations, progression collecte et module Importer unités. Le module unités doit supporter upload/drag-and-drop, modèle Excel, prévisualisation, rapport d’erreurs et confirmation. Design enterprise avec sidebar verte et cartes.
