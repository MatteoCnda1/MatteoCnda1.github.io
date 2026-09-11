---
id: 060-uwsgi
title: uWSGI — Serveur d'applications Python
sidebar_position: 60
tags: [linux, services, applicatif]
---

# uWSGI — Serveur d'applications Python

**uWSGI** est un serveur d'applications multi-protocole et multi-langage, le plus souvent utilisé côté Python via l'interface **WSGI** — un concurrent direct de [Gunicorn](./059-gunicorn.md), plus riche en fonctionnalités (multi-langage, protocole `uwsgi` natif optimisé, gestion avancée des workers) mais aussi plus complexe à configurer.

## Installation

```bash
pip install uwsgi
# ou, système Debian :
sudo apt install uwsgi uwsgi-plugin-python3
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/uwsgi/apps-available/monapp.ini` | Configuration de l'application (workers, socket, module WSGI) |
| `/etc/uwsgi/apps-enabled/` | Symlinks vers les configs actives (convention Debian, à la manière d'Apache/Nginx) |
| `/etc/systemd/system/uwsgi.service` | Unit systemd (si géré directement plutôt que via `uwsgi-emperor`) |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `uwsgi --ini monapp.ini` | Lancer manuellement avec une config donnée |
| `systemctl start/restart/status uwsgi` | Gestion du service |
| `uwsgi --check-config` | Vérifier une configuration |

## Exemple de configuration

`/etc/uwsgi/apps-available/monapp.ini` :

```ini
[uwsgi]
chdir = /opt/monapp
module = monapp.wsgi:application
home = /opt/monapp/venv
master = true
processes = 4
socket = /run/uwsgi/monapp.sock
chmod-socket = 660
vacuum = true
die-on-term = true
```

Le mode **Emperor** (`uwsgi --emperor /etc/uwsgi/apps-enabled`) permet de superviser automatiquement plusieurs applications (des "vassals") sans unit systemd dédiée à chacune.

## Sécurisation

- `chmod-socket = 660` + `chown-socket` pour restreindre l'accès au socket au seul serveur web.
- `die-on-term = true` pour un arrêt propre compatible avec systemd (sans process fantôme).
- Limiter `processes`/`threads` en cohérence avec la RAM disponible, comme pour Gunicorn.
- `uid`/`gid` dans la config pour lâcher les privilèges root après le bind, si le processus maître doit démarrer en root pour des ports privilégiés.
- Garder le paquet à jour : uWSGI a eu plusieurs CVE historiques dans son parsing de protocole.

## Logs & dépannage

- `journalctl -u uwsgi -f`, ou fichier de log dédié via `logto = /var/log/uwsgi/monapp.log`.
- `uwsgi --check-config` avant tout redémarrage en production.
- Erreur 502/504 côté proxy = socket introuvable/mal chmod, ou workers tous occupés (`processes` trop bas pour la charge).

## Voir aussi

- [Gunicorn](./059-gunicorn.md) — alternative plus simple pour servir du WSGI Python
- [nginx](./049-nginx.md) — reverse proxy typique, avec le module natif `uwsgi_pass` pour parler directement le protocole uWSGI
