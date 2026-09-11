---
id: 055-squid
title: Squid — Proxy HTTP
sidebar_position: 55
tags: [linux, services, web]
---

# Squid — Proxy HTTP

**Squid** est un proxy HTTP/HTTPS **sortant** (forward proxy) : les clients d'un réseau passent par lui pour accéder à Internet. Sert au filtrage d'accès web, à la mise en cache de contenu, et à la journalisation centralisée du trafic web sortant en entreprise.

## Installation

```bash
sudo apt install squid
sudo systemctl enable --now squid
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/squid/squid.conf` | Configuration principale (ACL, ports, cache) |
| `/var/spool/squid/` | Répertoire de cache disque |
| `/var/log/squid/access.log` | Journal des requêtes proxyées |

## Commandes utiles

```bash
sudo squid -k parse                 # Vérifier la syntaxe de squid.conf
sudo squid -k reconfigure           # Recharger sans redémarrer
squidclient mgr:info                # Statistiques du proxy
```

## Exemple de configuration

```
acl reseau_local src 192.168.1.0/24
http_access allow reseau_local
http_access deny all
http_port 3128
```

Ordre des règles important : Squid évalue les `http_access` dans l'ordre et s'arrête à la première correspondance — toujours terminer par un `deny all` explicite.

## Sécurisation

- Ne **jamais** laisser `http_access allow all` sans restriction — proxy ouvert exploitable pour rebondir anonymement (scan, spam, abus signalés à votre IP).
- Restreindre par ACL source (`acl` + `src`) et éventuellement par authentification (`auth_param basic` + `proxy_auth`).
- Limiter les ports de destination autorisés (`acl SSL_ports port 443`, `http_access deny CONNECT !SSL_ports`) pour éviter le tunneling `CONNECT` vers des ports arbitraires.
- Purger/limiter la taille du cache disque (`cache_dir`) pour éviter un remplissage incontrôlé.

## Logs & dépannage

```bash
tail -f /var/log/squid/access.log
journalctl -u squid -f
sudo squid -k parse                 # Avant tout reconfigure, valider la syntaxe
```

## Voir aussi

- [ufw](./013-ufw.md) / [nftables](./015-nftables.md) — pour restreindre l'accès réseau au port du proxy en amont
