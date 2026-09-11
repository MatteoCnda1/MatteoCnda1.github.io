---
id: 112-zabbix-server
title: zabbix-server — serveur Zabbix
sidebar_position: 112
tags: [linux, services, monitoring]
---

# Zabbix Server

Serveur central de la plateforme de supervision **Zabbix** : reçoit les métriques des `zabbix-agent` déployés sur le parc, les stocke en base (MySQL/PostgreSQL), évalue les déclencheurs (*triggers*) et génère les alertes. S'accompagne généralement d'un frontend web (`zabbix-frontend-php`) pour la configuration et les dashboards.

## Installation

```bash
sudo apt install zabbix-server-mysql zabbix-frontend-php zabbix-sql-scripts

# Importer le schéma initial dans la base
zcat /usr/share/zabbix-sql-scripts/mysql/server.sql.gz | mysql -u zabbix -p zabbix

sudo systemctl enable --now zabbix-server
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/zabbix/zabbix_server.conf` | Configuration principale : accès base de données, pollers, cache |
| `/etc/zabbix/web/zabbix.conf.php` | Configuration du frontend web |

## Commandes utiles

```bash
systemctl status|restart zabbix-server
zabbix_server -R config_cache_reload   # forcer le rechargement du cache de config
```

## Exemple de configuration

```ini
# /etc/zabbix/zabbix_server.conf
DBHost=localhost
DBName=zabbix
DBUser=zabbix
DBPassword=motdepasse
StartPollers=10
```

`StartPollers` définit le nombre de processus dédiés au sondage passif des agents — à ajuster selon la taille du parc surveillé.

## Sécurisation

- Restreindre l'accès à la base de données Zabbix (identifiants dédiés, pas de compte root).
- Protéger le frontend web (HTTPS, authentification forte, restriction d'IP pour l'admin).
- Chiffrer les communications avec les agents (PSK/certificats) sur un réseau non fiable.

## Logs & dépannage

```bash
journalctl -u zabbix-server -f
tail -f /var/log/zabbix/zabbix_server.log
```

## Voir aussi

- [Zabbix Agent](./111-zabbix-agent.md) — l'agent déployé sur chaque hôte surveillé
