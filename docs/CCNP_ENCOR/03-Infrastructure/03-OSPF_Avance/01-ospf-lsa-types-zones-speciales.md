---
id: 01-ospf-lsa-types-zones-speciales
title: "OSPF : types de LSA et zones spéciales (stub, NSSA)"
sidebar_position: 1
tags: [reseau]
---

# OSPF : types de LSA et zones spéciales (stub, NSSA)

> La LSDB (vue en CCNA 2) est construite à partir de différents **types de LSA** (Link State Advertisement), chacun décrivant une information topologique distincte. Comprendre ces types permet de configurer des **zones spéciales** limitant la taille de la LSDB dans les zones périphériques.

## Types de LSA principaux

| Type | Nom | Origine | Portée |
|---|---|---|---|
| **1** | Router LSA | Chaque routeur | Interne à la zone |
| **2** | Network LSA | Le DR d'un segment multi-accès | Interne à la zone |
| **3** | Summary LSA (inter-zone) | ABR | Propagée entre zones |
| **4** | ASBR Summary LSA | ABR (localise l'ASBR) | Propagée entre zones |
| **5** | External LSA (AS-External) | ASBR | Propagée dans TOUT le domaine OSPF |
| **7** | NSSA External LSA | ASBR (en zone NSSA uniquement) | Confinée à la zone NSSA, convertie en Type 5 par l'ABR |

```text
   Type 1/2 : décrivent la topologie DÉTAILLÉE INTERNE à une zone
              (routeurs, liens, segments) — jamais transmis
              tels quels à une autre zone

   Type 3    : un ABR RÉSUME les routes internes de sa zone en
               Type 3 pour les propager aux autres zones (perte
               de détail topologique, seulement le préfixe + coût)

   Type 5    : routes REDISTRIBUÉES depuis un autre protocole
               (ex. EIGRP, statique) injectées dans OSPF par un
               ASBR — propagées SANS MODIFICATION dans TOUT le
               domaine OSPF (même les zones stub, sauf configuration
               contraire), ce qui peut GONFLER significativement
               la LSDB des zones périphériques
```

## Zones stub : limiter la propagation des routes externes

```text
   ┌───────────────────────────────────────────┐
   │              Area 0 (backbone)                  │
   │         (contient un ASBR redistribuant           │
   │          des routes externes, Type 5)              │
   └────────────┬──────────────────────────────┘
                 │ ABR
        ┌────────▼────────┐
        │   Area 1 (STUB)    │
        │   REFUSE les LSA    │
        │   Type 5 (externes) │
        │   → route par       │
        │     défaut Type 3    │
        │     injectée par     │
        │     l'ABR à la place │
        └─────────────────┘
```

```bash
! Sur TOUS les routeurs de la zone stub (cohérence obligatoire)
Router(config-router)# area 1 stub
```

Une zone **stub** refuse les LSA Type 5 (routes externes) — l'ABR injecte à la place une **route par défaut** (0.0.0.0/0, Type 3) pour que les routeurs internes puissent quand même atteindre les destinations externes, sans avoir à maintenir le détail de chaque route externe dans leur LSDB. Réduit significativement la taille de la LSDB et la charge CPU sur les routeurs périphériques d'un grand réseau.

## Zone totally stub (spécifique Cisco)

```bash
Router(config-router)# area 1 stub no-summary       ! configuré UNIQUEMENT sur l'ABR
```

Va plus loin que la zone stub classique : refuse **également** les LSA Type 3 (routes inter-zones), ne conservant que la route par défaut injectée par l'ABR — LSDB minimale, adaptée à une zone purement périphérique sans besoin de granularité de routage inter-zone.

## Zone NSSA (Not-So-Stubby Area)

```text
   Problème résolu : une zone stub classique ne peut PAS contenir
   d'ASBR (elle refuse justement les LSA Type 5 générées par un
   ASBR) — que faire si UNE zone périphérique a QUAND MÊME besoin
   de redistribuer des routes externes localement (ex. connexion
   à un site partenaire) tout en restant "stub" pour tout le reste ?

   NSSA : autorise un ASBR LOCAL à générer des LSA Type 7
   (équivalent local du Type 5), CONFINÉES à la zone NSSA.
   L'ABR de la zone les CONVERTIT en Type 5 standard pour les
   propager au reste du domaine OSPF (si non filtré).
```

```bash
Router(config-router)# area 2 nssa
! variante : area 2 nssa no-summary (= "totally NSSA", combine
! les deux restrictions)
```

## Comparatif des zones spéciales

| Type de zone | LSA Type 5 (externes) | LSA Type 3 (inter-zones) | ASBR local autorisé |
|---|---|---|---|
| **Standard** | Autorisées | Autorisées | Oui |
| **Stub** | Refusées | Autorisées | Non |
| **Totally stub** | Refusées | Refusées (sauf défaut) | Non |
| **NSSA** | Refusées (converties en Type 7 localement) | Autorisées | **Oui** (via Type 7) |
| **Totally NSSA** | Refusées | Refusées (sauf défaut) | **Oui** (via Type 7) |

## Vérification

```bash
Router# show ip ospf database
Router# show ip ospf database summary       ! LSA Type 3
Router# show ip ospf database external      ! LSA Type 5
Router# show ip ospf database nssa-external ! LSA Type 7
```

## Ce qu'il faut retenir

- **Type 1/2** = topologie interne à la zone ; **Type 3** = routes résumées inter-zones (ABR) ; **Type 5** = routes externes redistribuées (ASBR), propagées à tout le domaine.
- **Zone stub** refuse le Type 5 (route par défaut à la place) ; **totally stub** refuse aussi le Type 3 ; les deux interdisent tout ASBR local.
- **NSSA** autorise un ASBR local (LSA Type 7, converties en Type 5 par l'ABR) tout en gardant les bénéfices d'une zone stub pour le reste.
- Toute configuration de zone spéciale doit être **cohérente sur tous les routeurs** de la zone concernée.

## Pour aller plus loin

- [RFC 2328 — OSPF Version 2](https://www.rfc-editor.org/rfc/rfc2328)
- [RFC 3101 — The OSPF Not-So-Stubby Area (NSSA) Option](https://www.rfc-editor.org/rfc/rfc3101)
