---
id: 01-oci-specifications
title: OCI — Open Container Initiative
sidebar_position: 1
tags: [conteneurs]
---

# OCI — Open Container Initiative

> Jusqu'en 2015, "conteneur" voulait dire "conteneur Docker" : le format d'image et le mode d'exécution étaient définis par un seul projet. L'**OCI** (Open Container Initiative, fondée en 2015 sous l'égide de la Linux Foundation, avec Docker comme contributeur fondateur) a standardisé ces formats pour que l'écosystème ne dépende plus d'une implémentation unique.

## Pourquoi standardiser

Avant l'OCI, une image construite pour Docker n'était garantie de fonctionner qu'avec Docker. La standardisation permet :

- à **plusieurs outils** (Docker, Podman, containerd, CRI-O...) de produire et consommer les **mêmes images**,
- à un **runtime bas niveau** (celui qui crée réellement le conteneur) d'être interchangeable sans changer le reste de la chaîne,
- à l'écosystème de ne pas dépendre de la pérennité d'un seul éditeur.

## Les trois spécifications OCI

| Spécification | Définit |
|---|---|
| **image-spec** | Le format d'une image de conteneur : structure des couches (layers), manifeste, configuration (commande à exécuter, variables d'env, etc.) |
| **runtime-spec** | Comment un runtime doit **exécuter** un conteneur à partir d'une image extraite sur disque (bundle) : quels namespaces créer, quelles cgroups appliquer... |
| **distribution-spec** | Comment un **registre** (comme Docker Hub) doit exposer une API pour pousser/tirer des images (`push`/`pull`) |

## Où se situe chaque outil dans la chaîne

```text
   docker run mon-image
        │
        ▼
   ┌─────────────┐   API haut niveau, gestion des images,
   │   dockerd    │   réseaux, volumes, build...
   └──────┬──────┘
          │ délègue l'exécution
          ▼
   ┌─────────────┐   Runtime de HAUT niveau : gère le cycle de
   │  containerd  │   vie (pull, stockage des images, snapshots),
   └──────┬──────┘   expose une API (gRPC / CRI pour Kubernetes)
          │ délègue la création du process
          ▼
   ┌─────────────┐   Runtime de BAS niveau, conforme OCI
   │     runc     │   runtime-spec : crée les namespaces/cgroups
   └──────┬──────┘   et lance le process — implémentation
          │           de référence de l'OCI
          ▼
   Conteneur en cours d'exécution
   (un processus Linux avec ses namespaces/cgroups)
```

- **runc** est l'implémentation de référence de la *runtime-spec* — c'est le petit programme qui, concrètement, appelle `clone()`/`unshare()` pour créer les namespaces et démarre le processus. D'autres runtimes bas niveau existent (`crun`, plus rapide, écrit en C ; `gVisor`/`runsc`, qui ajoute une couche de sandboxing supplémentaire ; `Kata Containers`, qui isole chaque conteneur dans une micro-VM).
- **containerd** est le runtime de *haut niveau* : il gère le téléchargement des images, leur stockage en couches, et pilote `runc` pour créer les conteneurs. Voir [containerd](../containerd/index.md).
- **Docker Engine** (`dockerd`) ajoute par-dessus containerd la couche orientée développeur : CLI `docker`, build d'images, réseaux virtuels, volumes, API REST.

## Une image OCI, concrètement

Une image conforme à l'*image-spec* est une archive contenant :

- un **manifeste** (JSON) qui liste les couches et la configuration,
- des **couches (layers)**, chacune étant une archive tar compressée représentant un diff du système de fichiers,
- un fichier de **configuration** décrivant la commande par défaut, les variables d'environnement, l'utilisateur, etc.

```bash
# Une image Docker est un objet OCI : on peut l'inspecter avec des outils génériques
docker manifest inspect nginx:latest

# skopeo (outil indépendant de Docker) peut inspecter/copier des images OCI
# entre différents registres sans avoir besoin d'un daemon Docker
skopeo inspect docker://nginx:latest
```

## Ce qu'il faut retenir

- L'**OCI** standardise trois choses : le format d'**image**, le comportement d'un **runtime**, et l'API d'un **registre de distribution**.
- La chaîne d'exécution typique : **dockerd** (haut niveau, UX développeur) → **containerd** (gestion des images/cycle de vie) → **runc** (bas niveau, création effective des namespaces/cgroups, conforme OCI).
- Grâce à cette standardisation, une image construite avec `docker build` fonctionne avec Podman, containerd/Kubernetes, ou tout autre outil compatible OCI.
