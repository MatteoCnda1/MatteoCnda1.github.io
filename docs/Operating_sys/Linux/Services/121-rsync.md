---
id: 121-rsync
title: rsync — synchronisation de fichiers
sidebar_position: 121
tags: [linux, services, sauvegarde]
---

# rsync — synchronisation de fichiers

`rsync` synchronise des fichiers/dossiers en ne transférant que les différences. Il s'utilise dans **deux modes** : en **commande ponctuelle via SSH** (le plus courant, déjà détaillé dans le [cours réseau Linux](../Networking/reseau-linux.md#accès-distant-et-transfert--ssh-scp-rsync) et les [bases Linux](../01-linux-basics.md#sauvegarde-avec-rsync)), ou en **démon `rsyncd`** exposant un service réseau dédié (port TCP 873) — c'est cet angle service que couvre cette fiche.

## Installation

```bash
sudo apt install rsync        # généralement déjà présent
sudo dnf install rsync
sudo systemctl enable --now rsync   # active le démon rsyncd (mode service)
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/rsyncd.conf` | Configuration du démon : modules (partages), chemins, droits d'accès |
| `/etc/rsyncd.secrets` | Identifiants pour les modules protégés par mot de passe |
| `/etc/rsyncd.motd` | Message affiché aux clients qui se connectent |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl start/stop/enable/status rsync` | Gérer le démon `rsyncd` |
| `rsync -avz src/ dest/` | Synchroniser (archive, verbeux, compressé) |
| `rsync -avz --delete src/ dest/` | Miroir exact (supprime en trop côté destination) |
| `rsync --dry-run -avz src/ dest/` | Simuler sans rien transférer |
| `rsync rsync://serveur/module/` | Lister/accéder à un module du démon |

## Exemple de configuration

```ini
# /etc/rsyncd.conf
uid = nobody
gid = nogroup
use chroot = yes
max connections = 4
pid file = /var/run/rsyncd.pid

[sauvegarde]
    path = /srv/backup
    comment = Module de sauvegarde
    read only = no
    auth users = backupuser
    secrets file = /etc/rsyncd.secrets
```

```
# /etc/rsyncd.secrets (permissions 600)
backupuser:motdepasse
```

## Sécurisation

- Le mode démon **sans authentification** expose un partage en lecture/écriture à quiconque atteint le port 873 — toujours définir `auth users` + `secrets file` pour les modules sensibles.
- Préférer le **transport via SSH** (`rsync -e ssh`) plutôt que le démon `rsyncd` nu quand c'est possible : trafic chiffré nativement, pas de port supplémentaire à exposer.
- `use chroot = yes` pour confiner le démon au chemin du module.
- Restreindre l'accès réseau au port 873 par firewall si le démon doit rester exposé.
- Fichier `rsyncd.secrets` en permissions `600`, propriétaire root.

## Logs & dépannage

```bash
journalctl -u rsync          # logs du démon (si activé via systemd)
rsync --dry-run -avz ...     # simuler un transfert pour voir ce qui changerait
rsync -avz --stats ...       # statistiques détaillées du transfert
```

## Voir aussi

- [Accès distant et transfert : ssh, scp, rsync](../Networking/reseau-linux.md#accès-distant-et-transfert--ssh-scp-rsync) — usage client détaillé
- [borgmatic](./122-borgmatic.md), [restic](./123-restic.md) — solutions de sauvegarde plus complètes (chiffrement, déduplication, rétention) bâties sur des principes similaires
