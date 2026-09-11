---
id: 035-mdmonitor
title: mdmonitor — Surveillance RAID logiciel (mdadm)
sidebar_position: 35
tags: [linux, services, stockage]
---

# mdmonitor — Surveillance RAID logiciel (mdadm)

**mdmonitor** est le démon de surveillance de `mdadm`, l'outil de gestion du **RAID logiciel Linux** (md, *multiple devices*). Il surveille l'état des arrays RAID (dégradation, disque défaillant, reconstruction) et déclenche des alertes.

## Installation

```bash
sudo apt install mdadm
sudo systemctl enable --now mdmonitor
```

Le paquet `mdadm` installe l'outil de gestion des arrays et active `mdmonitor` par défaut.

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/mdadm/mdadm.conf` | Définition des arrays (UUID, niveau RAID), adresse mail d'alerte (`MAILADDR`) |
| `/proc/mdstat` | État en temps réel des arrays (lecture seule, généré par le kernel) |

## Commandes utiles

```bash
systemctl status mdmonitor
cat /proc/mdstat                         # état de tous les arrays
mdadm --detail /dev/md0                  # détail d'un array (disques, état, spares)
mdadm --query --detail --scan >> /etc/mdadm/mdadm.conf   # enregistrer la config d'un array existant
mdadm /dev/md0 --fail /dev/sdb1          # marquer un disque comme défaillant
mdadm /dev/md0 --remove /dev/sdb1        # retirer un disque défaillant
mdadm /dev/md0 --add /dev/sdc1           # ajouter un disque de remplacement
```

## Exemple de configuration

```
# /etc/mdadm/mdadm.conf
MAILADDR admin@exemple.fr
ARRAY /dev/md0 UUID=3a2f1b4c:8d9e0f11:22334455:66778899
```

`MAILADDR` est essentiel : sans destinataire configuré, une dégradation RAID (disque tombé) peut passer totalement inaperçue jusqu'à la panne du second disque.

## Sécurisation

- Toujours configurer `MAILADDR` (ou un `PROGRAM` personnalisé déclenchant une alerte externe) — un RAID dégradé silencieux perd tout son intérêt de tolérance de panne.
- Tester périodiquement une simulation de panne en lab (`mdadm --fail`) pour valider que les alertes fonctionnent réellement.
- Documenter l'UUID de chaque array dans `mdadm.conf` pour un réassemblage fiable après réinstallation/déplacement de disques.

## Logs & dépannage

```bash
journalctl -u mdmonitor
cat /proc/mdstat                 # `[UU]` = sain, `[U_]` = dégradé
mdadm --detail /dev/md0 | grep State
```

## Voir aussi

- [smartmontools / smartd](./034-smartmontools-smartd.md) — surveiller la santé individuelle des disques membres de l'array
- [lvm2-monitor](./036-lvm2-monitor.md) — souvent combiné avec du RAID logiciel (LVM sur md)
