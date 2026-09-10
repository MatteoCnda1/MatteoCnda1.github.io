---
id: 01-cpu
title: CPU — Processeur
sidebar_position: 1
tags: [hardware]
---

# CPU — Processeur

> Le CPU (Central Processing Unit) exécute le cycle fetch-decode-execute vu dans le cours [Architecture de Von Neumann](../01-Computer-Architecture/01-architecture-von-neumann.md). Sa performance dépend de bien plus que sa "vitesse" affichée en GHz — architecture des cœurs, caches, jeu d'instructions.

## Anatomie d'un CPU moderne

```text
   ┌──────────────────────────────────────────────────┐
   │                        CPU                           │
   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
   │  │  Cœur 1   │  │  Cœur 2   │  │  Cœur 3   │  │  Cœur 4   │ │
   │  │ ┌───┐┌───┐│  │ ┌───┐┌───┐│  │ ┌───┐┌───┐│  │ ┌───┐┌───┐│ │
   │  │ │L1I││L1D││  │ │L1I││L1D││  │ │L1I││L1D││  │ │L1I││L1D││ │
   │  │ └───┘└───┘│  │ └───┘└───┘│  │ └───┘└───┘│  │ └───┘└───┘│ │
   │  │    L2      │  │    L2      │  │    L2      │  │    L2      │ │
   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │
   │  ┌──────────────────────────────────────────────┐  │
   │  │             L3 (partagé entre les cœurs)          │  │
   │  └──────────────────────────────────────────────┘  │
   │            Contrôleur mémoire + I/O intégrés          │
   └──────────────────────┬───────────────────────────┘
                            │
                            ▼
                      RAM (hors du CPU)
```

## La hiérarchie de cache : pourquoi

Comme vu dans le cours d'architecture, accéder à la RAM coûte cher en temps (des dizaines voire centaines de cycles CPU). Les caches (mémoire très rapide mais minuscule, directement sur la puce) exploitent le principe de **localité** — les données/instructions utilisées récemment (ou proches de celles utilisées récemment) ont de fortes chances d'être réutilisées bientôt.

| Niveau | Taille typique | Vitesse | Portée |
|---|---|---|---|
| **L1** (I + D, séparés) | 32-64 Ko par cœur | La plus rapide (~1-4 cycles) | Privé à chaque cœur |
| **L2** | 256 Ko - 2 Mo par cœur | Rapide (~10-20 cycles) | Privé à chaque cœur (généralement) |
| **L3** | Plusieurs Mo (partagés) | Plus lent (~30-50 cycles) | Partagé entre tous les cœurs |
| **RAM** | Plusieurs Go | Lent (~100-300 cycles) | Partagée, hors de la puce |

L1 est divisé en **L1I** (instructions) et **L1D** (données) — un vestige de l'architecture Harvard modifiée évoqué au cours précédent, pour permettre de charger une instruction et une donnée simultanément.

## Fréquence d'horloge : ce qu'elle mesure vraiment

Le GHz mesure le nombre de cycles d'horloge par seconde — mais le travail réellement effectué dépend aussi de **combien d'instructions par cycle (IPC)** le CPU peut traiter, ce qui dépend de son architecture interne. Un CPU à 3 GHz avec un meilleur IPC peut largement dépasser un CPU à 4 GHz plus ancien — c'est pourquoi comparer des CPU uniquement sur leur fréquence est trompeur depuis longtemps.

```text
   Performance ≈ Fréquence × IPC × Nombre de cœurs (utilisés efficacement)
```

## Pipeline et exécution superscalaire

```text
   Sans pipeline : une instruction complète avant de commencer la suivante

   [Fetch|Decode|Exec|Store]                              (instruction 1)
                              [Fetch|Decode|Exec|Store]     (instruction 2)

   Avec pipeline : chaque étage travaille sur une instruction différente
   simultanément

   [Fetch  ][Decode ][Exec   ][Store  ]                    (instr. 1)
           [Fetch  ][Decode ][Exec   ][Store  ]             (instr. 2)
                   [Fetch  ][Decode ][Exec   ][Store  ]      (instr. 3)
```

Un CPU **superscalaire** va plus loin : il possède plusieurs unités d'exécution et peut lancer **plusieurs instructions par cycle**, à condition qu'elles soient indépendantes entre elles (pas de dépendance de données). L'**exécution dans le désordre** (*out-of-order execution*) réordonne dynamiquement les instructions pour maximiser l'occupation de ces unités, tout en garantissant que les résultats apparaissent dans le bon ordre logique.

## SMT / Hyper-Threading

Le **Simultaneous Multithreading** (marque Intel : Hyper-Threading) fait apparaître un cœur physique comme **deux cœurs logiques** au système d'exploitation. Le cœur physique ne double pas ses unités de calcul — il exploite mieux les cycles où une unité serait sinon inoccupée, en exécutant des instructions de deux threads entrelacées. Gain réel généralement de 15-30%, pas un doublement de performance.

## Jeux d'instructions : x86-64, ARM, RISC-V

| Jeu d'instructions | Philosophie | Où on le trouve |
|---|---|---|
| **x86-64** (CISC) | Instructions complexes, nombreuses, variables en taille | PC, la plupart des serveurs |
| **ARM** (RISC) | Instructions simples, taille fixe, plus économes en énergie | Smartphones, Apple Silicon, de plus en plus de serveurs |
| **RISC-V** (RISC) | Comme ARM, mais **ouvert et libre de droits** (pas de licence à payer) | Microcontrôleurs, recherche, adoption croissante |

**CISC** (Complex Instruction Set Computer) privilégie des instructions riches qui font beaucoup en une seule fois ; **RISC** (Reduced Instruction Set Computer) privilégie des instructions simples et uniformes, plus faciles à faire exécuter très vite et efficacement en énergie — un facteur clé de l'avantage historique d'ARM en autonomie sur mobile.

## Multi-cœurs et types de cœurs hétérogènes

Depuis quelques années, beaucoup de CPU combinent des cœurs de **performance** (rapides, gourmands) et des cœurs d'**efficacité** (plus lents, économes) sur la même puce — approche popularisée par ARM (*big.LITTLE*) puis adoptée côté x86. L'OS répartit les tâches selon leurs besoins : tâches de fond sur les cœurs efficaces, tâches exigeantes sur les cœurs de performance.

## Inspecter son CPU sous Linux

```bash
lscpu                          # architecture, nombre de cœurs, fréquence, caches
cat /proc/cpuinfo               # détail par cœur logique
nproc                           # nombre de cœurs logiques disponibles
watch -n1 "grep MHz /proc/cpuinfo"   # fréquence en temps réel
```

## Ce qu'il faut retenir

- La performance dépend de **fréquence × IPC × cœurs exploités**, pas seulement des GHz affichés.
- La hiérarchie de cache (**L1 → L2 → L3 → RAM**) existe pour contourner le coût d'accès à la mémoire principale.
- **Pipeline**, exécution **superscalaire** et **out-of-order** permettent de traiter plusieurs instructions en parallèle au sein d'un même cœur.
- **CISC (x86-64)** vs **RISC (ARM, RISC-V)** : deux philosophies de jeu d'instructions, avec des compromis performance/énergie différents.

## Pour aller plus loin

- [Wikipedia — Central processing unit](https://en.wikipedia.org/wiki/Central_processing_unit)
- [Wikipedia — Instruction pipelining](https://en.wikipedia.org/wiki/Instruction_pipelining)
- Documentation développeur [Intel](https://www.intel.com/content/www/us/en/developer/overview.html) et [AMD](https://www.amd.com/en/developer.html) pour les architectures respectives.
