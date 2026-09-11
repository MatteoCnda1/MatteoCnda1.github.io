---
id: 131-gitlab-runner
title: GitLab Runner — agent CI/CD
sidebar_position: 131
tags: [linux, services, ci-cd]
---

# GitLab Runner — agent CI/CD

[GitLab Runner](https://docs.gitlab.com/runner/) est l'agent qui exécute les jobs définis dans `.gitlab-ci.yml` pour GitLab CI/CD. Contrairement à Jenkins (serveur + agents séparés), GitLab Runner est autonome : il s'enregistre auprès d'une instance GitLab (SaaS ou self-hosted) et exécute les jobs qu'elle lui assigne, généralement dans des conteneurs éphémères (executor Docker/Kubernetes).

## Installation

```bash
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt install gitlab-runner

# Activation (le paquet crée déjà le service)
sudo systemctl enable --now gitlab-runner

# Enregistrement auprès d'une instance GitLab
sudo gitlab-runner register --url https://gitlab.com/ --registration-token <token>
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/gitlab-runner/config.toml` | Configuration des runners enregistrés (executor, tags, concurrence) |
| `/home/gitlab-runner/` | Répertoire de travail par défaut |

## Commandes utiles

```bash
sudo gitlab-runner status
sudo gitlab-runner list
sudo gitlab-runner verify
sudo gitlab-runner unregister --name <runner-name>
systemctl restart gitlab-runner
```

## Exemple de configuration

```toml
# /etc/gitlab-runner/config.toml
concurrent = 4

[[runners]]
  name = "docker-runner-1"
  url = "https://gitlab.com/"
  token = "xxxxx"
  executor = "docker"
  [runners.docker]
    image = "alpine:latest"
    privileged = false
```

## Sécurisation

- Préférer l'**executor Docker** (jobs isolés dans des conteneurs éphémères) à l'executor `shell` (exécution directe sur l'hôte, dangereuse avec des jobs non fiables).
- Ne pas activer `privileged = true` sauf besoin explicite (Docker-in-Docker) — c'est un accès quasi-root à l'hôte.
- Utiliser des **runners spécifiques par projet** plutôt que des runners partagés pour du code sensible.
- Faire tourner `gitlab-runner` sous un utilisateur dédié, jamais root en dehors de l'exécution des conteneurs.
- Limiter les variables CI/CD sensibles (masquées + protégées dans GitLab, jamais en clair dans `.gitlab-ci.yml`).

## Logs & dépannage

```bash
journalctl -u gitlab-runner -f
sudo gitlab-runner --debug run     # exécution en avant-plan pour diagnostic
```

## Voir aussi

- [jenkins-agent](./130-jenkins-agent.md) — équivalent côté Jenkins
- [docker](./042-docker.md) — l'executor le plus utilisé par GitLab Runner
