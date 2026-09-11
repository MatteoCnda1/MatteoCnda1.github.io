---
id: 057-php-fpm
title: php-fpm — Exécution PHP
sidebar_position: 57
tags: [linux, services, applicatif]
---

# php-fpm — Exécution PHP

**PHP-FPM** (FastCGI Process Manager) est le gestionnaire de processus PHP utilisé pour exécuter du code PHP derrière un serveur web (Nginx, Apache). Il remplace l'ancien module `mod_php` en exécutant PHP dans des processus séparés, gérés par un pool, communiquant via FastCGI (socket Unix ou TCP). C'est le standard actuel pour servir des applications PHP (WordPress, Symfony, Laravel...).

## Installation

```bash
# Debian/Ubuntu
sudo apt install php-fpm

# RHEL/Fedora
sudo dnf install php-fpm

sudo systemctl enable --now php8.3-fpm   # le nom exact du service inclut la version PHP
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/php/8.3/fpm/php-fpm.conf` | Configuration globale du processus maître |
| `/etc/php/8.3/fpm/pool.d/www.conf` | Configuration d'un **pool** (utilisateur, socket, limites de processus) |
| `/etc/php/8.3/fpm/php.ini` | Configuration PHP elle-même (limites mémoire, extensions...) |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status/restart php8.3-fpm` | Gestion du service |
| `php-fpm8.3 -t` | Tester la configuration avant de recharger |
| `journalctl -u php8.3-fpm` | Logs du service |

## Exemple de configuration

Extrait d'un pool (`/etc/php/8.3/fpm/pool.d/www.conf`) :

```ini
[www]
user = www-data
group = www-data
listen = /run/php/php8.3-fpm.sock
listen.owner = www-data
pm = dynamic
pm.max_children = 20
pm.start_servers = 4
pm.min_spare_servers = 2
pm.max_spare_servers = 6
```

Un **socket Unix** (`listen = /run/php/...sock`) est préférable à un port TCP local : plus rapide, et non exposé au réseau.

## Sécurisation

- Exécuter le pool sous un utilisateur dédié non privilégié (`www-data`), jamais `root`.
- Désactiver les fonctions PHP dangereuses via `disable_functions` dans `php.ini` (`exec`, `shell_exec`, `system`...) si l'application ne les utilise pas.
- Limiter `pm.max_children` en cohérence avec la RAM disponible pour éviter l'épuisement mémoire (chaque processus PHP consomme sa propre mémoire).
- Restreindre les permissions du socket (`listen.owner`/`listen.group`/`listen.mode`) pour que seul le serveur web puisse s'y connecter.
- Activer `open_basedir` dans `php.ini` pour confiner l'accès filesystem de PHP au répertoire de l'application.

## Logs & dépannage

- Logs du pool : `/var/log/php8.3-fpm.log`.
- Slow log (requêtes lentes) : configurable via `slowlog` et `request_slowlog_timeout` dans le pool.
- `journalctl -u php8.3-fpm -f` pour suivre en direct.
- Erreur 502 côté Nginx = souvent php-fpm arrêté ou socket mal référencé dans la config Nginx.

## Voir aussi

- [nginx](./049-nginx.md) — reverse proxy typique servant les requêtes PHP à php-fpm via FastCGI
- [Cours PHP](../../../Programmation/Php/01-php-basics.md) — pour la syntaxe et le langage lui-même (cette fiche couvre uniquement le déploiement)
