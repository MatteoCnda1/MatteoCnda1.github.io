---
id: 01-routage-statique
title: "Routage statique IPv4 et IPv6"
sidebar_position: 1
tags: [reseau, cheatsheet]
---

# Routage statique IPv4 et IPv6

> Le **routage statique** consiste à déclarer manuellement, sur chaque routeur, les routes vers des réseaux distants. Simple et prévisible, mais ne s'adapte pas automatiquement aux pannes — à l'inverse du routage dynamique (OSPF, etc., vu dans le cours suivant).

## Syntaxe de la route statique IPv4

```bash
Router(config)# ip route <réseau-destination> <masque> <next-hop | interface-sortie> [distance-administrative]

! Exemple : joindre 192.168.20.0/24 via le routeur voisin 10.0.0.2
Router(config)# ip route 192.168.20.0 255.255.255.0 10.0.0.2

! Alternative : spécifier l'interface de sortie directement
! (adapté seulement aux liens point-à-point, ex. série)
Router(config)# ip route 192.168.20.0 255.255.255.0 serial 0/0/0
```

## Route par défaut (gateway of last resort)

```bash
Router(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
! capture TOUT trafic ne correspondant à AUCUNE autre route plus spécifique
! typiquement utilisé pour la sortie Internet
```

## Types de routes statiques

```text
   ROUTE STATIQUE STANDARD
   ip route 192.168.20.0 255.255.255.0 10.0.0.2
   → next-hop = adresse IP du routeur voisin

   ROUTE STATIQUE FLOTTANTE (floating static route)
   ip route 192.168.20.0 255.255.255.0 10.0.0.3 200
   → distance administrative élevée (200) : route de SECOURS,
     utilisée seulement si la route principale (dynamique ou
     statique à distance admin plus basse) disparaît

   ROUTE RÉCAPITULATIVE (summary route)
   ip route 192.168.0.0 255.255.0.0 10.0.0.2
   → regroupe plusieurs sous-réseaux contigus en une seule entrée,
     réduit la taille de la table de routage
```

## Distance administrative

```text
   Plus la distance administrative (AD) est FAIBLE, plus la route
   est PRÉFÉRÉE en cas de routes concurrentes vers la même destination :

   Connecté directement   : 0
   Route statique          : 1     (par défaut)
   EIGRP (interne)          : 90
   OSPF                     : 110
   RIP                      : 120
   Route statique flottante : > 120 (valeur choisie manuellement,
                                     ex. 200, pour être une route
                                     de secours seulement)
   Inconnue/inaccessible    : 255  (jamais installée dans la table)
```

Une route statique classique (AD=1) est **préférée** à toute route dynamique par défaut sur le même préfixe exact — c'est pourquoi une route statique flottante doit avoir une AD manuellement augmentée pour ne servir qu'en secours.

## Cas d'usage concret : route flottante de secours

```text
   Topologie : R1 relié à R2 par un lien principal (OSPF, AD=110)
   ET par un lien de secours 4G/LTE (statique, à activer seulement
   si le lien principal tombe)

   Router(config)# ip route 192.168.20.0 255.255.255.0 <next-hop-4G> 150

   → Tant qu'OSPF (AD=110) annonce la route, elle est préférée.
   → Si le lien principal tombe et qu'OSPF retire sa route,
     la route statique flottante (AD=150) prend automatiquement
     le relais, sans configuration supplémentaire.
```

## Routage statique IPv6

```bash
Router(config)# ipv6 route 2001:DB8:20::/64 2001:DB8:AB::2
Router(config)# ipv6 route ::/0 2001:DB8:AB::1     ! route par défaut IPv6
```

## Vérification et diagnostic

```bash
Router# show ip route static
S    192.168.20.0/24 [1/0] via 10.0.0.2
S*   0.0.0.0/0 [1/0] via 203.0.113.1

Router# show ip route 192.168.20.0
Router# show ipv6 route static
```

- `S` = route statique ; `S*` = route statique candidate à être la route par défaut.
- `[1/0]` = `[distance administrative/métrique]`.

## Ce qu'il faut retenir

- `ip route <réseau> <masque> <next-hop>` déclare une route statique manuelle ; `ip route 0.0.0.0 0.0.0.0 <next-hop>` = route par défaut.
- La **distance administrative** (AD) départage les sources de routes concurrentes : plus bas = préféré (connecté=0, statique=1, OSPF=110, RIP=120).
- Une **route flottante** (AD manuellement augmentée) sert de secours automatique, activée seulement si la route principale disparaît.
- IPv6 utilise une syntaxe équivalente avec `ipv6 route`.

## Pour aller plus loin

- [Cisco — IP Routing: Protocol-Independent Configuration Guide](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/iproute_pi/configuration/xe-16/irdp-xe-16-book.html)
