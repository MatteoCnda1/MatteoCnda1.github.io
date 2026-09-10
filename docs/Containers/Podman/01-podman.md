---
id: 01-podman
title: Podman — l'alternative sans daemon
sidebar_position: 1
tags: [conteneurs, linux, outil]
---

# Podman — l'alternative sans daemon

> Développé par Red Hat, **Podman** répond à deux critiques historiques de l'architecture Docker : la dépendance à un **daemon** unique tournant en root, et le manque de mode **rootless** natif. Sa promesse : une expérience CLI quasi identique à `docker`, sans ces deux contraintes.

## Différence architecturale majeure : pas de daemon

Comme vu dans le cours [Introduction & architecture](../Docker/00-introduction-architecture.md), Docker repose sur un modèle client-serveur : un daemon (`dockerd`) tourne en permanence, généralement en root, et toutes les commandes passent par lui.

```text
Docker (client-serveur, avec daemon)      Podman (fork/exec direct, sans daemon)

  docker run ...                            podman run ...
       │                                          │
       ▼                                          ▼
  Client Docker                             Podman (CLI = le process
       │ API REST                            qui gère tout directement)
       ▼                                          │
  dockerd (tourne en                              ▼
  permanence, souvent root)                 containers/conmon + runc
       │                                    (lancés directement, pas de
       ▼                                     processus daemon central)
  containerd → runc
```

Podman parle directement aux bibliothèques bas niveau (`libpod`, `containers/storage`, `containers/image`) et invoque `runc`/`crun` sans passer par un daemon central. Conséquences pratiques :

- **Pas de point de défaillance unique** : si un conteneur Podman plante, ça n'affecte pas les autres (pas de daemon partagé à faire crasher).
- **Rootless par défaut** : un utilisateur normal peut lancer des conteneurs Podman **sans aucun privilège root**, grâce aux [user namespaces](../Namespaces/index.md) — contrairement à Docker où appartenir au groupe `docker` équivaut à root (voir [Container Security](../Container_security/index.md)).

## Compatibilité CLI avec Docker

La quasi-totalité des commandes `docker` fonctionnent telles quelles avec `podman` — au point qu'un simple alias suffit souvent à migrer :

```bash
alias docker=podman

podman run -d -p 8080:80 nginx
podman ps
podman images
podman build -t mon-image .
podman exec -it <conteneur> bash
podman logs <conteneur>
```

Podman lit aussi nativement les **Dockerfiles** (pas besoin de les renommer) et sait utiliser `docker-compose`/`docker compose` via **podman-compose** ou son intégration Compose native.

## Le concept de "pod"

Contrairement à Docker, Podman reprend nativement le concept de **pod** de Kubernetes : un groupe de conteneurs qui partagent le même network namespace (donc le même `localhost` et la même IP), comme le fait un pod Kubernetes.

```bash
podman pod create --name mon-pod -p 8080:80
podman run -d --pod mon-pod --name web nginx
podman run -d --pod mon-pod --name sidecar mon-agent-logs
# "web" et "sidecar" partagent la même IP réseau, communiquent via localhost
```

Utile pour tester localement un scénario proche de ce qui tournera réellement sur Kubernetes.

## Installation sur Debian/Ubuntu

```bash
sudo apt update
sudo apt install podman

podman --version
podman run hello-world     # fonctionne immédiatement en rootless, sans configuration root
```

Contrairement à Docker, il n'y a **pas de service à démarrer** (`systemctl enable podman`) pour l'usage de base rootless — c'est justement le principe : rien ne tourne tant qu'aucune commande `podman` n'est exécutée.

## Quand préférer Podman à Docker

- **Environnements multi-utilisateurs** : chaque utilisateur lance ses propres conteneurs rootless, sans pouvoir affecter ceux d'un autre ni la machine hôte.
- **Intégration systemd** : `podman generate systemd` (ou `quadlet` sur les versions récentes) génère des unités systemd natives pour superviser des conteneurs comme n'importe quel service Linux.
- **Contextes où un daemon root permanent est un problème de conformité/sécurité** (serveurs partagés, environnements durcis).

## Ce qu'il faut retenir

- Podman n'a **pas de daemon central** : chaque commande `podman` lance/gère directement les conteneurs, sans processus root permanent en arrière-plan.
- **Rootless par défaut** grâce aux user namespaces — un utilisateur normal n'a besoin d'aucun privilège root pour lancer des conteneurs.
- Compatibilité CLI quasi totale avec `docker` (souvent un simple `alias docker=podman` suffit) et lecture native des Dockerfiles.
- Concept propre : le **pod**, groupe de conteneurs partageant le même réseau — un pont naturel vers Kubernetes.
