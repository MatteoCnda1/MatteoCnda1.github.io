---
id: 02-cycle-de-vie-image-conteneur
title: Cycle de vie d'une image et d'un conteneur
sidebar_position: 3
tags: [conteneurs, linux, outil]
---

# Cycle de vie d'une image et d'un conteneur

> Comprendre la différence entre une **image** (figée, en lecture seule) et un **conteneur** (une instance en cours d'exécution) est la clé pour ne pas se perdre dans les commandes Docker.

## Image vs conteneur

```text
        IMAGE (lecture seule)                    CONTENEUR (instance)

   ┌─────────────────────────┐                ┌─────────────────────────┐
   │  Couche 4 : app.py        │                │  Couche inscriptible      │ ← seule couche
   │  Couche 3 : pip install    │   docker run   │  (modifications du         │   modifiable,
   │  Couche 2 : apt install    │ ─────────────▶ │   conteneur en cours)      │   perdue si le
   │  Couche 1 : FROM python    │                ├─────────────────────────┤   conteneur est
   └─────────────────────────┘                │  Couche 4 : app.py        │   supprimé
     figée, partagée entre                     │  Couche 3 : pip install    │
     tous les conteneurs qui                    │  Couche 2 : apt install    │
     en dérivent                                │  Couche 1 : FROM python    │
                                                 └─────────────────────────┘
```

- Une **image** est composée de **couches (layers)** empilées, chacune représentant un diff du système de fichiers (voir [Images](../Images/index.md) pour le détail).
- Un **conteneur** ajoute par-dessus une fine **couche inscriptible** (copy-on-write) : tout ce que le conteneur écrit va là, sans jamais modifier l'image d'origine. Plusieurs conteneurs peuvent démarrer de la **même image** simultanément, chacun avec sa propre couche inscriptible isolée.
- Conséquence : **supprimer un conteneur détruit ses données** (la couche inscriptible), sauf ce qui a été explicitement mis dans un [volume](../Volumes/index.md). C'est voulu — un conteneur est pensé comme **jetable et reconstruit**, pas modifié en place.

## Les états d'un conteneur

```text
        docker create              docker start
   ────────────────────▶  Created  ────────────────▶  Running
                                                          │  │
                           docker run = create + start    │  │ docker pause
                                                            │  │
                            ┌───────────────────────────────┘  ▼
                            │                                 Paused
                            │  docker stop / kill              │
                            ▼                                  │ docker unpause
                          Exited  ◀──────────────────────────────┘
                            │
                            │ docker rm
                            ▼
                        (supprimé)
```

- **Created** : le conteneur existe (métadonnées, système de fichiers préparé) mais son processus principal n'a pas démarré.
- **Running** : le processus principal tourne.
- **Paused** : tous les processus du conteneur sont gelés (via un cgroup freezer), sans être arrêtés — utile pour un instantané cohérent.
- **Exited** : le processus principal s'est terminé (normalement ou après un `stop`/`kill`) ; le conteneur (et sa couche inscriptible) existent toujours sur disque tant qu'on ne fait pas `docker rm`.

`docker run` est un raccourci qui enchaîne `docker create` + `docker start` (+ éventuellement `docker attach` si pas de `-d`).

## Le cycle de vie complet, de l'image au nettoyage

```text
1. docker pull / docker build   → obtenir une image
2. docker run                   → créer ET démarrer un conteneur
3. docker exec / docker logs    → interagir avec le conteneur en cours
4. docker stop                  → arrêt propre (SIGTERM puis SIGKILL après un délai)
5. docker rm                    → supprimer le conteneur arrêté (perd la couche inscriptible)
6. docker rmi                   → supprimer l'image (si plus aucun conteneur ne l'utilise)
```

## `stop` vs `kill`

Une distinction souvent mal comprise :

- **`docker stop`** : envoie un `SIGTERM` (arrêt propre, laisse au processus une chance de terminer proprement ses requêtes en cours), attend un délai (10s par défaut), puis envoie `SIGKILL` si le processus tourne toujours.
- **`docker kill`** : envoie directement `SIGKILL` (ou un autre signal précisé), sans délai ni possibilité de nettoyage côté application.

## Ce qu'il faut retenir

- Une **image** est figée et partagée ; un **conteneur** ajoute une couche inscriptible éphémère par-dessus — supprimer le conteneur supprime cette couche, pas l'image.
- Cycle d'un conteneur : **Created → Running → (Paused) → Exited → supprimé**. `docker run` = `create` + `start`.
- `stop` (propre, SIGTERM puis SIGKILL après délai) diffère de `kill` (SIGKILL immédiat) — préférer `stop` sauf conteneur bloqué.
- Les données qui doivent survivre à la suppression d'un conteneur doivent être dans un [volume](../Volumes/index.md), jamais dans la couche inscriptible seule.
