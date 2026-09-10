---
id: 02-modeles-osi-tcpip
title: "Modèles OSI et TCP/IP, encapsulation, PDU"
sidebar_position: 2
tags: [reseau]
---

# Modèles OSI et TCP/IP, encapsulation, PDU

> Les modèles **OSI** (théorique, 7 couches, ISO) et **TCP/IP** (pratique, 4 couches, celui réellement implémenté sur Internet) découpent la communication réseau en couches indépendantes, chacune avec un rôle précis. Ce découpage permet l'interopérabilité entre constructeurs et facilite le dépannage (isoler le problème par couche).

## Les deux modèles côte à côte

```text
   OSI (7 couches)              TCP/IP (4 couches)         PDU / Exemple

   7. Application   ┐
   6. Présentation  ├──────────  4. Application     ────  Data (HTTP, DNS, SSH)
   5. Session       ┘

   4. Transport      ─────────  3. Transport        ────  Segment (TCP) /
                                                            Datagramme (UDP)

   3. Réseau          ─────────  2. Internet         ────  Paquet (IP)

   2. Liaison de      ┐
      données         ├──────  1. Accès réseau      ────  Trame (Ethernet)
   1. Physique        ┘                                    Bits (signaux)
```

| # OSI | Couche | Rôle | Unité de données (PDU) | Exemples |
|---|---|---|---|---|
| 7 | Application | Interface avec l'utilisateur/l'appli | Données | HTTP, DNS, DHCP, SSH, FTP |
| 6 | Présentation | Format, chiffrement, compression | Données | SSL/TLS, JPEG, ASCII |
| 5 | Session | Établissement/maintien de sessions | Données | NetBIOS, RPC |
| 4 | Transport | Livraison bout-en-bout, ports | Segment/Datagramme | TCP, UDP |
| 3 | Réseau | Adressage logique, routage | Paquet | IP, ICMP, OSPF |
| 2 | Liaison de données | Adressage physique local, trames | Trame | Ethernet, ARP, PPP |
| 1 | Physique | Transmission des bits (signal) | Bits | Câble cuivre, fibre, Wi-Fi |

Le modèle **TCP/IP** est celui réellement utilisé (piles de protocoles Internet) ; le modèle **OSI** reste la référence pédagogique et de dépannage car il détaille davantage les couches hautes (5/6/7 fusionnées en une seule couche Application côté TCP/IP).

## Encapsulation et décapsulation

```text
   ÉMETTEUR (encapsulation, du haut vers le bas)

   Données applicatives
        │  + en-tête Transport (port src/dst)
        ▼
   [Segment TCP/UDP]
        │  + en-tête Réseau (IP src/dst)
        ▼
   [Paquet IP]
        │  + en-tête Liaison (MAC src/dst) + queue (FCS)
        ▼
   [Trame Ethernet]
        │  conversion en signal électrique/optique/radio
        ▼
   [Bits] ───────────────────► support physique ───────────────────►

   RÉCEPTEUR (décapsulation, du bas vers le haut) : inverse exact
```

Chaque couche ajoute son propre en-tête (et parfois une queue, ex. FCS Ethernet) aux données reçues de la couche supérieure, sans en modifier le contenu — c'est le principe d'**encapsulation**. Le récepteur retire ces en-têtes couche par couche (**décapsulation**) pour reconstituer les données d'origine.

## PDU (Protocol Data Unit) à chaque couche

| Couche | Nom du PDU |
|---|---|
| Transport | Segment (TCP) / Datagramme (UDP) |
| Réseau | Paquet |
| Liaison de données | Trame |
| Physique | Bits |

Retenir la terminologie exacte est important en diagnostic réseau : on dit "capturer des **trames**" avec un analyseur au niveau 2, mais "un **paquet** IP" au niveau 3.

## Communication entre pairs (peer-to-peer logique)

Chaque couche d'un émetteur ne "dialogue" logiquement qu'avec la même couche du destinataire (ex. TCP source avec TCP destination), même si physiquement les données traversent toutes les couches inférieures et plusieurs équipements intermédiaires (switches, routeurs) qui, eux, ne traitent que jusqu'à leur couche de fonctionnement (un switch niveau 2 ne lit que l'en-tête Ethernet, un routeur relit jusqu'à l'en-tête IP).

## Ce qu'il faut retenir

- **OSI** = 7 couches (référence pédagogique/dépannage), **TCP/IP** = 4 couches (implémentation réelle).
- PDU par couche : **Segment/Datagramme** (Transport) → **Paquet** (Réseau) → **Trame** (Liaison) → **Bits** (Physique).
- **Encapsulation** : ajout d'en-têtes en descendant les couches à l'émission ; **décapsulation** : retrait en remontant à la réception.
- Un switch traite jusqu'à la couche 2, un routeur jusqu'à la couche 3 — comprendre à quelle couche un équipement "regarde" les données est la clé du dépannage réseau.

## Pour aller plus loin

- [RFC 1122 — Requirements for Internet Hosts](https://www.rfc-editor.org/rfc/rfc1122)
- [Wikipedia — Modèle OSI](https://fr.wikipedia.org/wiki/Mod%C3%A8le_OSI)
