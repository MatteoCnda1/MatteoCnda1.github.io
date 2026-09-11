---
id: 122-borgmatic
title: borgmatic — orchestrateur de sauvegardes Borg
sidebar_position: 122
tags: [linux, services, sauvegarde]
---

# borgmatic — orchestrateur de sauvegardes Borg

`borgmatic` est une surcouche de configuration et d'orchestration autour de **BorgBackup**, l'outil de sauvegarde à déduplication et chiffrement. Il gère la planification, la rétention et les hooks (avant/après sauvegarde) via un simple fichier YAML, là où Borg seul s'utilise en ligne de commande.

## Installation

```bash
sudo apt install borgmatic
# ou
pip3 install --user borgmatic

# Planification via systemd timer (fourni par le paquet, pas un démon permanent)
sudo systemctl enable --now borgmatic.timer
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/borgmatic/config.yaml` | Configuration principale : sources, dépôt(s) Borg, rétention, hooks |
| `~/.config/borgmatic/config.yaml` | Configuration utilisateur (alternative au fichier système) |
| `~/.cache/borg/` | Cache local des métadonnées Borg |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `borgmatic --dry-run` | Simuler une exécution sans rien modifier |
| `borgmatic` | Lancer une sauvegarde complète (create + prune + check selon config) |
| `borgmatic list` | Lister les archives du dépôt |
| `borgmatic restore --archive <nom>` | Restaurer une archive |
| `borgmatic --verbosity 1` | Sortie détaillée pour diagnostic |
| `systemctl list-timers borgmatic.timer` | Vérifier la prochaine exécution planifiée |

## Exemple de configuration

```yaml
# /etc/borgmatic/config.yaml
source_directories:
  - /home
  - /etc

repositories:
  - path: /mnt/backup/borg-repo
    label: local

retention:
  keep_daily: 7
  keep_weekly: 4
  keep_monthly: 6

encryption_passphrase: "changez-moi"

checks:
  - name: repository
```

## Sécurisation

- Le dépôt Borg est **chiffré côté client** (AES) : la passphrase (`encryption_passphrase`) ne doit jamais être en clair dans un dépôt versionné — utiliser un gestionnaire de secrets ou une variable d'environnement.
- Stocker le dépôt sur un support **distinct** de la machine sauvegardée (règle 3-2-1).
- Restreindre les permissions de `/etc/borgmatic/config.yaml` (contient potentiellement la passphrase).
- Vérifier régulièrement l'intégrité avec `checks: repository` et tester une restauration réelle périodiquement (une sauvegarde jamais restaurée n'est pas fiable).

## Logs & dépannage

```bash
journalctl -u borgmatic.service     # logs de la dernière exécution planifiée
borgmatic --verbosity 1             # diagnostic détaillé en exécution manuelle
borgmatic list                      # vérifier que les archives récentes sont présentes
```

## Voir aussi

- [restic](./123-restic.md) — alternative moderne avec un modèle proche (déduplication, chiffrement, multi-backend)
- [rsync](./121-rsync.md) — synchronisation simple sans déduplication/versionnement, pour comparaison
