---
id: 03-coexistence-ipv4-ipv6
title: "Coexistence IPv4/IPv6 : dual-stack, tunneling, traduction"
sidebar_position: 3
tags: [reseau]
---

# Coexistence IPv4/IPv6 : dual-stack, tunneling, traduction

> IPv4 et IPv6 ne sont **pas interopérables nativement** (piles protocolaires distinctes). La transition, entamée depuis les années 2000, repose sur trois grandes stratégies : faire tourner les deux piles en parallèle, encapsuler IPv6 dans IPv4, ou traduire entre les deux.

## Stratégie 1 : Dual-stack (la plus recommandée)

```text
   Hôte / routeur DUAL-STACK

   ┌──────────────────────────────────────┐
   │  Pile IPv4          Pile IPv6          │
   │  192.168.1.10       2001:DB8::10       │
   └──────────────────────────────────────┘
              │                  │
        [Réseau IPv4]      [Réseau IPv6]
        (routage IPv4       (routage IPv6
         indépendant)        indépendant)
```

Chaque équipement possède simultanément une adresse IPv4 et une adresse IPv6, avec des tables de routage et des protocoles de routage distincts (ex. OSPFv2 pour IPv4, OSPFv3 pour IPv6) fonctionnant en parallèle. C'est la méthode **recommandée par l'IETF** (RFC 4213) car elle ne dégrade aucune des deux piles et permet une bascule progressive.

```bash
Router(config)# ipv6 unicast-routing
Router(config)# interface gigabitEthernet 0/0
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# ipv6 address 2001:DB8:1::1/64
```

## Stratégie 2 : Tunneling (IPv6 sur infrastructure IPv4)

```text
   Site A (IPv6)      Infrastructure IPv4        Site B (IPv6)
   [Routeur A] ══════════ tunnel ══════════ [Routeur B]

   Paquet IPv6 original
   ┌──────────────────┐
   │  En-tête IPv6      │
   │  + données          │
   └──────────────────┘
            │ encapsulation dans un paquet IPv4
            ▼
   ┌────────────┬──────────────────┐
   │ En-tête IPv4│  En-tête IPv6 +   │
   │ (protocole  │  données           │
   │  41 = IPv6) │  (payload intact)  │
   └────────────┴──────────────────┘
```

Utilisé quand deux sites IPv6 doivent communiquer à travers une infrastructure encore purement IPv4 (opérateur, FAI). Le paquet IPv6 complet est encapsulé comme payload d'un paquet IPv4 (protocole IP numéro 41), puis désencapsulé à l'autre extrémité du tunnel.

```bash
Router(config)# interface tunnel 0
Router(config-if)# ipv6 address 2001:DB8:AAAA::1/64
Router(config-if)# tunnel source gigabitEthernet 0/0
Router(config-if)# tunnel destination 203.0.113.2
Router(config-if)# tunnel mode ipv6ip
```

| Mécanisme de tunneling | Principe |
|---|---|
| **6to4** | Tunnel automatique basé sur l'adresse IPv4 publique encodée dans le préfixe IPv6 (2002::/16) |
| **Teredo** | Tunnel IPv6 à travers du NAT IPv4, pour hôtes individuels |
| **GRE / tunnel manuel** | Tunnel point-à-point configuré explicitement entre deux routeurs (comme l'exemple ci-dessus) |
| **6RD** (Rapid Deployment) | Variante de 6to4 utilisée par certains FAI pour déployer IPv6 rapidement sur leur infrastructure IPv4 |

## Stratégie 3 : Traduction (NAT64/DNS64)

```text
   Hôte IPv6-only                              Serveur IPv4-only
   2001:DB8::10                                 203.0.113.50

        │  requête DNS "exemple.com" (AAAA ?)
        ▼
   [Résolveur DNS64] : pas d'enregistrement AAAA → synthétise une
                        adresse IPv6 spéciale intégrant l'IPv4
                        (ex. 64:ff9b::203.0.113.50)
        │
        ▼
   [Routeur NAT64] : traduit le paquet IPv6 entrant en paquet IPv4
                      sortant vers 203.0.113.50, et inversement
                      pour le retour
```

Utilisé pour permettre à des hôtes **IPv6-only** (de plus en plus fréquents, notamment en mobile) d'accéder à des ressources encore uniquement en IPv4, sans dual-stack ni tunnel — la traduction se fait de façon transparente pour le client via la combinaison **DNS64 + NAT64**.

## Comparatif des trois approches

| Stratégie | Complexité | Cas d'usage typique |
|---|---|---|
| **Dual-stack** | Faible (mais double la charge de gestion/routage) | Réseau d'entreprise en transition progressive |
| **Tunneling** | Moyenne | Connecter des îlots IPv6 à travers un cœur de réseau encore IPv4 |
| **Traduction (NAT64)** | Plus élevée | Réseaux mobiles/IPv6-only devant atteindre l'Internet IPv4 restant |

## Ce qu'il faut retenir

- **Dual-stack** = les deux piles tournent en parallèle, approche recommandée par défaut (RFC 4213).
- **Tunneling** encapsule IPv6 dans IPv4 (protocole 41) pour traverser une infrastructure IPv4 (6to4, Teredo, GRE, 6RD).
- **NAT64/DNS64** traduit entre IPv6 et IPv4 pour les hôtes IPv6-only accédant à des ressources encore en IPv4.

## Pour aller plus loin

- [RFC 4213 — Basic Transition Mechanisms for IPv6 Hosts and Routers](https://www.rfc-editor.org/rfc/rfc4213)
- [RFC 6146 — Stateful NAT64](https://www.rfc-editor.org/rfc/rfc6146)
