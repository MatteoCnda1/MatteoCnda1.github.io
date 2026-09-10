---
id: 02-eigrp-configuration
title: "Configuration EIGRP : named mode, sommation, load-balancing"
sidebar_position: 2
tags: [reseau, cheatsheet]
---

# Configuration EIGRP : named mode, sommation, load-balancing

## Configuration classique (legacy mode)

```bash
Router(config)# router eigrp 100                    ! "100" = Autonomous System Number, DOIT correspondre entre voisins (contrairement au process-id OSPF)
Router(config-router)# network 192.168.1.0 0.0.0.255
Router(config-router)# network 10.0.0.0 0.0.0.3
Router(config-router)# eigrp router-id 1.1.1.1
Router(config-router)# passive-interface gigabitEthernet 0/2
```

**Différence clé avec OSPF** : le numéro d'AS EIGRP **doit correspondre exactement** entre deux voisins pour former une adjacence (contrairement au process-id OSPF, purement local et arbitraire).

## Configuration moderne (named mode) — recommandée

```bash
Router(config)# router eigrp NOM_INSTANCE
Router(config-router)# address-family ipv4 unicast autonomous-system 100
Router(config-router-af)# network 192.168.1.0 0.0.0.255
Router(config-router-af)# af-interface gigabitEthernet 0/2
Router(config-router-af-interface)# passive-interface
Router(config-router-af-interface)# exit-af-interface
Router(config-router-af)# exit-address-family
```

Le **named mode** regroupe la configuration IPv4 et IPv6 sous une syntaxe unifiée, plus lisible sur les configurations complexes, et est la syntaxe recommandée sur les déploiements modernes (le legacy mode reste supporté pour compatibilité).

## Sommation de routes (manuelle)

```bash
Router(config)# interface gigabitEthernet 0/1
Router(config-if)# ip summary-address eigrp 100 192.168.0.0 255.255.0.0
```

Contrairement à OSPF où la sommation se fait uniquement sur un **ABR/ASBR** (frontière de zone), EIGRP permet de sommer des routes sur **n'importe quelle interface** de n'importe quel routeur — une flexibilité supplémentaire, mais qui exige de bien comprendre la topologie pour éviter de créer des boucles de routage via une sommation trop agressive masquant une perte de connectivité réelle vers un sous-réseau spécifique.

## Load-balancing : equal-cost et unequal-cost

```bash
Router(config-router)# maximum-paths 4      ! nb max de chemins à coût ÉGAL (défaut 4, max 32)

! Load-balancing à coût INÉGAL — spécificité EIGRP (rare chez les autres protocoles)
Router(config-router)# variance 2
! autorise l'utilisation de chemins dont la métrique est jusqu'à
! 2× la métrique du meilleur chemin (Successor), PARMI les
! Feasible Successors valides uniquement (jamais une route qui
! violerait la condition de faisabilité, pour éviter les boucles)
```

**La commande `variance`** est une spécificité notable d'EIGRP : elle permet un équilibrage de charge sur des liens de capacités différentes (proportionnellement à leur métrique), une fonctionnalité qu'OSPF n'offre pas nativement (OSPF n'équilibre qu'entre chemins à coût strictement égal).

## Authentification EIGRP (MD5/SHA)

```bash
Router(config)# key chain EIGRP_KEYS
Router(config-keychain)# key 1
Router(config-keychain-key)# key-string MaCléSecrete123

Router(config)# interface gigabitEthernet 0/1
Router(config-if)# ip authentication mode eigrp 100 md5
Router(config-if)# ip authentication key-chain eigrp 100 EIGRP_KEYS
```

## Vérification

```bash
Router# show ip eigrp neighbors
H   Address         Interface   Hold Uptime   SRTT   RTO  Q  Seq
0   10.0.0.2        Gi0/1         13 00:05:23   1     200  0  5

Router# show ip eigrp topology
P 192.168.10.0/24, 1 successors, FD is 3072
        via 10.0.0.2 (3072/2816), GigabitEthernet0/1        ! Successor
        via 10.0.0.6 (5376/2560), GigabitEthernet0/2        ! Feasible Successor (candidat, non installé)

Router# show ip route eigrp
D    192.168.10.0/24 [90/3072] via 10.0.0.2, 00:12:34, GigabitEthernet0/1
```

- `P` (Passive) dans `show ip eigrp topology` = état stable normal ; `A` (Active) = le routeur recherche activement une nouvelle route (aucun Feasible Successor disponible).
- `[90/3072]` dans `show ip route` = `[distance administrative EIGRP interne / métrique composite]`.

## Ce qu'il faut retenir

- Le **named mode** (unifié IPv4/IPv6) est la syntaxe recommandée sur les déploiements modernes, le legacy mode reste fonctionnel.
- EIGRP autorise la **sommation** sur n'importe quelle interface (pas seulement aux frontières de zone comme OSPF).
- **`variance`** permet un load-balancing à **coût inégal** parmi les Feasible Successors valides — spécificité EIGRP absente d'OSPF.
- `show ip eigrp topology` révèle Successor et Feasible Successors ; l'état `Active` (vs `Passive`) indique une recherche de route en cours.

## Pour aller plus loin

- [Cisco — EIGRP Configuration Guide (Named Mode)](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/iproute_eigrp/configuration/xe-16/ire-xe-16-book.html)
- [RFC 7868 — Cisco's EIGRP](https://www.rfc-editor.org/rfc/rfc7868)
