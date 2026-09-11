---
id: 069-etcd
title: etcd — base clé-valeur distribuée
sidebar_position: 69
tags: [linux, services, bases-de-donnees]
---

# etcd

etcd est un magasin **clé-valeur distribué et fortement cohérent**, basé sur l'algorithme de consensus **Raft**. Il sert de source de vérité pour la configuration et l'état de systèmes distribués — c'est notamment le datastore central de **Kubernetes** (tous les objets du cluster y sont stockés).

## Installation

```bash
sudo apt install etcd-server        # Debian/Ubuntu (ou binaire officiel depuis github.com/etcd-io/etcd)

sudo systemctl enable --now etcd
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/default/etcd` ou `/etc/etcd/etcd.conf.yml` | Configuration (nom du nœud, endpoints, cluster) |
| `/var/lib/etcd/` | Répertoire de données (WAL + snapshots) |

## Commandes utiles

```bash
systemctl status etcd
etcdctl endpoint health              # vérifier la santé du membre
etcdctl member list                  # lister les membres du cluster
etcdctl put clé valeur
etcdctl get clé
etcdctl snapshot save backup.db      # sauvegarde
```

## Exemple de configuration

```yaml
# etcd.conf.yml
name: 'node1'
initial-cluster: 'node1=https://10.0.0.5:2380,node2=https://10.0.0.6:2380'
listen-client-urls: 'https://127.0.0.1:2379'
```

## Sécurisation

- Activer TLS pour le trafic client (`--cert-file`/`--key-file`) et peer (inter-nœuds) — etcd contient potentiellement des secrets applicatifs (cas Kubernetes : Secrets non chiffrés au repos par défaut).
- Activer le chiffrement au repos des Secrets si utilisé comme backend Kubernetes (`--encryption-provider-config` côté kube-apiserver).
- Restreindre l'accès réseau au port `2379` (client) et `2380` (peer) au strict nécessaire — un etcd exposé sans authentification donne un accès total à l'état du cluster.
- Sauvegardes régulières (`etcdctl snapshot save`) : la perte d'etcd dans un cluster Kubernetes est catastrophique (perte de tout l'état).

## Logs & dépannage

```bash
journalctl -u etcd
etcdctl endpoint status --write-out=table
etcdctl member list --write-out=table
```

## Voir aussi

- [Cassandra](./067-cassandra.md) — autre base distribuée, mais orientée volumétrie/disponibilité plutôt que cohérence forte
