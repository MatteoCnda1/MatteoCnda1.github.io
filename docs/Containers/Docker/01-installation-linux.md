---
id: 01-installation-linux
title: Installation de Docker sur Linux
sidebar_position: 2
tags: [conteneurs, linux, outil]
---

# Installation de Docker sur Linux

> Deux approches existent : le paquet **`docker.io`** fourni par la distribution (souvent en retard sur la dernière version) ou le **dépôt officiel Docker**, recommandé pour avoir des versions à jour et cohérentes. Ce cours couvre l'installation via le dépôt officiel sur une distribution basée Debian/Ubuntu.

## Installation via le dépôt officiel (Debian/Ubuntu)

### 1. Désinstaller d'anciennes versions

```bash
sudo apt remove docker docker-engine docker.io containerd runc
```

### 2. Installer les prérequis et la clé GPG du dépôt

Depuis Debian 12/Ubuntu 22.04+, `apt-key` est déprécié : la clé GPG se dépose directement dans `/etc/apt/keyrings/` et se référence via `signed-by`.

```bash
sudo apt update
sudo apt install ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

*(Remplacer `debian` par `ubuntu` dans l'URL si besoin.)*

### 3. Ajouter le dépôt

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
```

### 4. Installer Docker Engine

```bash
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

- `docker-ce` : le daemon (`dockerd`).
- `docker-ce-cli` : le client en ligne de commande.
- `containerd.io` : le runtime de haut niveau.
- `docker-buildx-plugin` : le moteur de build moderne (multi-plateforme, cache avancé).
- `docker-compose-plugin` : la commande `docker compose` (v2, sans tiret — voir [Docker Compose](../Docker_Compose/index.md)).

## Vérifier l'installation

```bash
sudo systemctl status docker      # le daemon doit être "active (running)"
sudo docker run hello-world       # télécharge et lance une image de test
docker version                    # version du client ET du serveur
docker info                       # informations détaillées sur l'installation
```

## Étapes post-installation indispensables

### Utiliser Docker sans `sudo`

Par défaut, seul `root` (et les membres du groupe `docker`) peut parler au socket du daemon.

```bash
sudo usermod -aG docker $USER
# Se déconnecter/reconnecter (ou : newgrp docker) pour appliquer le changement
docker run hello-world            # doit fonctionner sans sudo
```

> ⚠️ Comme vu dans le cours [Introduction & architecture](./00-introduction-architecture.md), appartenir au groupe `docker` équivaut à des droits root sur la machine — à réserver aux comptes de confiance.

### Démarrage automatique au boot

```bash
sudo systemctl enable docker
sudo systemctl enable containerd
```

### Configurer les limites de logs (recommandé en production)

Par défaut, les logs d'un conteneur (`docker logs`) peuvent grossir indéfiniment et remplir le disque. À configurer dans `/etc/docker/daemon.json` :

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
sudo systemctl restart docker     # appliquer la nouvelle configuration
```

## Désinstaller Docker

```bash
sudo apt purge docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo rm -rf /var/lib/docker /var/lib/containerd   # supprime aussi images/conteneurs/volumes !
```

## Ce qu'il faut retenir

- Préférer le **dépôt officiel Docker** au paquet de distribution pour des versions à jour.
- Après installation : `docker run hello-world` pour valider, `usermod -aG docker $USER` pour éviter `sudo` à chaque commande.
- Le groupe `docker` équivaut à root — ce n'est pas une astuce de confort anodine côté sécurité.
- Penser à limiter la taille des logs (`daemon.json`) avant de mettre en production.
