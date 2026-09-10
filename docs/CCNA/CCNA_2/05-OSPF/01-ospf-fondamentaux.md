---
id: 01-ospf-fondamentaux
title: "OSPF : fondamentaux du protocole à état de liens"
sidebar_position: 1
tags: [reseau]
---

# OSPF : fondamentaux du protocole à état de liens

> **OSPF** (Open Shortest Path First, RFC 2328) est un protocole de routage dynamique **à état de liens** (link-state), standard ouvert (IETF), largement utilisé en entreprise. Chaque routeur construit une **carte complète** de la topologie du réseau (pas seulement une liste de routes) et calcule lui-même le meilleur chemin via l'algorithme de **Dijkstra**.

## État de liens vs vecteur de distance

```text
   VECTEUR DE DISTANCE (ex. RIP)          ÉTAT DE LIENS (OSPF)

   Chaque routeur connaît seulement        Chaque routeur construit une
   "la distance vers X, via ce voisin"     carte COMPLÈTE de la topologie
   (vision partielle, "on entend dire")    (LSDB - Link State Database,
                                            identique sur tous les routeurs
   → convergence lente, risque de           d'une même zone)
     boucles de routage
                                           → convergence rapide, calcul
                                             local du meilleur chemin
                                             via Dijkstra (SPF)
```

## Les trois structures de données OSPF

```text
   1. TABLE DE VOISINAGE (neighbor table)
      Liste des routeurs OSPF voisins directement adjacents,
      avec leur état de relation (Down → Init → 2-Way → ... → Full)

   2. LSDB (Link-State Database)
      Base de données topologique COMPLÈTE de la zone (area),
      identique sur tous les routeurs de cette zone — construite
      par échange de LSA (Link State Advertisements)

   3. TABLE DE ROUTAGE
      Résultat du calcul Dijkstra (SPF - Shortest Path First)
      appliqué à la LSDB : le meilleur chemin vers chaque réseau
```

## Établissement de la relation de voisinage

```text
   DOWN → INIT → 2-WAY → EXSTART → EXCHANGE → LOADING → FULL

   DOWN     : aucun paquet Hello reçu
   INIT     : Hello reçu, mais pas encore de réciprocité confirmée
   2-WAY    : réciprocité confirmée (les deux se voient mutuellement)
              → c'est ICI que s'arrête la relation sur un segment
              multi-accès avec des routeurs non-DR/BDR (DROTHER)
   EXSTART  : négociation du maître/esclave pour l'échange de LSDB
   EXCHANGE : échange des résumés de la LSDB (DBD - Database
              Description packets)
   LOADING  : demande et réception des LSA manquants (LSR/LSU)
   FULL     : LSDB synchronisée, relation de voisinage pleinement
              opérationnelle
```

## Paquets Hello et paramètres de correspondance

```bash
Router# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.0.0.2          1   FULL/BDR        00:00:38    10.0.0.2        GigabitEthernet0/1
```

Pour former une adjacence, deux routeurs OSPF doivent avoir des paramètres **identiques** :
- Même **zone (area)** sur l'interface concernée.
- Même **masque de sous-réseau** sur le lien.
- Mêmes intervalles **Hello/Dead** (par défaut 10s/40s sur Ethernet, 30s/120s sur liens NBMA).
- Même **type d'authentification** (si activée).
- Router ID **unique** (sinon conflit).

## Router ID (RID)

```text
   Ordre de sélection du Router ID (identifiant unique 32 bits,
   format d'une adresse IPv4) :

   1. Router ID configuré MANUELLEMENT (router-id X.X.X.X) → priorité absolue
   2. Sinon, adresse IP la plus HAUTE parmi les interfaces LOOPBACK actives
   3. Sinon, adresse IP la plus HAUTE parmi les interfaces PHYSIQUES actives
```

**Bonne pratique** : toujours configurer une interface **loopback** dédiée (jamais down tant que le routeur fonctionne) pour un Router ID stable, ou fixer le Router ID manuellement — éviter de dépendre d'une interface physique qui pourrait tomber.

## Zones (Areas) OSPF

```text
   ┌─────────────────────────────────────────────────────┐
   │                    Area 0 (BACKBONE)                    │
   │         TOUTES les autres zones doivent s'y connecter    │
   └────────────┬──────────────────────┬────────────────┘
                │ ABR                   │ ABR
        ┌───────▼────────┐      ┌──────▼─────────┐
        │    Area 1        │      │    Area 2        │
        └─────────────────┘      └─────────────────┘
```

- **Area 0** (backbone) : zone centrale obligatoire dans toute topologie OSPF multi-zones ; toutes les autres zones doivent s'y raccorder (directement ou via un lien virtuel).
- **ABR** (Area Border Router) : routeur avec des interfaces dans plusieurs zones, résume/filtre les routes entre elles.
- Le découpage en zones limite la taille de la LSDB par zone (scalabilité) et réduit l'impact d'un changement topologique (confiné à sa zone).

## Ce qu'il faut retenir

- OSPF = protocole **à état de liens** : chaque routeur construit une carte complète (LSDB) et calcule lui-même le meilleur chemin via **Dijkstra (SPF)**.
- Progression de voisinage : Down → Init → 2-Way → Exstart → Exchange → Loading → **Full**.
- Les paramètres (zone, masque, timers Hello/Dead, authentification) doivent correspondre entre voisins pour former une adjacence.
- Le **Router ID** se fixe manuellement, sinon dérivé de la loopback la plus haute, sinon de l'interface physique la plus haute.
- L'**Area 0** (backbone) est obligatoire ; toute autre zone doit s'y raccorder via un ABR.

## Pour aller plus loin

- [RFC 2328 — OSPF Version 2](https://www.rfc-editor.org/rfc/rfc2328)
- [Cisco — OSPF Design Guide](https://www.cisco.com/c/en/us/support/docs/ip/open-shortest-path-first-ospf/7039-1.html)
