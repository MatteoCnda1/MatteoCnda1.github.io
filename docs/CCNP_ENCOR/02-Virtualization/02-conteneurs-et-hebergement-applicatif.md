---
id: 02-conteneurs-et-hebergement-applicatif
title: "Hébergement applicatif sur l'infrastructure réseau (IOx)"
sidebar_position: 2
tags: [reseau, virtualisation, conteneurs]
---

# Hébergement applicatif sur l'infrastructure réseau (IOx)

> Les équipements réseau modernes (routeurs, switches) intègrent des ressources de calcul (CPU/RAM dédiés) capables d'héberger directement des **applications** ou des **conteneurs**, sans serveur externe — rapprochant le traitement de la donnée au plus près de sa collecte (*edge computing*).

## Pourquoi héberger une application directement sur un équipement réseau

```text
   ARCHITECTURE CLASSIQUE                  EDGE COMPUTING (IOx)

   [Capteurs IoT] → [Routeur] → WAN →      [Capteurs IoT] → [Routeur
   [Serveur distant : traitement,                            AVEC application
    filtrage, agrégation]                                     embarquée :
                                                                filtrage/agrégation
   → TOUTE la donnée brute traverse                            LOCAL] → WAN →
     le WAN, même si 99% est inutile                           [Serveur distant]
     après filtrage
                                            → SEULE la donnée UTILE
                                              (déjà filtrée/agrégée
                                              localement) traverse
                                              le WAN, économie de
                                              bande passante et de
                                              latence de traitement
```

## Cisco IOx : conteneurs applicatifs sur IOS

```text
   IOx = IOS + Linux, exécutés CÔTE À CÔTE sur le même équipement :

   ┌─────────────────────────────────────────────┐
   │  Équipement Cisco (routeur/switch compatible)   │
   │                                                    │
   │  ┌──────────────┐      ┌────────────────────┐  │
   │  │  IOS/IOS-XE     │      │  Environnement Linux  │  │
   │  │  (plan de        │      │  (conteneurs Docker,  │  │
   │  │  contrôle/données│      │   machines virtuelles) │  │
   │  │  réseau normal)  │      │                        │  │
   │  └──────────────┘      └────────────────────┘  │
   └─────────────────────────────────────────────┘
```

```bash
Router(config)# iox
! active le sous-système IOx sur l'équipement compatible

Router# show iox-service
IOx Infrastructure Summary:
---------------------------
  IOx service (CAF)       : Running
  IOx service (HA)        : Not Supported
  IOx service (IOxman)    : Running
  Libvirtd 5.5.0          : Running
```

## Cas d'usage concret

Un commutateur industriel déployé sur une ligne de production exécute directement une petite application de collecte de métriques (température, vibration de machines connectées) dans un conteneur IOx — la donnée brute est filtrée/agrégée localement avant envoi vers un système de supervision central, réduisant à la fois la bande passante WAN consommée et la latence de détection d'anomalie (pas d'aller-retour vers un serveur distant pour un simple seuil d'alerte).

## Application Hosting vs virtualisation réseau classique

| Aspect | Virtualisation réseau (VRF, vSwitch) | Application Hosting (IOx) |
|---|---|---|
| Objectif | Isoler/multiplexer des **fonctions réseau** | Exécuter des **applications tierces** (métier, IoT) |
| Ce qui tourne | Instances de routage/commutation virtuelles | Conteneurs/VM applicatifs quelconques |
| Bénéfice principal | Isolation, mutualisation de matériel réseau | Traitement local (edge), réduction de trafic WAN |

## Ce qu'il faut retenir

- L'hébergement applicatif directement sur un équipement réseau (**IOx**) rapproche le traitement des données de leur source (*edge computing*), réduisant bande passante WAN et latence.
- IOx fait cohabiter **IOS/IOS-XE** (fonctions réseau classiques) et un **environnement Linux** (conteneurs/VM) sur le même matériel.
- Distinct de la virtualisation réseau (VRF, vSwitch) qui virtualise des **fonctions réseau**, alors qu'IOx héberge des **applications tierces** quelconques.

## Pour aller plus loin

- [Cisco — IOx Overview](https://developer.cisco.com/docs/iox/)
- [Cisco — Application Hosting Configuration Guide](https://www.cisco.com/c/en/us/td/docs/routers/access/1000/software/guide/AppHosting/b-application-hosting.html)
