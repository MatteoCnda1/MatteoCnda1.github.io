---
id: 02-commutation-ethernet
title: "Commutation Ethernet : table MAC et méthodes de switching"
sidebar_position: 2
tags: [reseau, cheatsheet]
---

# Commutation Ethernet : table MAC et méthodes de switching

> Un **commutateur (switch)** prend des décisions de transfert de trame au niveau 2, en s'appuyant sur une **table d'adresses MAC** (CAM table) qu'il construit dynamiquement par apprentissage.

## Le processus "Learn, Flood, Forward"

```text
   1. APPRENTISSAGE (learning)
      Une trame arrive sur le port Fa0/1, @MAC source = AA:AA...
      → le switch enregistre : AA:AA... est joignable via Fa0/1

   2. DÉCISION DE TRANSFERT
      Le switch regarde la @MAC DESTINATION de la trame dans sa table :

      ┌─────────────────────┬──────────────────────────────────┐
      │ MAC dst CONNUE       │ MAC dst INCONNUE / broadcast      │
      │ dans la table        │                                    │
      ├─────────────────────┼──────────────────────────────────┤
      │ FORWARD : envoi      │ FLOOD : envoi sur TOUS les ports  │
      │ uniquement sur le    │ (sauf le port d'origine)          │
      │ port correspondant   │                                    │
      └─────────────────────┴──────────────────────────────────┘
```

- Si la **MAC destination = MAC source** du port d'entrée (même segment), la trame est **filtrée** (non retransmise).
- Table MAC = dynamique par défaut, avec un **timeout** (300 s par défaut sur IOS) : une entrée inactive expire et disparaît.

## Table MAC — commandes

```bash
Switch# show mac address-table
          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    aaaa.bbbb.cccc    DYNAMIC     Gi0/1
   1    dddd.eeee.ffff    DYNAMIC     Gi0/2

Switch# show mac address-table dynamic
Switch# show mac address-table interface gi0/1
Switch# clear mac address-table dynamic

! Adresse MAC statique (sécurité, redondance)
Switch(config)# mac address-table static aaaa.bbbb.cccc vlan 1 interface gi0/1
```

## Méthodes de commutation

```text
   STORE-AND-FORWARD         CUT-THROUGH              FRAGMENT-FREE

   Reçoit la trame           Lit seulement            Lit les 64 premiers
   ENTIÈREMENT avant de      l'en-tête (@MAC dst)     octets (au-delà de
   la transférer             puis transfère            la zone de collision
                             immédiatement              possible) avant
   → vérifie le FCS,                                    de transférer
     élimine les trames      → latence minimale,
     corrompues              mais propage              → compromis entre
                             les trames                  les deux
   → latence plus élevée     corrompues
     mais fiable
```

| Méthode | Vérification d'erreur | Latence | Usage |
|---|---|---|---|
| **Store-and-forward** | Oui (FCS complet) | Plus élevée | Défaut sur la plupart des switches Cisco modernes |
| **Cut-through** | Non | Très faible | Environnements exigeant une latence minimale (datacenters, HFT) |
| **Fragment-free** | Partielle (64 premiers octets) | Intermédiaire | Compromis historique |

## Segmentation des domaines et micro-segmentation

Chaque port de switch en full-duplex constitue son propre **domaine de collision** — c'est la différence fondamentale avec un hub (qui ne fait que répéter le signal sur tous les ports, un seul domaine de collision partagé). Le switch **ne segmente pas** le domaine de broadcast (voir cours précédent) : cela nécessite un routeur ou des VLANs (CCNA 2).

## Ce qu'il faut retenir

- Le switch apprend les `@MAC source` entrantes, puis **forward** si la destination est connue ou **flood** si inconnue/broadcast.
- `show mac address-table` affiche la table CAM ; timeout dynamique par défaut = 300 s.
- Trois méthodes de commutation : **store-and-forward** (fiable, défaut), **cut-through** (rapide, pas de vérification), **fragment-free** (compromis).
- Un switch segmente les domaines de collision (par port) mais pas les domaines de broadcast.

## Pour aller plus loin

- [Cisco — Understanding Switch Technology](https://www.cisco.com/c/en/us/support/docs/lan-switching/ethernet/10607-11.html)
- [Wikipedia — Ethernet switch](https://en.wikipedia.org/wiki/Network_switch)
