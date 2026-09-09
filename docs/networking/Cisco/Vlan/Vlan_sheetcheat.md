---
id: vlan-cheatsheet
title: VLANs - Cheat Sheet
sidebar_position: 2
tags: [reseau, cheatsheet]
---

# VLANs — Cheat Sheet

> Adapté du cheat sheet de Jeremy Stretch (packetlife.net), v2.0.

## Trunk Encapsulation

Comparaison des deux encapsulations de trunk et de la structure de leurs trames.

### Structure des trames

**ISL** (champs, en octets) :

| Champ | ISL Header | Dest MAC | Source MAC | Type | FCS |
| ----- | ---------- | -------- | ---------- | ---- | --- |
| Taille (octets) | 26 | 6 | 6 | 2 | 4 |

**Untagged** (trame Ethernet standard) :

| Champ | Dest MAC | Source MAC | Type |
| ----- | -------- | ---------- | ---- |
| — | 6 | 6 | 2 |

**802.1Q** (avec tag inséré) :

| Champ | Dest MAC | Source MAC | 802.1Q | Type |
| ----- | -------- | ---------- | ------ | ---- |
| Taille (octets) | 6 | 6 | 4 | 2 |

## Trunk Types

| Caractéristique | 802.1Q | ISL |
| --------------- | ------ | --- |
| Header Size | 4 bytes | 26 bytes |
| Trailer Size | N/A | 4 bytes |
| Standard | IEEE | Cisco |
| Maximum VLANs | 4094 | 1000 |

## VLAN Numbers

| Numéro | Rôle |
| ------ | ---- |
| 0 | Reserved |
| 1 | default |
| 1002 | fddi-default |
| 1003 | tr |
| 1004 | fdnet |
| 1005 | trnet |
| 1006-4094 | Extended |
| 4095 | Reserved |

## Configuration

### VLAN Creation

```bash
Switch(config)# vlan 100
Switch(config-vlan)# name Engineering
```

### Access Port Configuration

```bash
Switch(config-if)# switchport mode access
Switch(config-if)# switchport nonegotiate
Switch(config-if)# switchport access vlan 100
Switch(config-if)# switchport voice vlan 150
```

### Trunk Port Configuration

```bash
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk encapsulation dot1q
Switch(config-if)# switchport trunk allowed vlan 10,20-30
Switch(config-if)# switchport trunk native vlan 10
```

### SVI Configuration

```bash
Switch(config)# interface vlan100
Switch(config-if)# ip address 192.168.100.1 255.255.255.0
```

## VLAN Trunking Protocol (VTP)

**Domain** — Commun à tous les switches participant au VTP.

**Server Mode** — Génère et propage les advertisements VTP vers les clients ; mode par défaut sur un switch non configuré.

**Client Mode** — Reçoit et transfère les advertisements des serveurs ; les VLANs ne peuvent pas être configurés manuellement sur un switch en mode client.

**Transparent Mode** — Transfère les advertisements mais ne participe pas au VTP ; les VLANs doivent être configurés manuellement.

**Pruning** — Les VLANs n'ayant aucun access port sur un switch d'extrémité sont retirés du trunk pour réduire le trafic inondé (flooded traffic).

### VTP Configuration

```bash
Switch(config)# vtp mode {server | client | transparent}
Switch(config)# vtp domain <name>
Switch(config)# vtp password <password>
Switch(config)# vtp version {1 | 2}
Switch(config)# vtp pruning
```

## Terminology

**Trunking** — Transport de plusieurs VLANs sur la même connexion physique.

**Native VLAN** — Par défaut, les trames de ce VLAN sont non taguées (untagged) lorsqu'elles traversent un trunk.

**Access VLAN** — Le VLAN auquel un access port est assigné.

**Voice VLAN** — Si configuré, active un trunking minimal pour supporter le trafic voix en plus du trafic data sur un access port.

**Dynamic Trunking Protocol (DTP)** — Peut être utilisé pour établir automatiquement des trunks entre ports compatibles (non sécurisé).

**Switched Virtual Interface (SVI)** — Interface virtuelle fournissant une passerelle routée en entrée et sortie d'un VLAN.

## Switch Port Modes

| Mode | Comportement |
| ---- | ------------ |
| `trunk` | Forme un trunk inconditionnel |
| `dynamic desirable` | Tente de négocier un trunk avec l'extrémité distante |
| `dynamic auto` | Forme un trunk seulement si l'extrémité distante le demande |
| `access` | Ne formera jamais de trunk |

## Troubleshooting

```bash
show vlan
show interface [status | switchport]
show interface trunk
show vtp status
show vtp password
```
