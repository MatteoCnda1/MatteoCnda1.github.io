---
id: 123-restic
title: restic — sauvegardes chiffrées et dédupliquées
sidebar_position: 123
tags: [linux, services, sauvegarde]
---

# restic — sauvegardes chiffrées et dédupliquées

`restic` est un outil de sauvegarde moderne, écrit en Go, qui chiffre et déduplique les données et supporte de nombreux backends de stockage (local, SFTP, S3/MinIO, Backblaze B2, Azure...). Contrairement à Borg/borgmatic, il s'utilise généralement en une seule commande sans démon dédié, planifiée via cron ou un timer systemd.

## Installation

```bash
sudo apt install restic
# ou binaire statique depuis les releases GitHub

# Initialiser un dépôt (obligatoire avant la première sauvegarde)
restic -r /mnt/backup/restic-repo init
```

## Fichiers de configuration

| Fichier/Variable | Rôle |
|---|---|
| `RESTIC_REPOSITORY` | Variable d'environnement pointant vers le dépôt (local, `sftp:`, `s3:`...) |
| `RESTIC_PASSWORD` / `RESTIC_PASSWORD_FILE` | Passphrase de chiffrement du dépôt |
| `~/.config/restic/` | Emplacement conventionnel pour des scripts/fichiers d'environnement restic |
| Unit systemd + timer custom | restic n'a pas de fichier de conf central : la planification passe par un `.service`/`.timer` personnalisé appelant la commande |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `restic init` | Initialiser un nouveau dépôt |
| `restic backup /chemin` | Sauvegarder un répertoire |
| `restic snapshots` | Lister les snapshots existants |
| `restic restore <id> --target /chemin` | Restaurer un snapshot |
| `restic forget --keep-daily 7 --keep-weekly 4 --prune` | Appliquer une politique de rétention |
| `restic check` | Vérifier l'intégrité du dépôt |

## Exemple de configuration

```bash
# /etc/restic/env (source dans le service systemd)
export RESTIC_REPOSITORY="s3:https://minio.local:9000/backups"
export RESTIC_PASSWORD_FILE="/etc/restic/passphrase"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
```

```ini
# /etc/systemd/system/restic-backup.service
[Unit]
Description=Sauvegarde restic

[Service]
Type=oneshot
EnvironmentFile=/etc/restic/env
ExecStart=/usr/bin/restic backup /home /etc
ExecStartPost=/usr/bin/restic forget --keep-daily 7 --keep-weekly 4 --prune
```

## Sécurisation

- La **passphrase** protège l'intégralité du dépôt chiffré : la stocker dans un fichier à permissions `600` (`RESTIC_PASSWORD_FILE`), jamais en clair dans un script versionné.
- Restreindre les clés d'accès du backend (S3/MinIO) au strict nécessaire (write-only pour la sauvegarde, clé séparée pour la restauration).
- `restic check` régulièrement pour détecter une corruption avant qu'elle ne devienne critique.
- Répliquer le dépôt sur un second backend/site pour éviter un point de défaillance unique.

## Logs & dépannage

```bash
journalctl -u restic-backup.service   # si lancé via un unit systemd
restic snapshots                      # vérifier qu'un snapshot récent existe
restic check --read-data              # vérification approfondie (lit toutes les données)
```

## Voir aussi

- [borgmatic](./122-borgmatic.md) — alternative avec configuration YAML centralisée
- [minio](./126-minio.md) — backend S3 auto-hébergé utilisable comme dépôt restic
