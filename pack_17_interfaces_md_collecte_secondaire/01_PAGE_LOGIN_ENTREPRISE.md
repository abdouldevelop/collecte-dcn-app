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

# Page 1 — `/login`
# Interface : Connexion Entreprise

## Objectif métier
Permettre à une entreprise invitée ou déjà enregistrée d’accéder à son espace sécurisé afin de consulter ses produits préchargés, compléter son catalogue, renseigner ses déclarations mensuelles Import / Export, consulter son historique et gérer son profil.

## Utilisateurs concernés
- Entreprise déclarante
- Point focal entreprise
- Utilisateur autorisé par l’entreprise

## Structure UI
Desktop : layout en deux colonnes. À gauche, bloc institutionnel avec logo, nom de la plateforme, message de confiance et illustration sobre liée aux statistiques ou au commerce. À droite, carte blanche centrée contenant le formulaire de connexion.
Mobile : logo, titre, formulaire, actions, aide.

## Champs
- Adresse email : type email, obligatoire, placeholder `exemple@entreprise.com`, validation format email.
- Mot de passe : type password, obligatoire, toggle afficher/masquer, placeholder `••••••••`.

## Composants
- Logo
- Titre `Connexion Entreprise`
- Sous-texte `Accédez à votre espace sécurisé pour renseigner vos données mensuelles.`
- Input email
- Input mot de passe
- Bouton `Se connecter`
- Lien `Mot de passe oublié ?`
- Lien discret vers l’onboarding si invitation reçue

## Comportements
- Connexion réussie : redirection `/dashboard`.
- Identifiants invalides : afficher `Email ou mot de passe incorrect.`
- Compte désactivé : afficher `Votre compte est inactif. Veuillez contacter l’administration.`

## Sécurité
HTTPS, sessions HttpOnly, limitation tentatives, journalisation échecs, protection CSRF.

## API
`POST /api/auth/login`

## Prompt IA UI
Créer une page de connexion entreprise premium, institutionnelle, sobre et rassurante. Utiliser un panneau gauche vert `#496559`, une carte blanche à droite, champs email/mot de passe, bouton principal vert, états erreur/loading et responsive mobile-first.
