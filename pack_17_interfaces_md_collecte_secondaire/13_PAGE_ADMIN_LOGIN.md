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

# Page 13 — `/admin/login`
# Interface : Connexion Administration

## Objectif métier
Permettre aux administrateurs d’accéder à l’espace de supervision. Cette page est réservée aux utilisateurs internes autorisés.

## Champs
- Email administrateur, obligatoire
- Mot de passe, obligatoire, toggle visibilité

## Composants
Logo, titre `Espace Administration`, mention `Accès réservé aux utilisateurs autorisés`, carte formulaire, bouton `Se connecter`, lien mot de passe oublié.

## Sécurité
Limitation tentatives, journalisation, verrouillage temporaire, option double facteur recommandée, refus des comptes entreprise.

## Redirection
Après succès : `/admin/dashboard`.

## API
`POST /api/admin/auth/login`

## Prompt IA UI
Créer une page connexion admin sobre, corporate, sécurisée, carte blanche, fond clair, bouton vert, messages d’erreur, impression de contrôle et sécurité.
