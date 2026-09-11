---
id: 034-smartmontools-smartd
title: smartmontools / smartd — Surveillance disques SMART
sidebar_position: 34
tags: [linux, services, stockage]
---

# smartmontools / smartd — Surveillance disques SMART

Le paquet **smartmontools** fournit deux outils : `smartctl` (interrogation ponctuelle en CLI) et `smartd` (démon de surveillance continue). Tous deux lisent les attributs **S.M.A.R.T.** (Self-Monitoring, Analysis and Reporting Technology) exposés par les disques durs et SSD pour anticiper les pannes matérielles.

## Installation

```bash
sudo apt install smartmontools
sudo dnf install smartmontools
sudo systemctl enable --now smartd
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/smartd.conf` | Configuration du démon : disques surveillés, seuils, actions |
| `/etc/default/smartmontools` (Debian) | Active/désactive le démon au démarrage |

## Commandes utiles

```bash
systemctl status smartd
smartctl -a /dev/sda           # rapport complet (attributs, tests, santé globale)
smartctl -H /dev/sda           # état de santé résumé (PASSED/FAILED)
smartctl -t short /dev/sda     # lancer un auto-test court
smartctl -t long /dev/sda      # auto-test long (complet)
smartctl -l selftest /dev/sda  # historique des auto-tests
```

## Exemple de configuration

```
# /etc/smartd.conf — surveiller tous les disques, mail en cas d'anomalie, test hebdomadaire
DEVICESCAN -a -o on -S on -n standby -s (S/../.././02|L/../../6/03) -m admin@exemple.fr -M exec /usr/share/smartmontools/smartd-runner
```

`-a` : surveille tous les attributs. `-o on -S on` : active l'Offline Testing et l'Attribute Autosave. `-s` : planifie un test court quotidien à 2h et un test long le samedi à 3h.

## Sécurisation

- Ce n'est pas un service de sécurité réseau, mais de **fiabilité** : configurer une alerte mail/webhook (`-m`) est le point le plus important — un disque qui dégrade silencieusement est un risque de perte de données.
- Surveiller particulièrement les attributs `Reallocated_Sector_Ct`, `Current_Pending_Sector` et `Reported_Uncorrect` : leur augmentation est le signal précurseur le plus fiable de panne.
- Sur SSD, ajuster les seuils (les attributs SMART SSD diffèrent des HDD — usure de cellules `Wear_Leveling_Count`, `Media_Wearout_Indicator`).

## Logs & dépannage

```bash
journalctl -u smartd
tail -f /var/log/syslog | grep smartd    # selon la distribution
smartctl -x /dev/sda                     # diagnostic étendu si un test échoue
```

## Voir aussi

- [mdmonitor](./035-mdmonitor.md) et [lvm2-monitor](./036-lvm2-monitor.md) — surveillance complémentaire au niveau RAID/volumes
