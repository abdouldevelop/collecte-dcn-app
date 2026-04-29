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

# Page 5 — `/point-focal`
# Interface : Gestion du Point Focal

## Objectif métier
Permettre à l’entreprise de désigner la personne responsable des déclarations mensuelles. Le point focal est l’interlocuteur principal de l’administration.

## Bloc explicatif
Afficher : `Le point focal est la personne référente chargée du suivi et de la saisie des déclarations mensuelles de votre entreprise.`

## Champs
- Nom
- Prénom(s)
- Fonction
- Service / Département, optionnel
- Email professionnel
- Téléphone principal
- Téléphone secondaire, optionnel

## Paramètres notifications
Checkboxes : rappels mensuels, confirmations de soumission, alertes de retard, communications administratives.

## Historique
Afficher date de création, dernière modification, auteur de la dernière modification.

## Actions
- Enregistrer
- Modifier
- Annuler
- Remplacer le point focal

## Règles métier
Une entreprise doit avoir au moins un point focal actif. Le remplacement conserve l’historique. Les notifications sont envoyées en priorité au point focal.

## API
- `GET /api/company/focal-point`
- `POST /api/company/focal-point`
- `PATCH /api/company/focal-point`

## Prompt IA UI
Créer une page point focal claire, rassurante et simple, avec formulaire complet, paramètres de notification, historique de modification, validations inline et design institutionnel.
