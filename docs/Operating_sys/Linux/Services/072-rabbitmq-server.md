---
id: 072-rabbitmq-server
title: RabbitMQ — message broker
sidebar_position: 72
tags: [linux, services, data]
---

# RabbitMQ

RabbitMQ est un **message broker** implémentant principalement le protocole **AMQP** : il permet à des applications de s'échanger des messages de façon asynchrone et découplée (producteurs → exchanges → queues → consommateurs). Binaire/service : `rabbitmq-server`.

## Installation

```bash
sudo apt install rabbitmq-server     # Debian/Ubuntu
sudo dnf install rabbitmq-server     # RHEL/Fedora
sudo pacman -S rabbitmq              # Arch

sudo systemctl enable --now rabbitmq-server
sudo rabbitmq-plugins enable rabbitmq_management   # interface web d'admin (port 15672)
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/rabbitmq/rabbitmq.conf` | Configuration principale (nouveau format `sysctl`-like depuis 3.7) |
| `/etc/rabbitmq/enabled_plugins` | Liste des plugins activés |
| `/var/lib/rabbitmq/mnesia/` | Données persistantes (queues, exchanges, utilisateurs) |

## Commandes utiles

```bash
systemctl status rabbitmq-server
rabbitmqctl status
rabbitmqctl list_queues
rabbitmqctl list_users
rabbitmqctl add_user monuser monpass
rabbitmqctl set_permissions -p / monuser ".*" ".*" ".*"
rabbitmqctl delete_user guest        # à faire en prod (voir Sécurisation)
```

## Exemple de configuration

```conf
# /etc/rabbitmq/rabbitmq.conf
listeners.tcp.default = 5672
management.tcp.port = 15672
loopback_users = none
```

`loopback_users = none` autorise l'utilisateur par défaut à se connecter depuis n'importe où — à ne garder que temporairement, le temps de créer un utilisateur nominatif.

## Sécurisation

- **Supprimer le compte `guest`** (mot de passe par défaut public `guest`/`guest`, restreint au loopback par défaut mais à supprimer explicitement en prod).
- Créer des utilisateurs nominatifs avec des permissions **par vhost** minimales (`rabbitmqctl set_permissions`).
- Activer TLS pour les connexions AMQP (`listeners.ssl.default`) et pour l'interface de management.
- Restreindre l'accès réseau au port 5672 (AMQP) et 15672 (management) aux seuls clients/administrateurs légitimes.

## Logs & dépannage

```bash
journalctl -u rabbitmq-server -f
tail -f /var/log/rabbitmq/rabbit@$(hostname).log
rabbitmqctl node_health_check
rabbitmq-diagnostics status
```

## Voir aussi

- [Kafka](./073-kafka.md) — alternative orientée streaming/haut débit plutôt que messagerie AMQP classique.
