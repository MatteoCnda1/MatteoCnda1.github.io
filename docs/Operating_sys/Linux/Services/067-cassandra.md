---
id: 067-cassandra
title: Cassandra — base NoSQL distribuée
sidebar_position: 67
tags: [linux, services, bases-de-donnees]
---

# Apache Cassandra

Cassandra est un SGBD **NoSQL distribué en pair-à-pair** (pas de nœud maître), conçu pour la haute disponibilité et la scalabilité horizontale massive, avec un modèle de cohérence ajustable (tunable consistency). Utilisé pour des volumes très importants nécessitant une tolérance aux pannes multi-datacenter.

## Installation

```bash
# Dépôt officiel Apache Cassandra
echo "deb https://debian.cassandra.apache.org 41x main" | sudo tee /etc/apt/sources.list.d/cassandra.list
curl https://downloads.apache.org/cassandra/KEYS | sudo apt-key add -
sudo apt update && sudo apt install cassandra

sudo systemctl enable --now cassandra
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/cassandra/cassandra.yaml` | Configuration principale (cluster, réseau, stockage) |
| `/etc/cassandra/cassandra-env.sh` | Paramètres JVM |
| `/var/lib/cassandra/` | Répertoire de données |

## Commandes utiles

```bash
systemctl status cassandra
nodetool status                     # état du cluster/anneau
nodetool ring                       # répartition des tokens
cqlsh                               # console interactive (CQL, proche du SQL)
nodetool repair                     # réparation de cohérence entre réplicas
```

## Exemple de configuration

```yaml
# cassandra.yaml
cluster_name: 'MonCluster'
listen_address: 10.0.0.5
seed_provider:
  - parameters:
      - seeds: "10.0.0.5,10.0.0.6"
```

## Sécurisation

- Activer l'authentification (`authenticator: PasswordAuthenticator`, désactivée par défaut).
- Activer l'autorisation (`authorizer: CassandraAuthorizer`) pour un contrôle d'accès par rôle.
- Chiffrer le trafic inter-nœuds (`server_encryption_options`) et client (`client_encryption_options`).
- Ne jamais exposer le port `9042` (CQL) ou `7000` (inter-nœud) sur Internet — cluster à isoler dans un réseau privé/VPC.

## Logs & dépannage

```bash
journalctl -u cassandra
tail -f /var/log/cassandra/system.log
nodetool status                     # nœuds UP/DOWN, charge par nœud
nodetool tpstats                    # threads pools, détecte la saturation
```

## Voir aussi

- [etcd](./069-etcd.md) — autre base distribuée, mais orientée coordination/consensus fort plutôt que volumétrie
