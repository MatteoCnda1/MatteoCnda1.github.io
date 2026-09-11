---
id: 053-traefik
title: Traefik — Reverse proxy / ingress
sidebar_position: 53
tags: [linux, services, web]
---

# Traefik — Reverse proxy / ingress

**Traefik** est un reverse proxy moderne conçu pour les environnements dynamiques (Docker, Kubernetes) : il découvre automatiquement les services via des **providers** (Docker labels, fichiers, Kubernetes Ingress/CRD) et met à jour son routage sans redémarrage.

## Installation

```bash
# Binaire
curl -L https://github.com/traefik/traefik/releases/latest/download/traefik_linux_amd64.tar.gz | tar xz
sudo mv traefik /usr/local/bin/

# Ou conteneur (usage le plus courant)
docker run -d -p 80:80 -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  traefik:v3 --api.insecure=true --providers.docker
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `traefik.yml` / `traefik.toml` | Configuration statique (entrypoints, providers, certificats) |
| `dynamic.yml` | Configuration dynamique (routers, middlewares) si provider fichier |
| Labels Docker (`traefik.http.routers.*`) | Configuration dynamique quand le provider Docker est utilisé |

## Commandes utiles

```bash
traefik version
docker logs -f traefik              # si lancé en conteneur
curl localhost:8080/api/rawdata     # dashboard API (si activé)
```

## Exemple de configuration (labels Docker)

```yaml
services:
  app:
    image: mon-app
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`app.exemple.fr`)"
      - "traefik.http.routers.app.tls.certresolver=letsencrypt"
```

## Sécurisation

- Ne **jamais** exposer `--api.insecure=true` en production — protéger le dashboard par une authentification ou le désactiver.
- Limiter l'accès au socket Docker (`/var/run/docker.sock`) monté en lecture seule quand c'est possible, ou passer par un proxy socket restreint (ex: docker-socket-proxy).
- Activer les middlewares de sécurité (rate limiting, headers, IP whitelist) par router.
- Let's Encrypt intégré (`certresolver`) pour automatiser le renouvellement TLS.

## Logs & dépannage

```bash
docker logs -f traefik
# Ou en systemd :
journalctl -u traefik -f
```

Le dashboard (`--api.dashboard=true`, port 8080 par défaut) donne une vue en temps réel des routers/services détectés — premier réflexe de dépannage pour vérifier qu'un service est bien découvert.

## Voir aussi

- [nginx](./049-nginx.md) et [haproxy](./052-haproxy.md) — alternatives reverse proxy plus statiques
- [Docker](./042-docker.md) — provider le plus courant pour Traefik
