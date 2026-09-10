---
id: 03-sauvegarde-diagnostic
title: "Gestion des fichiers de configuration et diagnostic"
sidebar_position: 3
tags: [reseau, cheatsheet]
---

# Gestion des fichiers de configuration et diagnostic

> Comprendre où vit la configuration (RAM vs NVRAM vs serveur externe) et disposer d'une méthode de diagnostic structurée sont indispensables en exploitation quotidienne.

## Les emplacements de configuration et d'image IOS

```text
   ┌──────────────────────────────────────────────────────────┐
   │  RAM  (volatile)                                            │
   │  → running-config (config ACTIVE, perdue si coupure         │
   │    d'alimentation sans sauvegarde)                          │
   ├──────────────────────────────────────────────────────────┤
   │  NVRAM (non-volatile)                                       │
   │  → startup-config (config chargée au démarrage)             │
   ├──────────────────────────────────────────────────────────┤
   │  FLASH (non-volatile, plus grande capacité)                 │
   │  → image(s) IOS (le système d'exploitation lui-même)        │
   ├──────────────────────────────────────────────────────────┤
   │  TFTP / serveur externe                                     │
   │  → sauvegardes distantes, mise à jour d'image IOS            │
   └──────────────────────────────────────────────────────────┘
```

## Commandes de sauvegarde et restauration

```bash
! Sauvegarder la config active vers la NVRAM (persistance locale)
R1# copy running-config startup-config

! Sauvegarder vers un serveur TFTP distant
R1# copy running-config tftp
Address or name of remote host []? 192.168.1.100
Destination filename [r1-confg]?

! Restaurer une config depuis TFTP (fusionne avec la running-config actuelle)
R1# copy tftp running-config

! Revenir à la configuration d'usine (efface la startup-config)
R1# erase startup-config
R1# reload

! Copier/mettre à jour une image IOS depuis TFTP
R1# copy tftp flash
```

`copy X running-config` **fusionne** (merge) la source avec la configuration active — cela n'écrase pas ce qui n'est pas présent dans le fichier source, contrairement à une restauration complète après `erase` + `reload`.

## Registre de configuration (recovery de mot de passe)

```bash
R1# show version | include configuration register
Configuration register is 0x2102     ! valeur normale (démarre sur startup-config)
```

En cas de mot de passe enable perdu, la procédure classique consiste à redémarrer en mode ROMMON, positionner le registre à `0x2142` (ignore la startup-config au boot), réinitialiser le mot de passe, puis repositionner le registre à `0x2102` — procédure de récupération physique nécessitant un accès console.

## Méthodologie de diagnostic (approche par couches OSI)

```text
   1. COUCHE PHYSIQUE
      show interfaces          → état up/down, erreurs, duplex/vitesse
      Câble branché ? LED du port ?

   2. COUCHE LIAISON / IP LOCAL
      show ip interface brief  → Status/Protocol par interface
      show arp / show ipv6 neighbors → résolution d'adresse OK ?

   3. COUCHE RÉSEAU (routage)
      show ip route             → route présente vers la destination ?
      ping <gateway>             → passerelle joignable ?
      ping <destination>         → destination finale joignable ?

   4. CHEMIN COMPLET
      traceroute <destination>   → identifie le saut où ça bloque

   5. COUCHE APPLICATIVE
      telnet <ip> <port>          → le service écoute-t-il sur le port attendu ?
```

## Commandes de diagnostic complémentaires

```bash
R1# show tech-support            ! rapport complet (toutes les infos utiles à un support Cisco)
R1# show logging                 ! journal des événements/erreurs système
R1# debug ip icmp                ! debug en temps réel (à utiliser avec parcimonie en prod, charge CPU)
R1# undebug all                  ! désactive tous les debugs actifs (raccourci: u all)
R1# show processes cpu sorted    ! identifie un processus consommant trop de CPU
```

**Attention avec `debug`** : contrairement à `show`, `debug` génère un flux continu d'événements en temps réel et peut saturer le CPU d'un équipement en production — toujours penser à `undebug all` après usage, et éviter les debugs verbeux sur un équipement chargé en heures de pointe.

## Ce qu'il faut retenir

- **RAM** = running-config (active, volatile), **NVRAM** = startup-config (persistante), **Flash** = image(s) IOS.
- `copy running-config startup-config` sauvegarde ; `copy X running-config` **fusionne** (ne remplace pas).
- Diagnostic structuré : physique (`show interfaces`) → liaison/ARP → routage (`show ip route`, `ping`) → chemin complet (`traceroute`) → applicatif.
- `debug` est puissant mais coûteux en CPU — toujours penser à `undebug all` après diagnostic.

## Pour aller plus loin

- [Cisco — Using the debug Command](https://www.cisco.com/c/en/us/support/docs/dial-access/integrated-services-digital-networks-isdn-channel-associated-signaling-cas/10374-debug.html)
- [Cisco — Password Recovery Procedures](https://www.cisco.com/c/en/us/support/docs/routers/10000-series-routers/6130-pswdrec-6100.html)
