---
id: 073-kafka
title: Kafka — streaming / messaging
sidebar_position: 73
tags: [linux, services, data]
---

# Apache Kafka

Kafka est une plateforme de **streaming distribué** : les producteurs publient des messages dans des **topics** partitionnés, les consommateurs les lisent (à leur rythme, avec relecture possible), le tout avec une forte capacité de débit et de rétention. Utilisé pour l'ingestion de logs, les pipelines d'événements, l'intégration de systèmes découplés.

## Installation

```bash
# Généralement distribué en archive (pas de paquet natif partout) ou via un dépôt tiers (Confluent)
wget https://downloads.apache.org/kafka/<version>/kafka_2.13-<version>.tgz
tar -xzf kafka_2.13-<version>.tgz -C /opt/
```

Nécessite un unit file systemd personnalisé (pas de paquet standard sur la plupart des distributions) :

```ini
# /etc/systemd/system/kafka.service
[Unit]
Description=Apache Kafka
After=network.target

[Service]
Type=simple
User=kafka
ExecStart=/opt/kafka/bin/kafka-server-start.sh /opt/kafka/config/server.properties
ExecStop=/opt/kafka/bin/kafka-server-stop.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `config/server.properties` | Configuration du broker (id, listeners, rétention, répertoire de logs) |
| `config/kraft/server.properties` | Configuration en mode **KRaft** (sans Zookeeper, depuis Kafka 3.x+) |

## Commandes utiles

```bash
systemctl status kafka
bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic events --partitions 3 --replication-factor 1
bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic events
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic events --from-beginning
```

## Exemple de configuration

```properties
# server.properties
broker.id=0
listeners=PLAINTEXT://:9092
log.dirs=/var/lib/kafka/data
log.retention.hours=168
zookeeper.connect=localhost:2181    # absent en mode KRaft
```

## Sécurisation

- Activer **SASL/TLS** sur les listeners en production (par défaut, PLAINTEXT n'a ni chiffrement ni authentification).
- Configurer des **ACL** par topic (`kafka-acls.sh`) pour restreindre qui peut produire/consommer.
- Isoler le port 9092 (et 2181 pour Zookeeper) derrière un pare-feu — jamais exposés directement à Internet.
- Prévoir une rétention (`log.retention.*`) cohérente avec l'espace disque disponible.

## Logs & dépannage

```bash
journalctl -u kafka -f
tail -f /opt/kafka/logs/server.log
bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic events
```

## Voir aussi

- [Zookeeper](./074-zookeeper.md) — historiquement requis pour la coordination du cluster Kafka ; les versions récentes migrent vers le mode **KRaft** qui supprime cette dépendance.
- [RabbitMQ](./072-rabbitmq-server.md) — alternative orientée messagerie classique plutôt que streaming haut débit.
