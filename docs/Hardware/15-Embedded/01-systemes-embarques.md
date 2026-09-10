---
id: 01-systemes-embarques
title: Systèmes embarqués
sidebar_position: 1
tags: [hardware, embarque]
---

# Systèmes embarqués

> Un système embarqué est un ordinateur dédié à **une** fonction précise, intégré dans un objet plus large (électroménager, voiture, capteur IoT) — souvent avec des contraintes fortes de coût, de consommation et de taille, absentes d'un PC classique.

## Microcontrôleur vs microprocesseur

```text
   Microprocesseur (ex: CPU d'un PC)      Microcontrôleur (MCU)

   ┌──────┐                              ┌──────────────────────┐
   │  CPU   │  seul, sur sa puce            │           CPU            │
   └──────┘                              │  ┌────┐ ┌────┐ ┌────┐│
       │  nécessite des puces              │  │RAM  │ │Flash│ │GPIO ││   tout intégré
       │  EXTERNES séparées                │  └────┘ └────┘ └────┘│   sur UNE seule
       ▼                                  │  ┌────┐ ┌────┐        │   puce
   RAM, stockage flash,                    │  │ADC  │ │Timers│       │
   contrôleurs E/S...                      │  └────┘ └────┘        │
   (sur des puces différentes)             └──────────────────────┘
```

- **Microprocesseur** (CPU d'un PC/smartphone) : ne fait que calculer, a besoin de puces externes (RAM, stockage, contrôleurs) pour former un système complet — voir [Architecture de Von Neumann](../01-Computer-Architecture/01-architecture-von-neumann.md).
- **Microcontrôleur (MCU)** : intègre CPU, RAM, mémoire flash, et souvent des périphériques (GPIO, convertisseurs analogique-numérique, timers) **sur une seule puce** — moins puissant mais bien moins cher, moins gourmand en énergie, plus simple à intégrer dans un objet compact.

## GPIO : parler au monde physique

Les broches **GPIO** (General Purpose Input/Output) sont le moyen le plus direct pour un microcontrôleur d'interagir avec l'extérieur — lire l'état d'un bouton, allumer une LED, piloter un relais. Chaque broche peut généralement être configurée en entrée (lire une tension) ou en sortie (imposer une tension), programmée depuis le code.

## Les familles de microcontrôleurs courantes

| Famille | Architecture | Écosystème typique |
|---|---|---|
| **AVR** (Atmel/Microchip) | 8 bits | Arduino Uno, très accessible aux débutants |
| **ARM Cortex-M** | 32 bits (ARM, voir [CPU](../02-CPU/index.md)) | STM32, très répandu en industrie et en prototypage sérieux |
| **ESP32/ESP8266** | 32 bits (Tensilica/RISC-V selon modèle) | Wi-Fi/Bluetooth intégré, très populaire pour l'IoT |
| **RISC-V** | 32/64 bits, jeu d'instructions ouvert | Adoption croissante, notamment via ESP32-C |

## Protocoles de communication embarqués

Un microcontrôleur communique souvent avec d'autres puces (capteurs, mémoires, autres MCU) via des bus série simples, standards du monde embarqué :

- **UART** : liaison série point à point simple (deux fils, TX/RX), utilisée aussi pour le débogage/console série.
- **I²C** : bus à deux fils, permet de chaîner plusieurs périphériques sur les mêmes lignes, chacun identifié par une adresse.
- **SPI** : bus plus rapide qu'I²C, généralement point à point ou avec une ligne de sélection dédiée par périphérique, très utilisé pour les écrans et la mémoire flash externe.

Ces trois protocoles reviennent constamment en [rétro-ingénierie matérielle](../18-Hardware-Reverse-Engineering/index.md) — repérer des broches TX/RX, SDA/SCL ou MOSI/MISO sur un circuit imprimé est souvent le premier pas pour interagir avec un appareil embarqué non documenté.

## Temps réel : une contrainte souvent critique

Beaucoup de systèmes embarqués doivent garantir qu'une réaction survienne **dans un délai maximal strict** (freinage ABS, contrôle industriel) — pas seulement "vite en moyenne". Un **RTOS** (Real-Time Operating System, comme FreeRTOS ou Zephyr) ordonnance les tâches avec des garanties de délai, contrairement à un OS grand public (Linux, Windows) optimisé pour le débit moyen plutôt que pour le pire cas.

## Linux embarqué

Pour des systèmes plus puissants qu'un simple microcontrôleur (nécessitant un vrai système de fichiers, du réseau complexe, plusieurs processus) — routeurs, caméras IP, certains objets connectés haut de gamme — on utilise souvent un **Linux embarqué**, une distribution Linux minimale adaptée à des ressources restreintes (Buildroot, Yocto Project pour la construire sur mesure), plutôt qu'un microcontrôleur nu.

## Ce qu'il faut retenir

- Un **microcontrôleur** intègre CPU + mémoire + périphériques sur une seule puce, contrairement à un microprocesseur qui nécessite des composants externes.
- **UART, I²C, SPI** sont les trois protocoles de communication embarqués les plus courants — à reconnaître visuellement et fonctionnellement.
- Un système **temps réel** garantit un délai de réaction maximal (pire cas), pas seulement une bonne moyenne — d'où l'usage de RTOS dédiés plutôt qu'un OS généraliste.
- **Linux embarqué** (Buildroot, Yocto) prend le relais des microcontrôleurs nus quand le système a besoin de plus de puissance/fonctionnalités qu'une simple MCU ne peut offrir.

## Pour aller plus loin

- [Wikipedia — Embedded system](https://en.wikipedia.org/wiki/Embedded_system)
- [Wikipedia — Microcontroller](https://en.wikipedia.org/wiki/Microcontroller)
- [Documentation STM32 (STMicroelectronics)](https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html)
- [Le Projet Yocto — documentation officielle](https://docs.yoctoproject.org/)
