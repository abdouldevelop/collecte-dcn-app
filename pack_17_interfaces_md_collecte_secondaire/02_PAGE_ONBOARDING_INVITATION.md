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

# Page 2 — `/onboarding`
# Interface : Onboarding Entreprise par invitation

## Objectif métier
Permettre uniquement à une entreprise invitée par l’administration de finaliser la création de son compte. Cette page n’est pas publique : elle est accessible seulement via un lien sécurisé contenant un token unique envoyé par email.

## Conditions d’accès
Le système doit vérifier que le token existe, n’est pas expiré, n’a pas déjà été utilisé et correspond à une invitation valide. Si le lien est invalide ou expiré, afficher un message invitant à contacter l’administration.

## Workflow
1. L’administration envoie une invitation.
2. L’entreprise clique sur le lien.
3. La page vérifie le token.
4. L’entreprise complète ses informations.
5. Le compte est créé/activé.
6. L’invitation est marquée comme utilisée.
7. Redirection obligatoire vers `/login`.

## Champs entreprise
- Nom officiel de l’entreprise
- Sigle
- RCCM
- NCC
- Adresse
- Téléphone principal
- Email principal, prérempli depuis l’invitation si disponible

## Champs sécurité
- Mot de passe
- Confirmation mot de passe

## Composants
- Logo
- Titre `Activation du compte entreprise`
- Message `Cette page est accessible uniquement via invitation.`
- Stepper : vérification invitation, informations entreprise, sécurité, confirmation
- Formulaire en cartes
- Bouton `Créer mon compte`
- Bouton `Retour connexion`

## Règles métier
- Impossible de créer un compte sans invitation valide.
- Une invitation utilisée ne peut plus être réutilisée.
- Après succès, l’utilisateur va vers `/login`.

## API
- `GET /api/invitations/verify?token=...`
- `POST /api/company/onboarding`

## Prompt IA UI
Créer une page d’onboarding entreprise accessible uniquement par invitation. Design sécurisé, stepper clair, formulaire entreprise complet, création mot de passe, messages de token invalide/expiré, redirection finale vers connexion.
