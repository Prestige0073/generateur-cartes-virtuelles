# 📇 SITE 1 — Générateur de Cartes Bancaires

> **Cahier des charges** — Projet de cartes bancaires
> **Date** : 28 avril 2026

---

## 🎯 1. Présentation du projet

### Concept

Plateforme web permettant à un utilisateur de **créer un compte**, **payer** via Mobile Money, puis **générer une carte bancaire au design réaliste** (style Visa / Mastercard) avec ses propres informations. La carte est animée en **3D recto/verso**, et l'utilisateur peut générer un **lien de partage protégé par mot de passe** pour permettre à des visiteurs externes de visualiser sa carte.

### Objectif

- Projet de cartes bancaires
- Valorisation de compétences en développement web full-stack
- Création de cartes bancaires au design professionnel

### Public cible

- Étudiants, créateurs, utilisateurs souhaitant une carte bancaire professionnelle
- Personnes voulant offrir ou partager un design de carte personnalisé

---

## 🛠️ 2. Stack technique

| Couche | Technologie |
|---|---|
| **Frontend** | React.js |
| **Hébergement** | Vercel (gratuit) |
| **Base de données** | Supabase (PostgreSQL + Auth) |
| **Authentification** | Supabase Auth (email + mot de passe) |
| **Paiement** | FedaPay / Kkiapay / CinetPay (Mobile Money) |
| **Animations** | Framer Motion ou CSS 3D Transforms |
| **Styling** | Tailwind CSS (recommandé) |

---

## 👤 3. Parcours utilisateur

```
1. Arrivée sur le site
        ↓
2. Création d'un compte (email + mot de passe)
        ↓
3. Choix du template de carte (Basique / Premium / VIP)
        ↓
4. Paiement via Mobile Money (FedaPay/Kkiapay/CinetPay)
        ↓
5. Remplissage des informations de la carte
   (avec choix de la langue de la carte)
        ↓
6. Génération de la carte animée recto/verso
        ↓
7. Affichage du solde esthétique
        ↓
8. Génération du lien de partage + mot de passe
        ↓
9. Partage du lien avec des visiteurs externes
        ↓
10. Les visiteurs entrent le mot de passe et visualisent la carte
```

---

## ✨ 4. Fonctionnalités principales

### 4.1 Authentification

- Inscription par **email + mot de passe**
- Connexion / Déconnexion
- Récupération de mot de passe par email
- Pas d'authentification sociale (Google, Facebook, etc.)

### 4.2 Catalogue de templates

- Entre **5 et 8 templates** disponibles au lancement
- **Style classique banque** (Visa, Mastercard, finitions dorée et argentée)
- Chaque template appartient à un niveau : **Basique / Premium / VIP**
- Aperçu visuel avant achat

### 4.3 Paiement

| Niveau | Prix |
|---|---|
| **Basique** | 5 200 FCFA |
| **Premium** | 6 200 FCFA |
| **VIP** | 7 200 FCFA |

- Intégration via API : **FedaPay**, **Kkiapay** ou **CinetPay**
- Paiement par Mobile Money (MTN MoMo, Moov Money, Orange Money, etc.)
- Confirmation du paiement avant déblocage de la création
- **Une seule carte générée par paiement**

### 4.4 Création de la carte

L'utilisateur remplit un formulaire avec :

