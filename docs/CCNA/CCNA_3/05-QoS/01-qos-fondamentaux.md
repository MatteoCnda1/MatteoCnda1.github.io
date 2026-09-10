---
id: 01-qos-fondamentaux
title: "QoS : classification, marquage et gestion de congestion"
sidebar_position: 1
tags: [reseau, cheatsheet]
---

# QoS : classification, marquage et gestion de congestion

> La **QoS** (Quality of Service) priorise certains flux de trafic par rapport à d'autres lorsque la bande passante disponible est insuffisante pour tout traiter au même niveau de priorité — la QoS ne **crée** pas de bande passante supplémentaire, elle **arbitre** son partage.

## Les problèmes que la QoS résout

```text
   Sans QoS, en cas de congestion (lien saturé) :

   BANDE PASSANTE : le trafic critique peut être privé de débit
                    par du trafic non prioritaire (ex. téléchargement
                    massif écrasant un appel VoIP)

   LATENCE        : délai de transmission — critique pour la VoIP
                    (> 150 ms devient perceptible et gênant)

   GIGUE (jitter) : variation de latence dans le temps — dégrade
                    fortement la qualité audio/vidéo temps réel
                    même si la latence moyenne reste correcte

   PERTE DE PAQUETS: paquets droppés en cas de saturation de buffer
                    — pour la VoIP, une perte non compensée = coupure
                    audible ; pour TCP, une perte déclenche une
                    retransmission (accentue encore la congestion)
```

## Modèles de QoS

```text
   BEST-EFFORT              : aucune priorisation, tout le trafic
                               traité identiquement (défaut sans QoS)

   INTSERV (Integrated       : réservation EXPLICITE de bande passante
   Services)                  par flux (RSVP) — très précis mais ne
                               passe pas à l'échelle (état par flux
                               à maintenir sur chaque routeur du chemin)

   DIFFSERV (Differentiated  : classe le trafic en un NOMBRE LIMITÉ de
   Services)                  catégories (marquage dans l'en-tête IP),
                               chaque routeur applique une politique par
                               classe — le modèle DOMINANT en pratique
                               (scalable, pas d'état par flux)
```

## Marquage : DSCP et CoS

```text
   COUCHE 2 : CoS (Class of Service)
   → 3 bits dans le tag 802.1Q (priorité 0-7)
   → seulement pertinent sur des liens TAGUÉS (trunk)

   COUCHE 3 : DSCP (Differentiated Services Code Point)
   → 6 bits dans le champ ToS/DS de l'en-tête IP (0-63)
   → survit au routage (contrairement au CoS, limité au segment L2)
```

| Classe DSCP | Valeur | Usage typique |
|---|---|---|
| **EF** (Expedited Forwarding) | 46 | Voix (VoIP) — priorité maximale, faible latence/gigue exigée |
| **AF41** (Assured Forwarding) | 34 | Vidéoconférence |
| **AF21** | 18 | Trafic applicatif critique (ERP, transactionnel) |
| **Default (BE)** | 0 | Best-effort, trafic non prioritaire |

## Où marquer le trafic : au plus près de la source

```text
   [Téléphone IP] ──marque DSCP EF──► [Switch access] ──trust──► [Core]

   Bonne pratique : marquer/classifier AU PLUS PRÈS DE LA SOURCE
   (idéalement l'appareil lui-même, ex. téléphone IP Cisco marque
   nativement EF), puis FAIRE CONFIANCE (trust) à ce marquage sur
   le reste du chemin plutôt que de reclassifier à chaque saut
   (coûteux en traitement, source d'incohérences)
```

## Configuration de base (MQC — Modular QoS CLI)

```bash
! 1. CLASSIFICATION : identifier le trafic à traiter différemment
Router(config)# class-map match-any VOIP
Router(config-cmap)# match dscp ef
Router(config-cmap)# match access-group 100

! 2. STRATÉGIE : définir le traitement par classe
Router(config)# policy-map QOS_POLICY
Router(config-pmap)# class VOIP
Router(config-pmap-c)# priority percent 20          ! file prioritaire garantie (LLQ)
Router(config-pmap)# class class-default
Router(config-pmap-c)# fair-queue                    ! traitement équitable du reste

! 3. APPLICATION sur l'interface (sens sortant, où la congestion se produit)
Router(config)# interface serial 0/0/0
Router(config-if)# service-policy output QOS_POLICY
```

## Gestion de la congestion : files d'attente

```text
   FIFO (First In First Out)     : ordre d'arrivée strict, aucune
                                    priorisation — défaut sur liens
                                    à haut débit sans configuration

   WFQ (Weighted Fair Queuing)   : répartition équitable AUTOMATIQUE
                                    entre flux, favorise implicitement
                                    les flux à faible débit (ex. voix)
                                    par rapport aux flux volumineux

   LLQ (Low Latency Queuing)     : combine une file PRIORITAIRE STRICTE
                                    (pour la voix, garantit latence
                                    minimale) + CBWFQ pour le reste
                                    (classes configurées avec bande
                                    passante garantie) — modèle
                                    RECOMMANDÉ pour la VoIP en entreprise
```

## Vérification

```bash
Router# show policy-map interface serial 0/0/0
Router# show class-map
Router# show mls qos interface gigabitEthernet 0/1     ! sur switch, statut de trust QoS
```

## Ce qu'il faut retenir

- La QoS **arbitre** le partage de bande passante existante, elle n'en crée pas — n'a d'effet que pendant une congestion réelle.
- **DiffServ** (marquage DSCP, scalable) domine sur **IntServ** (réservation par flux, RSVP, non scalable).
- Marquer le trafic **au plus près de la source** puis faire confiance (trust) au marquage sur le reste du chemin.
- **LLQ** (file prioritaire stricte pour la voix + CBWFQ pour le reste) est le modèle recommandé pour la VoIP en entreprise.

## Pour aller plus loin

- [RFC 2474 — Definition of the Differentiated Services Field (DSCP)](https://www.rfc-editor.org/rfc/rfc2474)
- [Cisco — QoS Configuration Guide](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/qos_mqc/configuration/xe-16/qos-mqc-xe-16-book.html)
