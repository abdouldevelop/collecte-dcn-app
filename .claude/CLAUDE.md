# CLAUDE.md

# Projet : Application de Collecte Secondaire

## Vision globale

Construire une application web institutionnelle premium permettant aux entreprises de renseigner mensuellement des données statistiques de commerce extérieur (Import / Export), pendant que l’administration supervise, contrôle et exporte les résultats.

Le projet doit être :

- production-ready
- sécurisé
- scalable
- maintenable
- élégant visuellement
- extrêmement structuré
- parfaitement compatible agents IA

---

# Contexte métier

L’administration collecte régulièrement des informations économiques auprès des entreprises.

Les entreprises doivent déclarer pour chaque produit :

- prix minimum
- prix maximum
- quantité
- unité

Les données sont utilisées à des fins statistiques, économiques et décisionnelles.

---

# Acteurs du système

## Entreprise

Peut :

- recevoir invitation
- créer son compte
- se connecter
- voir ses produits
- ajouter observations produits
- ajouter nouveaux produits
- remplir déclaration Import
- remplir déclaration Export
- gérer point focal
- voir historique
- contacter support

## Administration

Peut :

- envoyer invitations
- importer entreprises
- importer produits
- importer unités
- superviser déclarations
- gérer entreprises
- voir historique global
- exporter données
- relancer entreprises

## Super Admin

Peut :

- gérer admins
- permissions
- paramètres système
- logs
- maintenance

---

# Stack technique obligatoire

## Frontend

- Next.js 15 App Router
- TypeScript strict
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Table
- TanStack Query

## Backend

- Route Handlers Next.js
- Prisma ORM
- PostgreSQL

## Infra

- Docker
- Docker Compose
- Mailhog
- MinIO / S3

---

# Docker obligatoire

Lancement :

```bash
docker compose up --build
```

Services :

- app
- postgres
- mailhog
- minio (optionnel)

---

# Référence UI obligatoire

Le dossier suivant contient les exemples visuels :

stitch_portail_de_connexion_institutionnel

Tous les agents IA doivent s’y référer pour rester fidèles :

- au style
- aux espacements
- à la qualité premium
- à l’identité institutionnelle

---

# Pages officielles

## Entreprise

1. Login
2. Onboarding invitation
3. Dashboard
4. Profil
5. Point focal
6. Produits
7. Ajouter produit
8. Hub déclarations
9. Déclaration Import
10. Déclaration Export
11. Historique
12. Support

## Admin

13. Admin Login
14. Admin Dashboard
15. Entreprises
16. Déclarations Admin
17. Fiche Entreprise

---

# Charte graphique

- Vert principal : #496559
- Orange accent : #f39221
- Fond : #F8F9FA
- Texte : #1F2937
- Succès : #16A34A
- Danger : #DC2626

---

# Règles métier critiques

## Invitations

- token unique
- usage unique
- expirables
- lien sécurisé

## Produits

Produits admin :

- non modifiables par entreprise
- non supprimables

Entreprise peut :

- ajouter observation
- ajouter nouveaux produits

## Unités

Importées uniquement par admin.

Disponibles en dropdown dans :

- déclaration import
- déclaration export

## Déclarations

Chaque ligne contient :

- prix_min
- prix_max
- quantite
- unite

Validation :

- prix_min <= prix_max
- quantite >= 0
- unité obligatoire si quantité > 0

---

# Architecture recommandée

```txt
app/
components/
modules/
lib/
services/
hooks/
types/
validators/
prisma/
```

---

# Base de données

Tables :

- users
- admins
- companies
- company_invitations
- focal_points
- products
- company_products
- units
- periods
- import_declarations
- export_declarations
- notifications
- support_tickets
- audit_logs

---

# Standards de code

- TypeScript strict
- Aucun any
- Server Components par défaut
- React Hook Form + Zod pour formulaires
- Tables avec tri / recherche / pagination
- Code modulaire

---

# Sécurité

- RBAC strict
- Middleware auth
- Hash mots de passe
- Rate limit login
- CSRF
- Logs admin

---

# Tests obligatoires

- unit tests
- integration tests
- e2e principaux workflows

---

# Definition of Done

Une feature est terminée si :

- build OK
- lint OK
- types OK
- tests OK
- responsive OK
- loading state OK
- error state OK
- permissions OK

---

# Prompt permanent

Construire cette application comme un portail institutionnel haut de gamme, fiable, rapide, maintenable et moderne.
