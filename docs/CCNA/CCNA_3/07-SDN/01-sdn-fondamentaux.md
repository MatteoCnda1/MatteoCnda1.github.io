---
id: 01-sdn-fondamentaux
title: "SDN : séparation des plans et architecture centralisée"
sidebar_position: 1
tags: [reseau, automatisation]
---

# SDN : séparation des plans et architecture centralisée

> Le **SDN** (Software-Defined Networking) centralise l'**intelligence de décision** du réseau dans un contrôleur logiciel, séparée des équipements qui se contentent d'exécuter les décisions — à l'opposé du modèle traditionnel où chaque équipement décide de façon autonome et distribuée.

## Les trois plans d'un équipement réseau

```text
   PLAN DE MANAGEMENT (management plane)
   → administration de l'équipement lui-même (SSH, SNMP, config)

   PLAN DE CONTRÔLE (control plane)
   → PREND LES DÉCISIONS : calcule la table de routage (OSPF,
     Dijkstra), construit la table MAC, exécute les protocoles
     de signalisation

   PLAN DE DONNÉES (data plane / forwarding plane)
   → EXÉCUTE les décisions du plan de contrôle : transfère
     effectivement chaque paquet/trame selon les tables déjà
     calculées (rapide, souvent en matériel dédié/ASIC)
```

## Réseau traditionnel vs SDN

```text
   RÉSEAU TRADITIONNEL (distribué)         SDN (centralisé)

   [R1: contrôle+données]                  ┌─────────────────┐
   [R2: contrôle+données]                  │   CONTRÔLEUR SDN   │
   [R3: contrôle+données]                  │  (plan de contrôle  │
   (chaque routeur calcule                 │   CENTRALISÉ,        │
   SA PROPRE table de routage               │   vue GLOBALE du      │
   de façon autonome, via                  │   réseau entier)      │
   OSPF/EIGRP — vision                     └────────┬────────┘
   locale/distribuée)                               │ (API, ex. OpenFlow)
                                            ┌────────┼────────┐
                                            ▼        ▼        ▼
                                          [R1]    [R2]    [R3]
                                          (plan de données SEULEMENT,
                                           exécutent les instructions
                                           reçues du contrôleur)
```

Le contrôleur SDN a une **vue globale** de toute la topologie (contrairement à un routeur OSPF classique qui ne voit que sa zone), permettant des décisions de routage plus sophistiquées (optimisation globale plutôt que locale) et une reconfiguration centralisée quasi-instantanée de l'ensemble du réseau.

## Interfaces Northbound et Southbound

```text
   ┌──────────────────────────────────┐
   │      Applications métier            │
   │  (orchestration, automatisation,    │
   │   portails self-service)             │
   └──────────────┬───────────────────┘
                   │ NORTHBOUND API (REST/API vers les applications,
                   │  généralement du langage métier de haut niveau)
   ┌──────────────▼───────────────────┐
   │         CONTRÔLEUR SDN               │
   └──────────────┬───────────────────┘
                   │ SOUTHBOUND API (protocoles vers les équipements
                   │  physiques : OpenFlow, NETCONF, gRPC...)
   ┌──────────────▼───────────────────┐
   │   Équipements réseau (data plane)    │
   └──────────────────────────────────┘
```

| Interface | Direction | Exemples de protocole |
|---|---|---|
| **Northbound** | Contrôleur → applications | API REST |
| **Southbound** | Contrôleur → équipements | OpenFlow, NETCONF, OpFlex |

## OpenFlow : le protocole southbound historique du SDN

```text
   OpenFlow programme directement les tables de flux (flow tables)
   des switches compatibles : le contrôleur pousse des règles
   explicites "match X → action Y" (ex. "trafic vers 10.0.0.5:80
   → transférer sur le port 3"), le switch les applique sans
   avoir besoin de son propre protocole de routage local.
```

## Solutions SDN Cisco

| Solution | Périmètre |
|---|---|
| **Cisco ACI** (Application Centric Infrastructure) | SDN pour datacenter, basé sur des politiques (intent-based), contrôleur APIC |
| **Cisco DNA Center** | Plateforme de gestion/automatisation pour le réseau de campus/entreprise, intent-based networking |
| **Cisco SD-WAN** (ex-Viptela) | SDN appliqué au WAN — orchestration centralisée de liens WAN multiples (MPLS, Internet, LTE) avec routage applicatif intelligent |

## Intent-Based Networking (IBN)

```text
   Approche traditionnelle : l'administrateur traduit MANUELLEMENT
   une intention métier ("les utilisateurs du VLAN Finance ne
   doivent JAMAIS atteindre le VLAN Production") en dizaines de
   commandes CLI (ACL, VLAN, routage) sur CHAQUE équipement concerné

   IBN : l'administrateur EXPRIME l'intention à un niveau ABSTRAIT
   dans le contrôleur (ex. via une interface graphique ou une API),
   et le SYSTÈME traduit automatiquement cette intention en
   configuration technique sur tous les équipements concernés,
   avec vérification continue de conformité (assurance)
```

## Ce qu'il faut retenir

- **SDN** sépare le **plan de contrôle** (décision, centralisé dans un contrôleur) du **plan de données** (exécution, distribué sur les équipements).
- **Northbound** = contrôleur vers applications (API REST) ; **Southbound** = contrôleur vers équipements (OpenFlow, NETCONF).
- **OpenFlow** programme directement les tables de flux des switches compatibles.
- Cisco propose **ACI** (datacenter), **DNA Center** (campus/entreprise) et **SD-WAN** (WAN) comme solutions SDN, souvent avec une approche **intent-based** (IBN).

## Pour aller plus loin

- [Open Networking Foundation — SDN Overview](https://opennetworking.org/sdn-definition/)
- [Cisco — Digital Network Architecture (DNA)](https://www.cisco.com/c/en/us/solutions/enterprise-networks/dna-solution-page.html)
