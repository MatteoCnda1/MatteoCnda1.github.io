---
id: 048-incus
title: incus — Conteneurs et VM
sidebar_position: 48
tags: [linux, services, conteneurs]
---

# incus — Conteneurs et VM

**Incus** est le fork communautaire de LXD (Linux Containers project), né en 2023 après le rachat de Canonical/LXD par une gouvernance jugée trop centralisée. Il conserve la même architecture : conteneurs système et VM légères via une API/CLI quasi identique à LXD, mais packagé nativement (pas de dépendance à snap) et maintenu par la communauté Linux Containers.

## Installation

```bash
# Debian/Ubuntu (dépôt zabbly ou paquet natif selon la distribution)
apt install incus
incus admin init             # configuration interactive initiale
systemctl status incus
```

## Fichiers de configuration

| Fichier/emplacement | Rôle |
|---|---|
| `/var/lib/incus/` | Données et configuration |
| `incus profile` | Profils réutilisables |
| `incus storage` | Pools de stockage (dir, zfs, btrfs, lvm) |

## Commandes utiles

```bash
incus list
incus launch images:debian/12 monconteneur
incus exec monconteneur -- bash
incus profile list
incus network list
```

## Exemple de configuration

```bash
incus launch images:debian/12 web01
incus config set web01 limits.cpu 2
incus config set web01 limits.memory 2GB
```

## Sécurisation

- Appartenir au groupe `incus` équivaut à un accès root sur l'hôte — même précaution que pour `lxd`/`docker`.
- Préférer des conteneurs non privilégiés par défaut.
- Isoler le pool de stockage sur ZFS/btrfs pour bénéficier des snapshots natifs.
- Utiliser les profils pour appliquer des limites de ressources par défaut.

## Logs & dépannage

```bash
journalctl -u incus -f
incus info monconteneur --show-log
incus monitor
```

## Voir aussi

- [lxd](./047-lxd.md) — le projet d'origine dont Incus est un fork, commandes quasi identiques (`lxc` → `incus`)
