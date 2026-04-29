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

# Page 17 — `/admin/entreprises/[id]`
# Interface : Fiche Entreprise

## Objectif métier
Centraliser toutes les informations d’une entreprise : identité, compte, invitation, point focal, produits, déclarations, activité et notes internes.

## Header
Nom officiel, sigle, RCCM, NCC, badge statut actif/non activé/suspendu. Actions : renvoyer invitation, envoyer rappel, suspendre, réactiver, exporter fiche.

## Onglet Informations générales
Identité : nom, sigle, RCCM, NCC, secteur, adresse, ville, pays. Contact : email, téléphone. Compte : date création, date activation, dernière connexion.

## Onglet Invitation
Date envoi, statut envoyée/ouverte/utilisée/expirée, nombre de relances, dernière relance, actions renvoyer/générer nouvelle invitation.

## Onglet Point focal
Nom complet, fonction, email, téléphone, dernière mise à jour. Si absent : `Aucun point focal renseigné.`

## Onglet Produits
Tableau : code, désignation, flux, unité, observation entreprise, source Administration/Entreprise, date ajout. Les produits administratifs sont lecture seule.

## Onglet Historique déclarations
Période, statut Import, statut Export, date soumission, action voir détail. Détail : lignes Import/Export, prix, quantités, unités.

## Onglet Activité récente
Journal des connexions, ajouts produits, observations, soumissions, modification point focal, invitation renvoyée.

## Onglet Notes administratives
Commentaires internes, incidents, suivi particulier, actions futures. Visible uniquement admin.

## API
- `GET /api/admin/companies/{id}`
- `GET /api/admin/companies/{id}/products`
- `GET /api/admin/companies/{id}/declarations`
- `POST /api/admin/companies/{id}/notes`
- `POST /api/admin/companies/{id}/invite/resend`
- `PATCH /api/admin/companies/{id}/status`

## Prompt IA UI
Créer une fiche entreprise admin complète en onglets avec profil, invitation, point focal, produits, historique, activité et notes. Design corporate, cartes structurées, tableaux compacts et badges statuts.
