---
id: 01-vlans
title: "VLAN : segmentation logique d'un réseau commuté"
sidebar_position: 1
tags: [reseau, cheatsheet]
---

# VLAN : segmentation logique d'un réseau commuté

> Un **VLAN** (Virtual LAN, norme IEEE 802.1Q) segmente logiquement un réseau commuté en plusieurs **domaines de broadcast distincts**, indépendamment du câblage physique — deux ports du même switch peuvent appartenir à des VLANs différents, donc à des réseaux logiquement isolés.

## Pourquoi segmenter en VLANs

```text
   SANS VLAN                          AVEC VLAN

   [Switch : 1 seul domaine de        [Switch : plusieurs domaines
    broadcast pour TOUS les ports]     de broadcast isolés]

   Comptabilité ─┐                    VLAN 10 (Compta)  : ports 1-8
   RH           ─┼─ [Switch]          VLAN 20 (RH)      : ports 9-16
   Invités      ─┘                    VLAN 99 (Invités) : ports 17-24

   → un broadcast RH atteint          → un broadcast RH reste confiné
     TOUT le monde, y compris           au VLAN 20 ; isolation logique
     les invités (sécurité faible,      sans changer le câblage physique
     performance dégradée)
```

Avantages : **isolation de sécurité** (les VLANs ne communiquent pas entre eux sans passer par un routeur), **réduction des domaines de broadcast** (performance), **flexibilité organisationnelle** (grouper par service plutôt que par localisation physique du câblage).

## Types de VLAN

| Type | Rôle |
|---|---|
| **VLAN de données** | Trafic utilisateur normal |
| **VLAN natif** | VLAN non tagué sur un trunk 802.1Q (par défaut VLAN 1, à changer en pratique) |
| **VLAN de management** | Dédié à l'administration des équipements (SVI, SSH) — jamais le VLAN 1 par bonne pratique |
| **VLAN voix** | Priorisé (QoS) pour la téléphonie IP, souvent superposé au VLAN de données sur le même port |
| **VLAN par défaut** | VLAN 1, tous les ports y appartiennent à la sortie d'usine, non supprimable |

## Configuration de base

```bash
! Création des VLANs
Switch(config)# vlan 10
Switch(config-vlan)# name COMPTABILITE
Switch(config-vlan)# exit
Switch(config)# vlan 20
Switch(config-vlan)# name RH
Switch(config-vlan)# exit

! Affectation d'un port en mode access à un VLAN
Switch(config)# interface fastEthernet 0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10

! Affectation groupée
Switch(config)# interface range fastEthernet 0/1 - 8
Switch(config-if-range)# switchport mode access
Switch(config-if-range)# switchport access vlan 10
```

## Vérification

```bash
Switch# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/9, Fa0/10, Fa0/11, Fa0/12
10   COMPTABILITE                     active    Fa0/1, Fa0/2, Fa0/3, Fa0/4
20   RH                               active    Fa0/9

Switch# show interfaces fastEthernet 0/1 switchport
Name: Fa0/1
Switchport: Enabled
Administrative Mode: static access
Access Mode VLAN: 10 (COMPTABILITE)
```

## VLAN voix : superposition sur un port access

```bash
Switch(config)# interface fastEthernet 0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10        ! VLAN données (PC)
Switch(config-if)# switchport voice vlan 100          ! VLAN voix (téléphone IP en aval du PC)
```

Un port en mode access peut transporter **deux** VLANs simultanément dans ce cas précis : le VLAN données pour le PC, et le VLAN voix (taggé 802.1Q) pour le téléphone IP branché entre le PC et le switch — un cas d'usage très répandu en entreprise (un seul câble/port pour PC + téléphone).

## Suppression et déplacement de ports

```bash
Switch(config)# no vlan 20                            ! supprime le VLAN (les ports affectés repassent au VLAN par défaut à la prochaine vérification)
Switch(config-if)# no switchport access vlan           ! remet le port au VLAN par défaut (1)
```

## Ce qu'il faut retenir

- Un VLAN = un **domaine de broadcast logique** distinct, indépendant du câblage physique.
- `vlan <id>` + `name` créent le VLAN ; `switchport mode access` + `switchport access vlan <id>` l'affectent à un port.
- Le **VLAN voix** se superpose au VLAN données sur un même port access (`switchport voice vlan`).
- La communication **inter-VLAN** nécessite un routeur ou un switch de couche 3 (voir cours suivant).

## Pour aller plus loin

- [IEEE 802.1Q Standard](https://standards.ieee.org/ieee/802.1Q/7061/)
- [Cisco — VLAN Configuration Guide](https://www.cisco.com/c/en/us/support/docs/lan-switching/vlan/10023-3.html)
