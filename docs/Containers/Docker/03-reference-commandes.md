---
id: 03-reference-commandes
title: Référence complète des commandes Docker
sidebar_position: 4
tags: [conteneurs, linux, outil, cheatsheet]
---

# Référence complète des commandes Docker

> Aide-mémoire exhaustif des commandes `docker` sur Linux, organisé par thème. Pour les concepts derrière chaque commande, voir les cours dédiés ([Images](../Images/index.md), [Volumes](../Volumes/index.md), [Networks](../Networks/index.md)...).

## Conteneurs — cycle de vie

```bash
# Créer et démarrer un conteneur (le plus utilisé)
docker run <image>
docker run -d <image>                    # -d : détaché (arrière-plan)
docker run -it <image> bash              # -it : interactif + pseudo-TTY (shell)
docker run --rm <image>                  # supprime le conteneur automatiquement à l'arrêt
docker run --name mon-conteneur <image>  # nommer le conteneur (sinon nom aléatoire)
docker run -p 8080:80 <image>            # publier le port 80 du conteneur sur 8080 de l'hôte
docker run -e VAR=valeur <image>         # définir une variable d'environnement
docker run -v /hote:/conteneur <image>   # bind mount (voir cours Volumes)
docker run --network mon-reseau <image>  # rattacher à un réseau (voir cours Networks)
docker run --memory=512m --cpus=1 <image> # limiter les ressources (voir cours cgroups)
docker run --restart=unless-stopped <image> # politique de redémarrage automatique

# Créer sans démarrer / démarrer un conteneur existant
docker create <image>
docker start <conteneur>
docker start -a <conteneur>              # -a : attache les flux stdout/stderr

# Arrêter / tuer
docker stop <conteneur>                  # SIGTERM, puis SIGKILL après 10s
docker stop -t 30 <conteneur>            # délai personnalisé avant SIGKILL
docker kill <conteneur>                  # SIGKILL immédiat
docker restart <conteneur>

# Pause / reprise (gèle les processus sans les arrêter)
docker pause <conteneur>
docker unpause <conteneur>

# Supprimer
docker rm <conteneur>
docker rm -f <conteneur>                 # force (arrête d'abord si en cours)
docker rm $(docker ps -aq)               # supprimer TOUS les conteneurs arrêtés+actifs

# Attendre qu'un conteneur se termine (bloquant, utile en script)
docker wait <conteneur>

# Renommer
docker rename <ancien-nom> <nouveau-nom>

# Mettre à jour la config d'un conteneur en cours (resources, restart policy)
docker update --memory=1g <conteneur>
```

## Conteneurs — observer & diagnostiquer

```bash
# Lister
docker ps                     # conteneurs en cours d'exécution
docker ps -a                  # + les conteneurs arrêtés
docker ps -q                  # uniquement les IDs (utile en script)
docker ps --filter status=exited

# Logs
docker logs <conteneur>
docker logs -f <conteneur>    # -f : suivre en temps réel (comme tail -f)
docker logs --tail 100 <conteneur>
docker logs --since 10m <conteneur>

# Inspecter (métadonnées complètes au format JSON)
docker inspect <conteneur>
docker inspect --format '{{.State.Status}}' <conteneur>
docker inspect --format '{{.NetworkSettings.IPAddress}}' <conteneur>

# Exécuter une commande dans un conteneur déjà lancé
docker exec <conteneur> ls /app
docker exec -it <conteneur> bash         # ouvrir un shell interactif
docker exec -u root <conteneur> whoami   # exécuter en tant qu'un utilisateur précis

# S'attacher au flux principal du conteneur (attention : Ctrl+C peut le tuer)
docker attach <conteneur>
# Pour se détacher sans tuer : Ctrl+P puis Ctrl+Q

# Statistiques temps réel (CPU, RAM, réseau, I/O — lit les cgroups)
docker stats
docker stats --no-stream <conteneur>     # une seule mesure, pas de rafraîchissement

# Processus tournant DANS le conteneur (vus depuis l'hôte)
docker top <conteneur>

# Voir les changements de fichiers depuis le démarrage (couche inscriptible)
docker diff <conteneur>

# Copier des fichiers entre l'hôte et un conteneur
docker cp <conteneur>:/chemin/fichier ./local
docker cp ./local <conteneur>:/chemin/fichier

# Voir les ports publiés
docker port <conteneur>

# Historique des événements Docker en temps réel
docker events

# Convertir un conteneur en nouvelle image (fige son état actuel)
docker commit <conteneur> nouvelle-image:tag
```

## Images

