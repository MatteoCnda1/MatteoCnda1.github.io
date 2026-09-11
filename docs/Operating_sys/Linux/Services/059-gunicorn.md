---
id: 059-gunicorn
title: Gunicorn — Serveur Python WSGI
sidebar_position: 59
tags: [linux, services, applicatif]
---

# Gunicorn — Serveur Python WSGI

**Gunicorn** (Green Unicorn) est un serveur d'applications Python implémentant l'interface **WSGI** (Web Server Gateway Interface), utilisé pour exécuter des applications Django, Flask, etc. en production. Comme php-fpm pour PHP, il se place derrière un reverse proxy ([nginx](./049-nginx.md)) qui gère TLS et le trafic statique.

## Installation

```bash
pip install gunicorn
```

Généralement installé dans un **environnement virtuel** (`venv`) dédié à l'application, pas au niveau système.

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/systemd/system/gunicorn.service` | Unit systemd lançant Gunicorn |
| `/opt/monapp/gunicorn.conf.py` | Fichier de configuration Gunicorn (workers, bind, timeouts...) |
| `/etc/systemd/system/gunicorn.socket` | (optionnel) socket systemd activé à la demande |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `gunicorn --check-config app:app` | Vérifier la config sans démarrer |
| `systemctl start/restart/status gunicorn` | Gestion du service |
| `journalctl -u gunicorn -f` | Logs en direct |

## Exemple de configuration

Unit systemd avec socket Unix (`/etc/systemd/system/gunicorn.service`) :

```ini
[Unit]
Description=Gunicorn pour monapp
After=network.target

[Service]
User=monapp
Group=www-data
WorkingDirectory=/opt/monapp
ExecStart=/opt/monapp/venv/bin/gunicorn \
    --workers 4 \
    --bind unix:/run/gunicorn/monapp.sock \
    monapp.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

Le nombre de **workers** recommandé est `(2 × nombre de cœurs) + 1`.

## Sécurisation

- Utilisateur système dédié, non privilégié.
- Socket Unix plutôt que TCP exposé, avec permissions restreintes au groupe du serveur web.
- `--timeout` adapté pour éviter qu'une requête lente ne bloque un worker indéfiniment (protection basique contre certains DoS applicatifs).
- Ne jamais lancer en mode `--reload` (rechargement à chaud) en production — réservé au développement.
- Placer systématiquement un reverse proxy devant pour gérer TLS, les en-têtes de sécurité et le trafic statique.

## Logs & dépannage

- `journalctl -u gunicorn -f` pour les logs d'accès/erreurs si non redirigés ailleurs.
- `--access-logfile` et `--error-logfile` pour rediriger vers des fichiers dédiés si besoin.
- Erreur 502 côté Nginx = Gunicorn arrêté, socket mal référencé, ou worker crashé (timeout applicatif).
- `systemctl status gunicorn` pour voir le nombre de workers actifs et les éventuels redémarrages en boucle.

## Voir aussi

- [uwsgi](./060-uwsgi.md) — alternative concurrente à Gunicorn pour servir des applications WSGI Python
- [nginx](./049-nginx.md) — reverse proxy typique devant Gunicorn
