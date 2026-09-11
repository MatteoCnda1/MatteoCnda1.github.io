---
id: 071-memcached
title: Memcached — cache mémoire
sidebar_position: 71
tags: [linux, services, data]
---

# Memcached

Memcached est un cache **clé-valeur en mémoire**, volontairement minimaliste : pas de persistance, pas de structures de données riches (juste des chaînes d'octets), mais très rapide et multi-thread nativement. Utilisé classiquement pour cacher des résultats de requêtes SQL ou des fragments de page web.

## Installation

```bash
sudo apt install memcached          # Debian/Ubuntu
sudo dnf install memcached          # RHEL/Fedora
sudo pacman -S memcached            # Arch

sudo systemctl enable --now memcached
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/memcached.conf` | Configuration principale (Debian/Ubuntu : options passées au démon) |
| `/etc/sysconfig/memcached` | Variante RHEL/Fedora |

## Commandes utiles

```bash
systemctl status memcached
echo stats | nc localhost 11211      # statistiques du serveur
memcached -vv                        # lancer en mode debug (verbeux, au premier plan)
memcached -h                         # options disponibles
```

## Exemple de configuration

```conf
# /etc/memcached.conf (Debian/Ubuntu)
-d
-m 256          # mémoire max en Mo
-p 11211        # port d'écoute
-u memcache     # utilisateur d'exécution
-l 127.0.0.1    # interface d'écoute — restreindre au loopback
```

## Sécurisation

- **Toujours** restreindre l'écoute (`-l 127.0.0.1`) — Memcached n'a **aucune authentification native** dans sa version standard ; exposé sur Internet, il a servi de vecteur à des attaques par **amplification DDoS** massives (facteur d'amplification très élevé sur le protocole UDP).
- Désactiver UDP si non utilisé (`-U 0`), ne garder que TCP.
- Isoler le service derrière un pare-feu/VLAN si un accès réseau (non-loopback) est nécessaire.
- Limiter la mémoire allouée (`-m`) pour éviter l'épuisement des ressources de l'hôte.

## Logs & dépannage

```bash
journalctl -u memcached -f
echo "stats items" | nc localhost 11211   # nombre d'objets en cache par slab
echo "flush_all" | nc localhost 11211     # vider le cache (dépannage)
```

## Voir aussi

- [Redis](./070-redis.md) — cache concurrent avec structures de données riches, persistance optionnelle et authentification native.
