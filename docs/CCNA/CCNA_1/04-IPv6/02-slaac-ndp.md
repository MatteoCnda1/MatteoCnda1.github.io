---
id: 02-slaac-ndp
title: "SLAAC et NDP (Neighbor Discovery Protocol)"
sidebar_position: 2
tags: [reseau]
---

# SLAAC et NDP (Neighbor Discovery Protocol)

> **NDP** (Neighbor Discovery Protocol, RFC 4861) remplace en IPv6 les fonctions assurées séparément par ARP, ICMP Router Discovery et ICMP Redirect en IPv4. Il s'appuie sur des messages **ICMPv6** en multicast. **SLAAC** (Stateless Address Autoconfiguration, RFC 4862) permet à un hôte de générer automatiquement sa propre adresse IPv6, sans serveur DHCP.

## Les messages NDP

| Message | Rôle | Équivalent IPv4 |
|---|---|---|
| **RS** (Router Solicitation) | Hôte → "Y a-t-il un routeur ici ?" (multicast ff02::2) | — |
| **RA** (Router Advertisement) | Routeur → annonce périodique/réponse (préfixe, passerelle, flags) | — |
| **NS** (Neighbor Solicitation) | "Qui a cette adresse IPv6 ?" (résolution d'adresse) | ARP Request |
| **NA** (Neighbor Advertisement) | Réponse à un NS | ARP Reply |
| **Redirect** | Routeur → indique une meilleure route au prochain saut | ICMP Redirect |

## SLAAC : autoconfiguration sans état

```text
   1. L'interface s'active → génère automatiquement son adresse
      LINK-LOCAL (fe80::/10), via EUI-64 ou un identifiant aléatoire

   2. DAD (Duplicate Address Detection) : envoie un NS pour vérifier
      qu'AUCUN autre hôte n'utilise déjà cette adresse sur le lien
      (sécurité avant utilisation effective)

   3. RS (Router Solicitation) envoyé en multicast (ff02::2, "tous
      les routeurs")

   4. Le routeur répond par un RA (Router Advertisement) contenant :
      - le préfixe réseau (ex. 2001:DB8:1::/64)
      - la durée de vie du préfixe
      - des FLAGS indiquant comment finir la configuration (voir ci-dessous)

   5. L'hôte combine le préfixe reçu + son ID d'interface (EUI-64 ou
      aléatoire) → adresse IPv6 GLOBALE complète, sans DHCP
```

## Génération de l'ID d'interface : EUI-64

```text
   Adresse MAC : AA:BB:CC:DD:EE:FF (48 bits)

   1. Insertion de FFFE au milieu :
      AA:BB:CC:FF:FE:DD:EE:FF (64 bits)

   2. Inversion du 7ème bit (U/L bit) du premier octet
      (AA = 10101010 → 10101000 = A8, indique "unique globalement")

   → ID d'interface EUI-64 : A8BB:CCFF:FEDD:EEFF

   Adresse finale = préfixe reçu du RA + cet ID d'interface
```

De nombreux OS modernes (Windows, macOS, Linux, Android) utilisent par défaut une **adresse aléatoire** (RFC 7217/4941, *privacy extensions*) plutôt qu'EUI-64, afin d'éviter qu'un identifiant fixe basé sur la MAC ne permette de tracer un appareil d'un réseau à l'autre.

## Les trois modes de configuration IPv6 (via les flags du RA)

```text
   Flag M (Managed) et O (Other config), transmis dans le RA :

   M=0, O=0  →  SLAAC pur (adresse + passerelle via RA uniquement)
   M=0, O=1  →  SLAAC pour l'adresse + DHCPv6 "stateless" pour les
                infos additionnelles (DNS, domaine) uniquement
   M=1       →  DHCPv6 "stateful" complet (le serveur DHCPv6 attribue
                et suit l'adresse, comme en IPv4)
```

## Configuration IOS — routeur annonçant un préfixe

```bash
Router(config)# ipv6 unicast-routing
Router(config)# interface gigabitEthernet 0/0
Router(config-if)# ipv6 address 2001:DB8:1::1/64
Router(config-if)# no ipv6 nd suppress-ra      ! autorise l'envoi de RA (actif par défaut sur la plupart des interfaces LAN)
Router(config-if)# ipv6 nd ra-lifetime 1800    ! durée de vie du routeur par défaut annoncée
Router(config-if)# ipv6 nd other-config-flag   ! positionne le flag O (DHCPv6 stateless pour DNS etc.)
```

## Vérification et diagnostic

```bash
Router# show ipv6 neighbors
IPv6 Address                Age Link-layer Addr State  Interface
2001:DB8:1::10                0 aaaa.bbbb.0002   REACH  Gi0/0
FE80::2                       0 aaaa.bbbb.0002   REACH  Gi0/0

Router# show ipv6 interface gigabitEthernet 0/0
Router# show ipv6 routers          ! liste les routeurs découverts via RA
```

## Ce qu'il faut retenir

- **NDP** remplace ARP + ICMP Router Discovery + ICMP Redirect en IPv6, via messages ICMPv6 (RS/RA/NS/NA/Redirect).
- **SLAAC** = autoconfiguration sans serveur DHCP : préfixe reçu via RA + ID d'interface (EUI-64 ou aléatoire).
- **DAD** vérifie l'unicité d'une adresse avant utilisation (envoi d'un NS vers sa propre adresse).
- Les flags **M/O** du RA déterminent le mode : SLAAC pur, SLAAC + DHCPv6 stateless, ou DHCPv6 stateful complet.

## Pour aller plus loin

- [RFC 4861 — Neighbor Discovery for IP version 6](https://www.rfc-editor.org/rfc/rfc4861)
- [RFC 4862 — IPv6 Stateless Address Autoconfiguration](https://www.rfc-editor.org/rfc/rfc4862)
- [RFC 7217 — A Method for Generating Semantically Opaque Interface Identifiers](https://www.rfc-editor.org/rfc/rfc7217)
