---
id: 01-containerd
title: containerd
sidebar_position: 1
tags: [conteneurs]
---

# containerd

> Extrait de Docker Engine en 2016 puis donné à la Cloud Native Computing Foundation (CNCF), **containerd** est le runtime de *haut niveau* qui fait tourner concrètement les conteneurs derrière Docker — et aussi derrière Kubernetes.

## Sa place dans la chaîne

Comme vu dans le cours sur [OCI](../OCI/index.md), la responsabilité de faire tourner un conteneur se répartit sur plusieurs couches :

```text
  Utilisateur / kubelet (Kubernetes)
        │
        ▼
  ┌──────────────┐   Interface haut niveau : CLI docker,
  │   dockerd     │   build d'images, réseaux, volumes
  └──────┬───────┘   (optionnel — Kubernetes parle direct. à containerd)
         │ délègue via une API gRPC
         ▼
  ┌──────────────┐   Gère : téléchargement/stockage des images,
  │  containerd   │   snapshots du système de fichiers, cycle de
  └──────┬───────┘   vie des conteneurs, exposition de l'API CRI
         │ crée un process par appel à
         ▼
  ┌──────────────┐   Bas niveau, conforme OCI runtime-spec :
  │     runc      │   crée réellement namespaces + cgroups
  └──────────────┘
```

Ce qui a changé avec l'extraction de containerd, c'est que **Docker n'est plus indispensable** pour faire tourner des conteneurs : Kubernetes, par exemple, parle directement à containerd via **CRI** (Container Runtime Interface), sans passer par `dockerd` du tout.

## Ce que containerd gère concrètement

- **Transfert d'images** : télécharger (`pull`) une image depuis un registre, gérer l'authentification.
- **Stockage en couches** : extraire et stocker les couches d'image, gérer les *snapshots* du système de fichiers (via des snapshotters comme `overlayfs`).
- **Cycle de vie des conteneurs** : créer, démarrer, arrêter, superviser des conteneurs (en pilotant `runc` ou un autre runtime bas niveau conforme OCI).
- **API** : expose une API gRPC utilisée par `dockerd`, et l'API **CRI** utilisée directement par `kubelet` (l'agent Kubernetes sur chaque nœud).

## Les outils en ligne de commande

containerd n'a pas de CLI conviviale équivalente à `docker` — deux outils bas niveau existent pour l'interroger directement, surtout utiles en diagnostic :

```bash
# ctr : le client livré avec containerd lui-même, assez bas niveau
sudo ctr version
sudo ctr images ls
sudo ctr containers ls

# crictl : le client orienté CRI, plus proche de ce que Kubernetes utilise
# (utile pour déboguer un nœud Kubernetes sans docker installé)
sudo crictl ps
sudo crictl images
sudo crictl logs <id-conteneur>
```

En usage quotidien de développeur, on ne touche quasiment jamais `ctr`/`crictl` directement : `docker` (ou `kubectl` côté Kubernetes) suffit, ils parlent à containerd en coulisses. Ces outils bas niveau servent surtout à **diagnostiquer** un problème quand la couche au-dessus se comporte mal, ou sur un nœud Kubernetes qui n'a pas Docker installé (cas courant depuis que Kubernetes a retiré le support natif de `dockerd` en 2022).

## Vérifier que containerd tourne

```bash
sudo systemctl status containerd
sudo ctr version    # affiche la version du client ET du serveur containerd
```

## Ce qu'il faut retenir

- **containerd** est le runtime de *haut niveau* qui gère images, stockage et cycle de vie des conteneurs — extrait de Docker Engine, aujourd'hui projet CNCF indépendant.
- Docker (`dockerd`) et Kubernetes (`kubelet`, via **CRI**) parlent tous les deux à containerd, qui pilote ensuite `runc` pour la création effective des conteneurs.
- `ctr`/`crictl` sont des outils bas niveau de diagnostic, pas des remplaçants du quotidien de `docker` ou `kubectl`.
