---
id: 037-sanoid
title: sanoid — Gestion et snapshots ZFS
sidebar_position: 37
tags: [linux, services, stockage]
---

# sanoid — Gestion et snapshots ZFS

**Sanoid** est un outil de politique de snapshots pour **ZFS** : il automatise la création, la rétention et la purge de snapshots selon des règles (horaire/journalier/hebdomadaire/mensuel), et s'accompagne de **Syncoid** pour la réplication de ces snapshots vers un autre pool ou une machine distante.

## Installation

```bash
sudo apt install sanoid
```

Sanoid fonctionne généralement via un **timer systemd** (`sanoid.timer`) plutôt qu'en démon permanent.

```bash
sudo systemctl enable --now sanoid.timer
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/sanoid/sanoid.conf` | Politiques de rétention par dataset ZFS |
| `/etc/sanoid/sanoid.defaults.conf` | Valeurs par défaut (ne pas modifier directement) |

## Commandes utiles

```bash
systemctl status sanoid.timer
sanoid --cron                   # exécution manuelle (normalement déclenchée par le timer)
sanoid --verbose --cron         # avec détails
zfs list -t snapshot            # lister les snapshots créés
syncoid tank/data backup/tank/data   # répliquer vers un autre pool/host
```

## Exemple de configuration

```ini
# /etc/sanoid/sanoid.conf
[tank/data]
    use_template = production
    recursive = yes

[template_production]
    frequently = 0
    hourly = 24
    daily = 30
    weekly = 8
    monthly = 6
    autosnap = yes
    autoprune = yes
```

Conserve 24 snapshots horaires, 30 journaliers, 8 hebdomadaires et 6 mensuels, avec création et purge automatiques.

## Sécurisation

- Un snapshot **n'est pas une sauvegarde externe** : il protège contre l'erreur humaine/corruption logique, pas contre une panne matérielle du pool — combiner avec **Syncoid** vers un pool/hôte distant.
- Protéger l'accès SSH utilisé par Syncoid pour la réplication (clé dédiée, `command=` restreint dans `authorized_keys`).
- Dimensionner la rétention selon l'espace disponible : des snapshots trop nombreux sur un dataset à fort taux de modification consomment vite l'espace du pool.

## Logs & dépannage

```bash
journalctl -u sanoid
journalctl -u sanoid.timer
zfs list -t snapshot -o name,creation,used
```

## Voir aussi

- [zfs-zed](./038-zfs-zed.md) — surveillance des événements ZFS (erreurs, dégradation de pool), complémentaire à Sanoid
