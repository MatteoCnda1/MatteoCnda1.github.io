---
id: 068-influxdb
title: InfluxDB — base de données orientée métriques
sidebar_position: 68
tags: [linux, services, bases-de-donnees]
---

# InfluxDB

InfluxDB est une base de données **time-series** (séries temporelles), optimisée pour l'ingestion à haut débit et l'interrogation de métriques horodatées (monitoring, IoT, capteurs). Souvent associée à Telegraf (collecte) et Grafana (visualisation) dans la stack **TICK**.

## Installation

```bash
curl -fsSL https://repos.influxdata.com/influxdata-archive_compat.key | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/influxdata.gpg
echo "deb https://repos.influxdata.com/debian stable main" | sudo tee /etc/apt/sources.list.d/influxdata.list
sudo apt update && sudo apt install influxdb2

sudo systemctl enable --now influxdb
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/influxdb/config.toml` | Configuration principale (réseau, stockage, rétention) |
| `/var/lib/influxdb/` | Répertoire de données |

## Commandes utiles

```bash
systemctl status influxdb
influx setup                        # configuration initiale (org, bucket, token)
influx bucket list
influx query 'from(bucket:"metrics") |> range(start:-1h)'   # requête Flux
influx backup /backup
```

## Exemple de configuration

```toml
# config.toml
http-bind-address = "127.0.0.1:8086"
```

## Sécurisation

- Restreindre `http-bind-address` à l'interface nécessaire ; exposer derrière un reverse proxy avec TLS pour l'accès distant.
- Utiliser des **tokens** à portée limitée (lecture seule pour Grafana, écriture seule pour Telegraf) plutôt qu'un token admin partout.
- Définir des politiques de **rétention** pour éviter la saturation disque par l'accumulation illimitée de métriques.
- Sauvegardes régulières (`influx backup`) avant toute migration de version majeure (le format interne change entre v1/v2/v3).

## Logs & dépannage

```bash
journalctl -u influxdb
influx ping                         # vérifier que l'API répond
```

## Voir aussi

- [Prometheus](./108-prometheus.md) — alternative time-series orientée pull/monitoring d'infrastructure
