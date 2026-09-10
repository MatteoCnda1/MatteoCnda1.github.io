---
id: 01-eigrp-fondamentaux
title: "EIGRP : algorithme DUAL et métrique composite"
sidebar_position: 1
tags: [reseau]
---

# EIGRP : algorithme DUAL et métrique composite

> **EIGRP** (Enhanced Interior Gateway Routing Protocol) est un protocole de routage **hybride** (historiquement propriétaire Cisco, ouvert en RFC 7868 depuis 2016), combinant la rapidité de convergence d'un protocole à état de liens avec la simplicité de configuration d'un vecteur de distance.

## Vecteur de distance amélioré : pas de calcul Dijkstra complet

```text
   EIGRP N'EST PAS à état de liens (pas de LSDB complète comme
   OSPF) : chaque routeur ne connaît QUE ce que ses voisins lui
   annoncent (comme un vecteur de distance classique) — MAIS il
   conserve des informations supplémentaires (routes de secours
   pré-calculées) qui permettent une convergence quasi-instantanée
   sans recalcul complet en cas de panne.
```

## L'algorithme DUAL (Diffusing Update Algorithm)

```text
   Pour chaque route, DUAL calcule et conserve :

   SUCCESSOR         : la MEILLEURE route actuelle (installée
                        dans la table de routage)

   FEASIBLE SUCCESSOR : une route de SECOURS déjà validée, prête
                        à être utilisée INSTANTANÉMENT si le
                        Successor tombe (AUCUN recalcul nécessaire)

   Condition de "Feasible Successor" (Feasibility Condition) :
   la métrique annoncée par ce voisin (Reported Distance) doit
   être INFÉRIEURE à la métrique actuelle du Successor
   (Feasible Distance) — condition qui GARANTIT mathématiquement
   l'ABSENCE de boucle de routage, sans avoir besoin d'un calcul
   Dijkstra complet
```

```text
   R1 ──(coût 10)──► R2 ──(coût 5)──► [Réseau 192.168.10.0/24]
   R1 ──(coût 20)──► R3 ──(coût 3)──► [Réseau 192.168.10.0/24]

   Feasible Distance (FD) via R2 = 10+5 = 15  → SUCCESSOR (meilleur)
   Feasible Distance (FD) via R3 = 20+3 = 23

   Condition Feasible Successor pour R3 :
   Reported Distance de R3 (= 3, la métrique DE R3 vers la
   destination, PAS le coût total depuis R1) < FD du Successor (15) ?
   → 3 < 15 → OUI, R3 est un FEASIBLE SUCCESSOR valide

   Si le lien R1-R2 tombe : bascule INSTANTANÉE vers R3, sans
   aucun calcul supplémentaire (R3 était déjà validé comme sûr)
```

Si **aucun** voisin ne satisfait la condition de faisabilité, DUAL passe en état **Active** : il interroge activement ses voisins (paquets Query) pour trouver une nouvelle route, un processus plus lent (bien que toujours nettement plus rapide qu'un recalcul RIP classique) — c'est le seul cas où EIGRP "recalcule" réellement.

## Métrique composite EIGRP

```text
   Métrique = f(bande passante, délai, [fiabilité, charge, MTU])

   Par défaut, SEULES bande passante et délai sont utilisées
   (fiabilité/charge/MTU existent mais sont désactivées par défaut,
   car rarement stables/pertinentes en pratique) :

   Métrique = 256 × ( (10^7 / BP_minimale_du_chemin_kbps)
                       + Σ(délais du chemin, en dizaines de µs) )

   → la bande passante prise en compte est la PLUS FAIBLE du
     chemin (le goulot d'étranglement), pas une moyenne
   → le délai est CUMULÉ sur tout le chemin (somme de chaque saut)
```

Contrairement à OSPF (coût basé uniquement sur la bande passante), EIGRP intègre nativement le **délai cumulé**, offrant en théorie une métrique plus fine — mais cette complexité supplémentaire est aussi une source d'erreurs de configuration si mal comprise (ex. modifier le délai d'une interface pour influencer le choix de chemin, une technique d'ingénierie de trafic EIGRP courante).

## Ce qu'il faut retenir

- EIGRP est un vecteur de distance **amélioré** (pas d'état de liens complet), utilisant l'algorithme **DUAL** pour précalculer des routes de secours (**Feasible Successors**) sans risque de boucle.
- La condition de faisabilité (Reported Distance du voisin < Feasible Distance du Successor) garantit mathématiquement l'absence de boucle, sans calcul Dijkstra.
- La **métrique composite** combine par défaut bande passante minimale du chemin et délai cumulé (contrairement à OSPF, coût basé sur la bande passante seule).
- Sans Feasible Successor disponible, EIGRP passe en état **Active** et interroge activement ses voisins — plus lent, mais rare.

## Pour aller plus loin

- [RFC 7868 — Cisco's Enhanced Interior Gateway Routing Protocol (EIGRP)](https://www.rfc-editor.org/rfc/rfc7868)
- [Cisco — EIGRP White Paper](https://www.cisco.com/c/en/us/products/collateral/ios-nx-os-software/enhanced-interior-gateway-routing-protocol-eigrp/prod_white_paper0900aecd80310f8b.html)
