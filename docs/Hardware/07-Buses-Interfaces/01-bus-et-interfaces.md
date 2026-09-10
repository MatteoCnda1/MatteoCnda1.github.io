---
id: 01-bus-et-interfaces
title: Bus & Interfaces
sidebar_position: 1
tags: [hardware]
---

# Bus & Interfaces

> Un bus est un canal partagé qui relie plusieurs composants pour échanger des données. Ce cours couvre les interfaces principales d'un PC moderne : **PCIe** (composants internes), **SATA** (stockage historique), **USB** et **Thunderbolt** (périphériques externes).

## Bus série vs bus parallèle

```text
   Bus parallèle (ancien)                Bus série (moderne)

   Plusieurs fils, 1 bit par fil,        1 (ou quelques) fil(s) très rapide(s),
   tous en même temps                     bits envoyés les uns après les autres,
                                           mais à très haute fréquence

   ────────────────                       ──▶ bit bit bit bit bit bit...
   ────────────────    (8, 16, 32 fils)   (mais à une fréquence bien plus élevée
   ────────────────                        que chaque fil du parallèle)
   ────────────────
```

Contre-intuitivement, les interfaces modernes (PCIe, SATA, USB 3+) sont **série**, pas parallèles. À très haute fréquence, synchroniser plusieurs fils parallèles entre eux (éviter que les bits n'arrivent pas exactement en même temps, un phénomène appelé *skew*) devient un problème majeur — un lien série unique, poussé à très haute fréquence, l'évite et se révèle en pratique plus rapide et plus simple à faire évoluer. C'est pourquoi l'ancien bus IDE/PATA (parallèle) a cédé la place à SATA (série), et pourquoi PCIe (série, en "lignes" multiples indépendantes) a remplacé l'ancien PCI (parallèle).

## PCIe (PCI Express) : le bus interne principal

```text
   CPU
    │
    ├── Slot PCIe x16 ──── GPU (voir cours GPU)
    ├── Slot/M.2 PCIe x4 ── SSD NVMe (voir cours Storage)
    └── (via chipset) ──── autres slots PCIe, cartes réseau, etc.
```

PCIe fonctionne par **lignes (lanes)** indépendantes, chacune étant elle-même un lien série bidirectionnel. Un slot "x16" a 16 lignes câblées, un "x4" en a 4 — plus de lignes, plus de bande passante potentielle. Chaque génération PCIe double environ la bande passante par ligne par rapport à la précédente (PCIe 3.0 → 4.0 → 5.0 → 6.0), sans changer physiquement les slots.

| Génération | Débit approx. par ligne (x1) |
|---|---|
| PCIe 3.0 | ~1 Go/s |
| PCIe 4.0 | ~2 Go/s |
| PCIe 5.0 | ~4 Go/s |

Une carte PCIe est généralement **rétrocompatible** : une carte PCIe 3.0 fonctionne dans un slot PCIe 5.0 (à la vitesse du plus lent des deux), et inversement une carte PCIe 5.0 fonctionne dans un slot PCIe 3.0, mais plafonnée au débit de ce dernier.

## SATA : l'interface de stockage historique

Voir le cours [Storage](../05-Storage/index.md) pour la comparaison détaillée SATA vs NVMe. Techniquement, SATA (Serial ATA, depuis 2003) a remplacé le PATA/IDE parallèle avec un câble plus fin, un débit supérieur, et le support du branchement à chaud (*hot-plug*). Plafonné à environ 600 Mo/s (SATA III), largement suffisant pour un HDD mais devenu le facteur limitant pour un SSD.

## USB : la famille la plus déroutante en nommage

```text
   USB 2.0            ~480 Mbit/s (~60 Mo/s)
   USB 3.0 / 3.1 Gen1 / 3.2 Gen1x1   → tous le MÊME standard, 5 Gbit/s, renommé plusieurs fois
   USB 3.1 Gen2 / 3.2 Gen2x1          → 10 Gbit/s
   USB 3.2 Gen2x2                      → 20 Gbit/s
   USB4                                  → 20 ou 40 Gbit/s selon implémentation, basé sur
                                           le protocole Thunderbolt 3
```

Le consortium USB a renommé les mêmes standards plusieurs fois au fil des ans à des fins marketing, rendant les étiquettes réellement confuses — en pratique, le débit réel annoncé en Gbit/s (5, 10, 20, 40) est plus fiable à vérifier que le simple numéro de version.

**USB-C** est un connecteur **physique** (réversible), pas un standard de débit en soi — un port USB-C peut transporter de l'USB 2.0 aussi bien que de l'USB4, selon ce qui a été implémenté derrière. USB-C supporte aussi le **Power Delivery** (charge jusqu'à 240 W) et le mode alternatif **DisplayPort** (vidéo) sur le même câble.

## Thunderbolt : au-delà de l'USB

Développé par Intel (avec Apple), **Thunderbolt** utilise le même connecteur physique USB-C mais transporte en réalité du **PCIe** et du **DisplayPort** directement, en plus de l'USB. Concrètement, un port Thunderbolt permet de connecter un GPU externe (eGPU) ou un boîtier de stockage NVMe externe avec des performances proches d'une connexion PCIe interne — impossible avec de l'USB classique, même à débit annoncé équivalent, car l'USB ne transporte pas nativement le protocole PCIe. Depuis Thunderbolt 3, la spécification a été donnée à titre gratuit au consortium USB, formant la base d'**USB4**.

## Ce qu'il faut retenir

- Les interfaces modernes privilégient un lien **série** à haute fréquence plutôt qu'un bus parallèle, pour éviter les problèmes de synchronisation entre fils.
- **PCIe** (par lignes) relie GPU, SSD NVMe et cartes d'extension directement au CPU ou via le chipset ; chaque génération double environ la bande passante par ligne.
- Le nommage **USB** est historiquement confus — se fier au débit en Gbit/s annoncé plutôt qu'au numéro de version.
- **Thunderbolt** transporte du PCIe natif sur un connecteur USB-C, permettant des usages (eGPU, stockage externe très rapide) hors de portée de l'USB classique.

## Pour aller plus loin

- [Wikipedia — PCI Express](https://en.wikipedia.org/wiki/PCI_Express)
- [Wikipedia — USB](https://en.wikipedia.org/wiki/USB)
- [Wikipedia — Thunderbolt (interface)](https://en.wikipedia.org/wiki/Thunderbolt_(interface))
