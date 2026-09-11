---
id: 038-zfs-zed
title: zfs-zed — Événements ZFS
sidebar_position: 38
tags: [linux, services, stockage]
---

# zfs-zed — Événements ZFS

**ZED** (ZFS Event Daemon) surveille les événements émis par le module noyau ZFS (erreurs de checksum, disque dégradé/absent, fin de scrub/resilver) et déclenche des actions — typiquement l'envoi d'un mail d'alerte.

## Installation

```bash
sudo apt install zfsutils-linux
sudo systemctl enable --now zfs-zed
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/zfs/zed.d/zed.rc` | Configuration principale (destinataire mail, seuils) |
| `/etc/zfs/zed.d/*.sh` | Scripts déclenchés par type d'événement (ex: `data-notify.sh`, `scrub_finish-notify.sh`) |

## Commandes utiles

```bash
systemctl status zfs-zed
zpool status -x               # pools non sains uniquement
zpool events                  # historique des événements bruts
zpool scrub tank               # lancer un scrub manuel (vérification d'intégrité)
zpool status tank               # état détaillé (dégradation, erreurs par disque)
```

## Exemple de configuration

```bash
# /etc/zfs/zed.d/zed.rc
ZED_EMAIL_ADDR="admin@exemple.fr"
ZED_EMAIL_OPTS="-s '@SUBJECT@' @ADDRESS@"
ZED_NOTIFY_VERBOSE=1
ZED_SCRUB_AFTER_RESILVER=1
```

Envoie un mail à chaque événement notable, et relance automatiquement un scrub après une reconstruction (resilver) pour confirmer l'intégrité du pool.

## Sécurisation

- Configurer impérativement `ZED_EMAIL_ADDR` — sans alerte, une dégradation de pool ZFS passe inaperçue jusqu'à une perte de données.
- Planifier des **scrubs réguliers** (`zpool scrub`, via cron/timer) : ZED réagit aux événements mais ne détecte pas la corruption silencieuse sans scrub périodique.
- Vérifier `zpool status -x` régulièrement même avec ZED actif — bonne pratique de double contrôle.

## Logs & dépannage

```bash
journalctl -u zfs-zed
zpool events -v                # détail complet du dernier événement
zpool status -v tank            # fichiers affectés en cas d'erreur de checksum
```

## Voir aussi

- [sanoid](./037-sanoid.md) — gestion des snapshots ZFS, complémentaire à la surveillance ZED
