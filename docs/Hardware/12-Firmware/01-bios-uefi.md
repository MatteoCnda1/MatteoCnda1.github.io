---
id: 01-bios-uefi
title: Firmware — BIOS & UEFI
sidebar_position: 1
tags: [hardware, linux]
---

# Firmware — BIOS & UEFI

> Le firmware d'une carte mère est le tout premier code exécuté à la mise sous tension, avant même le système d'exploitation — il initialise le matériel de base et transmet ensuite la main au [bootloader](#le-processus-de-démarrage) de l'OS.

## BIOS vs UEFI

| | BIOS (historique) | UEFI (moderne) |
|---|---|---|
| **Année** | Depuis les années 1980 | Depuis le milieu des années 2000, standard depuis ~2012 |
| **Mode processeur** | 16 bits au démarrage | 32/64 bits directement |
| **Interface** | Texte, navigation clavier | Graphique, souris possible |
| **Taille de disque de boot** | Limité à 2,2 To (partitionnement MBR) | Pas de limite pratique (partitionnement GPT) |
| **Sécurité** | Aucune vérification du bootloader | **Secure Boot** (voir [Hardware Security](../13-Hardware-Security/index.md)) |
| **Extensibilité** | Limitée | Pilotes et applications pré-boot possibles |

En pratique aujourd'hui, presque toutes les cartes mères utilisent l'**UEFI**, souvent encore appelé "BIOS" par habitude de langage — les deux termes sont utilisés de façon interchangeable dans le langage courant, même si techniquement distincts.

## Le processus de démarrage

```text
   Mise sous tension
        │
        ▼
   POST (Power-On Self-Test)     → vérifie que le matériel de base répond
        │                          (voir Hardware Diagnostics pour les bips POST)
        ▼
   Firmware (UEFI/BIOS)          → initialise le matériel, lit sa configuration
        │
        ▼
   Recherche d'un périphérique   → selon l'ordre de démarrage configuré
   de démarrage (disque, USB,      (disque interne, clé USB, réseau PXE...)
   réseau...)
        │
        ▼
   Bootloader (GRUB, systemd-boot,  → petit programme qui charge le noyau
   Windows Boot Manager...)           du système d'exploitation en mémoire
        │
        ▼
   Noyau du système d'exploitation → prend la main, initialise pilotes,
                                       monte les systèmes de fichiers,
                                       lance le premier processus (init/systemd)
```

## Accéder au firmware

```text
   Touche typique pour entrer dans le setup UEFI/BIOS au démarrage :
   Suppr, F2, F10, F12, ou Échap selon le fabricant (indiqué brièvement
   à l'écran juste après la mise sous tension)
```

Depuis un système déjà démarré, on peut aussi demander un redémarrage direct vers l'interface UEFI (sur les systèmes qui le supportent) :

```bash
sudo systemctl reboot --firmware-setup    # Linux (systemd) : redémarre directement dans l'UEFI
```

## Ce qu'on configure dans le firmware

- **Ordre de démarrage** (boot order) : quel périphérique tenter en premier.
- **Virtualisation matérielle** : activer/désactiver Intel VT-x / AMD-V (voir [Virtualization](../14-Virtualization/index.md)) — souvent désactivée par défaut, à activer manuellement pour faire tourner des VM ou certains hyperviseurs.
- **Secure Boot** : activer/désactiver la vérification cryptographique du bootloader (voir [Hardware Security](../13-Hardware-Security/index.md)).
- **Fréquences/tensions** : pour l'overclocking de la RAM (profils XMP/EXPO) ou du CPU.
- **Ventilateurs** : courbes de vitesse selon la température, sur les cartes mères qui le permettent.

## Mettre à jour le firmware

Une mise à jour du firmware (souvent nommée simplement "mise à jour du BIOS" par habitude) corrige des bugs, ajoute la compatibilité avec de nouveaux CPU, ou corrige des failles de sécurité — mais reste une opération sensible : une coupure de courant pendant la mise à jour peut rendre la carte mère inutilisable (*"bricker"*). La plupart des cartes mères récentes proposent une mise à jour directement depuis l'interface UEFI (à partir d'une clé USB), sans avoir besoin de démarrer un système d'exploitation.

```bash
# Sous Linux, certains firmwares peuvent être mis à jour via l'outil standard fwupd
fwupdmgr get-updates
fwupdmgr update
```

## NVRAM et réinitialisation

La configuration du firmware (ordre de boot, réglages personnalisés) est stockée dans une petite mémoire non volatile sur la carte mère, alimentée en continu par une pile bouton (souvent une CR2032, visible sur la carte mère). Retirer cette pile quelques minutes (carte mère hors tension) réinitialise la configuration aux valeurs d'usine — une manipulation de dépannage classique quand un système ne démarre plus après un mauvais réglage.

## Ce qu'il faut retenir

- **UEFI** a largement remplacé le **BIOS** historique (32/64 bits natif, GPT sans limite de taille pratique, Secure Boot) — le terme "BIOS" reste utilisé par habitude même pour désigner un UEFI.
- Séquence de démarrage : **POST → firmware → bootloader → noyau de l'OS**.
- Virtualisation matérielle et Secure Boot sont souvent **désactivés par défaut** dans le firmware — à vérifier/activer selon les besoins.
- La configuration du firmware vit dans une mémoire alimentée par une **pile bouton** sur la carte mère — la retirer réinitialise les réglages aux valeurs d'usine.

## Pour aller plus loin

- [Wikipedia — Unified Extensible Firmware Interface](https://en.wikipedia.org/wiki/UEFI)
- [Wikipedia — BIOS](https://en.wikipedia.org/wiki/BIOS)
- [fwupd — mise à jour de firmware sous Linux](https://fwupd.org/)