```bash
# Lister / rechercher / inspecter
docker images                            # alias de : docker image ls
docker images -a                         # inclure les images intermédiaires
docker search nginx                      # chercher sur Docker Hub
docker inspect <image>
docker history <image>                   # voir les couches et leur taille

# Télécharger / pousser
docker pull <image>[:tag]
docker pull <image>@sha256:<digest>      # par digest précis (immuable)
docker push <utilisateur>/<image>:<tag>

# Construire (voir cours Dockerfile)
docker build -t mon-image:1.0 .
docker build -f Dockerfile.prod -t mon-image .
docker build --no-cache -t mon-image .   # ignorer le cache de build
docker build --build-arg VERSION=1.2 -t mon-image .

# Taguer
docker tag mon-image:1.0 mon-image:latest
docker tag mon-image registry.exemple.com/mon-image:1.0

# Supprimer
docker rmi <image>
docker rmi -f <image>                    # force même si des conteneurs (arrêtés) l'utilisent
docker image prune                       # supprimer les images "dangling" (sans tag)
docker image prune -a                    # supprimer TOUTES les images non utilisées

# Exporter / importer (fichiers tar)
docker save -o image.tar <image>         # image → archive (avec historique des couches)
docker load -i image.tar                 # archive → image
docker export <conteneur> -o rootfs.tar  # conteneur → simple archive du filesystem (sans historique)
docker import rootfs.tar nouvelle-image  # archive → nouvelle image (une seule couche)
```

## Réseaux (voir cours [Networks](../Networks/index.md))

```bash
docker network ls
docker network create mon-reseau
docker network create --driver bridge --subnet 172.20.0.0/16 mon-reseau
docker network inspect mon-reseau
docker network connect mon-reseau <conteneur>
docker network disconnect mon-reseau <conteneur>
docker network rm mon-reseau
docker network prune                     # supprimer les réseaux inutilisés
```

## Volumes (voir cours [Volumes](../Volumes/index.md))

```bash
docker volume ls
docker volume create mon-volume
docker volume inspect mon-volume
docker volume rm mon-volume
docker volume prune                      # supprimer les volumes non utilisés par un conteneur
```

## Registres (voir cours [Registries](../Registries/index.md))

```bash
docker login
docker login registry.exemple.com
docker logout
```

## Docker Compose (voir cours dédié)

```bash
docker compose up
docker compose up -d
docker compose down
docker compose ps
docker compose logs -f
```

## Système & nettoyage

```bash
docker version                # version client + serveur
docker info                   # détails de l'installation (driver stockage, etc.)
docker system df              # espace disque utilisé par images/conteneurs/volumes
docker system df -v           # détail par objet

# Nettoyage global — très utile pour libérer de l'espace disque
docker system prune           # conteneurs arrêtés + réseaux + images dangling + cache de build
docker system prune -a        # + toutes les images non utilisées par un conteneur en cours
docker system prune -a --volumes  # + les volumes non utilisés (⚠️ perte de données possible)

docker builder prune          # nettoyer uniquement le cache de build (BuildKit)
```

## Options courantes de `docker run` — aide-mémoire

| Option | Effet |
|---|---|
| `-d`, `--detach` | Lancer en arrière-plan |
| `-it` | Interactif + pseudo-TTY (combinaison `-i -t`) |
| `--rm` | Supprimer le conteneur automatiquement à l'arrêt |
| `--name <nom>` | Nommer le conteneur |
| `-p <hôte>:<conteneur>` | Publier un port (`-P` : publier tous les ports exposés sur des ports aléatoires) |
| `-e VAR=val` | Variable d'environnement (`--env-file` pour un fichier entier) |
| `-v <src>:<dst>` | Bind mount ou volume nommé |
| `--network <nom>` | Rattacher à un réseau précis |
| `-w <chemin>` | Répertoire de travail dans le conteneur |
| `-u <uid>:<gid>` | Utilisateur d'exécution (voir [Container Security](../Container_security/index.md)) |
| `--memory`, `--cpus` | Limites de ressources (cgroups) |
| `--cap-add`, `--cap-drop` | Ajuster les capabilities (voir [Capabilities](../Capabilities/index.md)) |
| `--read-only` | Système de fichiers racine en lecture seule |
| `--restart` | Politique de redémarrage : `no`, `on-failure`, `always`, `unless-stopped` |
| `--init` | Utiliser un init minimal comme PID 1 (voir [Namespaces](../Namespaces/index.md)) |
| `--privileged` | Désactive toutes les protections — à éviter |

## Ce qu'il faut retenir

- Les commandes suivent un schéma cohérent : `docker <objet> <action>` (`docker container ls`, `docker image rm`, `docker volume create`...) — les raccourcis historiques (`docker ps`, `docker images`, `docker rm`) restent les plus utilisés.
- `docker system prune -a --volumes` libère un maximum d'espace mais supprime aussi ce qui n'est pas activement utilisé — à utiliser en connaissance de cause.
- `stop`/`kill`, `pause`/`unpause`, `attach`/`exec` sont des paires à ne pas confondre (voir le cours [Cycle de vie](./02-cycle-de-vie-image-conteneur.md)).
