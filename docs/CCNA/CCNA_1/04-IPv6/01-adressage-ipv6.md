---
id: 01-adressage-ipv6
title: "Adressage IPv6 : format et types d'adresses"
sidebar_position: 1
tags: [reseau]
---

# Adressage IPv6 : format et types d'adresses

> **IPv6** (RFC 8200) code les adresses sur **128 bits** (contre 32 bits pour IPv4), offrant un espace d'adressage quasi-illimité (~3,4 × 10^38 adresses) et supprimant plusieurs mécanismes devenus inutiles avec cet espace (NAT n'est plus nécessaire pour pallier une pénurie, ARP est remplacé par NDP, le broadcast disparaît au profit du multicast).

## Format d'écriture

```text
   2001:0DB8:0000:0000:0000:FF00:0042:8329
   └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘
   8 groupes de 16 bits (4 chiffres hexadécimaux), séparés par ":"

   RÈGLES DE COMPRESSION :

   1. Omettre les zéros non significatifs de chaque groupe :
      0DB8 → DB8   ;   0000 → 0   ;   0042 → 42

      2001:0DB8:0000:0000:0000:FF00:0042:8329
   →  2001:DB8:0:0:0:FF00:42:8329

   2. Remplacer UNE SEULE séquence de groupes à 0 consécutifs par "::"
      (utilisable une seule fois dans l'adresse, pour rester non-ambigu) :

      2001:DB8:0:0:0:FF00:42:8329
   →  2001:DB8::FF00:42:8329
```

## Structure d'une adresse unicast globale

```text
   ┌───────────────────────┬─────────────────┬──────────────────┐
   │  Préfixe de routage    │   ID de sous-    │   ID d'interface  │
   │  global (48 bits)      │   réseau (16 bits)│   (64 bits)       │
   │  attribué par le RIR/  │   géré par        │   souvent dérivé  │
   │  FAI                   │   l'organisation  │   de l'@ MAC      │
   │                        │                   │   (EUI-64) ou     │
   │                        │                   │   aléatoire       │
   │  2001:0DB8:ABCD        │   0001            │   ::/64           │
   └───────────────────────┴─────────────────┴──────────────────┘
                    /48                /64
```

Contrairement à IPv4, le sous-réseau IPv6 est quasi-systématiquement en **/64** (64 bits d'ID d'interface), même pour un lien point-à-point (simplification et alignement sur les mécanismes d'autoconfiguration).

## Types d'adresses IPv6

| Type | Préfixe | Portée | Équivalent IPv4 |
|---|---|---|---|
| **Unicast global (GUA)** | 2000::/3 | Routable sur Internet | Adresse publique |
| **Link-local (LLA)** | fe80::/10 | Un seul lien (non routé), auto-attribuée obligatoirement sur chaque interface | 169.254.0.0/16 (APIPA) — mais toujours présente et utilisée activement (NDP) |
| **Unique local (ULA)** | fc00::/7 (en pratique fd00::/8) | Routable en interne seulement | Adresses privées RFC 1918 |
| **Multicast** | ff00::/8 | Groupe d'abonnés | 224.0.0.0/4 |
| **Anycast** | (pris dans l'espace unicast) | Le nœud le plus proche parmi plusieurs répond | Pas d'équivalent direct IPv4 |
| **Loopback** | ::1/128 | Boucle locale | 127.0.0.1 |
| **Non spécifiée** | ::/128 | Absence d'adresse (avant attribution) | 0.0.0.0 |

**Important** : IPv6 **n'a pas d'adresse de broadcast**. Tout ce qui était du broadcast en IPv4 (ARP, DHCP Discover) est remplacé par du **multicast** ciblé (ex. `ff02::1` = tous les nœuds du lien local, `ff02::2` = tous les routeurs).

Chaque interface IPv6 possède **obligatoirement** une adresse **link-local** (auto-générée dès l'activation de l'interface, indépendamment de toute configuration), utilisée pour les communications locales (NDP, protocoles de routage) — une interface peut fonctionner en IPv6 avec seulement son adresse link-local, sans aucune adresse globale.

## Adresse anycast : cas d'usage

Une même adresse anycast est annoncée par **plusieurs** nœuds (ex. plusieurs serveurs DNS racine dans le monde) ; le routage achemine la requête vers le nœud le **topologiquement le plus proche** de l'émetteur. Utilisé massivement par les résolveurs DNS publics (ex. 1.1.1.1 de Cloudflare est en réalité annoncé en anycast IPv4 et IPv6 depuis des dizaines de sites).

## Configuration IOS de base

```bash
Router(config)# ipv6 unicast-routing          ! active le routage IPv6 globalement
Router(config)# interface gigabitEthernet 0/0
Router(config-if)# ipv6 address 2001:DB8::1/64
Router(config-if)# ipv6 address fe80::1 link-local   ! LLA explicite (optionnel)
Router(config-if)# no shutdown

Router# show ipv6 interface brief
GigabitEthernet0/0    [up/up]
    fe80::1
    2001:DB8::1
```

## Ce qu'il faut retenir

- IPv6 = 128 bits, notation hexadécimale, compression via omission des zéros et `::` (une seule fois par adresse).
- Sous-réseau standard = **/64** presque systématiquement.
- Types clés : **GUA** (routable, ~public), **LLA** (fe80::/10, obligatoire sur chaque interface, jamais routée), **ULA** (fc00::/7, ~privé), **multicast** (ff00::/8, remplace le broadcast).
- Pas de broadcast en IPv6 → tout passe par le multicast.

## Pour aller plus loin

- [RFC 8200 — Internet Protocol, Version 6 (IPv6) Specification](https://www.rfc-editor.org/rfc/rfc8200)
- [RFC 4291 — IP Version 6 Addressing Architecture](https://www.rfc-editor.org/rfc/rfc4291)
