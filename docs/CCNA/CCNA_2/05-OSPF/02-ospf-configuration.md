---
id: 02-ospf-configuration
title: "Configuration OSPF, élection DR/BDR et métrique"
sidebar_position: 2
tags: [reseau, cheatsheet]
---

# Configuration OSPF, élection DR/BDR et métrique

## Configuration de base (OSPFv2, IPv4)

```bash
Router(config)# router ospf 1                          ! "1" = process ID local (n'a pas besoin de correspondre entre routeurs)
Router(config-router)# router-id 1.1.1.1                ! fixé manuellement (bonne pratique)
Router(config-router)# network 192.168.1.0 0.0.0.255 area 0
Router(config-router)# network 10.0.0.0 0.0.0.3 area 0
Router(config-router)# passive-interface gigabitEthernet 0/2   ! annonce le réseau SANS envoyer de Hello (ex. interface LAN sans autre routeur)
```

- `network <adresse> <wildcard-mask> area <id>` : identifie les interfaces à activer pour OSPF, via un **masque générique (wildcard)**, inverse du masque de sous-réseau (0.0.0.255 = /24).
- `passive-interface` : l'interface est annoncée dans OSPF mais n'envoie/ne reçoit aucun paquet Hello — utilisé sur les interfaces LAN terminales pour éviter d'exposer inutilement OSPF à des hôtes non-routeurs (surface d'attaque réduite).

## Configuration OSPFv3 (IPv6)

```bash
Router(config)# ipv6 unicast-routing
Router(config)# interface gigabitEthernet 0/0
Router(config-if)# ipv6 ospf 1 area 0        ! activation directement sur l'interface (différence clé vs OSPFv2)
```

Différence majeure avec OSPFv2 : en **OSPFv3**, l'activation se fait directement **sur chaque interface** (`ipv6 ospf area`), pas via une commande `network` globale sous `router ospf`.

## Élection DR/BDR sur segments multi-accès

```text
   Sur un segment MULTI-ACCÈS (ex. LAN Ethernet avec 4 routeurs),
   sans DR/BDR, chaque routeur formerait une adjacence FULL avec
   TOUS les autres → N×(N-1)/2 adjacences, beaucoup de trafic
   Hello/LSA redondant.

   AVEC DR/BDR :

        [R1]────┐
        [R2]────┼──[DR]────[BDR]
        [R3]────┘    │        │
                  Tous les DROTHER forment une adjacence FULL
                  UNIQUEMENT avec le DR et le BDR (pas entre eux)

   → réduit les adjacences de N×(N-1)/2 à 2×(N-1)
```

```text
   Critères d'élection DR/BDR (dans l'ordre) :

   1. PRIORITÉ OSPF la plus élevée (ospf priority, 0-255, défaut 1)
      → priorité 0 = ne participera JAMAIS à l'élection
   2. En cas d'égalité : ROUTER ID le plus élevé

   Important : l'élection N'EST PAS préemptive — un routeur avec
   une priorité plus élevée arrivant APRÈS l'élection ne délogera
   PAS le DR déjà élu (il faut réinitialiser le processus OSPF
   pour forcer une nouvelle élection)
```

```bash
Router(config-if)# ip ospf priority 100     ! favorise ce routeur pour devenir DR
Router(config-if)# ip ospf priority 0        ! exclut ce routeur de l'élection (jamais DR/BDR)
```

## Métrique OSPF : le coût

```text
   Coût OSPF = référence de bande passante (par défaut 100 Mbps) ÷
               bande passante de l'interface (en Mbps)

   Interface 100 Mbps  → coût = 100/100 = 1
   Interface 1 Gbps    → coût = 100/1000 = 0 (arrondi à 1, limite historique !)
   Interface 10 Mbps   → coût = 100/10 = 10

   PROBLÈME sur les réseaux modernes : la référence par défaut de
   100 Mbps ne distingue plus 1 Gbps de 10 Gbps (les deux arrondis
   à un coût de 1) → ajuster la référence est nécessaire
```

```bash
! Ajuster la référence de bande passante (à appliquer IDENTIQUEMENT
! sur TOUS les routeurs du domaine OSPF pour rester cohérent)
Router(config-router)# auto-cost reference-bandwidth 10000    ! en Mbps, ici 10 Gbps

! Forcer manuellement le coût d'une interface spécifique
Router(config-if)# ip ospf cost 5
```

Le coût total d'une route = **somme des coûts** de chaque interface de sortie traversée jusqu'à la destination ; OSPF choisit toujours le chemin au coût cumulé le plus bas (calculé via Dijkstra).

## Vérification

```bash
Router# show ip ospf neighbor
Router# show ip ospf interface gigabitEthernet 0/1
Router# show ip protocols
Router# show ip route ospf
O    192.168.30.0/24 [110/2] via 10.0.0.6, 00:12:34, GigabitEthernet0/2
Router# show ip ospf database          ! contenu de la LSDB
```

## Ce qu'il faut retenir

- `router ospf <process-id>` + `network <réseau> <wildcard> area <id>` activent OSPFv2 ; OSPFv3 (IPv6) s'active directement par interface (`ipv6 ospf area`).
- `passive-interface` annonce un réseau sans envoyer de Hello — à utiliser sur toute interface LAN sans autre routeur OSPF.
- **DR/BDR** réduisent le nombre d'adjacences sur un segment multi-accès ; élection non préemptive basée sur priorité puis Router ID.
- **Coût** OSPF = référence de bande passante ÷ bande passante interface ; ajuster `auto-cost reference-bandwidth` (identiquement partout) sur les réseaux ≥ 1 Gbps.

## Pour aller plus loin

- [RFC 2328 — OSPF Version 2](https://www.rfc-editor.org/rfc/rfc2328)
- [RFC 5340 — OSPF for IPv6](https://www.rfc-editor.org/rfc/rfc5340)
