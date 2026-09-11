---
id: 030-tuned
title: tuned — Optimisation système
sidebar_position: 30
tags: [linux, services, systeme]
---

# tuned

**tuned** est un démon d'optimisation système (principalement dans l'écosystème RHEL/Fedora) qui applique dynamiquement des **profils** de réglages — CPU governor, I/O scheduler, paramètres réseau/sysctl, gestion énergétique — selon le rôle de la machine (serveur, poste de travail, virtualisation, latence réseau...). Il évite de devoir régler manuellement des dizaines de paramètres kernel dispersés.

## Installation

```bash
# Fedora/RHEL
sudo dnf install tuned
sudo systemctl enable --now tuned

# Debian/Ubuntu (disponible aussi, moins central que sur RHEL)
sudo apt install tuned
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/tuned/active_profile` | Profil actuellement actif |
| `/usr/lib/tuned/<profil>/tuned.conf` | Définition des profils fournis par le paquet |
| `/etc/tuned/<profil>/tuned.conf` | Profils personnalisés/surchargés |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status tuned` | État du démon |
| `tuned-adm list` | Lister les profils disponibles |
| `tuned-adm active` | Afficher le profil actif |
| `tuned-adm profile <nom>` | Basculer sur un profil |
| `tuned-adm recommend` | Profil recommandé selon le matériel détecté |
| `tuned-adm verify` | Vérifier que les réglages du profil actif sont bien appliqués |

## Exemple de configuration

```ini
# /etc/tuned/mon-profil/tuned.conf
[main]
include=throughput-performance

[sysctl]
net.core.somaxconn=4096
vm.swappiness=10
```

Ce profil personnalisé hérite du profil `throughput-performance` fourni par défaut et surcharge deux paramètres sysctl — pratique pour partir d'un profil standard sans tout redéfinir.

## Sécurisation

Pas d'enjeu de sécurité direct — tuned est un outil de performance, pas d'exposition réseau/service. Bonnes pratiques d'exploitation :

- Toujours vérifier `tuned-adm active` après un changement d'infrastructure (migration VM, changement de matériel) : un profil `virtual-guest` appliqué par erreur sur du bare-metal (ou l'inverse) dégrade les performances plutôt que de les améliorer.
- `tuned-adm verify` régulièrement pour détecter une dérive (un autre outil ou un script ayant modifié un sysctl que le profil est censé contrôler).

## Logs & dépannage

```bash
journalctl -u tuned
tuned-adm verify           # confronte l'état réel du système au profil actif
tuned-adm active           # profil actuellement appliqué
```

Un profil qui ne semble pas appliqué après `tuned-adm profile <nom>` : vérifier que le service est bien actif (`systemctl status tuned`) — `tuned-adm` ne fait qu'écrire la config, c'est le démon qui l'applique.
