---
id: 127-nextcloud
title: Nextcloud — cloud privé auto-hébergé
sidebar_position: 127
tags: [linux, services, sauvegarde]
---

# Nextcloud — cloud privé auto-hébergé

**Nextcloud** est une plateforme de cloud privé auto-hébergée (fichiers, partage, calendrier, contacts, et de nombreuses applications additionnelles). Techniquement, ce n'est pas un service systemd unique mais une **application PHP** qui tourne derrière un serveur web ([nginx](./049-nginx.md) ou [apache2](./050-apache2.md)) via [php-fpm](./057-php-fpm.md), avec une base de données ([postgresql](./063-postgresql.md), [mariadb](./065-mariadb.md) ou MySQL) et éventuellement Redis pour le cache/verrouillage.

## Installation

```bash
# Dépendances : serveur web + php-fpm + base de données
sudo apt install nginx php-fpm php-gd php-mysql php-curl php-mbstring php-intl php-xml php-zip

# Télécharger et déployer Nextcloud
wget https://download.nextcloud.com/server/releases/latest.zip
unzip latest.zip -d /var/www/

# Installation via l'assistant web, ou en CLI avec occ :
sudo -u www-data php occ maintenance:install \
  --database "mysql" --database-name nextcloud \
  --database-user ncuser --database-pass motdepasse \
  --admin-user admin --admin-pass motdepasse
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `config/config.php` | Configuration principale (base de données, domaines de confiance, cache) |
| `occ` (script CLI) | Outil d'administration en ligne de commande |
| `data/` | Répertoire de stockage des fichiers utilisateurs (à sortir du webroot en production) |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `sudo -u www-data php occ status` | État de l'installation |
| `sudo -u www-data php occ upgrade` | Appliquer une mise à jour |
| `sudo -u www-data php occ maintenance:mode --on/--off` | Basculer en mode maintenance |
| `sudo -u www-data php occ files:scan --all` | Rescanner les fichiers (après modif hors interface) |
| `sudo -u www-data php occ user:resetpassword <user>` | Réinitialiser un mot de passe |

## Exemple de configuration

```php
// config/config.php (extraits)
'trusted_domains' => ['cloud.example.fr'],
'overwriteprotocol' => 'https',
'memcache.local' => '\OC\Memcache\Redis',
'redis' => ['host' => '127.0.0.1', 'port' => 6379],
```

## Sécurisation

- **HTTPS obligatoire** (via [nginx](./049-nginx.md)/Let's Encrypt) — Nextcloud stocke des données personnelles/sensibles.
- Restreindre `trusted_domains` aux domaines réellement utilisés (sinon vulnérable à des attaques d'en-tête Host).
- Sortir le répertoire `data/` du webroot public ou bloquer son accès HTTP direct.
- Activer l'authentification à deux facteurs pour les comptes admin.
- Suivre le "Security & setup warnings" intégré à l'interface d'administration après chaque changement.
- Sauvegarder régulièrement `data/` **et** la base de données (les deux sont nécessaires à une restauration complète) — voir [borgmatic](./122-borgmatic.md)/[restic](./123-restic.md).

## Logs & dépannage

```bash
tail -f data/nextcloud.log            # log applicatif Nextcloud
sudo -u www-data php occ log:tail     # suivre les logs via occ
journalctl -u nginx -u php-fpm        # logs du serveur web/PHP
```

## Voir aussi

- [minio](./126-minio.md) — backend de stockage objet alternatif pour Nextcloud
- [postgresql](./063-postgresql.md), [mariadb](./065-mariadb.md) — bases de données supportées
- [redis](./070-redis.md) — cache/verrouillage recommandé en production
