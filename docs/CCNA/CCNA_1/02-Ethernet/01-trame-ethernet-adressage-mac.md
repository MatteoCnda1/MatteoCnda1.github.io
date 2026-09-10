---
id: 01-trame-ethernet-adressage-mac
title: "Trame Ethernet et adressage MAC"
sidebar_position: 1
tags: [reseau]
---

# Trame Ethernet et adressage MAC

> **Ethernet** (normes IEEE 802.3) est la technologie de couche 2 dominante en LAN filaire. Elle définit le format de trame, l'adressage physique (MAC) et les règles d'accès au support.

## Format de la trame Ethernet II

```text
   ┌──────────┬──────────┬──────────┬──────┬───────────────┬─────┐
   │ Préambule│ @MAC dst │ @MAC src │ Type │ Données (payload)│ FCS │
   │  8 octets│ 6 octets │ 6 octets │2 oct.│  46–1500 octets │4 oct│
   └──────────┴──────────┴──────────┴──────┴───────────────┴─────┘

   Préambule : synchronisation horloge émetteur/récepteur
   @MAC dst/src : adresses physiques destination et source
   Type (EtherType) : identifie le protocole encapsulé
                       (0x0800 = IPv4, 0x0806 = ARP, 0x86DD = IPv6)
   Données : payload (padding ajouté si < 46 octets)
   FCS (Frame Check Sequence) : CRC pour détection d'erreur
```

- Taille de trame min. : **64 octets** (hors préambule) ; taille max. standard : **1518 octets** (MTU payload de 1500 octets + en-têtes).
- Une trame plus petite que 64 octets est un **runt** ; plus grande que 1518 (sans jumbo frame) est un **giant** — deux erreurs classiques observées avec `show interfaces`.

## Adresse MAC

```text
   Adresse MAC (48 bits = 6 octets), notée en hexadécimal :

   00:1A:2B  :  3C:4D:5E
   └───┬────┘  └───┬────┘
     OUI          Numéro de série
  (Organizationally  (attribué par le
   Unique Identifier,  constructeur)
   attribué par l'IEEE
   au constructeur)
```

- **Adresse physique**, gravée sur l'interface réseau (burned-in address), mais modifiable logiquement en mémoire (spoofing MAC possible).
- **Unique globalement** en théorie (OUI + numéro de série attribués par l'IEEE à chaque constructeur).
- Le bit le moins significatif du premier octet distingue **unicast** (0) de **multicast/broadcast** (1) ; l'adresse `FF:FF:FF:FF:FF:FF` est le broadcast de couche 2.

## Normes Ethernet courantes

| Norme | Débit | Support | Distance max |
|---|---|---|---|
| 10BASE-T | 10 Mbps | Cuivre (Cat3+) | 100 m |
| 100BASE-TX (Fast Ethernet) | 100 Mbps | Cuivre (Cat5+) | 100 m |
| 1000BASE-T (Gigabit Ethernet) | 1 Gbps | Cuivre (Cat5e+) | 100 m |
| 10GBASE-T | 10 Gbps | Cuivre (Cat6a+) | 100 m |
| 1000BASE-SX/LX | 1 Gbps | Fibre optique | 550 m – 5 km selon fibre |
| 10GBASE-SR/LR | 10 Gbps | Fibre optique | 300 m – 10 km selon fibre |

## Duplex et auto-négociation

- **Half-duplex** : transmission OU réception à un instant donné (partage du support, historique des hubs), sujet aux collisions, nécessite CSMA/CD.
- **Full-duplex** : transmission ET réception simultanées (liens point-à-point switch-hôte modernes), pas de collisions possibles.
- **Auto-négociation** (802.3u) : les deux extrémités négocient automatiquement vitesse et duplex. Un **mismatch de duplex** (une extrémité en auto, l'autre forcée en half) est une cause classique de dégradation de performance (collisions tardives, erreurs CRC) — diagnostiqué via `show interfaces` (compteurs d'erreurs).

```text
Switch# show interfaces gigabitEthernet 0/1
GigabitEthernet0/1 is up, line protocol is up
  ...
  Full-duplex, 1000Mb/s, media type is 10/100/1000BaseTX
  ...
  5 minute input rate 0 bits/sec, 0 packets/sec
  0 runts, 0 giants, 0 throttles
  0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
```

## Ce qu'il faut retenir

- Trame Ethernet II : préambule, MAC dst, MAC src, EtherType, données, FCS. Taille 64–1518 octets.
- **Adresse MAC** = 48 bits, OUI (constructeur) + numéro de série, notion d'adresse physique unique.
- **Full-duplex** élimine les collisions ; un mismatch de duplex se détecte via les compteurs d'erreurs de `show interfaces`.

## Pour aller plus loin

- [IEEE 802.3 Standard](https://standards.ieee.org/ieee/802.3/7071/)
- [Wikipedia — Ethernet](https://fr.wikipedia.org/wiki/Ethernet)
