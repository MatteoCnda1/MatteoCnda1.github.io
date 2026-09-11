---
id: 111-zabbix-agent
title: zabbix-agent — agent Zabbix
sidebar_position: 111
tags: [linux, services, monitoring]
---

# Zabbix Agent

Agent installé sur chaque machine surveillée par une plateforme **Zabbix** : il collecte des métriques locales (CPU, mémoire, disque, process, logs) et les transmet au `zabbix-server`, soit en **passif** (le serveur interroge l'agent), soit en **actif** (l'agent envoie lui-même ses données, plus adapté aux gros parcs). Paquet `zabbix-agent` (ou `zabbix-agent2`, version moderne réécrite en Go avec support de plugins).

## Installation

```bash
sudo apt install zabbix-agent2   # ou zabbix-agent (version legacy en C)

sudo systemctl enable --now zabbix-agent2
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/zabbix/zabbix_agent2.conf` | Configuration principale : serveur cible, hostname, mode actif/passif |
| `/etc/zabbix/zabbix_agent2.d/` | Fichiers de config additionnels/plugins |

## Commandes utiles

```bash
systemctl status|restart zabbix-agent2
zabbix_agent2 -t agent.ping          # tester un item localement
zabbix_get -s <ip_agent> -k agent.ping  # depuis le serveur, interroger l'agent en mode passif
```

## Exemple de configuration

```ini
# /etc/zabbix/zabbix_agent2.conf
Server=10.0.0.5
ServerActive=10.0.0.5
Hostname=web01
```

`Server` autorise les requêtes passives depuis cette IP ; `ServerActive` définit où l'agent envoie ses données en mode actif.

## Sécurisation

- Restreindre `Server=` à l'IP exacte du serveur Zabbix (sinon n'importe qui peut interroger l'agent).
- Activer le chiffrement PSK ou certificat (`TLSConnect`/`TLSAccept`) pour les échanges agent↔serveur.
- Désactiver `EnableRemoteCommands` sauf besoin explicite (exécution de commandes à distance).

## Logs & dépannage

```bash
journalctl -u zabbix-agent2 -f
tail -f /var/log/zabbix/zabbix_agent2.log
```

## Voir aussi

- [Zabbix Server](./112-zabbix-server.md) — le serveur central qui collecte les données de cet agent
