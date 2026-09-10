---
id: 01-bgp-fondamentaux
title: "BGP : le protocole de routage d'Internet"
sidebar_position: 1
tags: [reseau]
---

# BGP : le protocole de routage d'Internet

> **BGP** (Border Gateway Protocol, RFC 4271) est le **seul** protocole de routage utilisé entre systèmes autonomes (AS) sur Internet — c'est littéralement le protocole qui fait tenir Internet ensemble en interconnectant des dizaines de milliers de réseaux indépendants. Contrairement à OSPF/EIGRP (protocoles IGP, internes à une organisation), BGP est un protocole **EGP** (Exterior Gateway Protocol), conçu pour la robustesse et le contrôle de politique à très grande échelle plutôt que pour une convergence rapide.

## Vecteur de chemin (path vector) : ni distance ni état de liens

```text
   VECTEUR DE DISTANCE          ÉTAT DE LIENS            VECTEUR DE CHEMIN
   (RIP)                        (OSPF)                    (BGP)

   "distance vers X"            Carte topologique           "pour atteindre X,
   via un voisin                complète calculée            le chemin passe
                                 via Dijkstra                 par les AS 65001,
                                                               65002, 65003..."

   → chaque route BGP porte la LISTE COMPLÈTE des AS traversés
     (AS-PATH), ce qui permet à chaque routeur de DÉTECTER et
     REJETER instantanément une boucle (si son propre AS
     apparaît déjà dans l'AS-PATH reçu, la route est rejetée)
```

## AS (Autonomous System) : l'unité de base de BGP

```text
   Un AS = un ensemble de réseaux sous UNE SEULE administration,
   avec une politique de routage COHÉRENTE, identifié par un
   numéro unique (ASN) :

   AS PUBLICS  : 1 – 64495 (attribués par les RIR, ex. IANA/RIPE)
   AS PRIVÉS   : 64512 – 65534 (usage interne, non annoncés
                 publiquement sur Internet — équivalent des
                 plages IP privées RFC 1918)
   AS 4 octets : extension (RFC 6793) pour pallier l'épuisement
                 des ASN 2 octets classiques
```

## eBGP vs iBGP

```text
   eBGP (External BGP)                    iBGP (Internal BGP)

   Entre DEUX AS DIFFÉRENTS                Entre routeurs du MÊME AS

   [AS 65001] ══eBGP══ [AS 65002]          [R1]══iBGP══[R2]══iBGP══[R3]
                                            (tous dans AS 65001)

   Distance admin. par défaut : 20         Distance admin. par défaut : 200
   (préférée)                              (moins préférée qu'eBGP)

   Règle du "split horizon BGP" : une route apprise par iBGP
   NE PEUT PAS être réannoncée à un AUTRE voisin iBGP
   (pour éviter les boucles internes) — nécessite soit un
   MAILLAGE COMPLET iBGP entre tous les routeurs internes,
   soit un Route Reflector ou une architecture de confédération
```

## Route Reflector : contourner le maillage complet iBGP

```text
   SANS Route Reflector (maillage complet requis) :
   N routeurs iBGP → N×(N-1)/2 sessions iBGP à maintenir
   (ex. 10 routeurs = 45 sessions !)

   AVEC Route Reflector (RR) :

        [R1]──┐
        [R2]──┼──[Route Reflector]──┬──[R3]
        ...   ┘                      └──[R4]

   → les "clients" (R1, R2, R3, R4) ne forment une session
     iBGP QU'AVEC le RR, qui est AUTORISÉ à leur RÉFLÉCHIR
     (réannoncer) les routes reçues d'autres clients — exception
     à la règle du split horizon iBGP, uniquement pour ce rôle
```

## Établissement de session BGP (TCP port 179)

```text
   IDLE → CONNECT → ACTIVE → OPENSENT → OPENCONFIRM → ESTABLISHED

   BGP s'appuie sur TCP (port 179) pour le transport — contrairement
   à OSPF/EIGRP qui utilisent directement IP — ce qui lui fournit
   nativement fiabilité et contrôle de flux sans réimplémenter ces
   mécanismes, au prix d'une latence d'établissement plus élevée.
```

## Types de messages BGP

| Message | Rôle |
|---|---|
| **OPEN** | Établit la session, négocie les paramètres (version, AS, capacités) |
| **UPDATE** | Annonce de nouvelles routes / retrait de routes existantes |
| **KEEPALIVE** | Maintient la session active (par défaut toutes les 60s, timeout 180s) |
| **NOTIFICATION** | Signale une erreur, ferme la session |

## Ce qu'il faut retenir

- BGP est un protocole **vecteur de chemin** (path vector) : chaque route porte la liste complète des AS traversés (**AS-PATH**), utilisée pour détecter les boucles.
- **eBGP** (entre AS différents, AD=20) vs **iBGP** (au sein d'un même AS, AD=200) — iBGP impose un maillage complet ou un **Route Reflector** à cause du split horizon interne.
- BGP s'appuie sur **TCP port 179**, avec les messages OPEN/UPDATE/KEEPALIVE/NOTIFICATION.
- Conçu pour le contrôle de politique à très grande échelle (routage d'Internet), pas pour la vitesse de convergence — à l'opposé des IGP internes (OSPF/EIGRP).

## Pour aller plus loin

- [RFC 4271 — A Border Gateway Protocol 4 (BGP-4)](https://www.rfc-editor.org/rfc/rfc4271)
- [RFC 6793 — BGP Support for Four-Octet AS Number Space](https://www.rfc-editor.org/rfc/rfc6793)
- [RFC 4456 — BGP Route Reflection](https://www.rfc-editor.org/rfc/rfc4456)
