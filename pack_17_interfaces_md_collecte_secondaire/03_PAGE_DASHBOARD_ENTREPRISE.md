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

# Page 3 — `/dashboard`
# Interface : Dashboard Entreprise

## Objectif métier
Servir de centre opérationnel mensuel pour l’entreprise. Cette page affiche la période active, le statut des déclarations Import/Export, les actions en attente, les alertes produits et les raccourcis utiles.

## Fonctionnalités
### Header utilisateur
Afficher nom entreprise, sigle, période active, menu utilisateur et déconnexion.

### Cartes de synthèse
- Statut général du mois : non commencé, brouillon, partiel, soumis, retard.
- Carte Import : nombre de produits Import/IE, lignes renseignées, dernière sauvegarde, bouton `Renseigner Import`.
- Carte Export : nombre de produits Export/IE, lignes renseignées, dernière sauvegarde, bouton `Renseigner Export`.
- Carte échéance : date indicative, jours restants, alerte si retard.

### Actions rapides
- Renseigner Import
- Renseigner Export
- Consulter Produits
- Mettre à jour Point Focal
- Voir Historique

### Produits à vérifier
Afficher une alerte si des produits préchargés nécessitent une observation, si l’entreprise a ajouté des produits ou si aucun produit n’est disponible.

### Notifications
Relances, confirmations, nouveaux produits chargés, échéances.

### Historique rapide
Afficher les trois dernières périodes avec statuts Import/Export et date de soumission.

## Règles intelligentes
- Si aucun point focal : alerte importante.
- Si aucun produit : orienter vers Produits.
- Si Import soumis mais Export non commencé : pousser l’action Export.
- Si tout est soumis : message de conformité.

## API
- `GET /api/company/dashboard`
- `GET /api/declarations/current-status`
- `GET /api/company/products/summary`

## Prompt IA UI
Créer un dashboard entreprise avec sidebar verte, cartes KPI, badges, actions rapides, alertes produits, notifications et historique rapide. Interface claire, responsive et orientée productivité.
