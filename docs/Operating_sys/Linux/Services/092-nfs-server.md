---
id: 092-nfs-server
title: nfs-server — Partage NFS
sidebar_position: 92
tags: [linux, services, partage-fichiers]
---

# nfs-server

**NFS** (Network File System) est le protocole de partage de fichiers natif du monde Unix/Linux — plus simple et performant qu'SMB pour des clients Linux, mais avec un modèle de sécurité historiquement plus faible (authentification par IP/UID côté client, pas par mot de passe, sauf ajout de Kerberos). NFSv3 dépend de [rpcbind](./093-rpcbind.md) pour la découverte de services ; NFSv4 en a beaucoup moins besoin (port unique 2049).

## Installation

```bash
sudo apt install nfs-kernel-server
sudo systemctl enable --now nfs-server
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/exports` | Liste des répertoires partagés et leurs droits d'accès |
| `/etc/nfs.conf` | Options générales du serveur NFS (version, threads...) |
| `/etc/idmapd.conf` | Mapping des identités pour NFSv4 |

## Commandes utiles

```bash
sudo exportfs -a                # (ré)appliquer /etc/exports
exportfs -v                     # lister les exports actifs
showmount -e localhost          # voir les partages exportés (côté serveur ou distant)
mount -t nfs serveur:/partage /mnt   # côté client
systemctl restart nfs-server
```

## Exemple de configuration

```
# /etc/exports
/srv/nfs/partage   192.168.1.0/24(rw,sync,no_subtree_check,root_squash)
```

- `root_squash` (par défaut) — mappe root du client vers `nobody` côté serveur, évite qu'un client root ait les pleins droits sur l'export.
- `sync` — garantit l'écriture sur disque avant confirmation (plus sûr qu'`async`, un peu plus lent).

## Sécurisation

- Restreindre chaque export à un **réseau/IP précis**, jamais `*` ouvert à tout le monde.
- Garder `root_squash` activé (ne jamais mettre `no_root_squash` sauf besoin très spécifique et maîtrisé).
- Préférer **NFSv4** (port unique 2049, plus facile à firewaller) à NFSv3 (ports dynamiques via rpcbind, plus difficile à filtrer).
- Envisager **Kerberos** (`sec=krb5`) pour une authentification forte si le réseau n'est pas totalement de confiance — NFS de base fait confiance à l'UID annoncé par le client.
- Ne jamais exposer NFS directement sur Internet.

## Logs & dépannage

```bash
journalctl -u nfs-server
showmount -e serveur             # depuis le client, vérifier ce qui est exporté
exportfs -v                      # vérifier les options effectivement appliquées
rpcinfo -p serveur                # vérifier les services RPC enregistrés (NFSv3)
```

## Voir aussi

- [rpcbind](./093-rpcbind.md) — requis pour NFSv3
- [autofs](./041-autofs.md) — montage automatique des exports NFS à la demande
