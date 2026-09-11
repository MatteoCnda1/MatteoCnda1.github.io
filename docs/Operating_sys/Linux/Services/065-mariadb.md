---
id: 065-mariadb
title: MariaDB — base de données relationnelle
sidebar_position: 65
tags: [linux, services, bases-de-donnees]
---

# MariaDB

MariaDB est le fork communautaire de MySQL (créé après le rachat de MySQL par Oracle), compatible protocole et largement adopté par défaut sur Debian/RHEL. Un cours dédié existe déjà sur ce site pour l'usage SQL/administration approfondie : **[MariaDB — cours complet](../../../Databases/MariaDB_cours.mdx)**. Cette fiche reste volontairement courte et couvre uniquement l'angle service/démon.

## Installation

```bash
sudo apt install mariadb-server       # Debian/Ubuntu
sudo dnf install mariadb-server       # RHEL/Fedora

sudo systemctl enable --now mariadb
sudo mysql_secure_installation
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/mysql/mariadb.conf.d/50-server.cnf` | Configuration principale du démon |
| `/etc/mysql/my.cnf` | Point d'entrée |
| `/var/lib/mysql/` | Répertoire de données |

## Commandes utiles

```bash
systemctl status mariadb
mariadb -u root -p                    # console interactive (alias mysql toujours fonctionnel)
mariadb-admin -u root -p status
mariadb-dump -u root -p dbname > backup.sql
```

## Logs & dépannage

```bash
journalctl -u mariadb
tail -f /var/log/mysql/error.log
```

## Voir aussi

- **[MariaDB — cours complet](../../../Databases/MariaDB_cours.mdx)** — usage SQL, administration, réplication
- [MySQL](./064-mysql.md) — le projet dont MariaDB est issu, compatibilité protocolaire
