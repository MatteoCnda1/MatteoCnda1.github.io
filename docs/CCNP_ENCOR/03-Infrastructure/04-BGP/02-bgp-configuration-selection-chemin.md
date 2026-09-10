---
id: 02-bgp-configuration-selection-chemin
title: "BGP : configuration et algorithme de sélection de chemin"
sidebar_position: 2
tags: [reseau, cheatsheet]
---

# BGP : configuration et algorithme de sélection de chemin

## Configuration eBGP de base

```bash
Router(config)# router bgp 65001                        ! numéro d'AS LOCAL
Router(config-router)# bgp router-id 1.1.1.1
Router(config-router)# neighbor 203.0.113.2 remote-as 65002   ! AS DISTANT du voisin
Router(config-router)# network 192.168.1.0 mask 255.255.255.0  ! annonce ce préfixe (doit exister dans la table de routage)
```

**Point critique** : contrairement à OSPF/EIGRP (`network` active un protocole sur une interface), la commande `network` en BGP **annonce un préfixe précis** — celui-ci doit déjà exister **exactement** dans la table de routage locale (via une route statique, connectée, ou apprise par un IGP), sinon l'annonce échoue silencieusement.

## Configuration iBGP

```bash
Router(config)# router bgp 65001
Router(config-router)# neighbor 10.0.0.2 remote-as 65001      ! MÊME AS que le local = iBGP
Router(config-router)# neighbor 10.0.0.2 update-source loopback 0
! utilise une interface loopback (toujours up) comme source de
! la session — bonne pratique en iBGP pour éviter qu'une panne
! d'un lien physique spécifique ne coupe la session BGP alors
! qu'un autre chemin interne existe encore
```

## Route Reflector

```bash
! Sur le Route Reflector
Router(config-router)# neighbor 10.0.0.11 remote-as 65001
Router(config-router)# neighbor 10.0.0.11 route-reflector-client
Router(config-router)# neighbor 10.0.0.12 remote-as 65001
Router(config-router)# neighbor 10.0.0.12 route-reflector-client
! les clients eux-mêmes n'ont besoin d'AUCUNE configuration
! spéciale — ils forment une session iBGP normale vers le RR
```

## Algorithme de sélection du meilleur chemin BGP

```text
   Quand PLUSIEURS routes existent vers la MÊME destination,
   BGP les départage dans cet ORDRE STRICT (s'arrête au premier
   critère décisif) :

   1. WEIGHT le plus élevé            (propriétaire Cisco, LOCAL au routeur)
   2. LOCAL PREFERENCE la plus élevée (propagée dans TOUT l'AS local, influence
                                        la sortie préférée pour TOUT l'AS)
   3. Route ORIGINÉE localement       (via "network"/redistribution) préférée
                                        à une route apprise
   4. AS-PATH le plus COURT            (moins d'AS traversés = préféré)
   5. ORIGIN le plus bas                (IGP < EGP < Incomplete)
   6. MED (Multi-Exit Discriminator)   le plus BAS (suggestion faite par
                                        un AS voisin sur son point d'entrée
                                        préféré — comparé seulement entre
                                        routes du MÊME AS voisin)
   7. eBGP préféré à iBGP
   8. IGP metric la plus basse vers le next-hop BGP
   9. Route la plus ANCIENNE (stabilité, évite le "route flapping")
   10. Router ID le plus bas (dernier recours, départage arbitraire)
```

Les deux premiers critères sont les plus utilisés en ingénierie de trafic pratique :

```bash
! WEIGHT : influence LOCALE uniquement (non propagée aux voisins)
Router(config-router)# neighbor 203.0.113.2 weight 200

! LOCAL PREFERENCE : influence TOUT l'AS local (propagée en iBGP)
Router(config-router)# bgp default local-preference 200
! ou via route-map pour cibler des préfixes spécifiques
```

```text
   WEIGHT : décision purement LOCALE à ce routeur, utile pour
   choisir SA propre sortie préférée sans affecter les autres
   routeurs de l'AS

   LOCAL PREFERENCE : décision propagée à TOUT l'AS via iBGP,
   utile pour imposer une politique de sortie COHÉRENTE à
   l'échelle de l'organisation entière (ex. "tout le trafic
   sortant doit préférer le lien vers le Transit Provider A
   plutôt que B")
```

## AS-PATH prepending : influencer les AS voisins

```bash
! Répéter artificiellement son propre AS dans l'AS-PATH annoncé
! rend le chemin ARTIFICIELLEMENT plus long aux yeux des AS
! distants, les incitant (critère 4) à préférer un AUTRE chemin
! d'entrée vers cet AS
Router(config-router)# neighbor 203.0.113.2 route-map PREPEND out

route-map PREPEND permit 10
 set as-path prepend 65001 65001 65001
```

Contrairement à Weight/Local Preference (qui influencent des décisions **sortantes**, propres à l'AS local), le **prepending** est une technique pour influencer le comportement **entrant** — comment les AS externes choisissent d'atteindre le réseau local, en rendant délibérément un chemin moins attractif.

## Vérification

```bash
Router# show ip bgp summary
Neighbor        V    AS  MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
203.0.113.2     4 65002    15234    15201        5    0    0 3d02h          423

Router# show ip bgp
Router# show ip bgp neighbors 203.0.113.2
Router# show ip route bgp
```

## Ce qu'il faut retenir

- La commande `network` en BGP annonce un **préfixe exact** déjà présent dans la table de routage — elle n'active rien sur une interface (différence majeure avec OSPF/EIGRP).
- L'algorithme de sélection de chemin BGP suit un ordre strict : **Weight** (local) → **Local Preference** (tout l'AS) → origine locale → **AS-PATH** le plus court → ... jusqu'au Router ID en dernier recours.
- **Weight** influence uniquement le routeur local ; **Local Preference** propage la décision à tout l'AS via iBGP.
- **AS-PATH prepending** influence les décisions des AS **distants** en rendant artificiellement un chemin moins attractif.

## Pour aller plus loin

- [RFC 4271 — BGP-4](https://www.rfc-editor.org/rfc/rfc4271)
- [Cisco — BGP Best Path Selection Algorithm](https://www.cisco.com/c/en/us/support/docs/ip/border-gateway-protocol-bgp/13753-25.html)
