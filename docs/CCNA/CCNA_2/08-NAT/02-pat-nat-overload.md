---
id: 02-pat-nat-overload
title: "PAT (NAT Overload) : partager une IP publique"
sidebar_position: 2
tags: [reseau, cheatsheet]
---

# PAT (NAT Overload) : partager une IP publique

> Le **PAT** (Port Address Translation, appelé `overload` dans IOS) permet à **des centaines d'hôtes internes** de partager **une seule adresse IP publique** simultanément, en distinguant chaque traduction par le **port source**. C'est de loin la forme de NAT la plus répandue (box internet domestique, quasi-totalité des PME).

## Principe : distinction par le port

```text
   192.168.1.10:54321 ──┐
   192.168.1.11:51234 ──┼──► [PAT] ──► 203.0.113.5:40001  (192.168.1.10)
   192.168.1.12:60001 ──┘             203.0.113.5:40002  (192.168.1.11)
                                       203.0.113.5:40003  (192.168.1.12)

   Table de traduction PAT :
   Pro  Inside global          Inside local
   tcp  203.0.113.5:40001      192.168.1.10:54321
   tcp  203.0.113.5:40002      192.168.1.11:51234
   tcp  203.0.113.5:40003      192.168.1.12:60001
```

Contrairement au NAT dynamique simple (une IP publique par hôte, limité par la taille du pool), le PAT permet en théorie jusqu'à **65 536 traductions simultanées par IP publique** (limite du champ port sur 16 bits, en pratique un peu moins par protocole/réservations).

## Configuration : PAT avec pool d'IP publiques

```bash
Router(config)# ip nat pool POOL_PUBLIC 203.0.113.10 203.0.113.10 netmask 255.255.255.0
Router(config)# access-list 1 permit 192.168.1.0 0.0.0.255
Router(config)# ip nat inside source list 1 pool POOL_PUBLIC overload
! le mot-clé "overload" transforme le NAT dynamique en PAT
```

## Configuration : PAT sur l'IP de l'interface (le cas le plus courant)

```bash
Router(config)# access-list 1 permit 192.168.1.0 0.0.0.255
Router(config)# ip nat inside source list 1 interface gigabitEthernet 0/1 overload
! utilise directement l'adresse IP publique de l'interface de sortie
! (pas besoin de pool séparé) — configuration typique d'une box/routeur
! de bordure avec une seule IP publique fournie par le FAI
```

C'est la configuration la plus fréquemment rencontrée en pratique : une entreprise/un particulier ne dispose généralement que d'**une seule** adresse IP publique (celle attribuée par le FAI sur l'interface WAN), et tout le trafic sortant du LAN est traduit via PAT vers cette IP unique.

## Cas d'usage concret complet

```text
   Entreprise : 200 postes internes (192.168.0.0/24), 1 seule IP
   publique fournie par le FAI (203.0.113.1) sur l'interface WAN.

   Router(config)# interface gigabitEthernet 0/0
   Router(config-if)# ip address 192.168.0.1 255.255.255.0
   Router(config-if)# ip nat inside

   Router(config)# interface gigabitEthernet 0/1
   Router(config-if)# ip address 203.0.113.1 255.255.255.252
   Router(config-if)# ip nat outside

   Router(config)# access-list 1 permit 192.168.0.0 0.0.0.255
   Router(config)# ip nat inside source list 1 interface gigabitEthernet 0/1 overload

   → les 200 postes accèdent simultanément à Internet en partageant
     203.0.113.1, chaque connexion distinguée par son port source
```

## Vérification

```bash
Router# show ip nat translations
Pro Inside global         Inside local        Outside local       Outside global
tcp 203.0.113.1:40001     192.168.0.10:54321  93.184.216.34:443   93.184.216.34:443
tcp 203.0.113.1:40002     192.168.0.11:51234  93.184.216.34:443   93.184.216.34:443

Router# show ip nat statistics
Total translations: 47 (2 static, 45 dynamic, 0 extended)
Outside interfaces: GigabitEthernet0/1
Inside interfaces: GigabitEthernet0/0
Hits: 15234  Misses: 47
```

## PAT vs NAT statique vs NAT dynamique — récapitulatif

| Type | Ratio privé:public | Cas d'usage |
|---|---|---|
| **NAT statique** | 1:1 fixe | Serveur exposé en permanence sous IP publique fixe |
| **NAT dynamique** | 1:1 à la demande (pool) | Nombre limité d'IP publiques, sans besoin de partage simultané massif |
| **PAT (overload)** | N:1 (des centaines vers une seule) | Cas le plus courant : accès Internet sortant pour tout un LAN |

## Ce qu'il faut retenir

- **PAT** distingue les traductions par le **port source**, permettant à de nombreux hôtes de partager une seule IP publique.
- `ip nat inside source list <ACL> interface <interface-WAN> overload` est la configuration la plus courante (utilise l'IP de l'interface, pas de pool séparé).
- Le mot-clé **`overload`** est ce qui transforme une règle NAT dynamique classique (1:1) en PAT (N:1).
- `show ip nat translations` révèle les ports source réattribués, `show ip nat statistics` donne un résumé d'activité.

## Pour aller plus loin

- [RFC 3022 — Traditional IP Network Address Translator](https://www.rfc-editor.org/rfc/rfc3022)
- [Cisco — NAT Overload (PAT) Configuration Example](https://www.cisco.com/c/en/us/support/docs/ip/network-address-translation-nat/13772-12.html)
