---
id: 01-securite-des-conteneurs
title: Sécurité des conteneurs — synthèse
sidebar_position: 1
tags: [conteneurs, cybersecurite, linux]
---

# Sécurité des conteneurs — synthèse

> Ce cours assemble les briques vues séparément ([Namespaces](../Namespaces/index.md), [cgroups](../cgroups/index.md), [Capabilities](../Capabilities/index.md), [Seccomp](../Seccomp/index.md)) en une checklist pratique de durcissement, et couvre les angles pas encore traités : rootless, image scanning, secrets.

## Rappel : les conteneurs ne sont pas des VM

Comme vu dans [Qu'est-ce qu'un conteneur ?](../Containers/01-quest-ce-quun-conteneur.md), tous les conteneurs **partagent le noyau de l'hôte**. Une faille noyau, ou une mauvaise configuration qui permet de sortir de l'isolation (namespaces/cgroups/capabilities), peut donner accès à l'hôte lui-même — l'isolation est **logicielle**, pas une frontière matérielle comme avec une VM.

## Les 4 couches de défense (rappel)

```text
   Processus dans le conteneur
   ┌──────────────────────────────────────────┐
   │ Namespaces  → vue isolée (pas d'isolation │
   │               de sécurité au sens strict, │
   │               juste une vue différente)    │
   ├──────────────────────────────────────────┤
   │ cgroups     → ressources plafonnées        │
   │               (limite l'impact d'un DoS)   │
   ├──────────────────────────────────────────┤
   │ Capabilities → pouvoirs de root réduits     │
   ├──────────────────────────────────────────┤
   │ Seccomp     → appels système filtrés        │
   ├──────────────────────────────────────────┤
   │ AppArmor/SELinux → politique MAC             │
   │               supplémentaire (optionnelle)  │
   └──────────────────────────────────────────┘
```

Aucune de ces couches n'est suffisante seule — c'est leur **combinaison** qui rend une évasion de conteneur difficile.

## Checklist de durcissement

### Ne jamais tourner en root dans le conteneur

```dockerfile
RUN adduser -D -u 1000 appuser
USER appuser
```

```bash
docker run -u 1000:1000 mon-image     # forcer un utilisateur non-root même si l'image ne le fait pas
```

Un conteneur qui tourne en root (même avec les capabilities réduites par défaut) reste plus dangereux en cas de vulnérabilité applicative (ex. écriture de fichier arbitraire) qu'un conteneur qui tourne avec un utilisateur non privilégié.

### Retirer les capabilities inutiles

```bash
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE mon-app
```

Voir le détail dans le cours [Capabilities](../Capabilities/index.md) — partir de zéro (`--cap-drop=ALL`) et n'ajouter que le strict nécessaire, plutôt que de partir du jeu par défaut de Docker et retirer au cas par cas.

### Système de fichiers en lecture seule

```bash
docker run --read-only --tmpfs /tmp mon-image
```

Empêche un attaquant d'écrire des fichiers persistants dans le conteneur (webshell, binaire malveillant) — combiné à un `tmpfs` pour les répertoires qui ont légitimement besoin d'écriture temporaire (`/tmp`, caches).

### Ne jamais utiliser `--privileged` en production

`--privileged` accorde **toutes** les capabilities, désactive seccomp et AppArmor/SELinux, et donne accès à tous les périphériques de l'hôte — l'équivalent d'annuler tout ce vu dans ce cours. À réserver strictement au debug local ou à des cas très spécifiques (ex. Docker-in-Docker en CI), jamais à une charge applicative normale.

### Limiter les ressources (anti déni de service)

```bash
docker run --memory=512m --cpus=1 --pids-limit=200 mon-app
```

Voir [cgroups](../cgroups/index.md) — sans limite, un conteneur compromis ou buggé peut épuiser les ressources de la machine hôte et affecter tous les autres conteneurs qui y tournent.

### Ne jamais exposer le socket Docker à un conteneur

