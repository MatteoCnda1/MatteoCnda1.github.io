---
id: 01-alimentation
title: Power — Alimentation électrique
sidebar_position: 1
tags: [hardware]
---

# Power — Alimentation électrique

> L'alimentation (PSU, Power Supply Unit) convertit le courant alternatif (AC) du secteur en plusieurs tensions continues (DC) stables dont les composants ont besoin — un maillon souvent sous-estimé, dont la qualité affecte directement la stabilité de toute la machine sous charge.

## AC vers DC : le rôle fondamental de l'alimentation

```text
   Secteur (AC)              PSU (Power Supply Unit)              Composants (DC)
   220V / 50Hz     ───▶      Redressement + filtrage      ───▶    +12V  (CPU, GPU,
   (courant                  + régulation de tension                ventilateurs)
   alternatif)                                                    +5V   (certains
                                                                    contrôleurs)
                                                                   +3.3V (logique
                                                                    carte mère)
```

Le **+12V** est la tension qui alimente aujourd'hui l'essentiel de la consommation réelle (CPU, GPU) sur un PC moderne — les autres tensions (+5V, +3.3V) restent nécessaires mais représentent une part bien plus faible de la puissance totale qu'à l'époque des PC plus anciens.

## Connecteurs principaux

| Connecteur | Alimente |
|---|---|
| **24 broches (ATX)** | Carte mère (alimentation principale) |
| **4+4 ou 8 broches (EPS)** | CPU |
| **6+2 broches (PCIe)** | GPU (souvent plusieurs connecteurs sur les GPU puissants) |
| **12VHPWR / 12V-2x6** | GPU haut de gamme récents, un seul câble remplaçant plusieurs 6+2 broches |
| **SATA power** | Disques (HDD/SSD SATA) |

## Puissance : watts réels vs watts affichés

La puissance indiquée sur une alimentation (ex : "750W") est sa capacité **maximale**, pas sa consommation réelle constante. Dimensionner une alimentation consiste à additionner la consommation de tous les composants (surtout CPU et GPU, de très loin les plus gourmands) avec une marge confortable, pour rester dans la zone où l'alimentation fonctionne à son **meilleur rendement** — généralement entre 40% et 80% de sa capacité maximale, pas au ras du plafond.

## Certification 80 PLUS : mesurer le rendement

```text
   Puissance tirée du secteur (AC)  =  Puissance utile délivrée (DC)  +  Pertes (chaleur)

   Rendement = Puissance utile / Puissance tirée du secteur
```

La certification **80 PLUS** garantit qu'une alimentation atteint un rendement minimal (au moins 80%, d'où le nom) à différents niveaux de charge — avec des paliers supérieurs (Bronze, Silver, Gold, Platinum, Titanium) correspondant à des rendements croissants. Une alimentation plus efficace chauffe moins, consomme moins d'électricité pour le même travail utile, et dure généralement plus longtemps.

## Modulaire, semi-modulaire, non-modulaire

- **Non-modulaire** : tous les câbles sont fixés en permanence à l'alimentation, qu'on les utilise ou non — moins cher, mais plus de câbles inutilisés à ranger dans le boîtier.
- **Semi-modulaire** : les câbles essentiels (24 broches, EPS) sont fixes, le reste est détachable.
- **Modulaire** : tous les câbles sont détachables, on ne branche que ce dont on a besoin — meilleure gestion des câbles, coût plus élevé.

## L'onduleur (UPS) : protéger contre les coupures

Un **UPS** (Uninterruptible Power Supply) contient une batterie qui prend le relais instantanément en cas de coupure secteur, laissant le temps d'éteindre proprement la machine (souvent via un script automatique déclenché par le logiciel de l'UPS) plutôt que de subir une coupure brutale — particulièrement critique pour des serveurs ou tout système où une coupure non maîtrisée pourrait corrompre des données en cours d'écriture sur le [stockage](../05-Storage/index.md).

## Alimentation et stabilité système

Une alimentation sous-dimensionnée ou défaillante peut causer des symptômes qui ressemblent à s'y méprendre à d'autres pannes matérielles ou logicielles — redémarrages aléatoires sous charge, extinctions brutales, instabilité qui n'apparaît qu'en jeu ou sous forte charge GPU/CPU. C'est un des composants les plus sous-estimés lors d'un diagnostic de panne (voir [Hardware Diagnostics](../17-Hardware-Diagnostics/index.md)) précisément parce que ses symptômes imitent ceux d'autres composants.

## Ce qu'il faut retenir

- L'alimentation convertit l'**AC du secteur** en plusieurs tensions **DC** stables, le **+12V** portant l'essentiel de la charge sur un PC moderne.
- La puissance affichée est un **maximum**, pas une consommation réelle — viser un fonctionnement entre 40% et 80% de la capacité pour un rendement optimal.
- La certification **80 PLUS** (Bronze à Titanium) mesure le rendement, pas la puissance.
- Une alimentation défaillante ou sous-dimensionnée peut produire des symptômes trompeurs (instabilité, redémarrages) souvent attribués à tort à d'autres composants.

## Pour aller plus loin

- [Wikipedia — Power supply unit (computer)](https://en.wikipedia.org/wiki/Power_supply_unit_(computer))
- [80 PLUS — site officiel de la certification](https://www.clearesult.com/80plus/)
