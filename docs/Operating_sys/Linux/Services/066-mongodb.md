---
id: 066-mongodb
title: MongoDB — base de données NoSQL orientée documents
sidebar_position: 66
tags: [linux, services, bases-de-donnees]
---

# MongoDB

MongoDB est un SGBD **NoSQL orienté documents** (stockage BSON/JSON), sans schéma rigide, conçu pour la scalabilité horizontale (sharding) et les charges applicatives modernes. Le démon `mongod` est géré par systemd.

## Installation

```bash
# Ajout du dépôt officiel MongoDB (le paquet n'est pas toujours dans les dépôts distro)
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server.gpg
echo "deb [signed-by=/usr/share/keyrings/mongodb-server.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org.list
sudo apt update && sudo apt install mongodb-org

sudo systemctl enable --now mongod
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/mongod.conf` | Configuration principale (réseau, stockage, sécurité) — format YAML |
| `/var/lib/mongodb/` | Répertoire de données |
| `/var/log/mongodb/mongod.log` | Fichier de log |

## Commandes utiles

```bash
systemctl status mongod
mongosh                              # console interactive (remplace l'ancien `mongo`)
mongodump --db=mydb --out=/backup
mongorestore /backup
```

## Exemple de configuration

```yaml
# mongod.conf
net:
  bindIp: 127.0.0.1
  port: 27017
security:
  authorization: enabled
```

## Sécurisation

- **`security.authorization: enabled`** — désactivé par défaut à l'install, ce qui laisse un accès libre à quiconque atteint le port 27017 : à activer systématiquement en production.
- `net.bindIp` restreint à `127.0.0.1` ou aux IP internes nécessaires — MongoDB exposé sans authentification sur Internet est une cause récurrente de fuites de données massives.
- Créer un utilisateur administrateur dès l'installation (`db.createUser(...)`) avant d'activer `authorization`.
- Chiffrement au repos (`security.enableEncryption`, édition Enterprise) ou chiffrement disque au niveau OS pour l'édition Community.
- TLS pour les connexions clients en environnement multi-hôtes.

## Logs & dépannage

```bash
journalctl -u mongod
tail -f /var/log/mongodb/mongod.log
mongosh --eval "db.serverStatus()"
```

## Voir aussi

- [Cours SQL — Bases de données](../../../Databases/index.md) — pour comparer avec le modèle relationnel
