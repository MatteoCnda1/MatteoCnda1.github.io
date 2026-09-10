---
id: 02-trunking-802-1q
title: "Trunking 802.1Q et DTP"
sidebar_position: 2
tags: [reseau, cheatsheet]
---

# Trunking 802.1Q et DTP

> Un **trunk** est un lien capable de transporter le trafic de **plusieurs VLANs simultanément** entre deux équipements (switch-switch ou switch-routeur), grâce au **tagging 802.1Q** qui identifie l'appartenance VLAN de chaque trame.

## Tagging 802.1Q

```text
   Trame Ethernet standard :
   ┌──────────┬──────────┬──────┬──────────┬─────┐
   │ MAC dst  │ MAC src  │ Type │ Données   │ FCS │
   └──────────┴──────────┴──────┴──────────┴─────┘

   Trame taguée 802.1Q (4 octets insérés après MAC src) :
   ┌──────────┬──────────┬──────────┬──────┬──────────┬─────┐
   │ MAC dst  │ MAC src  │ Tag 802.1Q│ Type │ Données   │ FCS │
   │          │          │ (4 octets)│      │           │     │
   └──────────┴──────────┴──────────┴──────┴──────────┴─────┘
                    │
                    ├─ TPID (0x8100) : identifie une trame taguée
                    ├─ Priority (3 bits) : CoS, priorisation QoS
                    └─ VLAN ID (12 bits) : 1 à 4094
```

Le tag ajoute l'**ID du VLAN d'origine** (12 bits → 4094 VLANs possibles) directement dans la trame. Le switch récepteur lit ce tag pour savoir à quel VLAN restreindre la diffusion de la trame.

## VLAN natif

```text
   Trunk entre SW1 et SW2

   VLAN 10 → trame TAGUÉE (802.1Q)
   VLAN 20 → trame TAGUÉE (802.1Q)
   VLAN 1 (natif) → trame NON TAGUÉE (transmise "nue")
```

Le **VLAN natif** (par défaut VLAN 1) est le seul VLAN dont les trames transitent **sans tag** sur un trunk 802.1Q — une compatibilité historique avec les équipements ne supportant pas le tagging. Un **mismatch de VLAN natif** entre les deux extrémités d'un trunk (ex. natif=1 d'un côté, natif=99 de l'autre) est une erreur de configuration classique générant des messages CDP d'avertissement et un comportement réseau incohérent.

**Bonne pratique de sécurité** : changer le VLAN natif pour un VLAN inutilisé (jamais le VLAN 1) afin de limiter le risque de **VLAN hopping** (une attaque exploitant le VLAN natif non tagué pour injecter du trafic dans un autre VLAN via double tagging).

## Configuration d'un trunk

```bash
Switch(config)# interface gigabitEthernet 0/1
Switch(config-if)# switchport trunk encapsulation dot1q   ! nécessaire sur certains modèles (switches multi-protocoles ISL/dot1q)
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk native vlan 999         ! change le VLAN natif (bonne pratique)
Switch(config-if)# switchport trunk allowed vlan 10,20,30   ! restreint les VLANs autorisés sur ce trunk
```

## Vérification

```bash
Switch# show interfaces trunk
Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on                802.1q         trunking      999

Port        Vlans allowed on trunk
Gi0/1       10,20,30

Switch# show interfaces gigabitEthernet 0/1 switchport
Administrative Mode: trunk
Operational Mode: trunk
Trunking Native Mode VLAN: 999 (VLAN0999)
```

## DTP (Dynamic Trunking Protocol)

```text
   Modes de port DTP :

   trunk      : force le mode trunk, envoie activement des négociations DTP
   access     : force le mode access, jamais trunk
   dynamic auto    : devient trunk SEULEMENT si l'autre extrémité négocie activement
   dynamic desirable : tente ACTIVEMENT de négocier un trunk avec l'autre extrémité
```

| Extrémité A | Extrémité B | Résultat |
|---|---|---|
| trunk | trunk / dynamic auto / dynamic desirable | Trunk |
| dynamic desirable | dynamic desirable / dynamic auto | Trunk |
| dynamic auto | dynamic auto | **Access** (aucune des deux ne négocie activement) |
| access | n'importe quel mode | **Access** |

**Bonne pratique de sécurité** : désactiver DTP (`switchport nonegotiate`) sur les ports de production, car un port en `dynamic auto`/`dynamic desirable` peut être manipulé par un attaquant connectant un équipement usurpant une négociation DTP pour obtenir un accès trunk (accès à tous les VLANs).

```bash
Switch(config-if)# switchport nonegotiate
```

## Ce qu'il faut retenir

- Le **tag 802.1Q** (4 octets : TPID, priorité, VLAN ID) identifie l'appartenance VLAN d'une trame sur un trunk.
- Le **VLAN natif** transite sans tag ; un mismatch entre extrémités d'un trunk cause des dysfonctionnements — le changer par sécurité.
- `switchport mode trunk` + `switchport trunk allowed vlan` configurent un trunk restreint.
- **DTP** négocie automatiquement trunk/access ; le désactiver (`switchport nonegotiate`) en production limite le risque de VLAN hopping.

## Pour aller plus loin

- [IEEE 802.1Q Standard](https://standards.ieee.org/ieee/802.1Q/7061/)
- [Cisco — Understanding VLAN Trunk Protocol (DTP)](https://www.cisco.com/c/en/us/support/docs/lan-switching/dynamic-trunking-protocol-dtp/10558-21.html)
