---
id: 042-docker
title: docker / dockerd — Conteneurs Docker
sidebar_position: 42
tags: [linux, services, conteneurs]
---

# docker / dockerd — Conteneurs Docker

`dockerd` est le démon (daemon) qui gère les conteneurs, images, réseaux et volumes Docker. Le client `docker` (CLI) communique avec lui via un socket Unix. Cette fiche couvre uniquement l'angle **service systemd** ; pour l'usage de Docker au quotidien (images, Dockerfile, Compose), voir les liens en fin de page.

## Installation

```bash
# Debian/Ubuntu (dépôt officiel Docker)
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | tee /etc/apt/sources.list.d/docker.list
apt update && apt install docker-ce docker-ce-cli containerd.io

systemctl enable --now docker
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/docker/daemon.json` | Configuration du démon (driver de stockage, logging, réseau, registries) |
| `/etc/docker/key.json` | Identité du démon |
| `/lib/systemd/system/docker.service` | Unit systemd (socket, options de lancement) |
| `/var/lib/docker/` | Données (images, conteneurs, volumes) |

## Commandes utiles

```bash
systemctl status docker
systemctl restart docker
docker info                # état du démon (driver, ressources)
docker ps -a                # conteneurs
docker system df            # usage disque
docker system prune -a      # nettoyage
```

## Exemple de configuration

```json
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "default-address-pools": [{ "base": "172.20.0.0/16", "size": 24 }]
}
```

Limite la taille des logs par conteneur (évite de saturer le disque) et fixe un pool d'adresses pour les réseaux Docker créés.

## Sécurisation

- Le socket Docker (`/var/run/docker.sock`) donne un accès **root-équivalent** à quiconque peut y écrire (le groupe `docker` équivaut à `root`) — ne jamais l'exposer sur le réseau sans TLS, ni ajouter un utilisateur non fiable au groupe `docker`.
- Activer le mode **rootless** (`dockerd-rootless-setuptool.sh install`) quand c'est possible, pour limiter l'impact d'une évasion de conteneur.
- Restreindre les capacités des conteneurs (`--cap-drop=ALL`, `--security-opt=no-new-privileges`).
- Ne jamais lancer un conteneur avec `--privileged` sans raison impérative.

## Logs & dépannage

```bash
journalctl -u docker -f
docker logs <conteneur>
docker events                # flux d'événements en temps réel
```

## Voir aussi

- [Installation Linux](../../../Containers/Docker/01-installation-linux.md), [Introduction & architecture](../../../Containers/Docker/00-introduction-architecture.md) et [Cycle de vie image/conteneur](../../../Containers/Docker/02-cycle-de-vie-image-conteneur.md) — l'usage complet de Docker
- [containerd](./043-containerd.md) — le runtime que dockerd pilote en interne depuis Docker Engine 18.09+
