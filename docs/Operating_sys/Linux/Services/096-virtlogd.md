---
id: 096-virtlogd
title: virtlogd — logs des machines virtuelles
sidebar_position: 96
tags: [linux, services, virtualisation]
---

# virtlogd — logs des machines virtuelles

`virtlogd` est un démon auxiliaire de la stack **libvirt** dédié exclusivement à la gestion des logs de sortie console des machines virtuelles QEMU. Il a été séparé de `libvirtd` pour que les logs de VM survivent à un redémarrage du démon principal (`libvirtd --reload`, mise à jour...) sans interrompre la capture.

## Installation

Installé automatiquement avec `libvirt-daemon` (voir [libvirtd](./095-libvirtd.md)). Démarré via activation par socket, pas besoin de l'activer manuellement dans la plupart des cas.

```bash
systemctl status virtlogd virtlogd.socket
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/libvirt/virtlogd.conf` | Taille max des logs, nombre de fichiers conservés (rotation) |
| `/var/log/libvirt/qemu/*.log` | Logs de sortie console de chaque VM |

## Commandes utiles

```bash
systemctl status virtlogd
journalctl -u virtlogd
```

Le démon n'a pas de CLI dédiée : il est piloté indirectement via `libvirtd`/`virsh`.

## Exemple de configuration

```ini
# /etc/libvirt/virtlogd.conf
max_size = 2097152      # taille max d'un fichier de log (octets) avant rotation
max_backups = 3         # nombre de fichiers de rotation conservés
```

## Sécurisation

- Limiter `max_size`/`max_backups` pour éviter un remplissage disque par une VM bavarde en console.
- Les fichiers `/var/log/libvirt/qemu/*.log` peuvent contenir des informations sensibles affichées au boot (mots de passe en clair dans certains cas de debug) — restreindre les permissions du dossier.

## Logs & dépannage

```bash
journalctl -u virtlogd
tail -f /var/log/libvirt/qemu/<vm>.log
# Si les logs de VM n'apparaissent plus : vérifier le socket
systemctl status virtlogd.socket
```

## Voir aussi

- [libvirtd](./095-libvirtd.md) — le démon qui orchestre virtlogd
- [virtlockd](./097-virtlockd.md) — l'autre démon auxiliaire de la stack
