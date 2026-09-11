---
id: 105-pacemaker
title: pacemaker — gestion de cluster HA
sidebar_position: 105
tags: [linux, services, ha-cluster]
---

# pacemaker — gestion de cluster HA

`pacemaker` est le **gestionnaire de ressources** d'un cluster haute disponibilité Linux : il décide où et quand démarrer/arrêter/déplacer des ressources (IP virtuelle, service, montage disque...) en fonction de l'état du cluster. Il s'appuie sur [corosync](./104-corosync.md) pour connaître le membership et la communication inter-nœuds — les deux fonctionnent toujours ensemble.

## Installation

```bash
sudo apt install pacemaker pcs      # Debian/Ubuntu (pcs = outil de gestion)
sudo dnf install pacemaker pcs      # RHEL/Fedora
sudo systemctl enable --now pcsd pacemaker corosync
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| CIB (Cluster Information Base) | Configuration vivante du cluster, gérée via `pcs`/`crm`, pas éditée à la main directement |
| `/var/lib/pacemaker/cib/cib.xml` | Représentation XML de la CIB sur disque |
| `/etc/corosync/corosync.conf` | Config de la couche communication sous-jacente |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `pcs status` | Vue d'ensemble du cluster et de ses ressources |
| `pcs cluster start --all` | Démarrer le cluster sur tous les nœuds |
| `pcs resource create ...` | Ajouter une ressource gérée (VIP, service...) |
| `pcs constraint` | Définir des contraintes de placement (colocation, ordre) |
| `crm_mon` | Moniteur temps réel de l'état du cluster |

## Exemple de configuration

```bash
# Créer une ressource IP virtuelle gérée par le cluster
pcs resource create vip ocf:heartbeat:IPaddr2 ip=192.168.1.100 cidr_netmask=24

# Créer une ressource service (ex: nginx)
pcs resource create webserver systemd:nginx

# Contraindre : la VIP et nginx doivent toujours être sur le même nœud
pcs constraint colocation add webserver with vip INFINITY
```

## Sécurisation

- Restreindre l'accès à l'API `pcsd` (port 2224) au réseau de management uniquement.
- Changer le mot de passe par défaut de l'utilisateur `hacluster` immédiatement après installation.
- Configurer un **fencing/STONITH** (Shoot The Other Node In The Head) — sans lui, un nœud partiellement défaillant peut causer une corruption de données (double écriture sur une ressource partagée).
- Limiter les permissions ACL de la CIB si plusieurs administrateurs interviennent sur le cluster.

## Logs & dépannage

- `journalctl -u pacemaker -f` — décisions de placement, échecs de ressources.
- `pcs status` / `crm_mon -1` — diagnostic rapide de l'état global.
- `pcs resource failcount show <ressource>` — voir si une ressource échoue en boucle.

## Voir aussi

- [corosync](./104-corosync.md) — la couche de communication sous-jacente, indispensable au fonctionnement de pacemaker.
- [keepalived](./103-keepalived.md) — solution plus légère si le besoin se limite à une bascule d'IP simple sans orchestration multi-ressources.
