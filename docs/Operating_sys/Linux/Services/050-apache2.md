---
id: 050-apache2
title: apache2 — Serveur web Apache
sidebar_position: 50
tags: [linux, services, web]
---

# apache2 — Serveur web Apache

**Apache HTTP Server** (`httpd`) est un serveur web historique, à l'architecture modulaire (MPM prefork/worker/event + modules chargeables). Le nom du service et les chemins diffèrent selon la distribution : `apache2` sous Debian/Ubuntu, `httpd` sous RHEL-like (voir [httpd](./051-httpd.md) pour les spécificités RHEL).

## Installation

```bash
sudo apt install apache2
sudo systemctl enable --now apache2
sudo a2enmod ssl rewrite headers   # activer des modules courants
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/apache2/apache2.conf` | Configuration principale |
| `/etc/apache2/sites-available/` + `sites-enabled/` | Vhosts (activés via `a2ensite`) |
| `/etc/apache2/mods-available/` + `mods-enabled/` | Modules (activés via `a2enmod`) |
| `/var/log/apache2/access.log` / `error.log` | Logs |

## Commandes utiles

```bash
sudo apachectl configtest           # Vérifier la syntaxe
sudo systemctl reload apache2
sudo a2ensite monsite && sudo systemctl reload apache2
sudo a2dismod status                # Désactiver un module
apache2ctl -M                       # Lister les modules chargés
```

## Exemple de configuration

```apache
<VirtualHost *:80>
    ServerName exemple.fr
    DocumentRoot /var/www/exemple

    <Directory /var/www/exemple>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

## Sécurisation

- `ServerTokens Prod` et `ServerSignature Off` pour ne pas divulguer version/OS.
- Désactiver les modules non utilisés (`a2dismod`) — surface d'attaque réduite.
- `AllowOverride None` par défaut, activer `.htaccess` uniquement où nécessaire (impact performance + sécurité).
- MPM `event` recommandé (meilleure gestion mémoire/concurrence que `prefork`) sauf si dépendance à des modules non thread-safe (mod_php classique).
- Restreindre l'accès aux répertoires sensibles (`<Directory>` avec `Require all denied` par défaut, puis autoriser explicitement).

## Logs & dépannage

```bash
tail -f /var/log/apache2/error.log
journalctl -u apache2 -f
sudo apachectl configtest
```

## Voir aussi

- [httpd](./051-httpd.md) — même logiciel, nommage et chemins RHEL
- [PHP-FPM](./057-php-fpm.md) — souvent utilisé via `mod_proxy_fcgi` en remplacement de mod_php
