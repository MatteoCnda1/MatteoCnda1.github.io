---
id: 126-minio
title: MinIO — stockage objet compatible S3
sidebar_position: 126
tags: [linux, services, sauvegarde]
---

# MinIO — stockage objet compatible S3

**MinIO** est un serveur de stockage objet auto-hébergé, compatible avec l'API **S3** d'Amazon. Il permet d'exposer un backend S3 sur sa propre infrastructure — utile comme cible de sauvegarde (restic, borgmatic...), stockage d'artefacts CI/CD, ou backend objet pour des applications qui parlent S3 nativement.

## Installation

```bash
# Binaire officiel
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

sudo systemctl enable --now minio
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/default/minio` | Variables d'environnement du service (chemin de données, identifiants, port) |
| `/etc/systemd/system/minio.service` | Unit systemd (fourni par le paquet ou à créer manuellement) |
| Répertoire de données (ex: `/data`) | Stockage effectif des objets |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl start/stop/enable/status minio` | Gérer le service |
| `mc alias set local http://localhost:9000 ACCESS_KEY SECRET_KEY` | Configurer le client `mc` |
| `mc mb local/mon-bucket` | Créer un bucket |
| `mc cp fichier local/mon-bucket/` | Envoyer un fichier |
| `mc admin info local` | Informations sur le cluster MinIO |

## Exemple de configuration

```bash
# /etc/default/minio
MINIO_VOLUMES="/data"
MINIO_OPTS="--console-address :9001"
MINIO_ROOT_USER="admin"
MINIO_ROOT_PASSWORD="changez-moi-mot-de-passe-fort"
```

## Sécurisation

- Changer impérativement `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD` par défaut avant toute exposition réseau.
- Activer **TLS** (certificats dans `~/.minio/certs/`) : l'API S3 transporte potentiellement des données sensibles en clair sinon.
- Créer des **politiques d'accès (IAM MinIO)** par application plutôt que de tout faire avec le compte root — clés à portée limitée par bucket/action.
- Isoler le port console d'administration (9001) du réseau public, distinct du port API (9000).
- Activer le versioning et/ou la réplication pour se protéger d'une suppression accidentelle.

## Logs & dépannage

```bash
journalctl -u minio
mc admin info local          # état du serveur
mc admin trace local         # tracer les requêtes en temps réel pour diagnostic
```

## Voir aussi

- [restic](./123-restic.md) — peut utiliser MinIO comme backend de sauvegarde S3
- [nextcloud](./127-nextcloud.md) — peut aussi utiliser MinIO comme stockage objet primaire
