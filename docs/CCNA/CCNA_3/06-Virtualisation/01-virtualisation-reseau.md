---
id: 01-virtualisation-reseau
title: "Virtualisation réseau : hyperviseurs, vSwitch, NFV"
sidebar_position: 1
tags: [reseau, virtualisation]
---

# Virtualisation réseau : hyperviseurs, vSwitch, NFV

> La virtualisation dissocie une fonction (serveur, switch, routeur, firewall) du **matériel physique dédié** qui l'exécutait traditionnellement, permettant de faire tourner plusieurs instances logiques indépendantes sur une infrastructure physique partagée.

## Type d'hyperviseur

```text
   HYPERVISEUR TYPE 1 (bare-metal)         HYPERVISEUR TYPE 2 (hosted)

   ┌──────┬──────┬──────┐                 ┌──────┬──────┬──────┐
   │ VM1  │ VM2  │ VM3  │                 │ VM1  │ VM2  │ VM3  │
   ├──────┴──────┴──────┤                 ├──────┴──────┴──────┤
   │    Hyperviseur       │                 │    Hyperviseur       │
   ├──────────────────┤                 ├──────────────────┤
   │  Matériel physique   │                 │   OS hôte (Windows,  │
   └──────────────────┘                 │   Linux, macOS)       │
                                          ├──────────────────┤
   Ex. VMware ESXi, KVM,                 │  Matériel physique   │
   Microsoft Hyper-V                      └──────────────────┘

                                          Ex. VMware Workstation,
                                          VirtualBox
```

Le **Type 1** (bare-metal, directement sur le matériel) est le standard en environnement de production/datacenter — meilleures performances, pas de surcouche OS hôte. Le **Type 2** (au-dessus d'un OS hôte classique) est adapté au poste de travail/labo (comme celui utilisé pour s'entraîner sur GNS3/EVE-NG/Packet Tracer).

## vSwitch : commutation au sein de l'hyperviseur

```text
   ┌────────────────────────────────────────────────────┐
   │  Hyperviseur                                            │
   │                                                          │
   │  [VM1]──┐                                                │
   │  [VM2]──┼──[vSwitch]────────────► NIC physique ────► LAN │
   │  [VM3]──┘   (switch LOGICIEL,                             │
   │              interne à l'hyperviseur,                     │
   │              peut supporter VLANs)                        │
   └────────────────────────────────────────────────────┘
```

Le **vSwitch** commute le trafic **entre VMs sur le même hôte physique** sans jamais sortir sur le réseau physique (si les VMs sont sur le même segment virtuel) — un trafic invisible aux switches physiques classiques, ce qui a des implications de sécurité et de supervision (un outil de capture réseau physique traditionnel ne verra jamais ce trafic inter-VM local).

## Réseau virtuel étendu : VXLAN

```text
   Problème : le VLAN classique (802.1Q) est limité à 4094 IDs —
   insuffisant pour un datacenter cloud multi-tenant hébergeant
   potentiellement des dizaines de milliers de clients isolés.

   VXLAN (Virtual Extensible LAN) : encapsule une trame Ethernet
   L2 complète dans un paquet UDP L3 (port 4789), avec un
   identifiant VNI (VXLAN Network Identifier) sur 24 bits
   → 16 MILLIONS de segments logiques possibles (vs 4094 en VLAN)

   ┌────────────┬──────────────┬───────────────┬─────────┐
   │ En-tête IP  │ En-tête UDP   │ En-tête VXLAN  │ Trame     │
   │ (routage    │ (port 4789)   │ (VNI, 24 bits) │ Ethernet  │
   │  du paquet   │               │                │ ORIGINALE │
   │  outer)      │               │                │           │
   └────────────┴──────────────┴───────────────┴─────────┘
```

VXLAN permet aussi d'étendre un même domaine de broadcast L2 **au-delà des limites physiques d'un datacenter** (ex. entre deux datacenters distants reliés par un réseau L3 routé), en encapsulant le trafic L2 dans des paquets IP routables normalement — utile pour la mobilité de VM entre sites sans changement d'adresse IP.

## NFV : Network Functions Virtualization

```text
   APPROCHE TRADITIONNELLE                 NFV

   Appliance MATÉRIELLE DÉDIÉE              Fonction réseau exécutée
   par fonction :                            comme un LOGICIEL, sur du
   [Firewall physique]                       matériel GÉNÉRIQUE (serveur
   [Routeur physique]                        x86 standard) :
   [Load balancer physique]                  → VM firewall
   → coûteux, peu flexible,                  → VM routeur virtuel (ex. CSR1000v)
     déploiement lent (achat                 → VM load balancer
     matériel à chaque besoin)                → déploiement en minutes,
                                                 scalabilité à la demande
```

NFV et SDN (cours suivant) sont des concepts **complémentaires mais distincts** : NFV virtualise la fonction elle-même (quoi), SDN centralise le contrôle du réseau (comment il est piloté) — un déploiement moderne combine souvent les deux (ex. un firewall virtuel NFV piloté par un contrôleur SDN).

## Ce qu'il faut retenir

- **Hyperviseur type 1** (bare-metal, production) vs **type 2** (hébergé sur un OS, labo/poste de travail).
- Le **vSwitch** commute le trafic inter-VM sur un même hôte, invisible au réseau physique.
- **VXLAN** encapsule des trames L2 dans des paquets IP/UDP, avec 16 millions de segments possibles (VNI 24 bits) contre 4094 pour le VLAN classique — standard des datacenters cloud modernes.
- **NFV** exécute des fonctions réseau (firewall, routeur, load balancer) comme des logiciels sur du matériel générique plutôt que sur des appliances dédiées.

## Pour aller plus loin

- [RFC 7348 — Virtual eXtensible Local Area Network (VXLAN)](https://www.rfc-editor.org/rfc/rfc7348)
- [ETSI — Network Functions Virtualisation (NFV)](https://www.etsi.org/technologies/nfv)
