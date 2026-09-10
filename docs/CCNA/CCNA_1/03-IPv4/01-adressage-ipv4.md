---
id: 01-adressage-ipv4
title: "Adressage IPv4 : structure, masques, adresses spéciales"
sidebar_position: 1
tags: [reseau]
---

# Adressage IPv4 : structure, masques, adresses spéciales

> Une adresse **IPv4** est codée sur **32 bits**, notée en décimal pointé (4 octets séparés par des points). Elle se décompose en une partie **réseau** et une partie **hôte**, la frontière étant définie par le **masque de sous-réseau**.

## Structure d'une adresse IPv4

```text
   192   .  168   .   1    .   10
   11000000.10101000.00000001.00001010
   └──────────┬──────────┘└─────┬─────┘
         Partie RÉSEAU        Partie HÔTE
        (déterminée par         (identifie l'hôte
         le masque)              dans ce réseau)
```

- 32 bits = 4 octets de 8 bits, chacun valant 0–255 en décimal.
- Le **masque de sous-réseau** (ex. 255.255.255.0 ou /24) indique quels bits appartiennent au réseau (bits à 1) et lesquels à l'hôte (bits à 0).

## Notation CIDR et masques

```text
   /24  =  255.255.255.0     = 11111111.11111111.11111111.00000000
   /25  =  255.255.255.128   = 11111111.11111111.11111111.10000000
   /26  =  255.255.255.192   = 11111111.11111111.11111111.11000000
   /27  =  255.255.255.224
   /28  =  255.255.255.240
   /29  =  255.255.255.248
   /30  =  255.255.255.252   (utilisé pour les liens point-à-point : 2 hôtes)
```

| Préfixe CIDR | Masque | Nb d'hôtes utilisables | Nb d'adresses totales |
|---|---|---|---|
| /24 | 255.255.255.0 | 254 | 256 |
| /25 | 255.255.255.128 | 126 | 128 |
| /26 | 255.255.255.192 | 62 | 64 |
| /27 | 255.255.255.224 | 30 | 32 |
| /28 | 255.255.255.240 | 14 | 16 |
| /29 | 255.255.255.248 | 6 | 8 |
| /30 | 255.255.255.252 | 2 | 4 |

Formule : hôtes utilisables = 2^(bits hôte) − 2 (on retire l'adresse réseau et l'adresse de broadcast).

## Classes historiques (contexte) vs CIDR (usage réel)

```text
   Classe A : 1.0.0.0   – 126.255.255.255   (/8 par défaut)  → gros réseaux
   Classe B : 128.0.0.0 – 191.255.255.255   (/16 par défaut) → réseaux moyens
   Classe C : 192.0.0.0 – 223.255.255.255   (/24 par défaut) → petits réseaux
   Classe D : 224.0.0.0 – 239.255.255.255   → multicast
   Classe E : 240.0.0.0 – 255.255.255.255   → réservé (expérimental)
```

Le système de classes (RFC 791, 1981) est **obsolète en pratique** depuis l'adoption du **CIDR** (Classless Inter-Domain Routing, RFC 4632, 1993), qui permet des masques de longueur arbitraire (/1 à /32) indépendamment de la classe — nécessaire pour éviter le gaspillage massif d'adresses IPv4 face à la pénurie. On le mentionne car le vocabulaire ("classe A/B/C") reste courant, mais tout adressage moderne raisonne en CIDR.

## Adresses IPv4 spéciales

| Adresse / plage | Rôle |
|---|---|
| `X.X.X.0` (dernier octet à 0, selon masque) | Adresse réseau (identifie le sous-réseau, non attribuable à un hôte) |
| `X.X.X.255` (selon masque) | Adresse de broadcast dirigé du sous-réseau |
| `127.0.0.0/8` | Loopback (boucle locale, `127.0.0.1` = localhost) |
| `169.254.0.0/16` | APIPA / link-local (auto-attribuée en l'absence de DHCP) |
| `0.0.0.0` | Route par défaut / adresse "non spécifiée" |
| `255.255.255.255` | Broadcast limité (tout le segment local, non routé) |

## Adresses privées (RFC 1918) vs publiques

```text
   10.0.0.0/8          (10.0.0.0    – 10.255.255.255)
   172.16.0.0/12        (172.16.0.0  – 172.31.255.255)
   192.168.0.0/16       (192.168.0.0 – 192.168.255.255)
```

Les adresses **privées** (RFC 1918) ne sont pas routées sur Internet public : elles doivent être traduites via **NAT** (vu en CCNA 2) pour communiquer avec l'extérieur. Toute autre adresse (hors plages réservées) est potentiellement **publique** et routable sur Internet.

## Configuration d'une interface — commandes

```bash
Router(config)# interface gigabitEthernet 0/0
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# no shutdown

! Vérification
Router# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.1.1     YES manual up                    up
```

## Ce qu'il faut retenir

- IPv4 = 32 bits, partie réseau + partie hôte, frontière fixée par le masque/CIDR.
- Hôtes utilisables = 2^(bits hôte) − 2 (réseau et broadcast exclus).
- Système de **classes** = historique/obsolète, **CIDR** = usage réel moderne.
- Adresses **privées** (RFC 1918 : 10/8, 172.16/12, 192.168/16) nécessitent du NAT pour sortir sur Internet.

## Pour aller plus loin

- [RFC 791 — Internet Protocol](https://www.rfc-editor.org/rfc/rfc791)
- [RFC 1918 — Address Allocation for Private Internets](https://www.rfc-editor.org/rfc/rfc1918)
- [RFC 4632 — CIDR](https://www.rfc-editor.org/rfc/rfc4632)
