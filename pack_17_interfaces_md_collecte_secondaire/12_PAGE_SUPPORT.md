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

# Page 12 — `/support`
# Interface : Support Entreprise

## Objectif métier
Permettre aux entreprises d’obtenir de l’aide, de signaler un problème technique ou fonctionnel et de contacter l’administration.

## Bloc accueil
Message rassurant, délai moyen de réponse, email support, rappel FAQ.

## FAQ
Questions : remplir Import, remplir Export, ajouter produit manquant, utiliser les unités, mot de passe oublié, produit absent, modifier observation produit.

## Formulaire assistance
Champs : sujet (Connexion, Produits, Déclaration Import, Déclaration Export, Compte entreprise, Problème technique, Autre), priorité (Normale, Élevée, Urgente), message, email prérempli, téléphone optionnel, pièce jointe optionnelle.
Formats : PDF, PNG, JPG, XLSX, CSV.

## Historique tickets
Numéro ticket, sujet, date, statut ouvert/en cours/résolu.

## API
- `POST /api/support/tickets`
- `GET /api/support/faq`
- `GET /api/support/tickets/me`

## Prompt IA UI
Créer une page support avec FAQ accordéon, formulaire assistance complet, pièces jointes, bloc coordonnées et historique tickets, design rassurant et responsive.
