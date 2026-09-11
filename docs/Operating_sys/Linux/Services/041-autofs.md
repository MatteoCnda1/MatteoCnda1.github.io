---
id: 041-autofs
title: autofs — Montage automatique
sidebar_position: 41
tags: [linux, services, stockage]
---

# autofs — Montage automatique

**autofs** monte automatiquement des systèmes de fichiers (NFS, CIFS/Samba, locaux) **à la demande**, lors du premier accès à leur point de montage, et les démonte après une période d'inactivité. Évite de garder tous les montages actifs en permanence dans `/etc/fstab`.

## Installation

```bash
sudo apt install autofs
sudo systemctl enable --now autofs
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/auto.master` | Point d'entrée : associe un répertoire racine à une *map* |
| `/etc/auto.<nom>` | Map définissant les montages (source, options) pour un répertoire |
| `/etc/autofs.conf` | Options globales du démon (timeout, verbosité) |

## Commandes utiles

```bash
systemctl status autofs
systemctl reload autofs       # recharger la configuration après modification des maps
automount -f -v                # lancer en avant-plan avec logs verbeux (débogage)
mount | grep autofs            # vérifier les montages actifs
```

## Exemple de configuration

```
# /etc/auto.master
/mnt/nfs    /etc/auto.nfs   --timeout=60

# /etc/auto.nfs — montage NFS à la demande, démonté après 60s d'inactivité
data    -fstype=nfs,rw,soft    serveur-nfs:/export/data
```

Un accès à `/mnt/nfs/data` déclenche le montage ; après 60 secondes sans accès, autofs démonte automatiquement.

## Sécurisation

- Préférer `soft` à `hard` pour les montages NFS non critiques : un montage `hard` peut bloquer indéfiniment un processus si le serveur distant devient injoignable.
- Restreindre les options de montage (`nosuid`, `nodev`, `noexec` quand pertinent) pour limiter l'impact d'un partage distant compromis.
- Éviter d'exposer des maps autofs permettant de monter n'importe quelle source arbitraire fournie par un utilisateur non privilégié.

## Logs & dépannage

```bash
journalctl -u autofs
automount -f -v                 # mode debug en avant-plan, très utile pour diagnostiquer une map qui ne matche pas
showmount -e serveur-nfs         # vérifier les exports NFS disponibles côté serveur
```

## Voir aussi

- [nfs-server](../Services/092-nfs-server.md) — le service côté serveur pour les partages NFS montés ici
