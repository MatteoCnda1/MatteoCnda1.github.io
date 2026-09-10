---
id: 03-redondance-materielle-logicielle
title: "Redondance matérielle et logicielle : SSO, NSF, StackWise"
sidebar_position: 3
tags: [reseau]
---

# Redondance matérielle et logicielle : SSO, NSF, StackWise

> Au-delà de la redondance de liens (EtherChannel) et de passerelle (FHRP, vus en CCNA), la haute disponibilité d'entreprise s'appuie sur des mécanismes de redondance **au sein même** d'un équipement ou entre équipements empilés.

## SSO (Stateful Switchover)

```text
   Châssis avec DEUX superviseurs (cartes de contrôle) :

   ┌─────────────────────────────────────────┐
   │  SUPERVISEUR ACTIF                          │
   │  Exécute le plan de contrôle              │
   │  (protocoles de routage, gestion)          │
   │       │ synchronisation continue de l'état │
   │       ▼ (table MAC, table de routage,      │
   │           sessions PPP, état des protocoles)│
   │  SUPERVISEUR STANDBY (à chaud)              │
   │  Prêt à prendre le relais INSTANTANÉMENT    │
   │  si l'actif tombe, SANS reconverger          │
   └─────────────────────────────────────────┘
```

**SSO** synchronise en permanence l'état complet (tables MAC, sessions de couche 2, état protocolaire) entre le superviseur actif et le standby, permettant un basculement quasi-instantané et **transparent** en cas de panne du superviseur actif — sans réapprentissage, sans coupure de service perceptible pour les couches basses.

## NSF (Non-Stop Forwarding)

```text
   SSO seul               SSO + NSF (couplé)

   Le plan de DONNÉES      Le plan de DONNÉES continue de
   peut être interrompu    TRANSFÉRER le trafic PENDANT que
   pendant que le plan     le plan de CONTRÔLE redémarre/
   de contrôle redémarre    reconverge (OSPF, EIGRP, BGP
   (protocoles de           redémarrent proprement, sans
   routage à reconstruire)  couper le forwarding en cours)
```

**NSF** s'appuie sur SSO et ajoute une extension spécifique aux **protocoles de routage** : lors d'un basculement de superviseur, les voisins OSPF/EIGRP/BGP sont informés (via des extensions dédiées : NSF-aware côté voisin) que le routeur redémarre son plan de contrôle sans que sa table de transfert existante ne soit invalidée — le trafic continue de transiter normalement pendant la reconvergence.

## Empilement physique : StackWise (Cisco)

```text
   ┌────┐   ┌────┐   ┌────┐   ┌────┐
   │ SW1 │══│ SW2 │══│ SW3 │══│ SW4 │   (câble StackWise dédié,
   └────┘   └────┘   └────┘   └────┘    formant un ANNEAU)

   → les 4 switches physiques se COMPORTENT comme UN SEUL
     équipement logique : UNE SEULE table MAC, UNE SEULE
     configuration, UN SEUL Router-ID/STP Bridge-ID
   → un "master" de pile est élu (rôle équivalent au
     superviseur actif), avec basculement SSO en cas de panne
```

```bash
Switch# show switch
Switch/Stack Mac Address : aaaa.bbbb.cccc
                                             H/W   Current
Switch#  Role   Mac Address     Priority Version  State
-------------------------------------------------------
 1       Master aaaa.bbbb.cc01     15     V02     Ready
 2       Member aaaa.bbbb.cc02     14     V02     Ready
 3       Member aaaa.bbbb.cc03     1      V02     Ready

Switch(config)# switch 1 priority 15    ! favorise ce membre pour devenir/rester master
```

**Avantage clé** : un pile StackWise s'administre comme **un seul équipement** (une seule adresse IP de management, une seule configuration à maintenir), tout en offrant une redondance physique réelle — la perte d'un membre de la pile ne coupe pas le service, les autres membres continuent d'assurer la commutation.

## VSS (Virtual Switching System) — variante châssis modulaires

```text
   VSS regroupe DEUX châssis physiques distincts (ex. 2 Cisco
   Catalyst 6500/6800) en UN SEUL système logique, reliés par
   un lien dédié VSL (Virtual Switch Link).

   Différence clé avec StackWise : VSS cible des châssis MODULAIRES
   haut de gamme (cœur de réseau), StackWise cible des switches
   FIXES d'accès/distribution empilables physiquement.
```

## Ce qu'il faut retenir

- **SSO** synchronise en continu l'état entre un superviseur actif et standby pour un basculement transparent du plan de contrôle.
- **NSF** (couplé à SSO) maintient le **plan de données actif** pendant que le plan de contrôle (protocoles de routage) redémarre après un basculement.
- **StackWise** empile plusieurs switches fixes en un seul équipement logique administrable (une IP, une config) ; **VSS** applique un principe similaire à des châssis modulaires haut de gamme.

## Pour aller plus loin

- [Cisco — High Availability Campus Network Design](https://www.cisco.com/c/en/us/td/docs/solutions/Enterprise/Campus/HA_campus_DG/hacampusdg.html)
- [Cisco — StackWise Technology White Paper](https://www.cisco.com/c/en/us/products/collateral/switches/catalyst-3750-series-switches/prod_white_paper0900aecd8032a35f.html)
