---
id: 01-dmvpn-mpls-l3vpn-concepts
title: "DMVPN et MPLS L3VPN : concepts et architecture"
sidebar_position: 1
tags: [reseau]
---

# DMVPN et MPLS L3VPN : concepts et architecture

> Au-delà du VPN site-to-site point-à-point (IPsec classique, vu en CCNA 3), les grandes entreprises multi-sites utilisent des architectures **maillées et dynamiques** : **DMVPN** (auto-hébergé, sur Internet) ou **MPLS L3VPN** (délégué à un opérateur).

## Le problème du VPN point-à-point à grande échelle

```text
   VPN IPsec POINT-À-POINT CLASSIQUE (topologie en étoile hub-and-spoke)

   [Site A]──tunnel──┐
   [Site B]──tunnel──┼──[Site HUB]
   [Site C]──tunnel──┘

   PROBLÈME : Site A → Site B doit OBLIGATOIREMENT transiter
   par le Hub (2 sauts de tunnel), même si A et B pourraient
   communiquer directement — chaque nouveau site nécessite en
   plus une configuration MANUELLE d'un tunnel supplémentaire
   sur TOUS les routeurs existants (N sites = jusqu'à N×(N-1)/2
   tunnels à maintenir pour un maillage complet statique)
```

## DMVPN : tunnels dynamiques à la demande

```text
   DMVPN (Dynamic Multipoint VPN) combine trois technologies :

   mGRE (Multipoint GRE)  : UNE SEULE interface tunnel logique
                              sur le HUB peut parler à TOUS les
                              spokes, sans configurer un tunnel
                              GRE distinct par spoke

   NHRP (Next Hop         : les spokes s'ENREGISTRENT auprès du
   Resolution Protocol)     hub (leur IP publique réelle ↔ leur
                             IP de tunnel) — permet ensuite à un
                             spoke de RÉSOUDRE dynamiquement
                             l'IP publique d'un AUTRE spoke pour
                             établir un tunnel DIRECT

   IPsec                  : chiffre le trafic à travers les
                             tunnels GRE ainsi établis
```

```text
   PHASE 1 : Hub-and-spoke pur (comme le VPN classique)
   PHASE 2/3 : Tunnels SPOKE-TO-SPOKE DYNAMIQUES

   [Site A]────────┐
                     │  (tunnel direct A↔B établi
                     │   DYNAMIQUEMENT via NHRP,
   [Site B]────────┤   SANS configuration manuelle
                     │   préalable de ce lien précis)
                     │
              [Site HUB]  (toujours utilisé pour l'enregistrement
                            NHRP initial et comme relais tant que
                            le tunnel direct n'est pas établi)
```

**Avantage clé de DMVPN Phase 2/3** : un nouveau site ("spoke") ne nécessite qu'une configuration sur **lui-même et le hub** — pas de reconfiguration des autres spokes existants — tout en permettant, une fois enregistré, des tunnels **spoke-to-spoke directs** à la demande dès qu'un trafic significatif le justifie (évitant le détour systématique par le hub).

## Configuration DMVPN simplifiée (hub)

```bash
Hub(config)# interface tunnel 0
Hub(config-if)# ip address 10.10.10.1 255.255.255.0
Hub(config-if)# tunnel mode gre multipoint          ! mGRE : pas de destination unique
Hub(config-if)# tunnel source gigabitEthernet 0/1
Hub(config-if)# ip nhrp authentication MaCleDMVPN
Hub(config-if)# ip nhrp map multicast dynamic         ! autorise l'apprentissage dynamique des spokes
Hub(config-if)# ip nhrp network-id 1
Hub(config-if)# tunnel protection ipsec profile DMVPN_PROFILE
```

