---
id: 01-images-et-layers
title: Images & système de fichiers en couches
sidebar_position: 1
tags: [conteneurs, outil]
---

# Images & système de fichiers en couches

> Une image Docker n'est pas un gros fichier monolithique : c'est un **empilement de couches (layers)**, chacune représentant un diff du système de fichiers. C'est ce qui rend le partage d'images efficace — plusieurs images peuvent partager des couches identiques.

## L'empilement de couches

```text
   docker build d'une image Python

   Couche 4  │  COPY app.py /app/app.py          (quelques Ko)
   Couche 3  │  RUN pip install flask             (quelques Mo)
   Couche 2  │  RUN apt install python3            (~50 Mo)
   Couche 1  │  FROM debian:bookworm-slim          (~80 Mo, image de base)
             └──────────────────────────────────
                 Chaque couche = diff par rapport à la précédente,
                 stockée une seule fois même si réutilisée par
                 plusieurs images.
```

Chaque instruction du [Dockerfile](../Dockerfile/index.md) qui modifie le système de fichiers (`RUN`, `COPY`, `ADD`) crée une nouvelle couche. Ces couches sont **empilées** par un système de fichiers **union** (`overlay2` sur Linux, le driver de stockage par défaut) qui les fusionne en une seule vue cohérente, sans les dupliquer physiquement sur disque.

## Pourquoi c'est efficace

- **Partage entre images** : si deux images utilisent `FROM debian:bookworm-slim`, cette couche n'est stockée **qu'une seule fois** sur le disque, peu importe le nombre d'images qui en dérivent.
- **Cache de build** : Docker réutilise les couches déjà construites tant que l'instruction et son contexte n'ont pas changé — voir [Dockerfile](../Dockerfile/index.md) pour l'ordre optimal des instructions.
- **Transfert réseau optimisé** : au `docker pull`, seules les couches absentes localement sont téléchargées.

## Le rôle d'overlay2

`overlay2` fusionne plusieurs répertoires en une seule vue, avec un mécanisme **copy-on-write** : lire un fichier passe à travers les couches jusqu'à le trouver ; écrire un fichier le copie d'abord dans la couche la plus haute (inscriptible) avant modification — les couches inférieures (l'image) ne sont **jamais modifiées**.

```bash
# Voir le driver de stockage utilisé
docker info | grep "Storage Driver"

# Voir où sont stockées les couches sur le disque (ne pas modifier à la main)
sudo ls /var/lib/docker/overlay2/
```

## Tags, digests et immuabilité

- Un **tag** (`nginx:1.25`, `nginx:latest`) est une **étiquette mutable** : elle peut être réassignée à une nouvelle image à tout moment (`latest` change régulièrement, par exemple).
- Un **digest** (`nginx@sha256:abcd1234...`) est une **empreinte immuable** du contenu exact de l'image — la même empreinte pointe toujours vers exactement le même contenu, jamais réassignable.

```bash
docker images --digests              # voir les digests des images locales
docker pull nginx@sha256:<digest>    # tirer une version précise, garantie identique
```

En production ou en CI/CD, épingler un **digest** plutôt qu'un tag évite les mauvaises surprises si quelqu'un republie une image sous le même tag.

## Inspecter une image

```bash
docker history <image>               # lister les couches et leur taille
docker inspect <image>               # métadonnées complètes (config, env, cmd...)
docker image inspect <image> --format '{{.Size}}'
```

## Multi-architecture (manifest list)

Une même référence d'image (`nginx:latest`) peut en réalité pointer vers plusieurs images différentes selon l'architecture du processeur (amd64, arm64...) via un **manifest list** (ou *manifest index*) — Docker sélectionne automatiquement la bonne variante au `pull` selon la machine.

```bash
docker manifest inspect nginx:latest   # voir les variantes disponibles
docker buildx build --platform linux/amd64,linux/arm64 -t mon-image --push .
```

## Ce qu'il faut retenir

- Une image = un empilement de **couches** immuables, fusionnées par `overlay2` ; un conteneur ajoute une couche inscriptible éphémère par-dessus.
- Les couches identiques sont **partagées** entre images (espace disque) et réutilisées au build (cache) et au pull (réseau).
- Un **tag** est mutable, un **digest** (`@sha256:...`) est immuable — préférer le digest pour la reproductibilité en production.
- `docker buildx` permet de construire des images **multi-architecture** en une seule commande.
