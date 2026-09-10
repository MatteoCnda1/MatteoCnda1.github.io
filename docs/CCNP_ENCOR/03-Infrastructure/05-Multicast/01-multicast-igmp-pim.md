---
id: 01-multicast-igmp-pim
title: "Multicast : IGMP et PIM"
sidebar_position: 1
tags: [reseau]
---

# Multicast : IGMP et PIM

> Le **multicast** (introduit en CCNA 1) diffuse un flux unique vers un **groupe d'abonnés**, sans dupliquer le trafic pour chacun (contrairement à plusieurs flux unicast parallèles). Deux protocoles complémentaires le rendent possible : **IGMP** (entre hôtes et leur routeur local) et **PIM** (entre routeurs, pour construire l'arbre de distribution).

## Pourquoi le multicast économise la bande passante

```text
   UNICAST RÉPÉTÉ (N flux distincts)      MULTICAST (1 flux, dupliqué
                                            seulement où nécessaire)

   [Serveur]─┬─► [Client A]                [Serveur]──► [Routeur]
             ├─► [Client B]                              ├──► [Client A]
             └─► [Client C]                               ├──► [Client B]
   (3× la bande passante                                   └──► [Client C]
    consommée en sortie du                                (1× la bande passante
    serveur, même contenu)                                 en sortie du serveur,
                                                             dupliqué seulement
                                                             au dernier saut
                                                             nécessaire)
```

## IGMP : gestion de l'appartenance à un groupe (hôte ↔ routeur local)

```text
   IGMP QUERY (routeur → tous les hôtes du segment, périodique)
   "Qui est encore intéressé par quels groupes multicast ?"

   IGMP REPORT (hôte → routeur, en réponse OU spontanément à
   l'adhésion à un nouveau groupe)
   "Je veux recevoir le groupe 239.1.1.1"

   IGMP LEAVE (IGMPv2+, hôte → routeur)
   "Je ne veux plus recevoir le groupe 239.1.1.1"
```

| Version | Apport |
|---|---|
| **IGMPv1** | Requête/réponse basique, pas de message LEAVE explicite (timeout uniquement) |
| **IGMPv2** | Ajoute LEAVE explicite (quitte un groupe plus rapidement, sans attendre le timeout) |
| **IGMPv3** | Ajoute le **source filtering** (SSM) : un hôte peut demander un groupe **depuis une source spécifique uniquement** |

```bash
Router(config)# ip multicast-routing
Router(config)# interface gigabitEthernet 0/1
Router(config-if)# ip pim sparse-mode
Router(config-if)# ip igmp version 3
```

## PIM : construction de l'arbre de distribution (routeur ↔ routeur)

```text
   PIM DENSE MODE (PIM-DM)               PIM SPARSE MODE (PIM-SM)

   "Flood puis prune" : envoie le        "Explicit join" : ne diffuse
   flux PARTOUT par défaut, puis          QUE vers les branches ayant
   ÉLAGUE (prune) les branches            EXPLICITEMENT demandé le
   sans récepteur intéressé               flux (via un point de
                                            rendez-vous, RP)

   → adapté aux réseaux où PRESQUE        → adapté à Internet/WAN,
     TOUS les segments ont des              où les récepteurs sont
     récepteurs (dense) — rarement          RARES et dispersés (sparse)
     utilisé en pratique aujourd'hui         — mode STANDARD utilisé
                                              en entreprise
```

**PIM-SM** est le mode dominant en pratique : contrairement à PIM-DM (qui suppose que le trafic multicast est désiré partout par défaut, gaspillant de la bande passante en floodant avant d'élaguer), PIM-SM ne transmet le flux que là où un récepteur l'a explicitement demandé — un comportement bien mieux adapté à la plupart des topologies réelles.

## Rendezvous Point (RP) en PIM-SM

```text
   1. Une source commence à émettre vers un groupe multicast
      → le PREMIER routeur (DR, Designated Router du segment
        source) encapsule le trafic et l'envoie au RP (Register)

   2. Un récepteur veut rejoindre ce groupe (via IGMP à son
      routeur local)
      → ce routeur envoie un message JOIN vers le RP, construisant
        un chemin (arbre partagé, "Shared Tree", noté "*,G")

   3. Le RP devient le POINT DE RENCONTRE initial entre source
      et récepteurs — le trafic transite via lui au début

   4. OPTIMISATION possible : une fois le flux identifié, les
      routeurs peuvent basculer vers un ARBRE DE CHEMIN LE PLUS
      COURT direct source→récepteur ("Shortest Path Tree", noté
      "S,G"), CONTOURNANT le RP pour la suite de la transmission
      (SPT switchover, comportement par défaut sur Cisco IOS)
```

```bash
! Configuration statique du RP (chaque routeur PIM doit connaître
! la même adresse de RP)
Router(config)# ip pim rp-address 10.0.0.100

! Ou découverte dynamique du RP (Auto-RP, propriétaire Cisco,
! ou BSR - Bootstrap Router, standard)
Router(config)# ip pim send-rp-announce loopback0 scope 16
Router(config)# ip pim send-rp-discovery scope 16
```

## SSM (Source-Specific Multicast) : simplifier sans RP

```text
   Plage réservée : 232.0.0.0/8

   Avec SSM (nécessite IGMPv3), un récepteur demande DIRECTEMENT
   "groupe G DEPUIS la source S" (S,G) — AUCUN RP nécessaire,
   l'arbre de distribution se construit directement source→récepteurs

   → simplifie l'architecture pour des cas d'usage à SOURCE UNIQUE
     bien identifiée (ex. diffusion vidéo IPTV depuis un serveur
     de contenu connu)
```

## Vérification

```bash
Router# show ip igmp groups
Router# show ip pim neighbor
Router# show ip mroute
(*, 239.1.1.1), 00:10:23/stopped, RP 10.0.0.100, flags: S
  Incoming interface: GigabitEthernet0/0, RPF nbr 10.0.0.1
  Outgoing interface list:
    GigabitEthernet0/1, Forward/Sparse, 00:10:23/00:02:45
```

## Ce qu'il faut retenir

- **IGMP** gère l'appartenance des hôtes à des groupes multicast (côté LAN, entre hôte et routeur local) ; **PIM** construit l'arbre de distribution entre routeurs.
- **PIM-SM** (explicit join, dominant en pratique) contraste avec **PIM-DM** (flood-and-prune, rarement utilisé).
- Le **Rendezvous Point (RP)** sert de point de rencontre initial entre source et récepteurs en PIM-SM ; un basculement SPT optionnel contourne ensuite le RP pour le chemin le plus court.
- **SSM** (232.0.0.0/8, IGMPv3) simplifie l'architecture en éliminant le besoin de RP pour les cas à source unique connue.

## Pour aller plus loin

- [RFC 3376 — Internet Group Management Protocol, Version 3 (IGMPv3)](https://www.rfc-editor.org/rfc/rfc3376)
- [RFC 7761 — Protocol Independent Multicast - Sparse Mode (PIM-SM)](https://www.rfc-editor.org/rfc/rfc7761)
