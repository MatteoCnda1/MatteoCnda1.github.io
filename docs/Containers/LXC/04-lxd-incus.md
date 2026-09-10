---
id: 04-lxd-incus
title: LXD & Incus — la couche de gestion moderne
sidebar_position: 5
tags: [conteneurs, linux, outil, cheatsheet]
---

# LXD & Incus — la couche de gestion moderne

> Comme vu dans le cours [Introduction & concepts](./00-introduction-concepts.md), **Incus** (fork communautaire de **LXD**) est aujourd'hui l'interface recommandée pour gérer des conteneurs LXC au quotidien : un démon avec API REST, une CLI unifiée, des images prêtes à l'emploi, et la gestion intégrée du stockage/réseau. Les commandes ci-dessous utilisent `incus`, quasi identiques avec `lxc` sous LXD (il suffit généralement de substituer le nom de la commande).

## Ce qu'apporte LXD/Incus par rapport aux outils `lxc-*` bruts

| | `lxc-*` brut | LXD / Incus |
|---|---|---|
| Interface | Une commande par action | CLI unifiée (`incus <verbe>`) |
| Images | Templates locaux, téléchargement manuel | Serveurs d'images distants, cache local, mise à jour simple |
| Stockage | Répertoire simple par défaut | Pools de stockage (zfs/btrfs/lvm/dir), clones/snapshots efficaces natifs |
| Réseau | Bridge basique via `lxc-net` | Gestion réseau riche (bridges, VLAN, NAT, règles de pare-feu) intégrée |
| Machines virtuelles | Non | **Oui** — Incus/LXD gèrent aussi des VM avec la même CLI, en plus des conteneurs |
| API distante | Non | API REST, gestion à distance et **clustering** multi-hôtes |
| Profils | Non | **Profils** réutilisables (config réseau/stockage/limites appliquée à plusieurs conteneurs) |

## Initialisation

```bash
incus admin init          # assistant interactif : stockage, réseau, écoute API
incus admin init --minimal  # config par défaut sans poser de question
```

## Gérer les images

```bash
incus image list                          # images en cache localement
incus image list images: debian           # chercher sur le serveur d'images distant
incus image list images: -c l             # lister uniquement les alias (colonne "l")
```

Le serveur d'images `images:` référence les distributions officielles (Debian, Ubuntu, Alpine, CentOS, Fedora, Arch...) prêtes à l'emploi.

## Créer et lancer un conteneur

```bash
# "launch" = créer + démarrer en une seule commande (le plus courant)
incus launch images:debian/12 mon-conteneur
incus launch images:ubuntu/24.04 mon-conteneur

# Créer sans démarrer
incus init images:debian/12 mon-conteneur

# Lancer avec des limites de ressources définies dès la création
incus launch images:debian/12 mon-conteneur -c limits.cpu=2 -c limits.memory=1GiB
```

## Cycle de vie

```bash
incus list                        # lister tous les conteneurs (et VM), avec état/IP
incus start mon-conteneur
incus stop mon-conteneur
incus stop mon-conteneur --force  # équivalent de lxc-stop --kill
incus restart mon-conteneur
incus pause mon-conteneur         # équivalent de lxc-freeze
incus resume mon-conteneur        # équivalent de lxc-unfreeze
incus delete mon-conteneur        # supprimer (doit être arrêté, sauf --force)
incus delete mon-conteneur --force
```

## Accéder à un conteneur

```bash
incus exec mon-conteneur -- bash             # shell interactif (équivalent lxc-attach)
incus exec mon-conteneur -- whoami
incus console mon-conteneur                  # équivalent lxc-console
```

## Transférer des fichiers

```bash
incus file push ./fichier.txt mon-conteneur/tmp/fichier.txt
incus file pull mon-conteneur/etc/hostname ./hostname-recupere
incus file edit mon-conteneur/etc/nginx/nginx.conf   # ouvre dans $EDITOR, réécrit dans le conteneur
```

## Configuration & profils

```bash
incus config show mon-conteneur                       # voir la config complète
incus config set mon-conteneur limits.memory 2GiB       # modifier une limite à chaud
incus config device add mon-conteneur homedir disk source=/home/user/partage path=/mnt/partage  # bind mount

# Les profils regroupent des réglages réutilisables sur plusieurs conteneurs
incus profile list
incus profile show default
incus profile create web-servers
incus profile set web-servers limits.cpu 2
incus launch images:debian/12 web01 --profile web-servers
```

## Snapshots et clones

```bash
incus snapshot create mon-conteneur avant-maj
incus snapshot list mon-conteneur
incus snapshot restore mon-conteneur avant-maj
incus snapshot delete mon-conteneur avant-maj

incus copy mon-conteneur mon-conteneur-clone            # clone local
incus copy mon-conteneur autre-hote:mon-conteneur        # clone vers un hôte distant (clustering/migration)
```

## Réseau et stockage

```bash
incus network list
incus network create mon-reseau
incus network attach mon-reseau mon-conteneur

incus storage list
incus storage create mon-pool zfs
incus storage volume create mon-pool mon-volume
```

## Publier une image personnalisée

Après avoir configuré un conteneur exactement comme voulu, on peut en faire une image réutilisable :

```bash
incus stop mon-conteneur
incus publish mon-conteneur --alias mon-image-perso
incus launch mon-image-perso nouveau-conteneur   # réutiliser l'image créée
```

## Machines virtuelles : la même CLI

Particularité importante d'Incus/LXD : la **même commande** `launch` peut créer une VM (via QEMU) plutôt qu'un conteneur, simplement avec un flag :

```bash
incus launch images:debian/12 ma-vm --vm
```

Utile quand l'isolation d'un conteneur (noyau partagé) ne suffit pas et qu'il faut une vraie virtualisation matérielle — sans changer d'outil ni de CLI.

## Ce qu'il faut retenir

- **Incus/LXD** apporte par-dessus `liblxc` : CLI unifiée, images distantes prêtes à l'emploi, stockage/réseau avancés, **profils** réutilisables, clustering, et même la gestion de **VM** avec la même CLI.
- Équivalences clés : `incus launch` = create+start, `incus exec` = attach, `incus stop --force` = kill, `incus pause`/`resume` = freeze/unfreeze.
- Les **profils** permettent de définir une configuration (ressources, réseau) une fois et de l'appliquer à plusieurs conteneurs.
- `incus copy`/`incus publish` permettent le clonage local, la migration vers un hôte distant, et la création d'images personnalisées réutilisables.
