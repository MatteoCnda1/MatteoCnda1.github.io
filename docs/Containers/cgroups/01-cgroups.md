---
id: 01-cgroups
title: cgroups (Control Groups)
sidebar_position: 1
tags: [conteneurs, linux]
---

# cgroups (Control Groups)

> Là où les [namespaces](../Namespaces/index.md) isolent la *vue* qu'un processus a du système, les cgroups **limitent et comptabilisent** les ressources qu'il peut réellement consommer : CPU, mémoire, I/O disque, nombre de processus. Sans cgroups, un conteneur qui boucle à l'infini pourrait épuiser toute la RAM de la machine hôte.

## Le principe

Un cgroup est un groupe de processus auquel on applique des limites de ressources. Ces groupes s'organisent en **hiérarchie** : un cgroup enfant hérite des contraintes de son parent et peut les restreindre davantage, jamais les élargir.

```text
/sys/fs/cgroup/                        (racine)
│
├── docker/                            (tous les conteneurs Docker)
│   ├── <id-conteneur-A>/              memory.max = 512M
│   │                                  cpu.max    = 50000 100000  (50% d'1 CPU)
│   └── <id-conteneur-B>/              memory.max = 1G
│
└── system.slice/                      (services systemd de l'hôte)
    └── nginx.service/                 memory.max = 256M
```

## cgroups v1 vs v2

- **v1** (historique) : chaque type de ressource (CPU, mémoire, I/O...) a sa **propre hiérarchie** indépendante — un processus peut donc appartenir à des groupes différents selon la ressource. Complexe à raisonner.
- **v2** (actuel, par défaut sur les distributions récentes) : **une seule hiérarchie unifiée** pour toutes les ressources. Plus simple, plus cohérent — c'est ce qu'utilise Docker par défaut aujourd'hui.

```bash
# Vérifier quelle version est active
mount | grep cgroup
stat -fc %T /sys/fs/cgroup/      # "cgroup2fs" = v2, "tmpfs" = v1 (hybride)
```

## Ce que les cgroups peuvent limiter

| Contrôleur | Limite | Exemple d'usage |
|---|---|---|
| `memory` | Mémoire RAM (+ swap) | Empêcher un conteneur d'épuiser la RAM de l'hôte |
| `cpu` | Temps CPU (part relative ou quota absolu) | Garantir qu'aucun conteneur ne monopolise le CPU |
| `io` (blkio) | Débit / IOPS disque | Éviter qu'un conteneur sature les disques |
| `pids` | Nombre de processus/threads | Empêcher une fork bomb de saturer la table de processus |
| `cpuset` | Épingler sur des cœurs CPU précis | Isolation de performance (NUMA, temps réel) |

## En pratique avec Docker

Docker traduit directement les options de `docker run` en configuration de cgroups :

```bash
# Limiter à 512 Mo de RAM et 0,5 CPU
docker run --memory=512m --cpus=0.5 nginx

# Limiter le nombre de processus dans le conteneur (anti fork-bomb)
docker run --pids-limit=100 nginx

# Voir la conso en temps réel (lit directement les cgroups)
docker stats
```

Quand la limite mémoire est dépassée, le noyau déclenche l'**OOM killer** (Out-Of-Memory killer) qui tue un processus du cgroup — c'est pour ça qu'un conteneur qui dépasse sa limite mémoire se fait tuer brutalement (souvent visible comme `OOMKilled: true` dans `docker inspect`) plutôt que de swapper indéfiniment.

## Inspecter les cgroups d'un conteneur

```bash
# Récupérer l'ID du cgroup du conteneur
docker inspect --format '{{.Id}}' <conteneur>

# Lire directement les fichiers cgroup v2 (depuis l'hôte)
cat /sys/fs/cgroup/system.slice/docker-<id-complet>.scope/memory.current
cat /sys/fs/cgroup/system.slice/docker-<id-complet>.scope/memory.max
```

## Ce qu'il faut retenir

- Les cgroups **limitent et comptabilisent** les ressources (CPU, mémoire, I/O, PIDs) — complémentaires aux namespaces qui, eux, isolent la *vue*.
- cgroups **v2** (hiérarchie unifiée) est le standard actuel, `v1` (une hiérarchie par ressource) devient historique.
- `docker run --memory`, `--cpus`, `--pids-limit` configurent directement des cgroups ; `docker stats` les lit en temps réel.
- Dépasser la limite mémoire déclenche l'**OOM killer** du noyau, pas un ralentissement progressif.
