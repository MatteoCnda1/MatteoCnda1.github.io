---
id: 058-node
title: Node.js — Service applicatif
sidebar_position: 58
tags: [linux, services, applicatif]
---

# Node.js — Service applicatif

**Node.js** n'a pas de paquet "service" packagé comme php-fpm ou tomcat : une application Node.js (`app.js`, serveur Express...) tourne comme un simple processus. Pour la gérer proprement en production (démarrage au boot, redémarrage automatique, logs centralisés), on l'encapsule dans une **unit systemd personnalisée**.

## Installation

```bash
# Debian/Ubuntu — via NodeSource pour une version récente
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash -
sudo apt install nodejs

node -v
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/systemd/system/monapp.service` | Unit systemd personnalisée définissant comment lancer l'application |
| `/opt/monapp/.env` | Variables d'environnement de l'application (souvent chargées via `EnvironmentFile=`) |
| `/opt/monapp/package.json` | Dépendances et point d'entrée de l'application |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl daemon-reload` | Recharger systemd après modification d'une unit |
| `systemctl start/enable/status monapp` | Gestion du service |
| `journalctl -u monapp -f` | Suivre les logs en direct (stdout/stderr de Node sont capturés par journald) |

## Exemple de configuration

Unit systemd typique (`/etc/systemd/system/monapp.service`) :

```ini
[Unit]
Description=Mon application Node.js
After=network.target

[Service]
Type=simple
User=nodeapp
WorkingDirectory=/opt/monapp
EnvironmentFile=/opt/monapp/.env
ExecStart=/usr/bin/node /opt/monapp/app.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now monapp
```

## Sécurisation

- Créer un **utilisateur système dédié** (`nodeapp`, sans shell de connexion) plutôt que de lancer l'app en `root`.
- Ajouter des directives de confinement systemd : `NoNewPrivileges=true`, `ProtectSystem=strict`, `ProtectHome=true`, `PrivateTmp=true`.
- Ne jamais exposer le port applicatif directement sur Internet : placer un reverse proxy ([nginx](./049-nginx.md)) devant, qui gère TLS et ne transmet qu'en interne.
- Garder Node.js et les dépendances npm à jour (`npm audit`) — la majorité des vulnérabilités viennent des dépendances tierces, pas du runtime lui-même.
- Limiter la mémoire/CPU via `MemoryMax=`/`CPUQuota=` dans l'unit pour éviter qu'un process qui fuit n'affecte le reste du système.

## Logs & dépannage

- Tous les `console.log`/`console.error` de l'application remontent dans journald via `StandardOutput=journal` : `journalctl -u monapp -f`.
- `systemctl status monapp` pour voir l'état et les derniers codes de sortie en cas de crash-loop.
- Un service qui boucle en `Restart=always` sans jamais se stabiliser indique typiquement une erreur au démarrage (dépendance manquante, port déjà utilisé) — voir les dernières lignes de `journalctl -u monapp`.

## Voir aussi

- [nginx](./049-nginx.md) — reverse proxy à placer devant une application Node.js
- [pm2](https://pm2.keymetrics.io/) — alternative populaire à systemd pour la gestion de process Node.js en production (non couverte ici, approche différente)
