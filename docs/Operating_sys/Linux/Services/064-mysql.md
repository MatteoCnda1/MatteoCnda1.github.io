---
id: 064-mysql
title: MySQL — base de données relationnelle
sidebar_position: 64
tags: [linux, services, bases-de-donnees]
---

# MySQL

MySQL est un SGBD relationnel open source (racheté par Oracle), historiquement l'un des plus utilisés pour les applications web (stack LAMP). Le démon `mysqld` est géré par systemd sous le nom de service `mysql`. Cette fiche couvre l'angle service — pour la syntaxe SQL, voir les [cours SQL de ce site](../../../Databases/index.md). Sur la plupart des distributions récentes, `mysql` a été remplacé par le fork **MariaDB** (voir [065-mariadb.md](./065-mariadb.md)), qui garde la compatibilité protocolaire.

## Installation

```bash
sudo apt install mysql-server        # Debian/Ubuntu (ou mariadb-server selon la distro)
sudo dnf install mysql-server        # RHEL/Fedora

sudo systemctl enable --now mysql
sudo mysql_secure_installation       # assistant de durcissement post-install
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/mysql/mysql.conf.d/mysqld.cnf` | Configuration principale du démon |
| `/etc/mysql/my.cnf` | Point d'entrée, inclut les fichiers `.cnf` du dossier `conf.d/` |
| `/var/lib/mysql/` | Répertoire de données |

## Commandes utiles

```bash
systemctl status mysql
mysql -u root -p                     # console interactive
mysqladmin -u root -p status
mysqldump -u root -p dbname > backup.sql
mysqladmin -u root -p processlist
```

## Exemple de configuration

```ini
# mysqld.cnf
[mysqld]
bind-address = 127.0.0.1
max_connections = 150
```

## Sécurisation

- Exécuter systématiquement `mysql_secure_installation` après l'installation (retire les comptes anonymes, la base de test, restreint root à localhost).
- `bind-address = 127.0.0.1` sauf besoin réseau explicite, alors restreindre par pare-feu/`pg_hba`-équivalent (`GRANT ... TO 'user'@'ip'`).
- Comptes applicatifs dédiés avec privilèges minimaux (`GRANT SELECT, INSERT ON db.* TO ...`), jamais `root` en production.
- Activer le chiffrement des connexions (`require_secure_transport = ON`) si accès réseau.
- Sauvegardes régulières (`mysqldump` ou snapshots), testées en restauration.

## Logs & dépannage

```bash
journalctl -u mysql
tail -f /var/log/mysql/error.log
mysql -u root -p -e "SHOW PROCESSLIST;"
mysql -u root -p -e "SHOW VARIABLES LIKE 'max_connections';"
```

## Voir aussi

- [Cours SQL — Bases de données](../../../Databases/index.md)
- [MariaDB](./065-mariadb.md) — le fork communautaire, souvent le paquet réellement installé
