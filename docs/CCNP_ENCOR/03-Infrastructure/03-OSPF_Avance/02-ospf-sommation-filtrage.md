---
id: 02-ospf-sommation-filtrage
title: "OSPF : sommation de routes et filtrage"
sidebar_position: 2
tags: [reseau, cheatsheet]
---

# OSPF : sommation de routes et filtrage

## Sommation inter-zone (sur un ABR)

```bash
! Sur l'ABR, résume les sous-réseaux internes de sa zone AVANT
! de les propager vers les autres zones (LSA Type 3)
Router(config-router)# area 1 range 192.168.0.0 255.255.0.0
```

```text
   Zone 1 contient : 192.168.1.0/24, 192.168.2.0/24, ... 192.168.15.0/24

   SANS sommation : l'ABR propage 15 LSA Type 3 distinctes vers
   le backbone

   AVEC "area 1 range 192.168.0.0 255.255.0.0" : l'ABR propage
   UNE SEULE LSA Type 3 (192.168.0.0/16) — réduit la taille de
   la LSDB dans les autres zones, ET isole ces zones d'un
   changement mineur interne à la zone 1 (flap d'une seule des
   15 routes ne déclenche PAS de recalcul SPF dans les autres
   zones, seulement dans la zone 1 elle-même)
```

## Sommation externe (sur un ASBR)

```bash
! Sur l'ASBR, résume des routes EXTERNES redistribuées (Type 5/7)
Router(config-router)# summary-address 172.16.0.0 255.240.0.0
```

Similaire à `area range`, mais appliquée aux routes **externes** (redistribuées depuis un autre protocole) plutôt qu'aux routes internes OSPF d'une zone — utilisée typiquement sur un ASBR qui redistribue un grand bloc de routes EIGRP/statiques vers OSPF.

## Filtrage de routes : distribute-list vs LSA filtering

```text
   PROBLÈME AVEC UN "distribute-list" CLASSIQUE EN OSPF :

   OSPF est un protocole à ÉTAT DE LIENS — un distribute-list
   filtre seulement l'INSTALLATION de la route dans la table de
   ROUTAGE locale, PAS la propagation de la LSA elle-même dans
   la LSDB (qui continue de se propager normalement à travers
   le domaine) → contrairement à un protocole vecteur de distance
   (EIGRP/RIP) où filtrer une annonce l'empêche réellement de
   se propager plus loin.
```

```bash
! distribute-list : filtre l'INSTALLATION locale seulement
Router(config-router)# distribute-list 10 in

! Filtrage RÉEL de la propagation de LSA Type 3 (entre zones,
! sur un ABR uniquement — la seule façon de VRAIMENT empêcher
! une route de se propager plus loin dans le domaine OSPF)
Router(config-router)# area 1 filter-list prefix FILTRE_LIST in
```

Le filtrage réel (empêchant une route de se propager au-delà d'un point donné) n'est possible en OSPF **qu'aux frontières de zone** (ABR, via `area filter-list`) — un `distribute-list` classique donne une fausse impression de filtrage complet, alors qu'il ne fait que masquer la route localement tout en la laissant continuer à se propager dans la LSDB des autres routeurs.

## Route par défaut

```bash
! Sur l'ASBR (routeur de sortie vers Internet, ex.)
Router(config-router)# default-information originate
! injecte 0.0.0.0/0 dans OSPF SEULEMENT si ce routeur possède
! déjà lui-même une route par défaut

Router(config-router)# default-information originate always
! injecte 0.0.0.0/0 INCONDITIONNELLEMENT (même sans route par
! défaut locale) — à utiliser avec précaution, risque de
! "trou noir" si ce routeur perd en réalité sa propre
! connectivité de sortie
```

## Vérification

```bash
Router# show ip route summary
Router# show ip ospf database summary        ! vérifie les LSA Type 3 après sommation
Router# show ip protocols                     ! affiche les filtres/sommations actifs
```

## Ce qu'il faut retenir

- `area <id> range` résume les routes **internes** propagées entre zones (sur un ABR) ; `summary-address` résume les routes **externes** redistribuées (sur un ASBR).
- La sommation réduit la LSDB des autres zones ET isole ces zones des changements internes mineurs (pas de recalcul SPF inutile).
- Un `distribute-list` classique ne filtre que l'**installation locale**, pas la propagation LSA — seul `area filter-list` (aux ABR) bloque réellement la propagation d'une route dans le domaine OSPF.
- `default-information originate [always]` injecte une route par défaut ; `always` l'injecte inconditionnellement, à manier avec précaution.

## Pour aller plus loin

- [RFC 2328 — OSPF Version 2](https://www.rfc-editor.org/rfc/rfc2328)
- [Cisco — OSPF Route Summarization](https://www.cisco.com/c/en/us/support/docs/ip/open-shortest-path-first-ospf/7039-1.html)
