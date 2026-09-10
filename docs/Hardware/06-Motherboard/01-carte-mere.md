---
id: 01-carte-mere
title: Motherboard — Carte mère
sidebar_position: 1
tags: [hardware]
---

# Motherboard — Carte mère

> La carte mère est le circuit imprimé central qui relie physiquement et électriquement tous les composants : [CPU](../02-CPU/index.md), [RAM](../04-RAM/index.md), [stockage](../05-Storage/index.md), [GPU](../03-GPU/index.md), alimentation, périphériques. C'est elle qui détermine, via son **socket** et son **chipset**, quels composants sont compatibles entre eux.

## Les éléments clés d'une carte mère

```text
   ┌─────────────────────────────────────────────────────┐
   │                                                          │
   │   ┌──────┐        ┌───────────────────┐               │
   │   │Socket  │        │  Slots RAM (2 ou 4) │               │
   │   │ CPU    │        └───────────────────┘               │
   │   └──────┘                                              │
   │       │                                                  │
   │   ┌────────┐   Bus interne (DMI/Infinity Fabric...)      │
   │   │ Chipset  │◀───────────────────────────────────┐      │
   │   └────────┘                                       │      │
   │       │                                             │      │
   │   ┌──────────┐  ┌──────────┐  ┌──────────────┐    │      │
   │   │ Ports SATA │  │ Slots PCIe │  │ Ports USB/audio│    │      │
   │   └──────────┘  └──────────┘  └──────────────┘    │      │
   │   ┌──────────────────────────────────────┐         │      │
   │   │ Slot PCIe principal (GPU) ─── relié directement │─────┘      │
   │   │ au CPU sur les plateformes récentes                │             │
   │   └──────────────────────────────────────┘                          │
   └─────────────────────────────────────────────────────┘
```

## Le socket : ce qui détermine la compatibilité CPU

Le **socket** est le connecteur physique qui reçoit le CPU — chaque génération/famille de processeur nécessite un socket spécifique (nombre et disposition des broches/contacts). C'est le premier critère de compatibilité : un CPU AMD AM5 ne rentre pas dans un socket Intel LGA1700, et souvent même une nouvelle génération du même fabricant change de socket, obligeant à changer de carte mère.

- **PGA** (Pin Grid Array) : les broches sont sur le CPU, qui s'insèrent dans des trous du socket — longtemps utilisé par AMD.
- **LGA** (Land Grid Array) : les broches sont sur la carte mère, le CPU a des contacts plats — utilisé par Intel, et adopté par AMD depuis le socket AM5.

## Le chipset : le chef d'orchestre des connexions

Le **chipset** gère les connexions entre le CPU et la plupart des périphériques (ports SATA, USB, slots PCIe secondaires) — il détermine combien de ports et de fonctionnalités sont disponibles, et souvent aussi certaines capacités haut de gamme (overclocking, nombre de lignes PCIe supplémentaires). Sur les plateformes modernes, le CPU intègre lui-même directement le contrôleur mémoire et les lignes PCIe principales (pour le GPU et un SSD NVMe) — le chipset se charge du reste.

## Formats (form factors)

| Format | Dimensions approximatives | Usage typique |
|---|---|---|
| **E-ATX** | 305 × 330 mm | Stations de travail, multi-GPU |
| **ATX** | 305 × 244 mm | Le format standard le plus courant |
| **Micro-ATX (mATX)** | 244 × 244 mm | Compact, moins de slots d'extension |
| **Mini-ITX** | 170 × 170 mm | Boîtiers très compacts, un seul slot PCIe |

Le format doit être compatible avec le [boîtier](../11-Cooling/index.md) et impacte directement le nombre de slots RAM, PCIe et de ports disponibles — un compromis taille/extensibilité.

## Les slots d'extension : PCIe

Voir le cours [Buses & Interfaces](../07-Buses-Interfaces/index.md) pour le détail du protocole PCIe lui-même. Côté carte mère, les slots PCIe se déclinent en tailles physiques (x1, x4, x8, x16) qui déterminent combien de "lignes" (voies de données parallèles) sont câblées — plus il y a de lignes, plus la bande passante potentielle est élevée. Le slot principal (x16, pour le GPU) est généralement relié **directement** au CPU pour la latence la plus faible ; les slots secondaires passent souvent par le chipset.

## Le BIOS/UEFI : le firmware de la carte mère

Une puce mémoire sur la carte mère contient le micrologiciel qui démarre la machine avant même le système d'exploitation, configure les paramètres bas niveau (fréquences, ordre de démarrage, virtualisation) — voir le cours dédié [Firmware](../12-Firmware/index.md) pour le détail BIOS vs UEFI.

## Alimentation de la carte mère elle-même

Au-delà de fournir de l'énergie au CPU/GPU/stockage, la carte mère régule elle-même la tension pour le CPU via des circuits appelés **VRM** (Voltage Regulator Module) — leur qualité et leur refroidissement influencent directement la stabilité en charge soutenue ou en overclocking. Voir le cours [Power](../10-Power/index.md) pour les connecteurs d'alimentation (24 broches, EPS 8 broches...).

## Inspecter sa carte mère sous Linux

```bash
sudo dmidecode -t baseboard      # fabricant, modèle de la carte mère
sudo dmidecode -t bios            # version et date du BIOS/UEFI
lspci                             # périphériques connectés via PCIe, gérés par le chipset
```

## Ce qu'il faut retenir

- Le **socket** détermine la compatibilité CPU ; le **chipset** gère la majorité des connexions vers les périphériques.
- Le **format** (ATX, mATX, Mini-ITX...) est un compromis entre taille et nombre de slots/ports disponibles.
- Les lignes **PCIe** du slot principal sont généralement câblées directement au CPU pour la latence minimale (GPU, SSD NVMe rapide).
- La carte mère héberge le **firmware BIOS/UEFI** et régule elle-même la tension du CPU via ses **VRM**.

## Pour aller plus loin

- [Wikipedia — Motherboard](https://en.wikipedia.org/wiki/Motherboard)
- [Wikipedia — Chipset](https://en.wikipedia.org/wiki/Chipset)