```bash
Spoke(config)# interface tunnel 0
Spoke(config-if)# ip address 10.10.10.11 255.255.255.0
Spoke(config-if)# tunnel source gigabitEthernet 0/1
Spoke(config-if)# tunnel destination 203.0.113.1       ! IP publique du HUB uniquement
Spoke(config-if)# ip nhrp authentication MaCleDMVPN
Spoke(config-if)# ip nhrp map 10.10.10.1 203.0.113.1     ! mapping statique VERS LE HUB seulement
Spoke(config-if)# ip nhrp nhs 10.10.10.1                  ! Next Hop Server = le hub
Spoke(config-if)# ip nhrp network-id 1
Spoke(config-if)# tunnel protection ipsec profile DMVPN_PROFILE
```

## MPLS L3VPN : l'approche déléguée à l'opérateur

```text
   ┌──────────────────────────────────────────────────┐
   │              CŒUR MPLS DE L'OPÉRATEUR                  │
   │                                                          │
   │  [PE]═══════[P]═══════[P]═══════[PE]                    │
   │  (Provider    (Provider    (Provider    (Provider          │
   │   Edge, en      core, ne     core)        Edge)             │
   │   bordure,      connaît que                                │
   │   maintient     les labels                                 │
   │   les VRF        MPLS, PAS                                 │
   │   clients)       les routes                                │
   │                  clients)                                  │
   └───┬──────────────────────────────────────────┬────┘
       │                                            │
   [CE - Client Edge]                        [CE - Client Edge]
   Site A                                     Site B
```

| Rôle | Localisation | Fonction |
|---|---|---|
| **CE** (Customer Edge) | Chez le client | Routeur de bordure du client, transmet ses routes au PE |
| **PE** (Provider Edge) | Bordure du réseau opérateur | Maintient une **VRF par client**, propage les routes clients via **MP-BGP** |
| **P** (Provider core) | Cœur du réseau opérateur | Commute uniquement via des **labels MPLS**, ne connaît AUCUNE route client individuelle |

L'opérateur propage les routes de chaque client entre ses PE via **MP-BGP** (Multiprotocol BGP), en utilisant des **Route-Distinguishers** (RD, rendent chaque préfixe client unique même si deux clients utilisent le même plan d'adressage privé) et des **Route-Targets** (RT, contrôlent quelles VRF importent/exportent quelles routes) — le client, lui, ne voit qu'une connectivité de type "réseau privé" entre ses sites, sans jamais avoir à gérer la complexité MPLS sous-jacente.

## DMVPN vs MPLS L3VPN — comparatif

| Critère | DMVPN | MPLS L3VPN |
|---|---|---|
| Infrastructure | Internet public (auto-hébergé) | Réseau dédié de l'opérateur |
| Coût | Plus faible | Plus élevé (SLA opérateur) |
| Bande passante garantie | Non (best-effort Internet) | Oui (SLA contractuel) |
| Complexité de gestion | À la charge du client | Déléguée à l'opérateur |
| Chiffrement | Natif (IPsec intégré) | Optionnel (le cœur MPLS n'est pas nativement chiffré) |

## Ce qu'il faut retenir

- **DMVPN** combine mGRE (une interface hub pour tous les spokes) + NHRP (résolution dynamique d'adresses) + IPsec, permettant des tunnels **spoke-to-spoke directs à la demande** sans reconfiguration manuelle du maillage complet.
- **MPLS L3VPN** délègue l'interconnexion à un opérateur : les PE maintiennent une VRF par client et propagent les routes via **MP-BGP** (RD/RT), le cœur P ne voit que des labels.
- DMVPN = coût faible, auto-hébergé, best-effort ; MPLS L3VPN = coût plus élevé, SLA garanti, géré par l'opérateur.

## Pour aller plus loin

- [Cisco — Dynamic Multipoint VPN (DMVPN) Design Guide](https://www.cisco.com/c/en/us/td/docs/solutions/Enterprise/WAN_and_MAN/DMVPN/DMVPN.html)
- [RFC 4364 — BGP/MPLS IP Virtual Private Networks (VPNs)](https://www.rfc-editor.org/rfc/rfc4364)
