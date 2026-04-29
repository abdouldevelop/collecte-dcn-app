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

# Page 10 — `/declarations/export`
# Interface : Déclaration Export

## Objectif métier
Permettre à l’entreprise de renseigner les informations statistiques relatives aux produits exportés. Afficher uniquement les produits marqués Export ou Import & Export.

## Header
Entreprise, période, point focal, date indicative d’échéance, statut non commencé/brouillon/soumis.

## Actions
Retour aux déclarations, Enregistrer brouillon, Soumettre Déclaration Export, recherche produit.

## Tableau
Colonnes : code produit, désignation officielle, observation entreprise, prix minimum FCFA, prix maximum FCFA, quantité, unité officielle sélectionnée, dernière modification.

## Unités
L’entreprise ne tape pas l’unité. Elle sélectionne une unité parmi les unités chargées par l’administration. Le champ doit être un select searchable.

## Validations
Prix min <= prix max, quantité positive/nulle, unité obligatoire si quantité > 0, unité valide, aucun champ numérique négatif.

## Soumission
Modale de confirmation avec produits concernés, lignes renseignées et lignes vides. Le formulaire reste consultable après soumission.

## API
- `GET /api/declarations/export/current`
- `POST /api/declarations/export/draft`
- `POST /api/declarations/export/submit`
- `GET /api/units`

## Prompt IA UI
Créer une page Déclaration Export en tableau professionnel, produits Export/IE uniquement, mêmes colonnes métier que l’import, unité officielle en dropdown, sauvegarde brouillon, soumission, validations inline et responsive.
