---
id: 044-podman
title: podman — Conteneurs sans démon central
sidebar_position: 44
tags: [linux, services, conteneurs]
---

# podman — Conteneurs sans démon central

Contrairement à Docker, **Podman** n'a pas de démon permanent : chaque commande `podman` lance directement les conteneurs via `runc`/`crun`, ce qui simplifie le modèle de sécurité (pas de processus root persistant à protéger) et facilite le mode **rootless** par défaut. Cette fiche couvre l'angle **service/socket systemd** (API REST optionnelle) ; pour l'usage courant, voir le lien en fin de page.

## Installation

```bash
apt install podman
# Activer l'API REST (optionnelle, compatible Docker) en tant qu'utilisateur
systemctl --user enable --now podman.socket
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `~/.config/containers/containers.conf` | Configuration utilisateur (rootless) |
| `/etc/containers/containers.conf` | Configuration système |
| `/etc/containers/registries.conf` | Registries autorisés |
| `/etc/containers/storage.conf` | Driver de stockage |

## Commandes utiles

```bash
podman ps -a
podman info
podman system service --time=0        # exposer l'API manuellement
systemctl --user status podman.socket
```

## Exemple de configuration

```toml
# registries.conf — restreindre les registries autorisés sans préfixe explicite
unqualified-search-registries = ["docker.io"]
```

## Sécurisation

- Le mode **rootless** est le mode par défaut recommandé : chaque utilisateur exécute ses conteneurs sous son propre UID, sans processus root permanent.
- `registries.conf` doit lister explicitement les registries de confiance (évite qu'un nom d'image ambigu soit résolu vers un registry non désiré).
- Utiliser `podman generate systemd` (ou Quadlet sur les versions récentes) pour transformer un conteneur en unit systemd durable plutôt que le laisser tourner en arrière-plan sans supervision.

## Logs & dépannage

```bash
journalctl --user -u podman.socket -f
podman logs <conteneur>
podman system df
```

## Voir aussi

- [Podman — cours complet](../../../Containers/Podman/01-podman.md)
- [docker / dockerd](./042-docker.md) — l'alternative avec démon central, CLI très proche
