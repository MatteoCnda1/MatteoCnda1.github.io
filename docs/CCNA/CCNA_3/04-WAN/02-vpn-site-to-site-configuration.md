---
id: 02-vpn-site-to-site-configuration
title: "VPN site-to-site : IPsec sur Cisco IOS"
sidebar_position: 2
tags: [reseau, cybersecurite, cheatsheet]
---

# VPN site-to-site : IPsec sur Cisco IOS

> Un **VPN IPsec site-to-site** chiffre le trafic entre deux passerelles (routeurs/firewalls) sur une infrastructure publique non fiable (Internet), rendant le trafic illisible pour un observateur sur le chemin.

## IPsec : les deux phases

```text
   PHASE 1 (IKE Phase 1) : établit un canal SÉCURISÉ et AUTHENTIFIÉ
   entre les deux passerelles elles-mêmes (négociation ISAKMP) —
   protège les négociations à venir, pas encore le trafic utilisateur

        Mode Main (6 messages, plus sûr) ou Mode Aggressive
        (3 messages, plus rapide mais expose plus d'informations)

   PHASE 2 (IKE Phase 2) : négocie les paramètres de chiffrement
   du trafic UTILISATEUR réel (IPsec SA - Security Association),
   protégée par le canal établi en Phase 1

        Mode Quick
```

## Les protocoles IPsec

| Protocole | Rôle |
|---|---|
| **IKE** (Internet Key Exchange) | Négocie et gère les clés de chiffrement automatiquement |
| **AH** (Authentication Header) | Authentifie et vérifie l'intégrité, **ne chiffre pas** le contenu |
| **ESP** (Encapsulating Security Payload) | Chiffre **et** authentifie le contenu — le plus utilisé en pratique |

**ESP** est quasi-systématiquement préféré à AH en pratique, car il fournit à la fois confidentialité (chiffrement) et intégrité — AH n'apporte que l'intégrité, insuffisant pour un usage VPN typique où la confidentialité est l'objectif principal.

## Configuration complète : VPN site-to-site IPsec (crypto map)

```bash
! === Phase 1 (ISAKMP) ===
R1(config)# crypto isakmp policy 10
R1(config-isakmp)# encryption aes 256
R1(config-isakmp)# hash sha256
R1(config-isakmp)# authentication pre-share
R1(config-isakmp)# group 14                        ! groupe Diffie-Hellman (force de l'échange de clé)
R1(config-isakmp)# lifetime 86400

R1(config)# crypto isakmp key MaCléPartagéeForte123 address 203.0.113.2   ! IP publique du site distant

! === Phase 2 (IPsec transform-set) ===
R1(config)# crypto ipsec transform-set TSET esp-aes 256 esp-sha256-hmac

! === Trafic à chiffrer (ACL "interessant traffic") ===
R1(config)# access-list 100 permit ip 192.168.1.0 0.0.0.255 192.168.2.0 0.0.0.255
! définit QUEL trafic doit passer par le tunnel (site A vers site B)

! === Crypto map liant tout ensemble ===
R1(config)# crypto map VPN_MAP 10 ipsec-isakmp
R1(config-crypto-map)# set peer 203.0.113.2
R1(config-crypto-map)# set transform-set TSET
R1(config-crypto-map)# match address 100

! === Application sur l'interface WAN ===
R1(config)# interface gigabitEthernet 0/1
R1(config-if)# crypto map VPN_MAP
```

**Configuration miroir requise sur R2** (site distant) : mêmes paramètres Phase 1/2, ACL avec source/destination inversées (192.168.2.0 → 192.168.1.0), `set peer 203.0.113.1` (IP publique de R1).

## VTI (Virtual Tunnel Interface) — alternative moderne aux crypto maps

```bash
R1(config)# interface tunnel 0
R1(config-if)# ip address 10.10.10.1 255.255.255.252
R1(config-if)# tunnel source gigabitEthernet 0/1
R1(config-if)# tunnel destination 203.0.113.2
R1(config-if)# tunnel mode ipsec ipv4
R1(config-if)# tunnel protection ipsec profile PROFIL_VPN
```

Les **VTI** simplifient la configuration (pas d'ACL "interesting traffic" à maintenir, le tunnel se comporte comme une interface routable classique — compatible avec du routage dynamique OSPF/EIGRP par-dessus) et sont recommandées sur les déploiements modernes par rapport aux crypto maps historiques.

## Vérification

```bash
R1# show crypto isakmp sa
dst             src             state          conn-id status
203.0.113.2     203.0.113.1     QM_IDLE           1    ACTIVE

R1# show crypto ipsec sa
   #pkts encaps: 1523, #pkts encrypt: 1523, #pkts decaps: 1489
   ...

R1# show crypto session
```

## Ce qu'il faut retenir

- IPsec négocie en deux phases : **Phase 1** sécurise le canal de négociation lui-même, **Phase 2** négocie les paramètres du trafic utilisateur.
- **ESP** (chiffrement + intégrité) est préféré à **AH** (intégrité seule) dans la quasi-totalité des déploiements.
- La configuration classique lie policy ISAKMP + transform-set + ACL "trafic intéressant" + crypto map, appliquée sur l'interface WAN.
- Les **VTI** (tunnel interface) simplifient la configuration et permettent le routage dynamique par-dessus le tunnel — approche moderne recommandée.

## Pour aller plus loin

- [RFC 4301 — Security Architecture for the Internet Protocol](https://www.rfc-editor.org/rfc/rfc4301)
- [Cisco — IPsec VPN Negotiation/IKE Overview](https://www.cisco.com/c/en/us/support/docs/security-vpn/ipsec-negotiation-ike-protocols/14106-how-vpn-works.html)
