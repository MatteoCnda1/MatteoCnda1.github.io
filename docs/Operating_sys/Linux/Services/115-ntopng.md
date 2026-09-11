---
id: 115-ntopng
title: ntopng — surveillance réseau
sidebar_position: 115
tags: [linux, services, monitoring]
---

# ntopng

Outil d'analyse de trafic réseau en temps réel (successeur de `ntop`) : capture le trafic sur une ou plusieurs interfaces et présente une interface web avec le détail des flux, hosts, protocoles et volumes. S'appuie sur `libpcap`/`PF_RING` pour la capture.

## Installation

```bash
# Dépôt officiel ntop
curl https://packages.ntop.org/apt-stable/22.04/all/apt-ntop-stable.deb -o /tmp/ntop.deb
sudo apt install /tmp/ntop.deb
sudo apt update && sudo apt install ntopng

sudo systemctl enable --now ntopng
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/ntopng/ntopng.conf` | Configuration principale (interfaces, port web, options) |
| `/var/lib/ntopng/` | Données persistées (base RRD/timeseries) |

## Commandes utiles

```bash
systemctl status|restart ntopng
ntopng -h                       # liste des options en ligne de commande
curl localhost:3000              # vérifier que l'interface web répond
```

## Exemple de configuration

```
-i=eth0
--http-port=3000
--data-dir=/var/lib/ntopng
```

Capture sur l'interface `eth0` et sert l'interface web sur le port 3000.

## Sécurisation

- Changer les identifiants admin par défaut dès la première connexion.
- Restreindre l'accès à l'interface web (firewall, reverse proxy avec auth) — elle expose des détails fins du trafic réseau interne.
- Sur une interface en mode capture, s'assurer que l'utilisateur `ntopng` a uniquement les capabilities nécessaires (`CAP_NET_RAW`, `CAP_NET_ADMIN`) plutôt que de tourner en root permanent.

## Logs & dépannage

```bash
journalctl -u ntopng -f
tail -f /var/log/ntopng/ntopng.log
```

## Voir aussi

- [snmpd](./116-snmpd.md) — approche complémentaire de supervision réseau par polling SNMP
