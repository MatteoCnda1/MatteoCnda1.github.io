---
id: 01-docker-compose
title: Docker Compose
sidebar_position: 1
tags: [conteneurs, outil, cheatsheet]
---

# Docker Compose

> Dès qu'une application dépend de plusieurs conteneurs (un serveur web, une base de données, un cache...), lancer chacun à la main avec `docker run` devient vite ingérable. **Compose** décrit toute une application multi-conteneurs dans un seul fichier YAML, démarrable/arrêtable en une commande.

## Compose v1 vs v2

- **v1** (historique, Python) : commande séparée `docker-compose` (avec un tiret), à installer en plus de Docker.
- **v2** (actuel) : réécrit en Go, intégré directement à Docker CLI comme **plugin** — commande `docker compose` (sans tiret, avec un espace). C'est ce qu'installe `docker-compose-plugin` (voir [Installation](../Docker/01-installation-linux.md)). Ce cours utilise la syntaxe v2.

## Structure d'un fichier `compose.yaml`

```yaml
services:
  web:
    build: .                        # construire depuis un Dockerfile local
    ports:
      - "8080:80"
    environment:
      - DEBUG=false
    depends_on:
      - db
    networks:
      - backend
    restart: unless-stopped

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}   # lu depuis un fichier .env
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - backend

networks:
  backend:

volumes:
  db-data:
```

Trois sections principales :

- **`services`** : chaque service devient un conteneur, avec sa config (`image` ou `build`, `ports`, `environment`, `volumes`, `depends_on`...).
- **`networks`** : les réseaux personnalisés ; par défaut, Compose crée déjà un réseau dédié au projet où tous les services se voient entre eux **par leur nom de service** (résolution DNS automatique — `db` est résolu automatiquement depuis `web`).
- **`volumes`** : les volumes nommés persistants, partageables entre services.

## Variables d'environnement et `.env`

Compose lit automatiquement un fichier `.env` situé à côté du fichier compose, pour substituer les `${VARIABLE}` :

```text
# .env
DB_PASSWORD=un-mot-de-passe-fort
```

## Commandes

```bash
docker compose up                 # créer et démarrer tous les services (logs attachés)
docker compose up -d              # en arrière-plan (détaché)
docker compose up --build         # forcer la reconstruction des images avant de démarrer
docker compose up mon-service     # démarrer un seul service (+ ses dépendances)

docker compose down               # arrêter et supprimer conteneurs + réseau du projet
docker compose down --volumes     # + supprimer les volumes (⚠️ perte de données)

docker compose ps                 # état des services du projet
docker compose logs               # logs de tous les services
docker compose logs -f mon-service

docker compose exec mon-service bash   # shell dans un service en cours d'exécution
docker compose run mon-service <cmd>   # lancer une commande ponctuelle (nouveau conteneur)

docker compose build              # (re)construire les images sans démarrer
docker compose pull               # mettre à jour les images depuis le registre
docker compose restart mon-service
docker compose stop
docker compose config             # valider et afficher la config finale résolue
```

## `depends_on` ne suffit pas toujours

`depends_on` contrôle uniquement l'**ordre de démarrage** des conteneurs, pas le fait que le service dépendant soit **réellement prêt** à recevoir des connexions (ex : PostgreSQL peut mettre plusieurs secondes après son démarrage avant d'accepter des connexions). Pour de vraies dépendances applicatives, on combine `depends_on` avec une condition de santé :

```yaml
services:
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  web:
    build: .
    depends_on:
      db:
        condition: service_healthy   # attend que le healthcheck de "db" passe au vert
```

## Plusieurs environnements (dev / prod)

Un pattern courant consiste à superposer plusieurs fichiers compose : un fichier de base + des surcharges spécifiques à un environnement.

```bash
docker compose -f compose.yaml -f compose.dev.yaml up
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

## Ce qu'il faut retenir

- `docker compose` (v2, sans tiret) décrit une application multi-conteneurs dans un fichier YAML unique : services, réseaux, volumes.
- Compose crée un réseau par projet où les services se résolvent entre eux **par leur nom** — pas besoin de connaître les IP.
- `depends_on` gère l'ordre de démarrage, pas la disponibilité réelle : combiner avec `healthcheck` + `condition: service_healthy` pour de vraies dépendances applicatives.
- `docker compose down --volumes` supprime aussi les données persistantes — à utiliser en connaissance de cause.
