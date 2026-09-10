---
id: 01-vrf-lite-virtualisation-reseau
title: "VRF-lite : virtualiser la table de routage"
sidebar_position: 1
tags: [reseau, virtualisation, cheatsheet]
---

# VRF-lite : virtualiser la table de routage

> Une **VRF** (Virtual Routing and Forwarding) crée, sur un **même routeur physique**, plusieurs tables de routage **totalement indépendantes** — permettant à des adresses IP identiques ou des politiques de routage distinctes de coexister sans interférer, comme si plusieurs routeurs virtuels tournaient sur une seule machine.

## Le problème résolu

```text
   SANS VRF                              AVEC VRF

   Un routeur = UNE table de routage      Un routeur = PLUSIEURS
   UNIQUE partagée par tout le trafic      tables de routage
                                           INDÉPENDANTES :

   Impossible d'avoir 192.168.1.0/24      VRF CLIENT_A : 192.168.1.0/24
   dans deux contextes isolés SANS        VRF CLIENT_B : 192.168.1.0/24
   conflit d'adressage                    (MÊME préfixe, ZÉRO conflit,
                                           tables totalement séparées)
```

**Cas d'usage typique** : un fournisseur de services héberge plusieurs clients sur la même infrastructure physique (routeur partagé), chaque client ayant potentiellement le même plan d'adressage privé — les VRF garantissent une isolation complète du routage entre clients, sans dupliquer le matériel.

## Configuration VRF-lite

```bash
! 1. Créer les VRF
Router(config)# vrf definition CLIENT_A
Router(config-vrf)# address-family ipv4
Router(config-vrf-af)# exit-address-family
Router(config-vrf)# exit

Router(config)# vrf definition CLIENT_B
Router(config-vrf)# address-family ipv4
Router(config-vrf-af)# exit-address-family
Router(config-vrf)# exit

! 2. Associer des interfaces à chaque VRF
Router(config)# interface gigabitEthernet 0/1
Router(config-if)# vrf forwarding CLIENT_A
Router(config-if)# ip address 192.168.1.1 255.255.255.0   ! réassignée APRÈS le vrf forwarding (celui-ci l'efface)

Router(config)# interface gigabitEthernet 0/2
Router(config-if)# vrf forwarding CLIENT_B
Router(config-if)# ip address 192.168.1.1 255.255.255.0   ! MÊME préfixe, AUCUN conflit (VRF différente)
```

**Piège de configuration classique** : appliquer `vrf forwarding` sur une interface **efface automatiquement** son adresse IP existante (changement de contexte de routage) — il faut systématiquement réappliquer `ip address` **après** avoir associé la VRF, sinon l'interface se retrouve sans IP.

## Routage par VRF

```bash
! Routage statique DANS une VRF spécifique
Router(config)# ip route vrf CLIENT_A 10.0.0.0 255.0.0.0 192.168.1.254

! OSPF dédié par VRF (processus distinct, comme les VRF elles-mêmes)
Router(config)# router ospf 10 vrf CLIENT_A
Router(config-router)# network 192.168.1.0 0.0.0.255 area 0
```

Chaque VRF peut exécuter son **propre processus de routage dynamique** (OSPF, EIGRP, BGP), totalement indépendant des autres VRF — deux clients peuvent avoir des politiques de routage entièrement différentes sur le même équipement physique.

## Vérification

```bash
Router# show vrf
  Name             Default RD          Protocols   Interfaces
  CLIENT_A         <not set>           ipv4        Gi0/1
  CLIENT_B         <not set>           ipv4        Gi0/2

Router# show ip route vrf CLIENT_A
Router# ping vrf CLIENT_A 192.168.1.254
```

## VRF-lite vs VRF avec MPLS (contexte fournisseur de services)

```text
   VRF-LITE (ce cours)                    VRF + MPLS L3VPN

   Isolation LOCALE, sur UN SEUL           Isolation ÉTENDUE sur
   routeur (ou une chaîne de routeurs      PLUSIEURS routeurs/sites,
   configurés VRF par VRF MANUELLEMENT     via MP-BGP qui PROPAGE
   sur chaque saut)                        automatiquement les routes
                                            de chaque VRF à travers le
   → adapté à un besoin d'isolation         cœur MPLS, avec des
     LOCAL/ponctuel                          Route-Distinguishers (RD)
                                              et Route-Targets (RT)

                                            → adapté à un opérateur
                                              fournissant du L3VPN à
                                              grande échelle
```

## Ce qu'il faut retenir

- Une **VRF** crée plusieurs tables de routage indépendantes sur un même routeur physique, permettant des préfixes IP identiques dans des contextes isolés.
- `vrf definition` + `vrf forwarding` sur l'interface + **réassignation de l'IP** (effacée par le changement de VRF) sont les étapes clés.
- Chaque VRF peut exécuter son propre processus de routage dynamique, indépendant des autres.
- **VRF-lite** = isolation locale manuelle ; **VRF + MPLS L3VPN** = isolation étendue automatisée via MP-BGP, typique d'un fournisseur de services.

## Pour aller plus loin

- [Cisco — VRF-lite Configuration Guide](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst3750x_3560x/software/release/15-2_1_e/multiple_forwarding/configuration/guide/scg3750x/swvrf.html)
- [RFC 4364 — BGP/MPLS IP Virtual Private Networks (VPNs)](https://www.rfc-editor.org/rfc/rfc4364)
