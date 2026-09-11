---
id: 076-opensearch
title: OpenSearch — recherche / analyse
sidebar_position: 76
tags: [linux, services, data]
---

# OpenSearch

OpenSearch est un **fork open source d'Elasticsearch**, créé par AWS en 2021 après le passage d'Elasticsearch à une licence non-OSI (SSPL/Elastic License). API et fonctionnement très proches d'Elasticsearch (compatibilité largement conservée sur les versions initiales), sous licence Apache 2.0.

## Installation

```bash
# Dépôt officiel OpenSearch
curl -o- https://artifacts.opensearch.org/publickeys/opensearch.pgp | sudo gpg --dearmor -o /usr/share/keyrings/opensearch.gpg
echo "deb [signed-by=/usr/share/keyrings/opensearch.gpg] https://artifacts.opensearch.org/releases/bundle/opensearch/2.x/apt stable main" | sudo tee /etc/apt/sources.list.d/opensearch.list
sudo apt update && sudo apt install opensearch

sudo systemctl enable --now opensearch
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/opensearch/opensearch.yml` | Configuration principale (cluster, réseau, chemins de données) |
| `/etc/opensearch/jvm.options` | Réglages mémoire JVM |
| `/etc/opensearch/opensearch-security/` | Configuration du plugin de sécurité (rôles, utilisateurs, TLS) |

## Commandes utiles

```bash
systemctl status opensearch
curl -k -u admin:$PASS https://localhost:9200
curl -k -u admin:$PASS https://localhost:9200/_cluster/health?pretty
curl -k -u admin:$PASS https://localhost:9200/_cat/indices?v
```

## Exemple de configuration

```yaml
# opensearch.yml
cluster.name: mon-cluster
node.name: node-1
network.host: 127.0.0.1
discovery.type: single-node
plugins.security.disabled: false     # le plugin de sécurité est actif par défaut
```

## Sécurisation

- Changer le mot de passe **admin par défaut** dès l'installation (le plugin `opensearch-security` embarque des identifiants de démo à ne jamais garder en prod).
- Ne pas exposer le port 9200 sans TLS/authentification.
- Dimensionner la heap JVM à ~50 % de la RAM (mêmes contraintes que Elasticsearch).
- Utiliser les rôles du plugin de sécurité pour un accès en moindre privilège plutôt que le compte admin partagé.

## Logs & dépannage

```bash
journalctl -u opensearch -f
tail -f /var/log/opensearch/mon-cluster.log
curl -k -u admin:$PASS https://localhost:9200/_cluster/health?pretty
```

## Voir aussi

- [Elasticsearch](./075-elasticsearch.md) — le projet dont OpenSearch est issu ; vérifier la compatibilité API avant toute migration entre les deux, les implémentations divergent progressivement au fil des versions.