- Nom du titulaire (Cardholder Name)
- Numéro de carte (16 chiffres)
- Date d'expiration (MM/AA)
- Code CVV (3 chiffres au verso)
- Type de réseau (Visa / Mastercard, selon template)
- **Langue de la carte** (français, anglais, etc.) — affecte les libellés "Cardholder Name", "Valid Thru", etc.
- **Montant esthétique** (saisi librement, juste pour l'affichage)

⚠️ **Important** : une fois la carte créée, elle est **définitive** (aucune modification possible).

### 4.5 Animation recto/verso

- **Flip 3D au clic** (compatible mobile)
- **Flip 3D au survol** (souris desktop)
- Animation fluide via Framer Motion ou CSS `transform: rotateY()`
- Recto : visuel principal + numéro + nom + expiration
- Verso : bande magnétique + CVV + signature stylisée

### 4.6 Espace compte (dashboard)

- Liste des cartes créées par l'utilisateur
- Affichage du **montant esthétique** de chaque carte
- Bouton pour générer / régénérer le lien de partage
- Historique des paiements

### 4.7 Lien de partage

- Génération automatique d'un **lien unique** (UUID ou slug)
- **Mot de passe généré automatiquement** par le système
- **Durée de validité : 30 jours**
- **Consultations illimitées** pendant cette période
- Page dédiée minimaliste pour les visiteurs : uniquement la carte animée + le solde
- Les visiteurs **ne peuvent rien modifier** (lecture seule)

---

## 🗄️ 5. Modèle de données (Supabase)

### Table `users` (gérée par Supabase Auth)
- `id` (UUID)
- `email`
- `created_at`

### Table `cards`
- `id` (UUID)
- `user_id` (FK → users)
- `template_id` (référence au template choisi)
- `tier` (basique / premium / vip)
- `cardholder_name`
- `card_number` (chiffré)
- `expiry_date`
- `cvv` (chiffré)
- `network_type` (visa / mastercard)
- `language` (fr / en / etc.)
- `display_amount` (decimal — esthétique)
- `created_at`

### Table `payments`
- `id` (UUID)
- `user_id` (FK)
- `card_id` (FK)
- `amount` (FCFA)
- `tier`
- `payment_provider` (fedapay / kkiapay / cinetpay)
- `transaction_id`
- `status` (pending / success / failed)
- `created_at`

### Table `share_links`
- `id` (UUID)
- `card_id` (FK)
- `slug` (string unique pour l'URL)
- `password_hash` (mot de passe hashé)
- `expires_at` (created_at + 30 jours)
- `created_at`

---

## 🎨 6. Pages du site

| Page | URL | Description |
|---|---|---|
| Accueil | `/` | Présentation du service + CTA inscription |
| Inscription | `/signup` | Formulaire de création de compte |
| Connexion | `/login` | Formulaire de connexion |
| Dashboard | `/dashboard` | Liste des cartes de l'utilisateur |
| Catalogue | `/templates` | Choix du template (Basique/Premium/VIP) |
| Paiement | `/payment/:tier` | Tunnel de paiement Mobile Money |
| Création carte | `/create-card` | Formulaire de remplissage des infos |
| Vue carte | `/card/:id` | Visualisation de la carte (propriétaire) |
| Vue partagée | `/share/:slug` | Page publique protégée par mot de passe |

---

## 🔒 7. Sécurité

- Hashage des mots de passe utilisateurs (Supabase Auth)
- Hashage des mots de passe de partage (bcrypt)
- Chiffrement des données sensibles (numéro de carte, CVV) en base
- Protection CSRF / XSS (React + bonnes pratiques)
- HTTPS obligatoire (géré par Vercel)
- Rate limiting sur les routes sensibles (login, paiement)

---

## 🚀 8. Roadmap de développement (suggérée)

1. **Phase 1** : Setup projet (React + Vercel + Supabase)
2. **Phase 2** : Authentification (inscription/connexion)
3. **Phase 3** : Création du catalogue + templates statiques
4. **Phase 4** : Intégration paiement (un seul provider d'abord)
5. **Phase 5** : Formulaire de création de carte
6. **Phase 6** : Animation 3D recto/verso
7. **Phase 7** : Système de lien de partage + mot de passe
8. **Phase 8** : Page publique de visualisation
9. **Phase 9** : Dashboard utilisateur
10. **Phase 10** : Tests + déploiement final

---

## 📝 9. Notes complémentaires

- Le projet est axé sur la création de cartes bancaires réalistes.
- Mention explicite à afficher quelque part sur le site : *"Cartes bancaires au design réaliste."
- Prévoir un design responsive (mobile + desktop)
- Langue de l'interface : **français** (par défaut)
- Langue **de la carte elle-même** : choisie par l'utilisateur lors du remplissage

---

*Fin du cahier des charges — Site 1*
