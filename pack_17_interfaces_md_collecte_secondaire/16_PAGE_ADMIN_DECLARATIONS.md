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

# Page 16 — `/admin/declarations`
# Interface : Supervision des Déclarations

## Objectif métier
Permettre à l’administration de consulter, filtrer, contrôler et exporter toutes les déclarations mensuelles.

## Header
Titre `Supervision des Déclarations`, période active, nombre total, taux de soumission, boutons Export Excel, Export CSV, Actualiser.

## Filtres
Période, entreprise, type Import/Export/Les deux, statut, anomalie.

## Tableau
Colonnes : entreprise, période, statut Import, statut Export, date dernière mise à jour, date soumission, nombre produits renseignés, anomalies, actions.

## Détail
Panneau détail avec déclaration Import et Export : produit, prix min, prix max, quantité, unité. Métadonnées : point focal, date saisie, dernière modification, utilisateur ayant soumis.

## Anomalies
Prix max inférieur prix min, quantité élevée, variation extrême, unité inhabituelle, ligne incomplète.

## Exports
Excel global, CSV global, export entreprise, export période, export retardataires.

## API
- `GET /api/admin/declarations`
- `GET /api/admin/declarations/{id}`
- `GET /api/admin/declarations/export`
- `POST /api/admin/declarations/{id}/reminder`

## Prompt IA UI
Créer une page supervision déclarations avec filtres avancés, tableau, badges, détails Import/Export, anomalies, exports Excel/CSV et design analytique professionnel.
