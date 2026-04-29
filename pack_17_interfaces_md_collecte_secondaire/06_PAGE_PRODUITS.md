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

# Page 6 — `/produits`
# Interface : Catalogue Produits Entreprise

## Objectif métier
Permettre à l’entreprise de consulter les produits préchargés par l’administration, d’ajouter des observations internes et d’ajouter de nouveaux produits manquants.

## Principe essentiel
Les produits chargés par l’administration sont officiels. L’entreprise ne peut pas les modifier et ne peut pas les supprimer. Elle peut uniquement ajouter ou modifier une observation interne, ajouter de nouveaux produits manquants et importer une liste de nouveaux produits.

## Header
- Titre `Mes produits`
- Bouton `Ajouter produit`
- Bouton `Importer liste`

## Bloc résumé
- Total produits
- Produits Import
- Produits Export
- Produits Import & Export
- Produits ajoutés par entreprise
- Produits issus de l’administration

## Filtres
Recherche code/désignation, flux, source Administration/Entreprise, avec ou sans observation.

## Tableau
Colonnes : code produit, désignation officielle, flux, unité de référence, observation entreprise, source, date d’ajout, actions.

## Actions autorisées
### Produit administration
Autorisé : ajouter/modifier observation.
Interdit : modifier code, désignation, flux, unité, supprimer.

### Produit ajouté entreprise
Visible comme source Entreprise. Aucune suppression dans la V1 pour conserver l’historique.

## Règles métier
- Import apparaît dans formulaire Import.
- Export apparaît dans formulaire Export.
- IE apparaît dans les deux.
- Aucun produit ne peut être supprimé par l’entreprise.

## API
- `GET /api/company/products`
- `PATCH /api/company/products/{id}/observation`
- `POST /api/company/products`
- `POST /api/company/products/import`

## Prompt IA UI
Créer une page catalogue produits avec tableau, filtres, badges Administration/Entreprise, flux, observation modifiable uniquement, boutons Ajouter/Importer, sans option de suppression.
