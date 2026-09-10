---
id: 02-table-de-routage
title: "Table de routage et processus de décision"
sidebar_position: 2
tags: [reseau]
---

# Table de routage et processus de décision

> Chaque routeur consulte sa **table de routage** pour décider, paquet par paquet, sur quelle interface de sortie transférer un paquet IP, selon le principe fondamental du **longest prefix match** (correspondance du préfixe le plus spécifique).

## Anatomie d'une entrée de table de routage

```bash
Router# show ip route
Codes: C - connected, S - static, O - OSPF, R - RIP, * - candidate default

Gateway of last resort is 203.0.113.1 to network 0.0.0.0

O    192.168.30.0/24 [110/2] via 10.0.0.6, 00:12:34, GigabitEthernet0/2
C    10.0.0.0/30 is directly connected, GigabitEthernet0/1
L    10.0.0.1/32 is directly connected, GigabitEthernet0/1
S*   0.0.0.0/0 [1/0] via 203.0.113.1
```

```text
   O    192.168.30.0/24   [110/2]        via 10.0.0.6, 00:12:34, Gi0/2
   │    │                  │    │         │            │          │
   │    │                  │    └Métrique │            │          └ interface de sortie
   │    │                  └AD (distance  │            └ ancienneté de la route
   │    │                    administrat.)│
   │    └ réseau + masque (CIDR)          └ next-hop (prochain saut)
   └ code source (protocole d'origine)
```

| Code | Signification |
|---|---|
| `C` | Réseau directement connecté |
| `L` | Route locale (/32 ou /128, l'adresse exacte de l'interface elle-même) |
| `S` | Route statique |
| `O` | OSPF |
| `D` | EIGRP |
| `R` | RIP |
| `B` | BGP |

## Le principe du longest prefix match

```text
   Table contenant PLUSIEURS routes qui matchent une même destination
   10.0.0.50 :

   0.0.0.0/0         (route par défaut, matche TOUT)
   10.0.0.0/8         (matche 10.0.0.50)
   10.0.0.0/24        (matche 10.0.0.50, PLUS SPÉCIFIQUE)

   → Le routeur choisit TOUJOURS la route au préfixe LE PLUS LONG
     (le plus spécifique), quelle que soit la distance administrative
     ou la métrique : ici, 10.0.0.0/24 (/24 > /8 > /0)
```

C'est une règle **absolue et prioritaire** sur la distance administrative : la distance administrative ne départage que des routes vers un **même préfixe exact** appris par plusieurs sources ; face à des préfixes de longueurs différentes, le plus spécifique gagne toujours.

## Processus de décision de transfert (packet forwarding)

```text
   1. Le routeur reçoit un paquet IP sur une interface
   2. Décapsule jusqu'à la couche 3, lit l'adresse IP DESTINATION
   3. Consulte la table de routage :
      a. Recherche la correspondance la PLUS SPÉCIFIQUE (longest match)
      b. Si aucune correspondance ET pas de route par défaut
         → paquet DROPPÉ, envoi d'un ICMP "Destination Unreachable"
      c. Si correspondance trouvée → détermine le next-hop et
         l'interface de sortie
   4. Ré-encapsule le paquet dans une NOUVELLE trame de couche 2
      adaptée au segment de sortie (nouvelle @MAC dst = celle du
      next-hop, obtenue via ARP/NDP)
   5. Décrémente le TTL (IPv4) / Hop Limit (IPv6) de 1
      → si TTL atteint 0, paquet droppé, ICMP "Time Exceeded"
        (mécanisme exploité par traceroute)
6. Transmet le paquet sur l'interface de sortie
```

## Routes récursives vs routes à interface de sortie directe

```text
   ip route 192.168.20.0 255.255.255.0 10.0.0.2
   → route RÉCURSIVE : le routeur doit d'abord chercher COMMENT
     joindre 10.0.0.2 lui-même dans la table (une recherche
     supplémentaire), avant de pouvoir déterminer l'interface
     de sortie réelle

   ip route 192.168.20.0 255.255.255.0 serial 0/0/0
   → route à INTERFACE DIRECTE : pas de recherche récursive
     nécessaire (adapté seulement aux liens point-à-point où
     l'interface de sortie est non-ambiguë)
```

## Ce qu'il faut retenir

- Une entrée de table = code source + préfixe (réseau/masque) + `[AD/métrique]` + next-hop + interface de sortie.
- Le **longest prefix match** est la règle absolue : le préfixe le plus spécifique gagne toujours, avant même la distance administrative.
- Le routeur décrémente le **TTL/Hop Limit** à chaque saut ; un TTL à 0 génère un ICMP Time Exceeded (base de `traceroute`).
- Une route statique pointant vers un next-hop IP (plutôt qu'une interface) est **récursive** : elle nécessite une recherche supplémentaire dans la table.

## Pour aller plus loin

- [Cisco — How Does Load Balancing Work?](https://www.cisco.com/c/en/us/support/docs/ip/enhanced-interior-gateway-routing-protocol-eigrp/5212-46.html)
- [RFC 1812 — Requirements for IP Version 4 Routers](https://www.rfc-editor.org/rfc/rfc1812)
