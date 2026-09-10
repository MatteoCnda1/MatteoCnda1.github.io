---
id: 03-arp
title: "ARP : résolution d'adresse IP vers MAC"
sidebar_position: 3
tags: [reseau, cheatsheet]
---

# ARP : résolution d'adresse IP vers MAC

> **ARP** (Address Resolution Protocol, RFC 826) permet à un hôte de découvrir l'**adresse MAC** correspondant à une **adresse IP** connue sur son propre segment (même sous-réseau). Indispensable car l'encapsulation Ethernet exige une adresse MAC destination, alors que les applications ne connaissent que des adresses IP.

## Fonctionnement (requête/réponse)

```text
   PC A (192.168.1.10)                    PC B (192.168.1.20)
   veut joindre 192.168.1.20,
   ne connaît pas sa MAC

   1. ARP REQUEST (broadcast, @MAC dst = FF:FF:FF:FF:FF:FF)
      "Qui a 192.168.1.20 ? Dites-le à 192.168.1.10 (AA:AA:AA:AA:AA:AA)"
      ────────────────────────────────────────────────────►  (tous les hôtes
                                                                 du LAN reçoivent)

   2. ARP REPLY (unicast, seul PC B répond)
      "192.168.1.20 est à BB:BB:BB:BB:BB:BB"
      ◄────────────────────────────────────────────────────

   3. PC A met à jour son cache ARP : 192.168.1.20 → BB:BB:BB:BB:BB:BB
      et peut désormais encapsuler la trame Ethernet vers B
```

- La **requête** est en broadcast (tous les hôtes du LAN la reçoivent), la **réponse** est en unicast (seul l'hôte concerné répond).
- Chaque hôte maintient un **cache ARP** local avec une durée de vie limitée (quelques minutes, variable selon l'OS) pour éviter de répéter la résolution à chaque trame.

## Cas hors sous-réseau : rôle de la passerelle

Si la destination n'est pas sur le même sous-réseau, l'hôte fait une résolution ARP pour l'adresse MAC de sa **passerelle par défaut** (default gateway), pas pour la destination finale — c'est le routeur qui se chargera ensuite du routage L3 et d'une nouvelle résolution ARP sur le segment de sortie.

```text
   PC A (192.168.1.10/24) veut joindre 8.8.8.8 (hors sous-réseau)

   PC A → ARP request pour la MAC de sa gateway (192.168.1.1)
        → encapsule le paquet IP (dst=8.8.8.8) dans une trame
          dont la MAC dst = MAC du routeur (gateway)
        → le routeur décapsule, route au niveau 3, ré-encapsule
          avec une nouvelle trame vers le prochain saut
```

## Commandes IOS et hôte

```bash
! Sur un routeur/switch Cisco IOS
Router# show arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  192.168.1.1             -   aaaa.bbbb.0001  ARPA   GigabitEthernet0/0
Internet  192.168.1.10            5   aaaa.bbbb.0002  ARPA   GigabitEthernet0/0

Router(config)# arp 192.168.1.99 aaaa.bbbb.cccc arpa   ! entrée ARP statique
Router# clear arp-cache                                 ! vider le cache dynamique
```

```bash
# Sur un hôte (Linux / Windows)
$ arp -a                     # afficher le cache ARP local
$ ip neigh show               # équivalent moderne Linux (remplace arp -a)
```

## Table ARP et sécurité : ARP spoofing

Comme ARP ne dispose d'aucune authentification, un attaquant sur le même LAN peut envoyer de fausses réponses ARP (**ARP spoofing / ARP poisoning**) pour associer sa propre MAC à l'IP de la passerelle et intercepter le trafic (attaque de l'homme du milieu). Contre-mesures vues en CCNA 3 / sécurité : **Dynamic ARP Inspection (DAI)**, qui valide les réponses ARP contre une table de confiance (souvent construite via DHCP Snooping).

## Ce qu'il faut retenir

- ARP résout une **IP connue → MAC inconnue** sur le même sous-réseau ; requête en broadcast, réponse en unicast.
- Pour une destination hors sous-réseau, l'hôte résout la MAC de sa **passerelle par défaut**, pas celle de la destination finale.
- `show arp` (Cisco) / `ip neigh` (Linux) affichent le cache ; `clear arp-cache` le vide.
- ARP n'a pas d'authentification → vulnérable au **spoofing**, contré par **Dynamic ARP Inspection**.

## Pour aller plus loin

- [RFC 826 — Address Resolution Protocol](https://www.rfc-editor.org/rfc/rfc826)
- [Wikipedia — Address Resolution Protocol](https://fr.wikipedia.org/wiki/Address_Resolution_Protocol)
