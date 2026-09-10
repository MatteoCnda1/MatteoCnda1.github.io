---
id: 03-inter-vlan-routing
title: "Routage inter-VLAN : router-on-a-stick et SVI"
sidebar_position: 3
tags: [reseau, cheatsheet]
---

# Routage inter-VLAN : router-on-a-stick et SVI

> Les VLANs isolent les domaines de broadcast — pour que deux VLANs communiquent entre eux, un équipement de couche 3 (routeur ou switch multicouche) doit router entre eux. Deux approches principales : **router-on-a-stick** et **routage via SVI** sur un switch de couche 3.

## Router-on-a-stick (routeur + sous-interfaces)

```text
   [PC VLAN10]──┐                    ┌── [PC VLAN20]
                │                     │
             [Switch] ═══ trunk ═══ [Routeur]
                                    (1 seule interface
                                     physique, plusieurs
                                     sous-interfaces logiques)
```

Un **seul lien physique** (trunk 802.1Q) relie le switch au routeur ; le routeur crée des **sous-interfaces** virtuelles (une par VLAN), chacune avec sa propre adresse IP servant de passerelle pour son VLAN.

```bash
! Côté switch : port en trunk vers le routeur
Switch(config)# interface gigabitEthernet 0/1
Switch(config-if)# switchport mode trunk

! Côté routeur : sous-interfaces
Router(config)# interface gigabitEthernet 0/0.10
Router(config-subif)# encapsulation dot1Q 10
Router(config-subif)# ip address 192.168.10.1 255.255.255.0

Router(config)# interface gigabitEthernet 0/0.20
Router(config-subif)# encapsulation dot1Q 20
Router(config-subif)# ip address 192.168.20.1 255.255.255.0

Router(config)# interface gigabitEthernet 0/0
Router(config-if)# no shutdown          ! l'interface physique parente doit être active
```

Limite pratique : toutes les VLANs partagent la **bande passante du lien physique unique**, ce qui peut créer un goulot d'étranglement sur des réseaux à fort trafic inter-VLAN.

## Routage via switch de couche 3 (SVI routées)

```text
   [PC VLAN10]──┐                ┌── [PC VLAN20]
                │                 │
             [Switch de couche 3 — routage ET commutation intégrés]
             SVI VLAN10 = passerelle VLAN10
             SVI VLAN20 = passerelle VLAN20
```

Un **switch multicouche** (Layer 3 switch) route directement entre VLANs en interne, sans passer par un lien externe dédié — approche standard en production (datacenter, cœur de réseau d'entreprise) car bien plus performante (routage matériel via ASIC, pas de goulot sur un lien unique).

```bash
Switch(config)# ip routing                       ! active le routage IP sur le switch (indispensable !)

Switch(config)# interface vlan 10
Switch(config-if)# ip address 192.168.10.1 255.255.255.0
Switch(config-if)# no shutdown

Switch(config)# interface vlan 20
Switch(config-if)# ip address 192.168.20.1 255.255.255.0
Switch(config-if)# no shutdown
```

**Point critique fréquemment oublié** : sans `ip routing`, un switch de couche 3 continue de se comporter comme un switch de couche 2 classique pour l'inter-VLAN — les SVIs existent mais ne routent pas entre elles.

## Comparatif des deux approches

| Critère | Router-on-a-stick | SVI (switch L3) |
|---|---|---|
| Matériel requis | Routeur + switch L2 classique | Switch multicouche (L3) |
| Bande passante inter-VLAN | Limitée au lien trunk unique | Interne, très haute performance |
| Coût | Plus faible (switch L2 économique) | Plus élevé (switch L3) |
| Usage typique | Petit réseau, labo, succursale | Cœur de réseau d'entreprise |

## Vérification

```bash
Router# show ip interface brief
GigabitEthernet0/0.10   192.168.10.1   YES manual up   up
GigabitEthernet0/0.20   192.168.20.1   YES manual up   up

Switch# show ip route
C    192.168.10.0/24 is directly connected, Vlan10
C    192.168.20.0/24 is directly connected, Vlan20
```

## Ce qu'il faut retenir

- **Router-on-a-stick** : un routeur avec des sous-interfaces `encapsulation dot1Q <id>`, un seul lien trunk physique vers le switch.
- **SVI sur switch L3** : `ip routing` + `interface vlan <id>` avec une IP par VLAN — approche standard en production pour la performance.
- Sans `ip routing` activé explicitement, un switch de couche 3 ne route pas entre VLANs même si les SVIs sont configurées.

## Pour aller plus loin

- [Cisco — Inter-VLAN Routing Configuration Example](https://www.cisco.com/c/en/us/support/docs/lan-switching/inter-vlan-routing/41860-howto-L3-intervlanrouting.html)
