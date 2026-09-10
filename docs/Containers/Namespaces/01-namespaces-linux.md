---
id: 01-namespaces-linux
title: Namespaces Linux
sidebar_position: 1
tags: [conteneurs, linux]
---

# Namespaces Linux

> Les namespaces sont le mécanisme noyau qui donne à un processus une **vue isolée** d'une ressource système — sans dupliquer cette ressource. C'est la brique la plus fondamentale de l'isolation des conteneurs.

## Le principe

Normalement, tous les processus d'une machine Linux voient **la même chose** : la même liste de processus (`ps aux`), la même pile réseau, le même système de fichiers monté, le même hostname. Un namespace permet de créer un **nouveau contexte** pour un type de ressource donné, dans lequel un processus (et ses enfants) évoluent isolément des autres.

```text
Sans namespace (vue partagée)          Avec namespace PID (vue isolée)

Hôte : PID 1, 2, 3, 4, 5 ...           Hôte : PID 1, 2, 3, 4, 5, 8842 ...
                                                                  │
Processus A voit : 1, 2, 3, 4, 5       Processus A voit : 1  ← (c'est lui-même,
Processus B voit : 1, 2, 3, 4, 5                              PID 8842 côté hôte)
```

Un conteneur, ce n'est ni plus ni moins qu'un ou plusieurs processus lancés dans un **jeu de namespaces dédié**.

## Les types de namespaces

| Namespace | Isole | Flag `clone()`/`unshare` |
|---|---|---|
| **PID** | La liste des processus (le conteneur voit son propre PID 1) | `CLONE_NEWPID` |
| **Mount (mnt)** | Les points de montage (le conteneur a son propre arbre de fichiers) | `CLONE_NEWNS` |
| **Network (net)** | La pile réseau (interfaces, IP, routes, ports, iptables) | `CLONE_NEWNET` |
| **UTS** | Le hostname et le nom de domaine | `CLONE_NEWUTS` |
| **IPC** | La communication inter-processus (files de messages, sémaphores) | `CLONE_NEWIPC` |
| **User** | La correspondance UID/GID (root *dans* le conteneur ≠ root sur l'hôte) | `CLONE_NEWUSER` |
| **Cgroup** | La vue de la hiérarchie de cgroups | `CLONE_NEWCGROUP` |
| **Time** (récent) | L'horloge système (utile pour les tests/migrations) | `CLONE_NEWTIME` |

Un conteneur Docker classique combine **PID + Mount + Network + UTS + IPC** (et Cgroup). Le **User namespace** est disponible mais pas activé par défaut — voir [Container Security](../Container_security/index.md) pour pourquoi c'est dommage côté sécurité.

## Manipuler les namespaces directement

Sans Docker, on peut créer et explorer des namespaces à la main avec les outils `util-linux` :

```bash
# Lancer un shell dans un nouveau namespace PID + mount + UTS
sudo unshare --pid --mount --uts --fork /bin/bash

# À l'intérieur, PID 1 est *ce* shell, pas systemd/init de l'hôte
ps aux
# PID   ...
# 1     /bin/bash

# Changer le hostname n'affecte QUE ce namespace UTS
hostname conteneur-test
```

```bash
# Lister les namespaces existants sur le système
lsns

# Voir dans quels namespaces se trouve un processus donné
ls -l /proc/<PID>/ns/

# Entrer dans les namespaces d'un processus déjà lancé (ex. un conteneur)
sudo nsenter --target <PID> --pid --mount --net /bin/bash
```

`nsenter` est l'outil qu'utilise en coulisses `docker exec` : il « entre » dans les namespaces d'un conteneur déjà lancé pour y exécuter une nouvelle commande.

## Le piège classique : PID 1 dans le conteneur

Le premier processus lancé dans un nouveau namespace PID devient le **PID 1** de ce namespace — avec les responsabilités particulières de PID 1 sous Linux (il doit *reaper* les processus zombies, il ignore les signaux par défaut sauf s'il les gère explicitement). Beaucoup d'images Docker lancent directement l'application comme PID 1, qui ne gère pas ces responsabilités → processus zombies qui s'accumulent, `SIGTERM` ignoré au `docker stop`. Solution : utiliser un init minimal comme point d'entrée (`tini`, ou l'option `docker run --init`).

## Ce qu'il faut retenir

- Un namespace donne une **vue isolée** d'une ressource système à un processus, sans la dupliquer physiquement.
- Il en existe 8 types (PID, Mount, Network, UTS, IPC, User, Cgroup, Time) ; Docker en combine plusieurs par défaut, mais **pas** le User namespace.
- `unshare` crée de nouveaux namespaces, `nsenter` permet d'en rejoindre un existant (c'est ce que fait `docker exec`).
- Le processus PID 1 d'un conteneur hérite des responsabilités spéciales de PID 1 sous Linux — d'où l'intérêt d'un init minimal (`--init`, `tini`).