```bash
# À NE JAMAIS FAIRE sauf cas très maîtrisé (ex. outils CI de build d'images) :
docker run -v /var/run/docker.sock:/var/run/docker.sock mon-image
```

Comme vu dans [Introduction & architecture](../Docker/00-introduction-architecture.md), accéder au socket Docker équivaut à des droits root sur l'hôte. Monter ce socket dans un conteneur lui donne, de fait, la capacité de contrôler **tous les autres conteneurs et l'hôte lui-même** — une des évasions de conteneur les plus documentées et les plus faciles à exploiter.

## Rootless : supprimer le daemon root de l'équation

Docker propose un **mode rootless** (le daemon lui-même tourne sous un utilisateur non privilégié, via des user namespaces) :

```bash
# Installation du mode rootless (script officiel)
curl -fsSL https://get.docker.com/rootless | sh
```

[Podman](../Podman/index.md) va plus loin en étant **rootless par défaut**, sans configuration supplémentaire — voir ce cours pour le détail.

## Scanner les images à la recherche de vulnérabilités

Une image construite à partir d'une base système (`debian`, `alpine`, `python`...) hérite des paquets — et de leurs vulnérabilités connues — de cette base. Des outils dédiés scannent une image et listent les CVE affectant les paquets qu'elle contient :

```bash
# Trivy (Aqua Security), très répandu, simple d'usage
trivy image mon-image:1.0

# Docker Scout, intégré à la CLI Docker
docker scout cves mon-image:1.0
```

Bonnes pratiques associées : utiliser des images de base **minimales** (`-slim`, `alpine`, ou *distroless*) pour réduire la surface de paquets vulnérables, et reconstruire régulièrement les images pour intégrer les correctifs de sécurité de la base.

## Secrets : ne jamais les mettre dans l'image

```dockerfile
# À NE JAMAIS FAIRE — le secret reste dans l'historique des couches,
# même si le fichier est supprimé dans une instruction suivante
COPY secret.key /app/secret.key
ENV API_KEY=abc123
```

Une couche d'image est **immuable** : même si une instruction ultérieure supprime le fichier, il reste **récupérable** en inspectant les couches précédentes (`docker history`, extraction manuelle du tar de la couche). Alternatives :

- **Variables d'environnement au runtime** (`docker run -e`, ou fichier `--env-file` non commité) plutôt que gravées dans l'image.
- **Docker secrets** (en mode Swarm) ou les mécanismes de secrets d'un orchestrateur (Kubernetes Secrets...).
- **BuildKit secrets** pour les secrets nécessaires uniquement **pendant le build** (ex. token pour cloner un dépôt privé), qui ne persistent dans aucune couche finale :

```dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=secret,id=github_token \
    GITHUB_TOKEN=$(cat /run/secrets/github_token) git clone ...
```

```bash
docker build --secret id=github_token,src=./token.txt .
```

## Audit rapide : Docker Bench for Security

Un script communautaire qui vérifie automatiquement une installation Docker par rapport aux recommandations du CIS (Center for Internet Security) :

```bash
docker run -it --net host --pid host --userns host --cap-add audit_control \
  -v /var/lib:/var/lib -v /var/run/docker.sock:/var/run/docker.sock \
  docker/docker-bench-security
```

## Ce qu'il faut retenir

- L'isolation d'un conteneur repose sur la **combinaison** de plusieurs couches (namespaces, cgroups, capabilities, seccomp, MAC) — aucune n'est suffisante seule.
- Checklist minimale : **utilisateur non-root**, capabilities réduites au strict nécessaire, `--read-only` + tmpfs, limites de ressources, jamais `--privileged`, jamais le socket Docker monté dans un conteneur non maîtrisé.
- Les **secrets ne doivent jamais être gravés dans une couche d'image** — même supprimés ensuite, ils restent récupérables ; utiliser les secrets BuildKit ou les variables au runtime.
- Scanner régulièrement les images (Trivy, Docker Scout) et repartir de bases **minimales** pour réduire la surface de vulnérabilités héritées.
