---
id: 01-retro-ingenierie-materielle
title: Rétro-ingénierie matérielle
sidebar_position: 1
tags: [hardware, cybersecurite, reverse-engineering]
---

# Rétro-ingénierie matérielle

> Comprendre le fonctionnement d'un appareil sans documentation — pour de l'analyse de sécurité, de la réparation, ou simplement la curiosité. Ce cours prolonge côté matériel la [rétro-ingénierie logicielle](../../Cybersecurity/15-Reverse-Engineering/index.md) déjà abordée côté Cybersecurity, et s'appuie sur les protocoles vus en [Embedded](../15-Embedded/index.md) (UART, I²C, SPI).

> ⚠️ Comme pour toute activité de sécurité offensive, la rétro-ingénierie matérielle doit se pratiquer sur du matériel qu'on possède ou avec une autorisation explicite — démonter/analyser un appareil tiers sans droit peut poser des problèmes légaux selon le contexte (garantie, propriété intellectuelle, réglementation locale).

## Identifier les composants d'un circuit imprimé

La première étape face à un circuit inconnu : identifier visuellement ses puces principales.

```text
   Repérer sur une carte électronique :
   - Le plus gros circuit intégré (souvent le CPU/SoC principal ou le
     microcontrôleur)
   - Les puces mémoire (souvent plus petites, à proximité du CPU)
   - Les connecteurs non peuplés / pads de test (souvent des interfaces
     de debug laissées par le fabricant)
   - Le régulateur de tension (près de l'alimentation, dissipe souvent
     un peu de chaleur)
```

Le numéro imprimé sur chaque puce (*part number*) permet généralement de retrouver sa **datasheet** (documentation technique officielle du fabricant) via une simple recherche — la datasheet précise le brochage exact, indispensable pour la suite.

## Identifier les interfaces de debug

Les fabricants laissent souvent des interfaces de développement/debug sur la carte finale, parfois désactivées logiciellement mais physiquement présentes :

- **UART** : recherché en priorité — souvent 3-4 broches (VCC, GND, TX, RX) non peuplées ou sous forme de pads de test, donne fréquemment accès à une console de démarrage voire un shell.
- **JTAG** : interface de debug standardisée (test et programmation), permettant potentiellement un contrôle total du processeur (lecture/écriture mémoire, contrôle d'exécution pas à pas) — la cible la plus intéressante mais aussi souvent la mieux protégée.
- **SWD** (Serial Wire Debug) : variante ARM de JTAG, seulement 2 fils au lieu des 4-5 de JTAG classique.

```bash
# Une fois les broches UART identifiées, s'y connecter via un adaptateur USB-série
screen /dev/ttyUSB0 115200        # 115200 bauds est une vitesse UART très courante,
                                    # à ajuster selon le matériel (souvent visible dans
                                    # les logs de boot si accessible)
```

## Outils matériels de base

| Outil | Usage |
|---|---|
| **Multimètre** | Vérifier continuité, tension, identifier VCC/GND sur des pads non documentés |
| **Adaptateur UART-USB** (ex: FTDI, CP2102) | Se connecter à une interface UART découverte |
| **Programmateur JTAG/SWD** (ex: J-Link, ST-Link, Bus Pirate) | Interagir avec une interface JTAG/SWD |
| **Analyseur logique** | Capturer et décoder le trafic sur un bus (I²C, SPI, UART) en observant les signaux réels dans le temps |
| **Fer à dessouder / station à air chaud** | Retirer une puce pour l'analyser séparément (ex : extraire une puce mémoire flash) |

## Analyser un bus avec un analyseur logique

Un **analyseur logique** capture l'état de plusieurs broches numériques dans le temps, et le logiciel associé peut ensuite **décoder** automatiquement des protocoles standards (UART, I²C, SPI) en messages lisibles — bien plus rapide que d'interpréter manuellement des chronogrammes bruts, et une étape quasi incontournable dès qu'un protocole n'est pas encore identifié avec certitude.

## Extraire le firmware

Plusieurs approches selon le type de mémoire et la protection en place :

- **Lecture directe de la puce flash** : si la mémoire est une puce externe standard (souvent en boîtier SOIC ou similaire), la dessouder et la lire avec un programmateur dédié donne un accès complet et fiable au contenu.
- **Via JTAG/SWD** : si le processeur le permet et que la protection en lecture (*read-out protection*) n'est pas activée, dumper directement la mémoire interne du microcontrôleur.
- **Via une mise à jour officielle** : souvent la méthode la plus simple quand elle existe — le fabricant distribue parfois le firmware complet dans un fichier de mise à jour téléchargeable, sans manipulation matérielle nécessaire.

Une fois le firmware extrait, l'analyse rejoint la [rétro-ingénierie logicielle](../../Cybersecurity/15-Reverse-Engineering/index.md) classique (désassemblage, analyse statique/dynamique) — avec la difficulté supplémentaire de devoir souvent identifier soi-même l'architecture du processeur cible pour configurer correctement l'outil de désassemblage.

## Protections rencontrées côté fabricant

- **Read-out protection (RDP)** : empêche la lecture de la mémoire interne d'un microcontrôleur via JTAG/SWD une fois activée en production.
- **Puces "epoxy blob"** : la puce est noyée dans une résine opaque directement sur le circuit, rendant l'identification visuelle et le dessoudage bien plus difficiles.
- **Marquages effacés** : certains fabricants poncent ou masquent intentionnellement les références des puces pour compliquer l'identification.

## Ce qu'il faut retenir

- Identifier d'abord visuellement les puces principales et chercher leur **datasheet** via leur *part number* — la base de toute analyse ultérieure.
- **UART** (simple, souvent accessible), **JTAG/SWD** (accès profond, souvent protégé) sont les interfaces de debug à rechercher en priorité.
- Un **analyseur logique** est l'outil le plus rentable pour identifier et décoder un protocole (UART/I²C/SPI) inconnu sur un circuit.
- L'extraction du firmware peut passer par la puce flash directement, JTAG/SWD, ou plus simplement une mise à jour officielle téléchargeable — à privilégier quand elle existe.

## Pour aller plus loin

- [Wikipedia — JTAG](https://en.wikipedia.org/wiki/JTAG)
- [Hackaday](https://hackaday.com/) — une immense base d'articles de rétro-ingénierie matérielle documentés par la communauté.
- Voir aussi [Rétro-ingénierie (logicielle)](../../Cybersecurity/15-Reverse-Engineering/index.md) et [Systèmes embarqués](../15-Embedded/index.md) sur ce site.
