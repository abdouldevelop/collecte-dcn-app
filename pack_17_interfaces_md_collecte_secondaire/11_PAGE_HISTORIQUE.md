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

# Page 11 — `/historique`
# Interface : Historique des Déclarations

## Objectif métier
Permettre à l’entreprise de consulter toutes ses déclarations mensuelles passées, Import et Export.

## Bloc synthèse
Nombre total de périodes, mois déclarés cette année, dernière déclaration soumise, mois manquants, taux de complétion annuel.

## Filtres
Année, mois, type Import/Export/Les deux, statut Non commencé/Brouillon/Soumis/Retard, recherche libre.

## Tableau
Colonnes : période, statut Import, statut Export, date dernière mise à jour, date soumission, action. Actions : Voir détail, Télécharger si disponible.

## Vue détail
Afficher blocs Import et Export avec produit, prix min, prix max, quantité, unité, puis métadonnées : date création, dernière modification, date soumission, point focal.

## Règles métier
Anciennes périodes consultables, brouillons visibles, une période peut contenir Import seul, Export seul ou les deux.

## API
- `GET /api/company/declarations/history`
- `GET /api/company/declarations/{id}`
- `GET /api/company/declarations/{id}/export`

## Prompt IA UI
Créer une page historique orientée données avec synthèse, filtres, tableau des périodes, badges statuts, détail Import/Export, pagination et responsive mobile.
