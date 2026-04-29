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

# Page 9 — `/declarations/import`
# Interface : Déclaration Import

## Objectif métier
Permettre à l’entreprise de renseigner mensuellement les informations statistiques relatives aux produits importés. Afficher uniquement les produits marqués Import ou Import & Export.

## Header contextuel
Afficher entreprise, période, point focal actif, date indicative d’échéance et statut non commencé/brouillon/soumis.

## Actions
Retour aux déclarations, Enregistrer brouillon, Soumettre Déclaration Import, recherche produit.

## Tableau de saisie
Colonnes :
1. Code produit, lecture seule
2. Désignation officielle, lecture seule
3. Observation entreprise, lecture seule
4. Prix minimum, numérique FCFA
5. Prix maximum, numérique FCFA
6. Quantité, numérique
7. Unité, sélection officielle chargée par l’administration
8. Dernière modification

## Unités
Les unités ne sont pas saisies librement. L’entreprise choisit dans une liste officielle importée par l’administration. Le select doit être searchable et afficher code + libellé si disponible.

## Validations
Prix min <= prix max, valeurs positives ou nulles, unité obligatoire si quantité renseignée, unité appartenant à la liste officielle.

## Soumission
Afficher une modale avec total produits, lignes renseignées, lignes vides et confirmation. Le formulaire reste consultable après soumission.

## API
- `GET /api/declarations/import/current`
- `POST /api/declarations/import/draft`
- `POST /api/declarations/import/submit`
- `GET /api/units`

## Prompt IA UI
Créer une page de saisie Import en tableau type tableur avec produits Import/IE, observation, prix min/max, quantité, unité en dropdown officiel, sauvegarde brouillon, soumission, modale, validations inline, sticky header et responsive en cartes.
