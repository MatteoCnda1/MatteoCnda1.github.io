---
id: 070-redis
title: Redis — cache / base clé-valeur
sidebar_position: 70
tags: [linux, services, data]
---

# Redis

Redis est un moteur de stockage clé-valeur **en mémoire**, utilisé comme cache, broker de messages léger (pub/sub) ou base de données rapide pour des structures simples (strings, listes, sets, hashes, sorted sets). Binaire principal : `redis-server`, package `redis` (ou `redis-server` sur Debian/Ubuntu).

## Installation

```bash
sudo apt install redis-server        # Debian/Ubuntu
sudo dnf install redis               # RHEL/Fedora
sudo pacman -S redis                 # Arch

sudo systemctl enable --now redis-server   # nom du service redis sur Debian/Ubuntu
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/redis/redis.conf` | Configuration principale (bind, port, persistence, mémoire max) |
| `/var/lib/redis/` | Répertoire de données (dump RDB, fichier AOF) |
| `/etc/redis/redis.conf` (section `requirepass`) | Mot de passe d'authentification |

## Commandes utiles

```bash
systemctl status redis-server
redis-cli ping                       # doit répondre PONG
redis-cli -a <password> info         # infos serveur (auth requise si mot de passe défini)
redis-cli config get maxmemory
redis-cli monitor                    # observer les commandes en temps réel (debug uniquement)
```

## Exemple de configuration

```conf
bind 127.0.0.1 -::1
port 6379
requirepass ChangeMoi!2024
maxmemory 512mb
maxmemory-policy allkeys-lru
appendonly yes
```

`bind` restreint l'écoute au loopback (à ouvrir explicitement si accès distant nécessaire) ; `requirepass` impose une authentification ; `maxmemory-policy` définit la stratégie d'éviction une fois la mémoire maximale atteinte.

## Sécurisation

- Ne **jamais** exposer Redis sans authentification sur une interface publique (`bind 0.0.0.0` sans `requirepass` = compromission triviale — cas d'attaque très courant sur les scans Internet).
- Définir `requirepass` (ou les **ACL** utilisateur depuis Redis 6, plus granulaires que le mot de passe unique).
- Renommer/désactiver les commandes dangereuses (`FLUSHALL`, `CONFIG`, `DEBUG`) via `rename-command` en production.
- Faire tourner Redis avec un utilisateur dédié non privilégié (`redis`, par défaut sur la plupart des paquets).
- Activer TLS (`tls-port`) si le trafic doit transiter sur un réseau non fiable.

## Logs & dépannage

```bash
journalctl -u redis-server -f
tail -f /var/log/redis/redis-server.log
redis-cli --latency                  # mesurer la latence réseau/serveur
redis-cli info memory                # diagnostiquer la consommation mémoire
```

## Voir aussi

- [Memcached](./071-memcached.md) — cache concurrent, modèle de données plus simple (uniquement clé → chaîne d'octets, pas de structures riches, pas de persistance).
