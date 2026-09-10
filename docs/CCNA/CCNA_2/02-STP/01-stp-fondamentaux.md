---
id: 01-stp-fondamentaux
title: "STP : prévenir les boucles de commutation"
sidebar_position: 1
tags: [reseau]
---

# STP : prévenir les boucles de commutation

> **STP** (Spanning Tree Protocol, IEEE 802.1D) empêche les **boucles de commutation** dans une topologie redondante, en bloquant logiquement certains ports pour ne conserver qu'un **arbre sans boucle** (spanning tree) tout en gardant les liens physiques redondants prêts à prendre le relais en cas de panne.

## Pourquoi la redondance physique cause des boucles fatales

```text
   Topologie redondante SANS STP :

        [SW1]══════════[SW2]
           ║                ║
           ╚════════════════╝
        (double lien = boucle physique)

   PROBLÈMES en cascade dès qu'une trame broadcast/inconnue circule :

   1. TEMPÊTE DE BROADCAST (broadcast storm)
      Une trame broadcast tourne indéfiniment en boucle, dupliquée à
      chaque passage → sature la bande passante en quelques secondes

   2. INSTABILITÉ DE LA TABLE MAC
      Le switch voit la MÊME @MAC source arriver par des ports
      différents en alternance → réapprend en boucle, table instable

   3. DUPLICATION DE TRAMES
      Une même trame unicast peut arriver plusieurs fois au
      destinataire, dupliquée par les chemins multiples
```

Sans STP, un réseau redondant (souhaitable pour la tolérance de panne) devient **inutilisable en quelques secondes** dès qu'une boucle physique existe et qu'une trame broadcast y circule (aucun TTL au niveau 2, contrairement à IP).

## Élection du Root Bridge

```text
   BID (Bridge ID) = Priorité (2 octets, défaut 32768) + @MAC (6 octets)

   1. Chaque switch s'annonce d'abord comme Root Bridge (BPDU)
   2. Comparaison des BID reçus : le PLUS PETIT BID gagne
      (priorité la plus basse d'abord, puis MAC la plus basse
       en cas d'égalité de priorité)
   3. Le switch avec le plus petit BID devient le ROOT BRIDGE
      (racine de l'arbre, référence pour tous les calculs de coût)
```

## Rôles de port STP

```text
                    [ROOT BRIDGE]
                   Tous les ports : ROOT PORTS désignés ("DP")
                   (racine = tous ses ports actifs sont "designated")
                    /                          \
              (coût le plus bas)          (coût le plus bas)
                  /                               \
            [SW2]                                [SW3]
         Root Port (RP)                       Root Port (RP)
         = port avec le                       = port avec le
           meilleur coût                        meilleur coût
           vers la racine                        vers la racine
              \                                  /
               \                                /
                \______════ liaison SW2-SW3 ═══/
                    Un des deux ports devient
                    DESIGNATED (DP), l'autre
                    devient BLOCKING (BLK)
```

| Rôle de port | Description |
|---|---|
| **Root Port (RP)** | Un seul par switch non-racine : le port avec le **meilleur coût cumulé** vers le Root Bridge |
| **Designated Port (DP)** | Un par segment : le port qui transfère le trafic sur ce segment (tous les ports du Root Bridge sont DP) |
| **Blocking/Alternate (BLK)** | Port redondant qui **ne transfère aucune trame de données** (mais continue de recevoir des BPDU) — élimine la boucle |

## Coût STP par bande passante

| Débit du lien | Coût STP (802.1D original) |
|---|---|
| 10 Mbps | 100 |
| 100 Mbps | 19 |
| 1 Gbps | 4 |
| 10 Gbps | 2 |

Le **coût cumulé** vers la racine = somme des coûts de chaque lien traversé ; le port avec le coût total le plus faible devient Root Port. En cas d'égalité, on départage par le BID du switch voisin le plus bas, puis par l'ID de port le plus bas.

## Les BPDU (Bridge Protocol Data Unit)

```bash
Switch# show spanning-tree
VLAN0001
  Spanning tree enabled protocol ieee
  Root ID    Priority    32769
             Address     aaaa.bbbb.0001
             Cost        4
             Port        1 (GigabitEthernet0/1)

  Bridge ID  Priority    32769  (priority 32768 sys-id-ext 1)
             Address     cccc.dddd.0003

Interface           Role Sts Cost      Prio.Nbr Type
-------------------- ---- --- --------- -------- --------
Gi0/1                Root FWD 4         128.1    P2p
Gi0/2                Altn BLK 4         128.2    P2p
```

- **Root** = ce switch n'est pas la racine, ce port est son Root Port.
- **Altn** (Alternate, terminologie RSTP) = port bloqué redondant.
- **FWD** = forwarding (transfère le trafic), **BLK** = blocking (n'en transfère pas).

## Ce qu'il faut retenir

- Sans STP, une topologie redondante cause tempête de broadcast, instabilité de la table MAC et duplication de trames.
- Le **Root Bridge** est élu via le plus petit BID (priorité + MAC) ; référence pour tous les calculs de coût.
- Chaque switch non-racine a **un** Root Port (meilleur coût vers la racine) ; chaque segment a **un** Designated Port ; les autres ports redondants sont **bloqués**.
- Coût STP décroissant avec le débit : 10 Mbps=100, 100 Mbps=19, 1 Gbps=4, 10 Gbps=2.

## Pour aller plus loin

- [IEEE 802.1D Standard](https://standards.ieee.org/ieee/802.1D/3961/)
- [Cisco — Understanding Spanning-Tree Protocol](https://www.cisco.com/c/en/us/tech/lan-switching/spanning-tree-protocol/index.html)
