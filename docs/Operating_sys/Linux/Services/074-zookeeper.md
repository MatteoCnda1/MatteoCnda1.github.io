---
id: 074-zookeeper
title: ZooKeeper — coordination distribuée
sidebar_position: 74
tags: [linux, services, data]
---

# Apache ZooKeeper

ZooKeeper est un service de **coordination distribuée** : configuration partagée, élection de leader, verrous distribués, découverte de service. Longtemps utilisé comme dépendance obligatoire de Kafka (avant le mode KRaft) et d'autres systèmes distribués (HBase, Solr).

## Installation

```bash
# Souvent distribué en archive, ou embarqué avec Kafka (bin/zookeeper-server-start.sh)
wget https://downloads.apache.org/zookeeper/<version>/apache-zookeeper-<version>-bin.tar.gz
tar -xzf apache-zookeeper-*-bin.tar.gz -C /opt/
cp /opt/zookeeper/conf/zoo_sample.cfg /opt/zookeeper/conf/zoo.cfg
```

Unit file systemd personnalisé nécessaire (comme pour Kafka) :

```ini
[Unit]
Description=Apache ZooKeeper
After=network.target

[Service]
Type=simple
User=zookeeper
ExecStart=/opt/zookeeper/bin/zkServer.sh start-foreground
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `conf/zoo.cfg` | Configuration principale (port client, répertoire de données, membres du cluster) |
| `data/myid` | Identifiant unique du nœud dans un cluster (ensemble) ZooKeeper |

## Commandes utiles

```bash
systemctl status zookeeper
bin/zkServer.sh status
bin/zkCli.sh -server localhost:2181       # client interactif
echo ruok | nc localhost 2181             # "are you ok" — répond "imok" si sain
```

## Exemple de configuration

```properties
# zoo.cfg
tickTime=2000
dataDir=/var/lib/zookeeper
clientPort=2181
# Membres du cluster (mode ensemble, 3 nœuds minimum recommandé pour la tolérance de panne)
server.1=zk1.local:2888:3888
server.2=zk2.local:2888:3888
server.3=zk3.local:2888:3888
```

## Sécurisation

- Activer l'authentification **SASL** (Kerberos ou digest) — ZooKeeper n'authentifie rien par défaut.
- Restreindre l'accès réseau au port 2181 (client) et 2888/3888 (communication inter-nœuds) aux seuls services légitimes.
- Utiliser des **ACL de znode** (`setAcl`) pour restreindre qui peut lire/écrire quels chemins.
- Un cluster ZooKeeper nécessite un nombre **impair** de nœuds (quorum majoritaire) — dimensionner en conséquence pour la tolérance de panne.

## Logs & dépannage

```bash
journalctl -u zookeeper -f
tail -f /opt/zookeeper/logs/zookeeper.out
bin/zkServer.sh status        # rôle du nœud : leader/follower/standalone
```

## Voir aussi

- [Kafka](./073-kafka.md) — principal consommateur historique de ZooKeeper, aujourd'hui progressivement remplacé par le mode KRaft interne.
- [etcd](./069-etcd.md) — alternative moderne pour la coordination distribuée, plus simple à opérer.
