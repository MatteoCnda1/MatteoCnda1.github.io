---
id: 01-materiel-mobile
title: Matériel mobile
sidebar_position: 1
tags: [hardware, mobile]
---

# Matériel mobile

> Un smartphone concentre dans un boîtier de quelques millimètres d'épaisseur ce qui occupait plusieurs cartes séparées sur un PC — la clé de cette intégration : le **SoC** (System on Chip).

## Le SoC : un ordinateur entier sur une seule puce

```text
   PC (composants séparés)              Smartphone (SoC)

   ┌────┐  ┌────┐  ┌────┐              ┌──────────────────────┐
   │ CPU  │  │ GPU  │  │Modem │              │  CPU  │  GPU  │ Modem  │  │
   └────┘  └────┘  └────┘              │  NPU  │ ISP  │ Codec  │  │  TOUT sur
   Cartes/puces distinctes,             │           audio          │  │  UNE seule
   reliées par des bus                  └──────────────────────┘  puce
   (PCIe, etc.)                          + RAM souvent empilée directement
                                          dessus (Package on Package)
```

Un SoC intègre sur une même puce le [CPU](../02-CPU/index.md), le [GPU](../03-GPU/index.md), le modem cellulaire, le processeur de signal image (ISP, pour la caméra), un **NPU** (Neural Processing Unit, dédié aux calculs d'IA embarquée — reconnaissance faciale, traitement photo par IA), et souvent bien plus — une intégration extrême rendue nécessaire par les contraintes d'espace et de consommation d'un boîtier mobile.

## ARM : l'architecture dominante du mobile

Comme évoqué dans le cours [CPU](../02-CPU/index.md), l'architecture **ARM** (RISC) domine très largement le mobile face à x86 — son efficacité énergétique supérieure (instructions simples, taille fixe, moins de transistors nécessaires pour un travail équivalent) est décisive sur batterie, là où x86 privilégie historiquement la performance brute au prix d'une consommation plus élevée. Apple, Qualcomm (Snapdragon), Samsung (Exynos), MediaTek conçoivent tous des SoC basés sur des cœurs ARM (souvent leurs propres implémentations personnalisées du jeu d'instructions ARM).

## Gestion de la batterie et de l'énergie

- **Li-ion / Li-Po** : les deux technologies de batterie dominantes — la Li-Po (Lithium Polymer) offre plus de flexibilité de forme (fine, courbée), utile dans des boîtiers mobiles contraints.
- **PMIC** (Power Management IC) : puce dédiée qui régule et distribue l'alimentation aux différents blocs du SoC, souvent en ajustant dynamiquement la tension/fréquence selon la charge (*DVFS*, Dynamic Voltage and Frequency Scaling) pour économiser l'énergie quand la puissance maximale n'est pas nécessaire.
- **Charge rapide** : négociation entre le chargeur et l'appareil (via USB-C Power Delivery ou des protocoles propriétaires) pour délivrer davantage de watts en toute sécurité, généralement limitée aux premiers pourcentages de charge pour préserver la longévité de la batterie.

## Capteurs embarqués

Un smartphone moderne embarque une quantité de capteurs bien supérieure à un PC classique :

| Capteur | Mesure |
|---|---|
| **Accéléromètre** | Accélération linéaire (orientation, détection de mouvement) |
| **Gyroscope** | Rotation angulaire (stabilisation, réalité augmentée) |
| **Magnétomètre** | Champ magnétique terrestre (boussole) |
| **GPS/GNSS** | Position géographique (via signaux satellite) |
| **Capteur de proximité** | Éteint l'écran quand le téléphone est près de l'oreille |
| **Capteur de luminosité** | Ajuste automatiquement la luminosité de l'écran |

## Stockage mobile : eMMC vs UFS

Similaire en principe au [stockage](../05-Storage/index.md) d'un PC, mais dans des formats spécifiques à l'embarqué :

- **eMMC** : ancien standard, une seule file de commandes à la fois — devenu le facteur limitant sur les appareils d'entrée de gamme.
- **UFS** (Universal Flash Storage) : standard moderne, plusieurs files de commandes en parallèle (comme le NVMe côté PC), débit bien supérieur — quasi généralisé sur le milieu et haut de gamme actuel.

## Connectivité cellulaire : 4G/5G

Le **modem** intégré au SoC (ou parfois une puce séparée) gère la communication avec les antennes-relais — la 5G introduit notamment des bandes de fréquences plus élevées (*mmWave*) offrant un débit très supérieur mais une portée bien plus courte, généralement combinées à des bandes plus basses (*sub-6GHz*) pour la couverture générale.

## Ce qu'il faut retenir

- Le **SoC** intègre CPU, GPU, modem, ISP, NPU sur une seule puce — une réponse directe aux contraintes d'espace et d'énergie du mobile.
- **ARM** domine le mobile pour son efficacité énergétique, contrairement à x86 historiquement plus orienté performance brute.
- Le **PMIC** régule dynamiquement tension/fréquence (DVFS) pour économiser la batterie selon la charge réelle du moment.
- **UFS** a remplacé **eMMC** comme standard de stockage mobile performant, avec des files de commandes parallèles comparables au NVMe côté PC.

## Pour aller plus loin

- [Wikipedia — System on a chip](https://en.wikipedia.org/wiki/System_on_a_chip)
- [Wikipedia — ARM architecture family](https://en.wikipedia.org/wiki/ARM_architecture_family)
- [Wikipedia — Universal Flash Storage](https://en.wikipedia.org/wiki/Universal_Flash_Storage)
