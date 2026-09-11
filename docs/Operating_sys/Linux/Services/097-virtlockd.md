---
id: 097-virtlockd
title: virtlockd — verrouillage des disques de VM
sidebar_position: 97
tags: [linux, services, virtualisation]
---

# virtlockd — verrouillage des disques de VM

`virtlockd` est le démon de **verrouillage** de la stack libvirt : il empêche qu'un même disque de machine virtuelle soit démarré simultanément par deux instances de `libvirtd` (par exemple sur deux hôtes différents partageant un stockage réseau), ce qui corromprait le disque. Comme `virtlogd`, il est séparé de `libvirtd` pour survivre à ses redémarrages et garder les verrous actifs.

## Installation

Installé automatiquement avec `libvirt-daemon` (voir [libvirtd](./095-libvirtd.md)).

```bash
systemctl status virtlockd virtlockd.socket
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/libvirt/virtlockd.conf` | Configuration du démon de verrouillage |
| `/etc/libvirt/qemu-lockd.conf` | Activation et pilotes de verrouillage pour QEMU (lockd ou sanlock) |
| `/var/lib/libvirt/lockd/` | Verrous actifs |

## Commandes utiles

```bash
systemctl status virtlockd
journalctl -u virtlockd
```

Piloté indirectement via `libvirtd`, pas de CLI dédiée.

## Exemple de configuration

```ini
# /etc/libvirt/qemu-lockd.conf — activer le verrouillage des disques
lock_manager = "lockd"
```

Puis dans `/etc/libvirt/qemu.conf` :

```ini
lock_manager = "lockd"
```

## Sécurisation

- Activer explicitement le verrouillage (`lock_manager = "lockd"`) dès qu'un stockage est **partagé entre plusieurs hôtes** (NFS, SAN) — sans ça, démarrer la même VM sur deux hôtes corrompt silencieusement le disque.
- Pour un cluster multi-hôtes plus robuste, préférer **sanlock** à `lockd` (verrouillage via un disque partagé dédié, plus résilient qu'un simple lock local par hôte).

## Logs & dépannage

```bash
journalctl -u virtlockd
# Erreur typique si un disque est déjà verrouillé par un autre hôte :
virsh start <vm>   # renverra une erreur "resource busy" si le verrou est déjà pris
```

## Voir aussi

- [libvirtd](./095-libvirtd.md) — le démon principal
- [virtlogd](./096-virtlogd.md) — l'autre démon auxiliaire
