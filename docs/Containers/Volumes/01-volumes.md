---
id: 01-volumes
title: Volumes & persistance des données
sidebar_position: 1
tags: [conteneurs, outil]
---

# Volumes & persistance des données

> Comme vu dans le cours [Cycle de vie](../Docker/02-cycle-de-vie-image-conteneur.md), la couche inscriptible d'un conteneur disparaît avec lui. Pour toute donnée qui doit **survivre** à la suppression d'un conteneur (base de données, fichiers uploadés...), il faut un mécanisme de stockage externe à cette couche.

## Les trois types de montage

```text
┌────────────────────────────────────────────────────────────┐
│                          HÔTE                                 │
│                                                                │
│  /home/user/data/  ────────┐          Géré par Docker,         │
│  (bind mount)                │          dans /var/lib/docker/   │
│                               │          volumes/  (volume nommé)│
│                               │              ┌───────────┐      │
│                               │              │ mon-volume │      │
│                               │              └─────┬─────┘      │
│                               ▼                    │            │
│                  ┌──────────────────────────────────▼─────┐     │
│                  │              CONTENEUR                    │     │
│                  │   /app/data  (bind mount)                  │     │
│                  │   /var/lib/mysql  (volume nommé)            │     │
│                  │   /tmp/cache  (tmpfs — en RAM, non persistant)│     │
│                  └────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

| Type | Où vivent les données | Cas d'usage |
|---|---|---|
| **Volume nommé** | Géré entièrement par Docker (`/var/lib/docker/volumes/`) | Données persistantes d'application (bases de données) — **recommandé par défaut** |
| **Bind mount** | Un chemin précis de l'hôte, choisi explicitement | Code source en développement, fichiers de config à éditer depuis l'hôte |
| **tmpfs** | En RAM uniquement, jamais écrit sur disque | Données temporaires sensibles (secrets en mémoire) ou performance pure |

## Volumes nommés (recommandés pour les données applicatives)

```bash
# Créer, lister, inspecter, supprimer
docker volume create mon-volume
docker volume ls
docker volume inspect mon-volume
docker volume rm mon-volume
docker volume prune                    # supprimer tous les volumes non utilisés

# Utiliser un volume nommé (créé automatiquement s'il n'existe pas)
docker run -v mon-volume:/var/lib/mysql mysql
docker run --mount source=mon-volume,target=/var/lib/mysql mysql   # syntaxe équivalente, plus explicite
```

`-v` et `--mount` font la même chose ; `--mount` est plus verbeux mais évite les ambiguïtés de syntaxe (utile en script), `-v` reste le plus utilisé en interactif.

## Bind mounts

```bash
# Monter un dossier précis de l'hôte (chemin absolu obligatoire)
docker run -v /home/user/projet:/app mon-image
docker run -v "$(pwd)":/app mon-image           # le répertoire courant

# Lecture seule côté conteneur
docker run -v /home/user/config:/etc/app:ro mon-image
```

Cas d'usage typique en développement : monter le code source local dans le conteneur pour voir les changements sans reconstruire l'image à chaque modification.

## tmpfs (éphémère, en mémoire)

```bash
docker run --tmpfs /tmp mon-image
docker run --mount type=tmpfs,destination=/tmp,tmpfs-size=100m mon-image
```

## Sauvegarder et restaurer un volume

Les volumes nommés vivent dans l'espace géré par Docker — la méthode standard pour les sauvegarder passe par un conteneur temporaire qui monte le volume et une archive :

```bash
# Sauvegarde : monter le volume en lecture seule + un dossier hôte, archiver
docker run --rm -v mon-volume:/data:ro -v "$(pwd)":/backup alpine \
  tar czf /backup/sauvegarde.tar.gz -C /data .

# Restauration : créer le volume s'il n'existe pas, puis extraire dedans
docker run --rm -v mon-volume:/data -v "$(pwd)":/backup alpine \
  tar xzf /backup/sauvegarde.tar.gz -C /data
```

## Volumes partagés entre plusieurs conteneurs

Un même volume nommé peut être monté par plusieurs conteneurs simultanément — utile pour partager des fichiers, mais attention aux écritures concurrentes non coordonnées (pas de verrouillage automatique).

```bash
docker run -d --name writer -v partage:/data alpine sh -c "while true; do date >> /data/log; sleep 5; done"
docker run --rm -v partage:/data alpine cat /data/log
```

## Ce qu'il faut retenir

- **Volume nommé** = géré par Docker, le choix par défaut pour les données persistantes d'application.
- **Bind mount** = chemin hôte explicite, pratique en développement pour le code source, mais couple le conteneur à la machine hôte.
- **tmpfs** = en RAM, jamais persistant, jamais sur disque — pour du temporaire ou du sensible.
- La sauvegarde d'un volume passe par un conteneur temporaire qui l'archive vers l'hôte, pas par un accès direct au dossier interne de Docker.
