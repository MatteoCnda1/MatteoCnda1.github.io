---
id: 01-architecture-von-neumann
title: Architecture de Von Neumann
sidebar_position: 1
tags: [hardware]
---

# Architecture de Von Neumann

> Presque tous les ordinateurs modernes — d'un smartphone à un supercalculateur — suivent, au fond, le même plan proposé par John von Neumann en 1945 : un processeur, une mémoire qui stocke **à la fois** les données et les instructions, et un bus qui les relie.

## Les quatre blocs fondamentaux

```text
                    ┌─────────────────────────┐
                    │           CPU              │
                    │  ┌─────┐  ┌──────────────┐ │
                    │  │ ALU  │  │  Unité de      │ │
                    │  │(calc)│  │  contrôle      │ │
                    │  └─────┘  └──────────────┘ │
                    │       Registres              │
                    └───────────┬─────────────────┘
                                │  Bus (adresses, données, contrôle)
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
      ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
      │     Mémoire      │ │  Entrées (E)    │ │  Sorties (S)    │
      │ (instructions ET │ │  clavier, souris,│ │  écran, haut-   │
      │  données)         │ │  réseau...       │ │  parleurs...    │
      └───────────────┘ └───────────────┘ └───────────────┘
```

- **CPU** (voir cours [CPU](../02-CPU/index.md)) : exécute les instructions, effectue les calculs (ALU) et pilote le déroulement (unité de contrôle).
- **Mémoire** : stocke **indifféremment** le programme (les instructions) et les données qu'il manipule — c'est la caractéristique qui définit l'architecture de Von Neumann par opposition à Harvard (voir plus bas).
- **Bus** : le ou les canaux physiques qui transportent adresses, données et signaux de contrôle entre les blocs.
- **E/S** : tout ce qui fait entrer ou sortir de l'information du système.

## Le cycle fetch-decode-execute

C'est la boucle infinie qui tourne dans un CPU, du démarrage à l'extinction :

```text
   ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
   │  FETCH     │ ──▶  │  DECODE    │ ──▶  │  EXECUTE   │ ──▶  │  STORE     │ ──┐
   │ Charger    │      │ Interpréter│      │ Effectuer  │      │ Écrire le  │   │
   │ l'instruc- │      │ l'instruc- │      │ l'opération│      │ résultat   │   │
   │ tion depuis│      │ tion (quel │      │ (calcul,   │      │ (registre/ │   │
   │ la mémoire │      │ opérande,  │      │ comparaison│      │ mémoire)   │   │
   │ (adresse   │      │ quelle     │      │ , saut...) │      │            │   │
   │ donnée par │      │ opération) │      │            │      │            │   │
   │ le Program │      │            │      │            │      │            │   │
   │ Counter)   │      │            │      │            │      │            │   │
   └──────────┘      └──────────┘      └──────────┘      └──────────┘   │
        ▲                                                                  │
        └──────────────────────────────────────────────────────────────────┘
                    (le Program Counter avance vers l'instruction suivante)
```

Le **Program Counter (PC)**, un registre spécial du CPU, pointe toujours vers la prochaine instruction à charger — un `jump`/`branch` (utilisé par les boucles et les `if`) consiste simplement à modifier directement cette adresse au lieu de la laisser avancer normalement.

## Le goulot d'étranglement de Von Neumann

Puisque instructions ET données partagent le **même bus** vers la même mémoire, le CPU ne peut techniquement récupérer qu'une seule chose à la fois — même quand il pourrait en théorie calculer plus vite. C'est le **"Von Neumann bottleneck"**, une des limites structurelles les plus citées en architecture des ordinateurs, et une des raisons pour lesquelles la hiérarchie de cache (voir [CPU](../02-CPU/index.md)) est devenue aussi critique : elle réduit le nombre d'allers-retours nécessaires vers la mémoire principale.

## Von Neumann vs Harvard

```text
   Von Neumann                          Harvard

   ┌─────┐                              ┌─────┐
   │ CPU  │                              │ CPU  │
   └──┬──┘                              └┬───┬┘
      │ UN SEUL bus                       │   │  DEUX bus séparés
      ▼                                   ▼   ▼
   ┌─────────────────┐            ┌──────────┐ ┌──────────┐
   │ Mémoire unique     │            │ Mémoire    │ │ Mémoire    │
   │ (instructions +     │            │ programme  │ │ données    │
   │  données mélangées) │            │ (lecture   │ │ (lecture/  │
   └─────────────────┘            │ seule)     │ │ écriture)  │
                                    └──────────┘ └──────────┘
```

- **Von Neumann** : une mémoire unique, plus simple et flexible (un programme peut se modifier lui-même, se charger dynamiquement...) — c'est le modèle des PC, serveurs, smartphones.
- **Harvard** (pure) : mémoire programme et mémoire données **physiquement séparées**, chacune avec son propre bus — permet de charger une instruction et une donnée **simultanément**. Utilisé dans la plupart des microcontrôleurs (voir [Embedded](../15-Embedded/index.md)) et les DSP.
- En pratique, les CPU modernes sont des **hybrides** : Von Neumann au niveau de la mémoire principale (RAM), mais avec des caches L1 séparés instructions/données (architecture "Harvard modifiée") pour limiter le goulot d'étranglement.

## Ce qu'il faut retenir

- Quatre blocs : **CPU, mémoire, bus, E/S** — la mémoire stocke indifféremment instructions et données.
- Le cycle **fetch-decode-execute** (piloté par le Program Counter) est la boucle fondamentale de tout CPU.
- Le **goulot d'étranglement de Von Neumann** (bus unique partagé) motive une bonne partie des optimisations matérielles modernes (caches, architectures hybrides).
- **Harvard** sépare physiquement mémoire programme et données — dominant dans l'embarqué, quasi absent des PC/serveurs grand public.

## Pour aller plus loin

- [Wikipedia — Von Neumann architecture](https://en.wikipedia.org/wiki/Von_Neumann_architecture)
- [Wikipedia — Harvard architecture](https://en.wikipedia.org/wiki/Harvard_architecture)
- *Computer Organization and Design*, Patterson & Hennessy — la référence académique historique du domaine.
