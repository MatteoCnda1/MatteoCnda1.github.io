---
id: 075-elasticsearch
title: Elasticsearch — recherche / indexation
sidebar_position: 75
tags: [linux, services, data]
---

# Elasticsearch

Elasticsearch est un moteur de **recherche et d'indexation distribué**, basé sur Lucene, piloté via une API REST/JSON. Utilisé pour la recherche full-text, l'analyse de logs (souvent dans une stack ELK avec Logstash/Filebeat et Kibana), et l'analytics en quasi temps réel.

## Installation

```bash
# Dépôt officiel Elastic
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elastic.gpg
echo "deb [signed-by=/usr/share/keyrings/elastic.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt update && sudo apt install elasticsearch

sudo systemctl enable --now elasticsearch
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/elasticsearch/elasticsearch.yml` | Configuration principale (cluster, réseau, chemins de données) |
| `/etc/elasticsearch/jvm.options` | Réglages mémoire JVM (heap size) |
| `/var/lib/elasticsearch/` | Données indexées |

## Commandes utiles

```bash
systemctl status elasticsearch
curl -k -u elastic:$PASS https://localhost:9200          # santé du nœud
curl -k -u elastic:$PASS https://localhost:9200/_cluster/health?pretty
curl -k -u elastic:$PASS https://localhost:9200/_cat/indices?v
```

## Exemple de configuration

```yaml
# elasticsearch.yml
cluster.name: mon-cluster
node.name: node-1
network.host: 127.0.0.1
discovery.type: single-node        # pour un nœud unique (dev/petit prod)
xpack.security.enabled: true       # authentification/TLS, activé par défaut depuis la 8.x
```

## Sécurisation

- Ne **jamais** exposer directement le port 9200 sans authentification (`xpack.security.enabled: true`, activé par défaut depuis Elasticsearch 8) — largement scanné et compromis historiquement quand exposé nu.
- Dimensionner la heap JVM à environ **50 % de la RAM disponible**, sans dépasser ~32 Go (limite des pointeurs compressés).
- Restreindre `network.host` à l'interface nécessaire, filtrer l'accès au port 9200/9300 par pare-feu.
- Configurer des rôles/utilisateurs via l'API de sécurité plutôt qu'un accès superutilisateur partagé.

## Logs & dépannage

```bash
journalctl -u elasticsearch -f
tail -f /var/log/elasticsearch/mon-cluster.log
curl -k -u elastic:$PASS https://localhost:9200/_cluster/health?pretty   # statut green/yellow/red
```

## Voir aussi

- [OpenSearch](./076-opensearch.md) — fork communautaire né d'un changement de licence d'Elasticsearch, API largement compatible.
