# TrophyQuest – micro‑service Node (PSN → PostgreSQL)

Micro‑service minimal pour **récupérer jeux & trophées PSN** avec [`psn-api`](https://www.npmjs.com/package/psn-api), et **stocker en PostgreSQL** (local).
Pensé pour alimenter ensuite le backend Spring/Angular ou un ETL vers Snowflake.

---

## 1) Structure du projet
```
psn-fetcher/
├─ src/
│  ├─ server.js          # Express + routes REST
│  ├─ psnClient.js       # Auth + appels PSN (psn-api)
│  └─ config-db-pool.js              # Connexion & helpers Postgres
├─ .env.example
├─ package.json
└─ README.md (ce fichier)
```

---

## 2) Installation rapide
```bash
# Prérequis
#  - Node 20+
#  - PostgreSQL local (ex: user=postgres, password=postgres, db=trophyquest)

# 1) Installer
npm init -y
npm install express psn-api pg dotenv morgan

# 2) Configurer l'env
cp .env.example .env # Renseigner NPSSO (cookie PlayStation) et DATABASE_URL

# 5) Lancer le serveur
node src/server.js # API sur http://localhost:3000
```
---

## 10) Tests rapides (curl)
```bash
# 0) Vérifier la DB
curl -s localhost:3000/health

# 1) Auth (optionnel – vérifie NPSSO et token cache)
curl -s -X POST localhost:3000/auth -H 'content-type: application/json' -d '{"npsso":"'$NPSSO'"}'

# 2) Importer MES jeux
env NPSSO=<votre_cookie> curl -s -X POST localhost:3000/me/titles:ingest -H 'content-type: application/json' -d '{"npsso":"'$NPSSO'"}'

# 3) Importer les TROPHÉES d’un titre
curl -s -X POST localhost:3000/titles/<npCommunicationId>/trophies:ingest -H 'content-type: application/json' -d '{"npsso":"'$NPSSO'"}'

# 4) Importer l’état GAGNÉ pour un user/titre
curl -s -X POST localhost:3000/users/<accountId>/titles/<npCommunicationId>/earned:ingest -H 'content-type: application/json' -d '{"npsso":"'$NPSSO'"}'
```

---

## 11) Intégration Spring/Angular (lecture)
- Votre service Spring lit les tables `psn_titles`, `psn_trophies`, `psn_earned` via JDBC.
- Endpoints côté Spring : `/games`, `/games/{id}/trophies`, `/users/{id}/progress`.
- **Guide rapide IA** : générer à la volée depuis les métadonnées (nom/description trophée).

---

## 12) Notes & limites
- Ce micro‑service simplifie les schémas des réponses `psn-api` (compat variations). Adaptez les mappings si la version diffère.
- Pour des volumes plus grands : ajouter **retry/backoff**, **caching** et **pagination** (offset/limit) sur `/me/titles`.
- Ne demandez pas le NPSSO d’utilisateurs finaux. Commencez avec votre compte pour vos tests.
- Pour Snowflake : remplacez `pg` par un export S3/NDJSON + Snowpipe, ou connecteur Snowflake JDBC côté Spring.

