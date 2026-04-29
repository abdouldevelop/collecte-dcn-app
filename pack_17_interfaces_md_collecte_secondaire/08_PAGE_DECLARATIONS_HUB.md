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

# Page 8 — `/declarations`
# Interface : Hub Déclarations Mensuelles

## Objectif métier
Servir de porte d’entrée vers les formulaires mensuels Import et Export. La page présente l’état d’avancement de chaque déclaration et oriente l’entreprise vers l’action appropriée.

## Bloc récapitulatif
Afficher mois/année, date indicative d’échéance, nombre total produits Import, nombre total produits Export, progression globale et statut global.

## Carte Déclaration Import
Produits concernés : Import et Import & Export.
Afficher nombre de produits, lignes renseignées, dernière sauvegarde, statut non commencée/brouillon/soumise. Actions : Commencer, Reprendre, Consulter. Redirection `/declarations/import`.

## Carte Déclaration Export
Produits concernés : Export et Import & Export.
Afficher les mêmes informations. Redirection `/declarations/export`.

## Alertes
Point focal non renseigné, aucun produit disponible, produits nouvellement ajoutés, échéance proche, import soumis mais export non commencé, brouillon non soumis.

## Historique rapide
Afficher les trois dernières périodes avec statuts et date.

## Règles métier
Si aucun produit d’un flux n’existe, griser la carte. Le formulaire ne doit pas obligatoirement être fermé après soumission. Les déclarations restent consultables.

## API
- `GET /api/declarations/current`
- `GET /api/company/products/summary`
- `GET /api/company/focal-point`

## Prompt IA UI
Créer un hub de déclarations avec deux grandes cartes Import/Export, progression, statuts, alertes, historique rapide et CTA évidents, design clair et responsive.
