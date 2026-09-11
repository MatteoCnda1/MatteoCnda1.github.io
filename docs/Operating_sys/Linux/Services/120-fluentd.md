---
id: 120-fluentd
title: Fluentd — collecte de logs
sidebar_position: 120
tags: [linux, services, logs]
---

# Fluentd — collecte de logs

**Fluentd** est un collecteur/routeur de logs unifié, alternative à la stack Filebeat/Logstash : il agrège des logs depuis de multiples sources, les structure en JSON, et les route vers une ou plusieurs destinations (Elasticsearch, S3, Kafka...). Très utilisé dans l'écosystème Kubernetes (projet CNCF) comme agent de collecte par nœud.

## Installation

```bash
# td-agent = distribution stable de Fluentd
curl -fsSL https://toolbelt.treasuredata.com/sh/install-ubuntu-jammy-td-agent4.sh | sh
sudo systemctl enable --now td-agent
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/td-agent/td-agent.conf` | Configuration principale (source, filter, match) |
| `/etc/td-agent/plugin/` | Plugins additionnels (sorties, parseurs) |
| `/var/log/td-agent/` | Logs internes de Fluentd lui-même |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `fluentd --dry-run -c td-agent.conf` | Valider une configuration sans démarrer |
| `td-agent-gem install <plugin>` | Installer un plugin (sortie, parseur...) |
| `systemctl status td-agent` | État du service |

## Exemple de configuration

```
<source>
  @type tail
  path /var/log/nginx/access.log
  pos_file /var/log/td-agent/nginx.pos
  tag nginx.access
  <parse>
    @type nginx
  </parse>
</source>

<match nginx.access>
  @type elasticsearch
  host localhost
  port 9200
  index_name nginx-logs
</match>
```

## Sécurisation

- Activer TLS sur les sorties réseau (`<match>` vers Elasticsearch/Kafka distants).
- Limiter les permissions du fichier `pos_file` et des logs sources (utilisateur dédié `td-agent`, pas root).
- Configurer un buffer avec limite de taille (`<buffer>` avec `total_limit_size`) pour éviter qu'une destination indisponible ne sature le disque local.

## Logs & dépannage

- `journalctl -u td-agent -f` (ou `/var/log/td-agent/td-agent.log`) — erreurs de parsing, échecs d'envoi.
- `fluentd --dry-run` — premier réflexe après modification de config.
- Vérifier l'état du buffer (`/var/log/td-agent/buffer/`) en cas de destination indisponible — les événements s'y accumulent en attendant.

## Voir aussi

- [filebeat](./118-filebeat.md) et [logstash](./119-logstash.md) — l'équivalent fonctionnel côté stack Elastic.
