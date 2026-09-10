---
id: 00-introduction-architecture
title: Introduction & architecture de Docker
sidebar_position: 1
tags: [conteneurs, linux, outil]
---

# Introduction & architecture de Docker

> Docker (2013) n'a pas inventé les conteneurs — les [namespaces](../Namespaces/index.md) et [cgroups](../cgroups/index.md) existaient déjà, et LXC les combinait depuis 2008. Sa contribution a été de rendre les conteneurs **faciles à utiliser** : un format d'image portable, une commande unique pour construire/lancer/partager, et un écosystème complet autour (Docker Hub, Compose...).

## Ce que Docker ajoute par rapport aux briques noyau nues

- **Une image** : un instantané figé, versionné et partageable de tout ce dont une application a besoin pour tourner (code, dépendances, configuration) — voir [Images](../Images/index.md).
- **Un Dockerfile** : une recette texte pour construire cette image de façon reproductible — voir [Dockerfile](../Dockerfile/index.md).
- **Un registre** : un serveur pour stocker et partager des images (Docker Hub par défaut) — voir [Registries](../Registries/index.md).
- **Une CLI unifiée** : une seule commande `docker` pour construire, lancer, inspecter, débugger.

## Architecture client-serveur

Docker fonctionne selon un modèle **client-serveur** : la commande `docker` que tu tapes est un simple client qui parle à un **daemon** (`dockerd`) via une API REST, en local (socket Unix) ou à distance (TCP).

```text
┌─────────────────┐         API REST         ┌──────────────────────────┐
│   Client Docker   │ ───────────────────────▶ │        dockerd            │
│   (commande `docker`) │  (socket Unix par    │   (le "Docker Engine")    │
└─────────────────┘   défaut : /var/run/       │                           │
                       docker.sock)             │  ┌─────────────────────┐ │
                                                 │  │     containerd       │ │
                                                 │  └──────────┬──────────┘ │
                                                 │             │            │
                                                 │  ┌──────────▼──────────┐ │
                                                 │  │        runc          │ │
                                                 │  └──────────┬──────────┘ │
                                                 └─────────────┼────────────┘
                                                                ▼
                                                     Conteneurs en cours
                                                     d'exécution

                          ┌─────────────────────────┐
                          │   Registre (Docker Hub)   │  ◀── push / pull d'images
                          └─────────────────────────┘
```

Conséquence pratique importante : **toute commande `docker` nécessite d'accéder au socket du daemon**, généralement réservé à `root` — d'où le classique `sudo docker ...`, ou l'ajout de son utilisateur au groupe `docker` (voir [Installation](./01-installation-linux.md)). Comme le daemon tourne en root, appartenir au groupe `docker` équivaut de facto à avoir des droits root sur la machine — point de vigilance en sécurité (voir [Container Security](../Container_security/index.md)).

## Les composants, de haut en bas

| Couche | Rôle |
|---|---|
| **CLI `docker`** | Ce que tu tapes ; traduit tes commandes en appels à l'API REST du daemon |
| **`dockerd`** | Le daemon ; reçoit les requêtes API, orchestre la construction d'images, les réseaux, les volumes |
| **`containerd`** | Runtime de haut niveau ; gère les images et le cycle de vie des conteneurs (voir [containerd](../containerd/index.md)) |
| **`runc`** | Runtime bas niveau conforme OCI ; crée réellement les namespaces/cgroups et lance le process (voir [OCI](../OCI/index.md)) |

## Docker Desktop vs Docker Engine sous Linux

Sous **Linux**, Docker tourne nativement — le daemon parle directement au noyau de la machine, pas besoin de virtualisation. C'est différent de macOS/Windows, où Docker Desktop fait tourner une petite VM Linux en coulisses (puisque les namespaces/cgroups sont des mécanismes Linux). Ce cours couvre **Docker Engine sur Linux**, l'installation native, sans Docker Desktop.

## Terminologie de base

- **Image** : le "plan" figé et versionné (lecture seule).
- **Conteneur** : une **instance en cours d'exécution** d'une image, avec une fine couche inscriptible par-dessus.
- **Registre** : un serveur qui stocke des images (Docker Hub, GHCR, un registre privé...).
- **Dockerfile** : le fichier texte qui décrit comment construire une image.
- **Volume** : un mécanisme de stockage persistant, indépendant du cycle de vie du conteneur.

## Ce qu'il faut retenir

- Docker = une **UX** (image, Dockerfile, CLI, registre) construite par-dessus les briques noyau (namespaces/cgroups/capabilities) et le standard OCI.
- Architecture **client-serveur** : la CLI parle à `dockerd` via une API REST, `dockerd` délègue à `containerd`, qui délègue à `runc`.
- Accéder au socket Docker (`/var/run/docker.sock`, ou appartenir au groupe `docker`) équivaut à des droits root sur la machine — à traiter comme tel.
- Sous Linux, Docker Engine tourne nativement, sans VM intermédiaire (contrairement à Docker Desktop sur macOS/Windows).
