---
id: 01-storage
title: Storage — Stockage persistant
sidebar_position: 1
tags: [hardware, stockage]
---

# Storage — Stockage persistant

> Contrairement à la [RAM](../04-RAM/index.md), le stockage conserve les données **hors tension** — c'est là que vivent le système d'exploitation, les fichiers et les bases de données entre deux démarrages. Le choix de technologie (HDD, SSD SATA, SSD NVMe) a un impact direct et souvent sous-estimé sur les performances globales d'une machine.

## HDD vs SSD : deux technologies radicalement différentes

```text
   HDD (Hard Disk Drive)                SSD (Solid State Drive)

   Plateaux magnétiques rotatifs         Puces de mémoire flash NAND
   + une tête de lecture/écriture         (pas de pièce mobile)
   qui se déplace mécaniquement

   ┌───────────────┐                    ┌───────────────┐
   │  ⊙ ⊙ ⊙  (plateaux)│                    │ ▦ ▦ ▦ ▦ ▦ ▦ ▦ ▦  │
   │   \  tête        │                    │  (puces NAND      │
   │    \  mobile      │                    │   flash)           │
   └───────────────┘                    └───────────────┘

   Latence : millisecondes                Latence : microsecondes
   (déplacement mécanique + rotation)      (accès électronique pur)
```

- **HDD** : capacité maximale par euro la plus élevée, mais lent (accès mécanique), fragile aux chocs, bruyant.
- **SSD** : accès quasi instantané, silencieux, résistant aux chocs — mais coût par gigaoctet plus élevé (l'écart s'est fortement réduit ces dernières années) et durée de vie limitée en nombre d'écritures.

## SATA vs NVMe : le vrai goulot d'étranglement

Le gain le plus spectaculaire des SSD modernes ne vient pas seulement de la flash NAND elle-même, mais de l'**interface** utilisée pour y accéder :

```text
   SSD SATA                              SSD NVMe (via PCIe)

   Interface SATA (héritée des HDD)       Interface PCIe (voir cours
   Débit plafonné à ~600 Mo/s              Buses & Interfaces),
   Protocole AHCI, pensé pour              parle directement au CPU
   des disques mécaniques lents            Débit : plusieurs Go/s
                                           Protocole NVMe, conçu
                                           spécifiquement pour la
                                           flash (files de commandes
                                           massivement parallèles)
```

Un SSD **NVMe** peut être 5 à 10 fois plus rapide qu'un SSD **SATA**, non pas parce que la mémoire flash est différente, mais parce que le protocole SATA/AHCI a été conçu à une époque où les disques étaient mécaniques et lents — il devient le facteur limitant bien avant que la flash NVMe n'atteigne ses propres limites.

## IOPS vs débit séquentiel : deux mesures différentes

- **Débit séquentiel** (Mo/s ou Go/s) : vitesse pour lire/écrire un **gros fichier continu** — pertinent pour copier une vidéo, par exemple.
- **IOPS** (Input/Output Operations Per Second) : nombre d'opérations de lecture/écriture **aléatoires** possibles par seconde, souvent sur de petits blocs — bien plus représentatif de l'usage réel d'un système (démarrer l'OS, ouvrir des applications, base de données) qui manipule en permanence de nombreux petits fichiers dispersés.

Un HDD s'effondre en IOPS aléatoires (la tête doit physiquement se déplacer à chaque accès), là où un SSD reste rapide — c'est la vraie raison pour laquelle passer d'un HDD à un SSD change radicalement la réactivité perçue d'un système, bien plus que le débit séquentiel seul ne le suggérerait.

## Comment fonctionne la mémoire flash NAND

La NAND stocke l'information sous forme de charge électrique piégée dans des cellules, organisées en **pages** (unité de lecture/écriture, quelques Ko) regroupées en **blocs** (unité d'effacement, plusieurs centaines de Ko à quelques Mo). Contrainte fondamentale : on peut **écrire** page par page, mais on ne peut **effacer** que par bloc entier — d'où la nécessité d'un algorithme interne (le *Flash Translation Layer*) qui réorganise constamment les données pour amortir l'usure et masquer cette contrainte au système d'exploitation.

- **Wear leveling** : répartit les écritures sur l'ensemble des cellules pour éviter qu'une zone s'use prématurément (chaque cellule NAND supporte un nombre fini de cycles écriture/effacement).
- **TRIM** : commande envoyée par l'OS au SSD pour signaler quels blocs ne contiennent plus de données valides, permettant au disque de les effacer en amont plutôt qu'au dernier moment.

## Systèmes de fichiers : un aperçu

Le stockage brut (secteurs/blocs) est organisé par un **système de fichiers** en fichiers et dossiers utilisables : `ext4`/`btrfs`/`XFS` sous Linux, `NTFS` sous Windows, `APFS` sous macOS. Chacun fait des compromis différents entre performance, résistance à la corruption, et fonctionnalités (snapshots, compression, checksums).

## Inspecter son stockage sous Linux

```bash
lsblk                          # lister les disques et partitions
df -h                          # espace utilisé/disponible par système de fichiers monté
sudo smartctl -a /dev/sda       # santé du disque (SMART), utile aussi bien HDD que SSD
sudo nvme smart-log /dev/nvme0  # santé spécifique à un SSD NVMe
sudo hdparm -Tt /dev/sda        # test rapide de débit (indicatif, pas un vrai benchmark)
```

## Ce qu'il faut retenir

- **HDD** (mécanique, lent, capacité/euro élevée) vs **SSD** (électronique, rapide, silencieux).
- La différence **SATA vs NVMe** vient surtout du **protocole/interface**, pas seulement de la puce flash elle-même.
- Les **IOPS** (accès aléatoires) reflètent mieux l'usage réel qu'un débit séquentiel — c'est pourquoi un SSD change autant la réactivité perçue d'un système.
- La NAND s'écrit par **page** mais s'efface par **bloc** — d'où le *wear leveling* et **TRIM**, essentiels à la longévité et aux performances d'un SSD dans le temps.

## Pour aller plus loin

- [Wikipedia — Solid-state drive](https://en.wikipedia.org/wiki/Solid-state_drive)
- [Wikipedia — NVM Express (NVMe)](https://en.wikipedia.org/wiki/NVM_Express)
- [Documentation Arch Wiki — Solid state drive](https://wiki.archlinux.org/title/Solid_state_drive) — très détaillée sur l'optimisation SSD sous Linux.
