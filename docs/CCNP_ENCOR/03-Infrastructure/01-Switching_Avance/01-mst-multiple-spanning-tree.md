---
id: 01-mst-multiple-spanning-tree
title: "MST (Multiple Spanning Tree) : STP pour grand nombre de VLANs"
sidebar_position: 1
tags: [reseau, cheatsheet]
---

# MST (Multiple Spanning Tree) : STP pour grand nombre de VLANs

> **PVST+** (vu en CCNA 2) fait tourner **une instance STP par VLAN**, précis mais coûteux en ressources CPU/mémoire dès que le nombre de VLANs devient important (des centaines de VLANs = des centaines d'instances STP en parallèle). **MST** (IEEE 802.1s) résout ce problème en regroupant plusieurs VLANs dans un nombre **limité d'instances**.

## Le problème de scalabilité de PVST+

```text
   PVST+ avec 200 VLANs = 200 INSTANCES STP INDÉPENDANTES,
   chacune avec ses propres calculs de Root Bridge, ses propres
   BPDU, sa propre table de topologie

   → charge CPU/mémoire proportionnelle au nombre de VLANs
   → sur un grand réseau (campus avec des centaines de VLANs),
     devient un facteur limitant réel
```

## Principe MST : mapper plusieurs VLANs sur peu d'instances

```text
   MST REGION "CAMPUS_A" :

   Instance MST 0 (IST - Internal Spanning Tree, toujours présente)
   → VLANs non explicitement mappés ailleurs

   Instance MST 1 → VLANs 10, 20, 30, 40   (ex. tous les VLANs "data")
   Instance MST 2 → VLANs 100, 200, 300     (ex. tous les VLANs "voix")

   → SEULEMENT 3 instances STP au total pour gérer des CENTAINES
     de VLANs, chaque instance calculant sa PROPRE topologie
     (permet quand même un équilibrage de charge entre liens
     redondants, comme PVST+, mais avec un coût de calcul bien
     moindre)
```

Chaque **instance MST** conserve la possibilité de bloquer des liens différents (donc de répartir la charge entre chemins redondants, comme PVST+), mais le nombre d'instances à calculer est **choisi par l'administrateur** (typiquement une poignée) plutôt qu'imposé par le nombre de VLANs.

## Régions MST : notion de compatibilité

```text
   Pour que plusieurs switches appartiennent à la MÊME "région"
   MST (et donc partagent les mêmes instances), TROIS paramètres
   doivent être IDENTIQUES :

   1. Nom de la région (configuration name)
   2. Numéro de révision (revision number)
   3. Table de mapping VLAN → instance (identique caractère
      pour caractère)

   Un switch avec UN SEUL de ces paramètres différent est
   considéré dans une région MST DIFFÉRENTE — MST traite alors
   la frontière entre régions comme une frontière STP classique
   (calcul CST - Common Spanning Tree entre régions)
```

## Configuration

```bash
Switch(config)# spanning-tree mode mst

Switch(config)# spanning-tree mst configuration
Switch(config-mst)# name CAMPUS_A
Switch(config-mst)# revision 1
Switch(config-mst)# instance 1 vlan 10,20,30,40
Switch(config-mst)# instance 2 vlan 100,200,300
Switch(config-mst)# exit

! Priorité par instance (équivalent de "spanning-tree vlan X priority" en PVST+)
Switch(config)# spanning-tree mst 1 priority 4096
Switch(config)# spanning-tree mst 1 root primary
```

**Point critique d'examen** : la configuration MST (name, revision, mapping) doit être **identique au caractère près** sur tous les switches d'une même région — une simple différence de casse ou d'espace dans le nom de région place le switch dans une région distincte, cassant le comportement attendu.

## Vérification

```bash
Switch# show spanning-tree mst configuration
Name      [CAMPUS_A]
Revision  1     Instances configured 3

Instance  Vlans mapped
--------  ---------------------------------------------------------------
0         5-9,11-19,21-29,31-39,41-99,101-199,201-299,301-4094
1         10,20,30,40
2         100,200,300

Switch# show spanning-tree mst 1
Switch# show spanning-tree mst 1 interface gigabitEthernet 0/1
```

## MST vs PVST+ : comparatif

| Critère | PVST+ | MST |
|---|---|---|
| Instances STP | Une par VLAN | Un nombre **limité** choisi par l'administrateur |
| Charge CPU/mémoire | Croît avec le nombre de VLANs | Reste stable quel que soit le nombre de VLANs |
| Standard | Propriétaire Cisco (basé sur RSTP) | Standard IEEE 802.1s |
| Équilibrage de charge inter-liens | Oui, par VLAN | Oui, par instance |
| Complexité de configuration | Simple | Plus complexe (régions à synchroniser) |

## Ce qu'il faut retenir

- **MST** regroupe de nombreux VLANs en un nombre limité d'**instances STP**, résolvant le problème de scalabilité de PVST+ (une instance par VLAN).
- Une **région MST** exige nom, révision et mapping VLAN→instance strictement identiques sur tous les switches membres.
- L'équilibrage de charge reste possible (par instance plutôt que par VLAN), avec une charge de calcul bien inférieure à PVST+ sur un grand nombre de VLANs.

## Pour aller plus loin

- [IEEE 802.1s Standard (intégré à 802.1Q)](https://standards.ieee.org/ieee/802.1Q/7061/)
- [Cisco — Understanding Multiple Spanning Tree Protocol](https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/24248-147.html)
