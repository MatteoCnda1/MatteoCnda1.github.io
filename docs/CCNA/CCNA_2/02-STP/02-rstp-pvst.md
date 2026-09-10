---
id: 02-rstp-pvst
title: "RSTP, PVST+ et configuration STP"
sidebar_position: 2
tags: [reseau, cheatsheet]
---

# RSTP, PVST+ et configuration STP

> Le STP original (802.1D) converge **lentement** (jusqu'à 50 secondes) après un changement de topologie. **RSTP** (802.1w) réduit ce délai à quelques secondes. **PVST+** (Per-VLAN Spanning Tree, propriétaire Cisco) fait tourner une instance STP indépendante par VLAN.

## Les états de port STP (802.1D classique)

```text
   BLOCKING (20s max) → LISTENING (15s) → LEARNING (15s) → FORWARDING
   (bloque, écoute      (écoute les       (apprend les      (transfère
    les BPDU)            BPDU, ne          @MAC, ne           le trafic
                          transfère        transfère            normalement)
                          toujours pas)    toujours pas)

   Convergence totale possible : jusqu'à 50 secondes après un
   changement de topologie (lien coupé, nouveau switch...)
```

Ce délai de 50 secondes, acceptable dans les années 1990, est **inacceptable** dans un réseau moderne (coupure de service ressentie par les utilisateurs, applications temps réel).

## RSTP (Rapid STP, 802.1w) : convergence en quelques secondes

```text
   États RSTP (simplifiés à 3, fusion Blocking+Listening) :

   DISCARDING → LEARNING → FORWARDING

   Mécanismes de convergence rapide :
   - Handshake explicite entre ports (Proposal/Agreement) au lieu
     d'attendre des timers fixes
   - Edge ports (équivalent PortFast) passent directement en
     forwarding sans attendre de BPDU
   - Backup immédiat : un port Alternate bascule en forwarding
     dès la perte du Root Port, sans repasser par tous les états
```

| Rôle de port | 802.1D | RSTP (802.1w) |
|---|---|---|
| Root Port | Root Port | Root Port |
| Designated Port | Designated Port | Designated Port |
| Port bloqué redondant | Blocking | **Alternate** (backup du Root Port) ou **Backup** (backup d'un Designated Port sur un segment partagé) |

RSTP est aujourd'hui le standard de fait, activé par défaut sur la plupart des switches Cisco récents (`spanning-tree mode rapid-pvst`).

## PVST+ : une instance STP par VLAN

```text
   STP classique (802.1D pur) : UNE SEULE instance pour TOUS les VLANs
   → impossible de charger-équilibrer le trafic entre liens redondants

   PVST+ (Cisco) : UNE instance STP INDÉPENDANTE par VLAN
   → chaque VLAN peut avoir un Root Bridge et une topologie
     bloquée différents → équilibrage de charge possible

   Exemple :
   VLAN 10 → Root Bridge = SW1, lien SW1-SW3 actif, SW2-SW3 bloqué
   VLAN 20 → Root Bridge = SW2, lien SW2-SW3 actif, SW1-SW3 bloqué
   (charge répartie sur les deux liens redondants selon le VLAN)
```

## Configuration : priorité et Root Bridge

```bash
! Forcer un switch à devenir Root Bridge pour un VLAN donné
Switch(config)# spanning-tree vlan 10 priority 4096
! (valeur multiple de 4096, de 0 à 61440 ; plus bas = préféré)

! Raccourci Cisco équivalent (ajuste automatiquement la priorité)
Switch(config)# spanning-tree vlan 10 root primary
Switch(config)# spanning-tree vlan 10 root secondary   ! sur un 2e switch, backup

! Activer RSTP (Rapid PVST+)
Switch(config)# spanning-tree mode rapid-pvst
```

## PortFast et BPDU Guard (ports d'accès terminaux)

```bash
! PortFast : le port passe directement en forwarding (utile pour
! un PC, pas un switch/routeur en aval, qui doit rester en STP normal)
Switch(config-if)# spanning-tree portfast

! BPDU Guard : désactive le port si une BPDU y est reçue
! (protection contre un switch non autorisé branché sur un port
! utilisateur, qui pourrait perturber l'élection du Root Bridge)
Switch(config-if)# spanning-tree bpduguard enable

! Activation globale, sur tous les ports PortFast
Switch(config)# spanning-tree portfast bpduguard default
```

**Cas d'usage concret** : un port de switch dédié à un poste utilisateur n'a pas besoin d'attendre 30-50 secondes de convergence STP avant de transférer du trafic (ex. un PC qui démarre et lance un DHCP Discover trop tôt échouerait sinon). `spanning-tree portfast` élimine ce délai sur les ports terminaux, à condition qu'aucun switch ne soit jamais branché dessus (d'où l'intérêt de coupler avec `bpduguard`, qui coupe le port si une BPDU y apparaît malgré tout).

## Vérification

```bash
Switch# show spanning-tree vlan 10
Switch# show spanning-tree summary
Switch mode: Rapid-PVST
Switch# show spanning-tree interface gigabitEthernet 0/1 detail
```

## Ce qu'il faut retenir

- STP 802.1D classique converge en jusqu'à **50 secondes** (Blocking→Listening→Learning→Forwarding) ; **RSTP** (802.1w) réduit cela à quelques secondes via des mécanismes de handshake actif.
- **PVST+** fait tourner une instance STP par VLAN, permettant l'équilibrage de charge entre liens redondants selon le VLAN.
- `spanning-tree vlan X priority` ou `root primary/secondary` contrôlent l'élection du Root Bridge.
- **PortFast** + **BPDU Guard** accélèrent la convergence sur les ports terminaux tout en se protégeant d'un switch non autorisé branché par erreur.

## Pour aller plus loin

- [IEEE 802.1w Standard (intégré à 802.1D-2004)](https://standards.ieee.org/ieee/802.1D/3961/)
- [Cisco — Spanning Tree PortFast BPDU Guard Enhancement](https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/10586-65.html)
