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

# Page 7 — `/produits/nouveau`
# Interface : Ajouter Produit

## Objectif métier
Permettre à l’entreprise d’ajouter un ou plusieurs produits absents de la liste préchargée par l’administration.

## Bloc d’information
Rappeler d’ajouter uniquement les produits réellement utilisés et absents de la liste actuelle.

## Deux fonctionnalités disponibles
1. Ajout manuel.
2. Import en masse par fichier avec upload classique et drag and drop.

## Ajout manuel
Champs :
- Code produit, optionnel si inconnu
- Désignation du produit, obligatoire
- Flux : Import, Export, Import & Export
- Unité, sélection parmi les unités chargées par l’administration si disponible
- Observation

Boutons : Enregistrer, Enregistrer et ajouter un autre, Retour à la liste.

## Import en masse
### Upload classique
Bouton `Choisir un fichier`. Formats : xlsx, xls, csv.

### Drag and Drop
Zone : `Glissez-déposez votre fichier ici ou cliquez pour importer`.

Colonnes attendues : `code_produit`, `designation`, `flux`, `unite`, `observation`.

## Fonctionnalités
Télécharger modèle Excel, prévisualisation, compteur, détection doublons, rapport erreurs, validation finale.

## Contrôles
Désignation obligatoire, flux valide, unité valide si renseignée, doublons avec existants, doublons dans le fichier, format supporté.

## API
- `POST /api/company/products`
- `POST /api/company/products/import`
- `GET /api/units`

## Prompt IA UI
Créer une page Ajouter Produit avec deux sections : ajout manuel et import fichier. L’import doit supporter upload classique et drag and drop, modèle Excel, prévisualisation, rapport d’erreurs et validation.
