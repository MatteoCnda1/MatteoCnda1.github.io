---
id: 036-lvm2-monitor
title: lvm2-monitor — Surveillance LVM
sidebar_position: 36
tags: [linux, services, stockage]
---

# lvm2-monitor — Surveillance LVM

**lvm2-monitor** est le service qui active la surveillance des volumes **LVM** (*Logical Volume Manager*) par `dmeventd` — notamment le suivi des volumes miroirs/thin provisionnés et le déclenchement d'actions automatiques (ex : extension d'un pool thin proche de la saturation).

## Installation

```bash
sudo apt install lvm2
sudo systemctl enable --now lvm2-monitor
```

Le paquet `lvm2` fournit les outils (`pvcreate`, `vgcreate`, `lvcreate`...) et active ce service par défaut.

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/lvm/lvm.conf` | Configuration globale LVM (dont la section `activation` pour le monitoring) |
| `/etc/lvm/lvm.conf` → `thin_pool_autoextend_percent` / `thin_pool_autoextend_threshold` | Auto-extension des pools thin provisionnés |

## Commandes utiles

```bash
systemctl status lvm2-monitor
pvs                       # liste des Physical Volumes
vgs                       # liste des Volume Groups
lvs                       # liste des Logical Volumes
lvs -o+seg_monitor         # état du monitoring dmeventd par volume
lvchange --monitor y /dev/vg0/lv0   # (ré)activer le monitoring sur un volume
```

## Exemple de configuration

```
# /etc/lvm/lvm.conf — auto-extension d'un pool thin à 80% d'usage, +20% de capacité
activation {
    thin_pool_autoextend_threshold = 80
    thin_pool_autoextend_percent = 20
}
```

Sans auto-extension configurée, un pool thin provisionné saturé passe en lecture seule — l'un des incidents LVM les plus fréquents en production.

## Sécurisation

- Configurer systématiquement l'auto-extension (ou une alerte) sur les pools **thin provisionnés** — la saturation silencieuse est le principal risque de ce mode.
- Surveiller l'espace réellement disponible dans le VG sous-jacent : l'auto-extension d'un thin pool ne fonctionne que s'il reste de la place physique.
- Combiner avec des snapshots LVM réguliers pour permettre un rollback rapide en cas de corruption.

## Logs & dépannage

```bash
journalctl -u lvm2-monitor
dmesg | grep -i lvm
lvs -a -o+lv_health_status    # état de santé détaillé des volumes
```

## Voir aussi

- [mdmonitor](./035-mdmonitor.md) — RAID logiciel souvent utilisé comme couche sous-jacente à LVM
