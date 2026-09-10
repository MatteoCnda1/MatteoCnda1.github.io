---
id: 01-ram
title: RAM — Mémoire vive
sidebar_position: 1
tags: [hardware]
---

# RAM — Mémoire vive

> La RAM (Random Access Memory) est la mémoire de travail du système : rapide, mais **volatile** — son contenu disparaît à la coupure d'alimentation, contrairement au [stockage](../05-Storage/index.md). C'est l'espace où vivent le système d'exploitation, les programmes en cours et leurs données actives.

## RAM vs cache vs stockage

```text
   Registres CPU     ← le plus rapide, le plus petit (quelques dizaines d'octets)
        │
   Cache L1/L2/L3    ← voir cours CPU (quelques Mo, sur la puce)
        │
   RAM                ← quelques Go à quelques centaines de Go, VOLATILE
        │
   Stockage (SSD/HDD) ← le plus lent, le plus grand, PERSISTANT (voir cours Storage)
```

Plus on descend dans cette hiérarchie, plus la capacité augmente et plus la vitesse diminue — un compromis physique et économique fondamental (la mémoire rapide est bien plus chère par gigaoctet).

## DRAM : pourquoi il faut la rafraîchir

La RAM standard est de la **DRAM** (Dynamic RAM) : chaque bit est stocké comme une charge électrique dans un minuscule condensateur, qui se **décharge naturellement** en quelques millisecondes. Un circuit de **rafraîchissement** relit et réécrit donc en permanence chaque cellule, des milliers de fois par seconde, pour ne pas perdre l'information — d'où le "Dynamic" du nom, et l'un des facteurs de latence de la DRAM face à la SRAM (Static RAM, utilisée pour les caches CPU, plus rapide mais bien plus chère et moins dense).

## Les générations DDR

| Génération | Année approximative | Bande passante typique | Tension |
|---|---|---|---|
| DDR3 | 2007 | ~10-17 Go/s | 1,5 V |
| DDR4 | 2014 | ~17-25 Go/s | 1,2 V |
| DDR5 | 2020 | ~38-51 Go/s et plus | 1,1 V |

**DDR** (Double Data Rate) transfère des données sur les **deux fronts** du signal d'horloge (montant et descendant), doublant le débit à fréquence d'horloge égale par rapport à une SDR classique — le principe reste le même depuis DDR jusqu'à DDR5, chaque génération l'appliquant à des fréquences plus élevées et avec des optimisations internes supplémentaires.

## Latence (timings) : ce que les chiffres CL signifient

```text
   DDR5-6000 CL36

   6000  → fréquence effective (MT/s, millions de transferts par seconde)
   CL36  → CAS Latency : nombre de cycles d'horloge entre la demande
           d'une donnée et sa disponibilité réelle
```

À fréquence égale, un **CL plus bas = latence plus faible = plus réactif**. Mais comparer directement le CL entre générations différentes n'a pas de sens sans le rapporter à la fréquence — la latence *réelle* en nanosecondes se calcule approximativement par `(CL / fréquence) × 2000`.

## Canaux mémoire (single/dual/quad channel)

```text
   Single channel                  Dual channel

   CPU ──── 1 bus ──── barrette      CPU ─┬── bus A ── barrette 1
                                          └── bus B ── barrette 2
                                     (accès simultané aux deux,
                                      bande passante quasi doublée)
```

Utiliser deux barrettes identiques dans les bons emplacements (souvent indiqués par la couleur des slots sur la carte mère — voir [Motherboard](../06-Motherboard/index.md)) active le **dual channel** : le contrôleur mémoire peut lire/écrire sur les deux barrettes en parallèle, un gain de bande passante réel et gratuit par rapport à une seule barrette de capacité équivalente.

## ECC : détecter et corriger les erreurs

Les rayons cosmiques et le bruit électrique peuvent occasionnellement inverser un bit en mémoire (*bit flip*). La RAM **ECC** (Error-Correcting Code) ajoute des bits de contrôle qui permettent de détecter, et souvent corriger automatiquement, ces erreurs — quasi systématique sur les serveurs, rare sur le grand public (surcoût, légère perte de performance).

## Mémoire virtuelle et swap

Le système d'exploitation présente à chaque programme un espace d'adressage qui semble continu et privé (la **mémoire virtuelle**), traduit en adresses physiques réelles par l'unité de gestion mémoire du CPU (MMU). Quand la RAM physique vient à manquer, l'OS peut déplacer temporairement des pages mémoire peu utilisées vers le [stockage](../05-Storage/index.md) (le **swap**) — bien plus lent que la RAM, d'où le ralentissement caractéristique d'un système qui "swap" beaucoup.

## Inspecter sa RAM sous Linux

```bash
free -h                     # mémoire totale, utilisée, libre, swap
sudo dmidecode --type memory  # détail des barrettes : type, fréquence, fabricant
cat /proc/meminfo             # informations détaillées, format brut
vmstat 1                      # activité mémoire en temps réel (dont le swap)
```

## Ce qu'il faut retenir

- La RAM est **volatile** (DRAM, rafraîchie en continu) et se situe entre les caches CPU et le stockage persistant dans la hiérarchie mémoire.
- **DDR** double le débit en transférant sur les deux fronts d'horloge ; le **CL** mesure la latence, à comparer à fréquence égale seulement.
- Le **dual/quad channel** augmente la bande passante en accédant à plusieurs barrettes en parallèle.
- La **mémoire virtuelle** et le **swap** permettent à l'OS de gérer plus de mémoire "apparente" que de RAM physique réellement disponible, au prix d'un ralentissement si trop sollicité.

## Pour aller plus loin

- [Wikipedia — Dynamic random-access memory](https://en.wikipedia.org/wiki/Dynamic_random-access_memory)
- [Wikipedia — DDR5 SDRAM](https://en.wikipedia.org/wiki/DDR5_SDRAM)
- [JEDEC](https://www.jedec.org/) — l'organisme qui standardise les spécifications DDR.
