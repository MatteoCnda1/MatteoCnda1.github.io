---
id: 063-postgresql
title: PostgreSQL — base de données relationnelle
sidebar_position: 63
tags: [linux, services, bases-de-donnees]
---

# PostgreSQL

PostgreSQL est un SGBD relationnel open source avancé (conformité SQL étendue, extensions comme PostGIS/pgvector, MVCC natif). Le service tourne via le démon `postgres` (paquet `postgresql`), géré par systemd. Cette fiche couvre l'angle service — pour la syntaxe SQL elle-même, voir les [cours SQL de ce site](../../../Databases/index.md).

## Installation

```bash
sudo apt install postgresql postgresql-contrib      # Debian/Ubuntu
sudo dnf install postgresql-server postgresql-contrib && sudo postgresql-setup --initdb   # RHEL/Fedora

sudo systemctl enable --now postgresql
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/postgresql/<version>/main/postgresql.conf` (Debian) ou `/var/lib/pgsql/data/postgresql.conf` (RHEL) | Configuration principale (mémoire, connexions, réseau) |
| `pg_hba.conf` (même dossier) | Règles d'authentification par hôte/utilisateur/base |
| `pg_ident.conf` | Correspondances d'identité pour l'authentification système |

## Commandes utiles

```bash
systemctl status postgresql
sudo -u postgres psql              # console interactive en tant que superuser
psql -h host -U user -d dbname     # connexion distante
sudo -u postgres createuser --interactive
sudo -u postgres createdb dbname
pg_ctl reload                      # recharger la config sans coupure de connexions
```

## Exemple de configuration

```conf
# postgresql.conf
listen_addresses = 'localhost'   # ou '10.0.0.5' pour une écoute réseau restreinte
max_connections = 100
shared_buffers = 256MB
```

```conf
# pg_hba.conf — exiger un mot de passe chiffré depuis le réseau local
host    all    all    10.0.0.0/24    scram-sha-256
```

## Sécurisation

- Ne jamais laisser `listen_addresses = '*'` sans restreindre `pg_hba.conf` en conséquence.
- Authentification `scram-sha-256` (pas `md5`, obsolète) dans `pg_hba.conf`.
- Créer des rôles applicatifs avec des privilèges minimaux (`GRANT` ciblé) plutôt que d'utiliser `postgres` en production.
- Chiffrer les connexions distantes (`ssl = on` + certificats).
- Sauvegardes régulières via `pg_dump`/`pg_basebackup`, testées.

## Logs & dépannage

```bash
journalctl -u postgresql
tail -f /var/log/postgresql/postgresql-*.log
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"   # connexions actives
```

## Voir aussi

- [Cours SQL — Bases de données](../../../Databases/index.md) — syntaxe SQL, jointures, sécurité applicative
- [MariaDB](./065-mariadb.md) — l'alternative MySQL-compatible
