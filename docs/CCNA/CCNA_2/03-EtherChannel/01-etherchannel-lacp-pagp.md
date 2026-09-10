---
id: 01-etherchannel-lacp-pagp
title: "EtherChannel : agrégation de liens (LACP/PAgP)"
sidebar_position: 1
tags: [reseau, cheatsheet]
---

# EtherChannel : agrégation de liens (LACP/PAgP)

> **EtherChannel** regroupe **2 à 8 ports physiques** entre deux switches en un **unique lien logique**, offrant bande passante cumulée et redondance — et surtout, du point de vue de STP, ce groupe apparaît comme **un seul lien** : aucun port n'est bloqué inutilement, contrairement à des liens parallèles non agrégés.

## Pourquoi agréger plutôt que laisser STP bloquer

```text
   SANS EtherChannel                    AVEC EtherChannel

   [SW1]══(Gi0/1)══════[SW2]            [SW1]══(Po1: Gi0/1+Gi0/2+Gi0/3)══[SW2]
   [SW1]══(Gi0/2)══════[SW2]             → 1 SEUL lien logique pour STP
   [SW1]══(Gi0/3)══════[SW2]             → bande passante CUMULÉE (3x)
   (3 liens parallèles = boucle           → aucun port bloqué
    pour STP → 2 des 3 ports              → si un lien physique tombe,
    seront BLOQUÉS par STP,                 le trafic bascule sur les
    bande passante gaspillée)               autres sans convergence STP
```

C'est le cas d'usage principal : sans agrégation, des liens physiques parallèles entre deux mêmes switches sont vus par STP comme une boucle, et tous sauf un seront bloqués — gaspillant la bande passante redondante. L'EtherChannel résout ce problème en présentant les liens agrégés comme **une seule interface logique** (Port-Channel) à STP.

## Protocoles de négociation : LACP vs PAgP

| Protocole | Origine | Modes |
|---|---|---|
| **PAgP** (Port Aggregation Protocol) | Propriétaire Cisco | `desirable` (négocie activement), `auto` (répond seulement) |
| **LACP** (Link Aggregation Control Protocol) | Standard IEEE 802.3ad | `active` (négocie activement), `passive` (répond seulement) |
| **Statique (on)** | — | Aucune négociation, agrégation forcée sans vérification de compatibilité |

**LACP est recommandé** en pratique (standard multi-constructeur, interopérable). Le mode `on` (statique, sans négociation) est déconseillé car il n'y a aucune vérification que l'autre extrémité est réellement configurée en cohérence — un mismatch silencieux peut créer une boucle non détectée.

```text
   Extrémité A          Extrémité B          Résultat
   active                active/passive       EtherChannel formé (LACP)
   passive               passive               PAS d'EtherChannel (aucune négociation active)
   on                    on                    EtherChannel formé (statique, sans négociation)
   on                    active/passive        PAS d'EtherChannel (incompatible)
```

## Configuration LACP

```bash
! Sur SW1 et SW2 (configuration symétrique requise)
Switch(config)# interface range gigabitEthernet 0/1 - 3
Switch(config-if-range)# channel-group 1 mode active
Switch(config-if-range)# exit

! L'interface logique Port-Channel1 est créée automatiquement
Switch(config)# interface port-channel 1
Switch(config-if)# switchport mode trunk        ! configuration appliquée au groupe entier
Switch(config-if)# switchport trunk allowed vlan 10,20,30
```

**Important** : la configuration (mode access/trunk, VLANs autorisées, etc.) se fait normalement sur l'interface **Port-Channel** logique, qui se propage automatiquement aux ports physiques membres — configurer différemment les ports membres individuellement peut empêcher la formation du groupe (les ports membres doivent être cohérents : même vitesse, même duplex, même mode VLAN).

## Vérification

```bash
Switch# show etherchannel summary
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SU)        LACP        Gi0/1(P) Gi0/2(P) Gi0/3(P)

! Flags : S = Layer2, U = en service, P = membre agrégé (in-port-channel)

Switch# show interfaces port-channel 1
Switch# show etherchannel port-channel
```

## Répartition de charge (load balancing)

```bash
Switch(config)# port-channel load-balance src-dst-ip
! critères possibles : src-mac, dst-mac, src-dst-mac,
! src-ip, dst-ip, src-dst-ip, src-dst-port...
```

Le trafic n'est **pas** réparti trame par trame de façon aléatoire, mais selon un algorithme de hachage déterministe (basé sur les adresses/ports source-destination) qui choisit un lien physique fixe pour un même flux — garantissant l'ordre des trames pour une conversation donnée, tout en répartissant différents flux sur différents liens physiques.

## Ce qu'il faut retenir

- EtherChannel regroupe 2-8 ports physiques en **un** lien logique (Port-Channel), vu comme un seul lien par STP — élimine le blocage inutile de liens redondants parallèles.
- **LACP** (standard IEEE, `active`/`passive`) est recommandé sur **PAgP** (propriétaire Cisco) ou le mode statique `on` (sans négociation, risqué).
- La configuration se fait sur l'interface **Port-Channel** logique, propagée aux membres.
- Le load-balancing utilise un hachage déterministe (par flux, pas par trame) pour préserver l'ordre des trames.

## Pour aller plus loin

- [IEEE 802.3ad / 802.1AX — Link Aggregation](https://standards.ieee.org/ieee/802.1AX/7145/)
- [Cisco — EtherChannel Configuration Guide](https://www.cisco.com/c/en/us/support/docs/lan-switching/etherchannel/12023-4.html)
