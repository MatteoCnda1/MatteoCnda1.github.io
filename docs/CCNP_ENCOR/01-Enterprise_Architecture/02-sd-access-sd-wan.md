---
id: 02-sd-access-sd-wan
title: "SD-Access et SD-WAN : composants et architecture"
sidebar_position: 2
tags: [reseau, automatisation]
---

# SD-Access et SD-WAN : composants et architecture

> **SD-Access** applique les principes du SDN (cours CCNA 3) au réseau de **campus**, tandis que **SD-WAN** les applique au **WAN inter-sites** — deux architectures Cisco intent-based distinctes, mais qui partagent la même logique de séparation contrôle/données et d'orchestration centralisée.

## SD-Access : composants de la fabric

```text
   ┌─────────────────────────────────────────────────┐
   │         DNA Center (contrôleur / plan de management)  │
   └───────────────────┬───────────────────────────┘
                        │
   ┌───────────────────▼───────────────────────────┐
   │  CONTROL PLANE NODE                                │
   │  (base de données LISP : qui est où dans la fabric)│
   └───────────────────┬───────────────────────────┘
                        │
   ┌────────────┬──────┴───────┬────────────────┐
   ▼            ▼               ▼                ▼
[FABRIC       [FABRIC        [FABRIC          [FABRIC
 EDGE NODE]    EDGE NODE]     BORDER NODE]     WLC/AP]
 (switch        (switch        (passerelle       (accès sans fil
  d'accès,        d'accès)       vers le reste     intégré à la
  connecte les                   du réseau/        fabric)
  terminaux)                     Internet, hors
                                  fabric)
```

| Composant | Rôle |
|---|---|
| **Control Plane Node** | Base de données LISP (Locator/ID Separation Protocol) : associe l'identité d'un hôte (EID) à sa localisation réelle (RLOC) dans la fabric |
| **Fabric Border Node** | Passerelle entre la fabric SD-Access et le reste du réseau (WAN, Internet, datacenter) |
| **Fabric Edge Node** | Switch d'accès où se connectent physiquement les terminaux |
| **DNA Center** | Contrôleur central : provisioning, politiques, assurance (monitoring) |

## Underlay et overlay

```text
   UNDERLAY (réseau physique)         OVERLAY (réseau logique, VXLAN)

   Connectivité IP de base entre       Segments logiques ENCAPSULÉS
   tous les nœuds de la fabric          dans l'underlay via VXLAN,
   (généralement du routage IGP         transportant à la fois le
   classique, ex. IS-IS ou OSPF)        trafic ET les métadonnées
                                        de politique (SGT, voir
   → invisible aux utilisateurs          sécurité)
     finaux, juste le "tuyau"
                                       → c'est ICI que vivent les
                                         VLANs/segments logiques
                                         perçus par les utilisateurs
```

L'**underlay** assure uniquement la connectivité IP entre les nœuds de la fabric (peu importe comment, tant que ça route) ; l'**overlay** (VXLAN, cours CCNA 3) transporte le trafic utilisateur réel de façon logiquement segmentée, indépendamment de la topologie physique sous-jacente — un changement de politique dans l'overlay ne nécessite aucun changement de câblage physique.

## SD-WAN : composants

```text
   ┌─────────────────────────────────────────────────┐
   │  vManage (orchestration, interface de gestion)       │
   ├─────────────────────────────────────────────────┤
   │  vSmart (plan de contrôle centralisé — distribue     │
   │  les politiques de routage aux edges)                  │
   ├─────────────────────────────────────────────────┤
   │  vBond (orchestrateur d'authentification/            │
   │  découverte initiale des edges)                        │
   └───────────────────┬───────────────────────────┘
                        │ contrôle (DTLS/TLS sécurisé)
   ┌────────────┬──────┴───────┬────────────────┐
   ▼            ▼               ▼                ▼
 [vEdge/cEdge  [vEdge/cEdge   [vEdge/cEdge     [vEdge/cEdge
  Site A]       Site B]        Site C]          Datacenter]
  (routeur      (routeur       (routeur         (routeur
   physique/     physique/      physique/        physique/
   virtuel)      virtuel)       virtuel)         virtuel)
```

| Composant | Rôle |
|---|---|
| **vManage** | Interface de gestion centralisée (configuration, monitoring, politiques) |
| **vSmart** | Plan de contrôle : distribue les routes et politiques de routage/sécurité à tous les edges |
| **vBond** | Point d'entrée d'authentification/découverte lors du premier démarrage d'un edge |
| **vEdge/cEdge** | Routeur physique ou virtuel déployé sur chaque site, exécute le plan de données |

## Cas d'usage : routage applicatif intelligent (SD-WAN)

```text
   Sans SD-WAN : le trafic emprunte TOUJOURS le même chemin WAN
   (ex. MPLS), quelle que soit la qualité réelle du lien à
   l'instant T (latence, perte, gigue)

   Avec SD-WAN : le contrôleur MESURE en continu la qualité de
   CHAQUE lien disponible sur un site (MPLS, Internet, LTE) et
   RÉACHEMINE dynamiquement le trafic applicatif SENSIBLE (VoIP,
   visio) vers le meilleur lien disponible à l'instant T, sans
   intervention manuelle — un routeur classique ne fait pas ce
   choix applicatif, seulement un choix de meilleure route IP
```

## Ce qu'il faut retenir

- **SD-Access** structure la fabric campus autour d'un Control Plane Node (LISP), de Fabric Border/Edge Nodes, orchestrés par DNA Center ; l'**underlay** (connectivité physique) porte l'**overlay** (segments logiques VXLAN).
- **SD-WAN** sépare vManage (gestion), vSmart (contrôle), vBond (authentification/découverte) des vEdge/cEdge (plan de données sur site).
- Les deux architectures partagent le principe SDN de séparation contrôle/données, appliqué respectivement au campus et au WAN.

## Pour aller plus loin

- [Cisco — SD-Access Solution Overview](https://www.cisco.com/c/en/us/solutions/enterprise-networks/software-defined-access/index.html)
- [Cisco — SD-WAN Design Guide](https://www.cisco.com/c/en/us/td/docs/solutions/CVD/SDWAN/cisco-sdwan-design-guide.html)
- [RFC 6830 — The Locator/ID Separation Protocol (LISP)](https://www.rfc-editor.org/rfc/rfc6830)
