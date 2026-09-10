---
id: 02-securite-infrastructure-copp-urpf
title: "Sécurité de l'infrastructure : CoPP et uRPF"
sidebar_position: 2
tags: [reseau, cybersecurite, cheatsheet]
---

# Sécurité de l'infrastructure : CoPP et uRPF

> Au-delà de sécuriser le trafic **traversant** un équipement (ACL, firewall), il faut aussi protéger l'équipement **lui-même** : son processeur de contrôle (CPU) contre la saturation, et le réseau contre l'usurpation d'adresse source (**IP spoofing**).

## CoPP (Control Plane Policing)

```text
   Rappel des trois plans (vus en CCNA 3, SDN) :

   Plan de DONNÉES  : transféré en matériel (ASIC), très rapide,
                       gère des millions de paquets/seconde
   Plan de CONTRÔLE : traité par le CPU DE L'ÉQUIPEMENT lui-même
                       (protocoles de routage, SSH, SNMP...) —
                       capacité BEAUCOUP plus limitée

   ATTAQUE : un flot de paquets destinés AU ROUTEUR LUI-MÊME
   (ex. un flood de fausses requêtes SSH, ou de paquets ICMP mal
   formés nécessitant un traitement CPU) peut SATURER le plan de
   contrôle — même si le plan de données continue de fonctionner,
   le routeur devient INJOIGNABLE en administration ET incapable
   de traiter ses propres protocoles de routage (risque de
   convergence OSPF/BGP cassée par manque de CPU disponible)
```

**CoPP** applique une politique de QoS (classification + limitation de débit) **spécifiquement au trafic destiné au plan de contrôle** de l'équipement lui-même — protégeant le CPU contre la saturation, qu'elle soit malveillante (DoS ciblé) ou accidentelle (tempête de broadcast, boucle de routage générant un flot de messages).

```bash
! 1. Classifier le trafic destiné au plan de contrôle
Router(config)# access-list 100 permit tcp any host 192.168.1.1 eq 22   ! SSH légitime
Router(config)# access-list 101 permit icmp any host 192.168.1.1         ! ICMP

Router(config)# class-map CRITIQUE
Router(config-cmap)# match access-group 100
Router(config)# class-map NORMAL
Router(config-cmap)# match access-group 101

! 2. Politique : limiter le débit autorisé vers le CPU par classe
Router(config)# policy-map COPP_POLICY
Router(config-pmap)# class CRITIQUE
Router(config-pmap-c)# police 512000 conform-action transmit exceed-action drop
Router(config-pmap)# class NORMAL
Router(config-pmap-c)# police 64000 conform-action transmit exceed-action drop
Router(config-pmap)# class class-default
Router(config-pmap-c)# police 8000 conform-action transmit exceed-action drop

! 3. Application SPÉCIFIQUE au plan de contrôle (pas une interface normale)
Router(config)# control-plane
Router(config-cp)# service-policy input COPP_POLICY
```

**Point critique** : CoPP s'applique via `control-plane`, **pas** via `service-policy` sur une interface normale — c'est une politique globale protégeant le CPU de l'équipement, indépendamment de l'interface par laquelle le trafic est physiquement reçu.

## uRPF (Unicast Reverse Path Forwarding)

```text
   ATTAQUE CONTRÉE : IP SPOOFING — un attaquant envoie des paquets
   avec une adresse IP SOURCE FALSIFIÉE (ex. usurpant l'adresse
   d'une victime tierce), souvent utilisé pour des attaques par
   réflexion/amplification DDoS (le trafic de réponse est envoyé
   à la victime usurpée, pas à l'attaquant réel)

   PRINCIPE uRPF : pour chaque paquet ENTRANT, le routeur vérifie
   que l'ADRESSE SOURCE du paquet correspondrait à une route
   RÉELLE et COHÉRENTE dans sa table de routage SI ce paquet
   devait repartir dans l'autre sens — sinon, DROP immédiat
```

```text
   MODE STRICT                            MODE LOOSE

   Le paquet DOIT arriver EXACTEMENT       Le paquet est accepté SI
   par l'interface que la table de         une route QUELCONQUE existe
   routage indiquerait pour ATTEINDRE       vers cette IP source
   cette IP source (le CHEMIN DOIT           (n'importe quelle interface),
   correspondre exactement)                  MOINS strict — adapté aux
                                              topologies ASYMÉTRIQUES
   → adapté aux interfaces à chemin          (ex. trafic entrant et
     SYMÉTRIQUE UNIQUE (ex. accès             sortant empruntant des
     client résidentiel, une seule             chemins physiquement
     route possible vers/depuis lui)           différents, courant en
                                                BGP multi-homed)
```

```bash
! Mode strict (interface avec un chemin de retour unique et garanti)
Router(config)# interface gigabitEthernet 0/1
Router(config-if)# ip verify unicast source reachable-via rx

! Mode loose (topologies avec routage asymétrique)
Router(config-if)# ip verify unicast source reachable-via any
```

## Cas d'usage concret

Un fournisseur d'accès Internet applique uRPF en mode **strict** sur toutes ses interfaces client résidentielles (chaque client n'a qu'un chemin de connexion possible) : un client dont l'équipement serait compromis et tenterait d'envoyer du trafic avec une IP source usurpée (pour participer à une attaque DDoS par réflexion) voit ce trafic **immédiatement rejeté** dès l'entrée sur le réseau de l'opérateur — une mesure de bonne hygiène réseau largement recommandée (BCP 38 / RFC 2827) pour limiter la portée des attaques par usurpation à l'échelle d'Internet.

## Ce qu'il faut retenir

- **CoPP** protège le **CPU** de l'équipement (plan de contrôle) contre la saturation, via une politique QoS appliquée sous `control-plane`, distincte d'une politique QoS de trafic normal.
- **uRPF** rejette les paquets dont l'adresse source ne correspondrait à aucune route cohérente — contre-mesure directe à l'**IP spoofing**.
- Mode **strict** (chemin de retour unique attendu exactement) vs **loose** (n'importe quelle route existante suffit, adapté aux topologies asymétriques).

## Pour aller plus loin

- [RFC 2827 / BCP 38 — Network Ingress Filtering](https://www.rfc-editor.org/rfc/rfc2827)
- [Cisco — Control Plane Policing Implementation Guide](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/qos_plcshp/configuration/xe-16/qos-plcshp-xe-16-book/qos-plcshp-control-plane-policing.html)
- [RFC 3704 — Ingress Filtering for Multihomed Networks](https://www.rfc-editor.org/rfc/rfc3704)
