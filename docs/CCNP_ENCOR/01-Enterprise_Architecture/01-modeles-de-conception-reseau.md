---
id: 01-modeles-de-conception-reseau
title: "Modèles de conception : three-tier, two-tier, spine-leaf"
sidebar_position: 1
tags: [reseau]
---

# Modèles de conception : three-tier, two-tier, spine-leaf

> Le choix d'un modèle de conception structure la scalabilité, la résilience et la latence d'un réseau d'entreprise. Trois modèles dominent : le **three-tier** hiérarchique classique, sa variante compressée **two-tier**, et le **spine-leaf** issu des datacenters.

## Modèle hiérarchique three-tier (Cisco classique)

```text
   ┌─────────────────────────────────────────────────┐
   │                   CORE (cœur)                        │
   │   Commutation/routage ultra-rapide entre distributions│
   │   AUCUNE politique appliquée ici (pas d'ACL/QoS       │
   │   complexe) — priorité absolue à la vitesse            │
   └───────────┬───────────────────────┬─────────────┘
               │                       │
   ┌───────────▼──────────┐ ┌─────────▼────────────┐
   │   DISTRIBUTION           │ │    DISTRIBUTION           │
   │   Agrégation des accès,  │ │   Agrégation des accès,   │
   │   ROUTAGE inter-VLAN,    │ │   ROUTAGE inter-VLAN,      │
   │   politiques (ACL, QoS,  │ │   politiques, sommation    │
   │   sommation de routes)   │ │   de routes                │
   └───────────┬──────────┘ └─────────┬────────────┘
               │                       │
   ┌───────────▼──────────┐ ┌─────────▼────────────┐
   │   ACCÈS                  │ │    ACCÈS                   │
   │   Connexion des postes    │ │   Connexion des postes     │
   │   utilisateurs, ports     │ │   utilisateurs, ports      │
   │   access, Port Security   │ │   access, Port Security    │
   └──────────────────────┘ └───────────────────────┘
```

| Couche | Rôle principal | Équipements typiques |
|---|---|---|
| **Access** | Connexion des terminaux, VLAN, sécurité de port | Switches L2 d'accès |
| **Distribution** | Agrégation, routage inter-VLAN, politiques, sommation de routes | Switches L3 |
| **Core** | Commutation/routage haute vitesse, pas de politique | Switches/routeurs cœur, redondants |

Chaque couche a une **responsabilité unique et limitée** — le Core ne doit jamais appliquer d'ACL complexes (préserver la vitesse), la Distribution concentre les politiques et le point de sommation des routes, l'Access gère la sécurité au plus près de l'utilisateur.

## Modèle two-tier (collapsed core)

```text
   ┌─────────────────────────────────────────────────┐
   │        CORE/DISTRIBUTION FUSIONNÉS                  │
   │   (une seule couche cumule routage inter-VLAN         │
   │    ET commutation cœur — adapté aux réseaux            │
   │    de taille moyenne, où un Core séparé serait          │
   │    surdimensionné)                                       │
   └───────────┬───────────────────────┬─────────────┘
               │                       │
   ┌───────────▼──────────┐ ┌─────────▼────────────┐
   │        ACCÈS             │ │        ACCÈS              │
   └──────────────────────┘ └───────────────────────┘
```

Adapté aux réseaux de **campus unique de taille moyenne** (moins de redondance nécessaire, coût matériel réduit) — la distinction Core/Distribution n'apporte pas assez de valeur pour justifier une couche physique séparée.

## Spine-Leaf (issu du datacenter, adopté en SD-Access)

```text
   SPINE  [S1]────────────[S2]────────────[S3]
            │  \          / │  \          / │
            │   \        /  │   \        /  │
            │    \      /   │    \      /   │
   LEAF   [L1]    [L2]    [L3]    [L4]    [L5]

   Règle structurelle : CHAQUE leaf est connecté à CHAQUE spine
   (maillage complet leaf↔spine), JAMAIS de lien spine-spine ou
   leaf-leaf direct
```

| Critère | Three-tier | Spine-leaf |
|---|---|---|
| Nombre de sauts entre 2 points d'accès | Variable (jusqu'à 6+ via le Core) | **Constant** : toujours leaf→spine→leaf (2 sauts) |
| Latence | Variable selon le chemin | Prévisible et faible |
| Scalabilité horizontale | Limitée (ajout de couches) | Ajout simple de spines/leafs |
| Origine | Réseaux de campus traditionnels | Datacenters, adopté par SD-Access |

Le spine-leaf élimine la variabilité de latence des modèles hiérarchiques classiques : quel que soit le leaf de départ et d'arrivée, le chemin traverse **toujours exactement un spine** — un avantage décisif pour les charges est-ouest intenses (trafic inter-serveurs en datacenter, ou inter-postes en campus SD-Access).

## Méthodologie de conception : approche descendante (top-down)

```text
   1. Comprendre les EXIGENCES MÉTIER (applications critiques,
      nombre d'utilisateurs, contraintes de disponibilité)
   2. Définir l'ARCHITECTURE LOGIQUE (modèle hiérarchique choisi,
      zones de sécurité, plan d'adressage)
   3. Sélectionner la TECHNOLOGIE et le MATÉRIEL adaptés
   4. Implémenter et VALIDER par rapport aux exigences initiales

   → à l'opposé d'une approche "bottom-up" (partir du matériel
     disponible et construire autour), qui aligne rarement bien
     le réseau sur les besoins métier réels
```

## Ce qu'il faut retenir

- **Three-tier** : Access (connexion/sécurité) → Distribution (routage inter-VLAN, politiques) → Core (vitesse pure, pas de politique).
- **Two-tier** : fusion Core/Distribution, adapté aux campus de taille moyenne.
- **Spine-leaf** : chaque leaf connecté à chaque spine, latence constante (2 sauts), origine datacenter, base du SD-Access moderne.
- La conception doit suivre une **approche descendante** : exigences métier → architecture logique → technologie/matériel.

## Pour aller plus loin

- [Cisco — Campus Network for High Availability Design Guide](https://www.cisco.com/c/en/us/td/docs/solutions/Enterprise/Campus/HA_campus_DG/hacampusdg.html)
- [Cisco — Data Center Spine-and-Leaf Architecture](https://www.cisco.com/c/en/us/products/collateral/switches/nexus-9000-series-switches/white-paper-c11-737022.html)
