---
id: 01-registries
title: Registres d'images (Registries)
sidebar_position: 1
tags: [conteneurs, outil]
---

# Registres d'images (Registries)

> Un registre est un serveur qui **stocke et distribue** des images, conformément à la spécification OCI *distribution-spec* (voir [OCI](../OCI/index.md)). Docker Hub est le registre public par défaut, mais l'écosystème en compte beaucoup d'autres.

## Anatomie d'une référence d'image

```text
   registry.exemple.com:5000 / mon-organisation / mon-image : 1.2.3
   └──────────┬───────────┘   └──────┬───────┘   └───┬────┘   └─┬─┘
        registre (hôte:port)     namespace         nom image    tag

   Si le registre est omis → Docker Hub par défaut (docker.io)
   Si le tag est omis → "latest" par défaut
```

```bash
docker pull nginx                    # = docker.io/library/nginx:latest
docker pull bitnami/nginx:1.25       # = docker.io/bitnami/nginx:1.25
docker pull ghcr.io/org/projet:v2    # registre explicite (GitHub Container Registry)
```

## Les registres courants

| Registre | Particularité |
|---|---|
| **Docker Hub** (`docker.io`) | Le registre par défaut, historique ; limites de débit strictes en anonyme |
| **GitHub Container Registry** (`ghcr.io`) | Intégré à GitHub, pratique en CI/CD avec `GITHUB_TOKEN` |
| **GitLab Container Registry** | Intégré à chaque projet GitLab |
| **Amazon ECR / Google Artifact Registry / Azure ACR** | Registres managés des clouds publics |
| **Registre privé auto-hébergé** | L'image officielle `registry` permet d'en monter un en quelques minutes |

## S'authentifier

```bash
docker login                          # Docker Hub, invite login/mot de passe
docker login ghcr.io -u <user>        # registre précis
docker login registry.exemple.com:5000 --username admin --password-stdin < mdp.txt
docker logout
```

Les identifiants sont stockés (par défaut en clair, sauf configuration d'un *credential helper*) dans `~/.docker/config.json` — utiliser un gestionnaire d'identifiants (`docker-credential-pass`, `docker-credential-desktop`...) plutôt que des mots de passe en clair sur un serveur partagé.

## Pousser et tirer

```bash
# Une image doit être taguée avec le nom complet du registre cible avant de la pousser
docker tag mon-image:1.0 ghcr.io/mon-org/mon-image:1.0
docker push ghcr.io/mon-org/mon-image:1.0

docker pull ghcr.io/mon-org/mon-image:1.0
```

## Monter un registre privé simple

Pratique en lab ou petite équipe, sans dépendre d'un service externe :

```bash
docker run -d -p 5000:5000 --name registry --restart=always registry:2

# L'utiliser comme n'importe quel registre
docker tag mon-image localhost:5000/mon-image:1.0
docker push localhost:5000/mon-image:1.0
docker pull localhost:5000/mon-image:1.0
```

> Par défaut, Docker refuse de pousser vers un registre **sans HTTPS** (sauf `localhost`) — pour un registre distant, il faut soit du TLS, soit déclarer explicitement le registre comme "insecure" dans `/etc/docker/daemon.json` (à réserver au lab, jamais en production).

## Ce qu'il faut retenir

- Une référence d'image complète = `[registre/]namespace/nom[:tag]` ; sans registre explicite, Docker Hub est utilisé par défaut.
- `docker login`/`push`/`pull` fonctionnent avec **n'importe quel** registre conforme OCI, pas seulement Docker Hub.
- Une image doit être **retaguée** (`docker tag`) avec le nom complet du registre cible avant de pouvoir être poussée dessus.
- Docker exige HTTPS pour un registre distant sauf configuration explicite "insecure" — à éviter hors environnement de test.
