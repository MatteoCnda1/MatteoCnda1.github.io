---
id: 114-telegraf
title: Telegraf — collecte de métriques
sidebar_position: 114
tags: [linux, services, monitoring]
---

# Telegraf

Agent de collecte de métriques de l'écosystème InfluxDB (le "T" de la stack **TICK**), à l'architecture pilotée par plugins : plugins d'**input** (système, Docker, MySQL, MQTT...), de **processing**, et d'**output** (InfluxDB, Prometheus, Kafka...). Contrairement à node_exporter (passif, attend le scrape), Telegraf **pousse** activement les métriques vers ses destinations.

## Installation

```bash
sudo apt install telegraf

sudo systemctl enable --now telegraf
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/telegraf/telegraf.conf` | Configuration principale (agent, outputs globaux) |
| `/etc/telegraf/telegraf.d/*.conf` | Fichiers de plugins additionnels |

## Commandes utiles

```bash
systemctl status|restart telegraf
telegraf --config /etc/telegraf/telegraf.conf --test   # exécuter une collecte et afficher le résultat sans envoyer
telegraf --config-directory /etc/telegraf/telegraf.d    # tester avec les plugins additionnels
```

## Exemple de configuration

```toml
[[inputs.cpu]]
  percpu = true

[[outputs.influxdb_v2]]
  urls = ["http://localhost:8086"]
  token = "$INFLUX_TOKEN"
  organization = "org"
  bucket = "metrics"
```

Collecte les métriques CPU par cœur et les pousse vers un bucket InfluxDB v2.

## Sécurisation

- Stocker les tokens/identifiants d'output dans des variables d'environnement (`$INFLUX_TOKEN`), pas en clair dans le fichier de config.
- Restreindre les permissions du fichier de config (`chmod 640`, propriétaire `telegraf`) puisqu'il peut contenir des secrets.
- N'activer que les plugins d'input réellement nécessaires (surface de collecte = surface d'information exposée).

## Logs & dépannage

```bash
journalctl -u telegraf -f
telegraf --test --config /etc/telegraf/telegraf.conf   # voir précisément ce qui serait collecté
```

## Voir aussi

- [InfluxDB](./068-influxdb.md) — destination la plus courante de Telegraf
- [Prometheus](./108-prometheus.md) — Telegraf peut aussi exposer un endpoint `/metrics` en mode pull
