---
id: 01-fhrp-hsrp-vrrp-glbp
title: "FHRP : redondance de passerelle (HSRP, VRRP, GLBP)"
sidebar_position: 1
tags: [reseau, cheatsheet]
---

# FHRP : redondance de passerelle (HSRP, VRRP, GLBP)

> Un **FHRP** (First Hop Redundancy Protocol) élimine la **passerelle par défaut comme point de défaillance unique** : plusieurs routeurs physiques partagent une **adresse IP/MAC virtuelle**, utilisée par les hôtes comme passerelle, avec bascule automatique et transparente en cas de panne du routeur actif.

## Le problème résolu

```text
   SANS FHRP                              AVEC FHRP

   [PC] → gateway = 192.168.1.1            [PC] → gateway = 192.168.1.1 (IP VIRTUELLE)
   (IP RÉELLE du routeur R1)                        │
                                            [R1 (actif)]══[R2 (standby)]
   Si R1 tombe → AUCUNE route de           Si R1 tombe → R2 prend
   sortie, les PC ne peuvent PAS             automatiquement le relais,
   changer de gateway automatiquement          les PC continuent d'utiliser
   (config statique sur chaque poste)          la MÊME IP virtuelle 192.168.1.1
```

## HSRP (Hot Standby Router Protocol) — propriétaire Cisco

```text
   États HSRP : Initial → Learn → Listen → Speak → Standby → ACTIVE

   Rôles actifs :
   - ACTIVE  : transfère effectivement le trafic pour l'IP virtuelle
   - STANDBY : prêt à prendre le relais immédiatement si l'Active tombe
   - Les autres routeurs du groupe restent en LISTEN
```

```bash
! R1 (sera Actif — priorité plus élevée)
R1(config)# interface gigabitEthernet 0/1
R1(config-if)# standby 1 ip 192.168.1.1          ! groupe 1, IP virtuelle
R1(config-if)# standby 1 priority 110              ! défaut 100, plus haut = préféré
R1(config-if)# standby 1 preempt                    ! reprend le rôle Actif dès qu'il redevient disponible

! R2 (Standby)
R2(config)# interface gigabitEthernet 0/1
R2(config-if)# standby 1 ip 192.168.1.1
R2(config-if)# standby 1 priority 90
```

- `preempt` : **sans** cette commande, un routeur revenant en ligne après une panne ne reprend **pas** automatiquement son rôle Actif même si sa priorité redevient supérieure (évite un basculement inutile/flapping) — à activer explicitement si le retour immédiat au routeur "préféré" est souhaité.
- L'**adresse MAC virtuelle** HSRP suit un format standardisé (`0000.0C07.ACxx`, où `xx` = numéro de groupe en hexadécimal), permettant de la reconnaître facilement dans une capture réseau.

## VRRP (Virtual Router Redundancy Protocol) — standard IETF

```bash
R1(config)# interface gigabitEthernet 0/1
R1(config-if)# vrrp 1 ip 192.168.1.1
R1(config-if)# vrrp 1 priority 110
! le préemption est ACTIVÉE PAR DÉFAUT en VRRP (contrairement à HSRP)
```

Fonctionnellement très proche d'HSRP (mêmes concepts : groupe, IP virtuelle, priorité), mais **standard ouvert IETF** (RFC 5798) — interopérable multi-constructeur, alors que HSRP est propriétaire Cisco. Terminologie légèrement différente : le routeur actif s'appelle **Master** (pas "Active"), les autres **Backup**.

## GLBP (Gateway Load Balancing Protocol) — propriétaire Cisco

```text
   Limite d'HSRP/VRRP : UN SEUL routeur actif à la fois, l'autre
   reste inutilisé (pur backup) tant qu'aucune panne ne survient
   → gaspillage de la capacité du routeur standby

   GLBP : répartit ACTIVEMENT la charge entre PLUSIEURS routeurs
   simultanément, via une seule IP virtuelle mais PLUSIEURS
   adresses MAC virtuelles (une par routeur du groupe, jusqu'à 4)

   [PC1] → ARP pour 192.168.1.1 → reçoit MAC virtuelle de R1
   [PC2] → ARP pour 192.168.1.1 → reçoit MAC virtuelle de R2
   (le AVG - Active Virtual Gateway - répond différemment selon
    le client, répartissant la charge)
```

```bash
R1(config-if)# glbp 1 ip 192.168.1.1
R1(config-if)# glbp 1 priority 110
R1(config-if)# glbp 1 load-balancing round-robin   ! ou host-dependent, weighted
```

## Comparatif

| Critère | HSRP | VRRP | GLBP |
|---|---|---|---|
| Origine | Propriétaire Cisco | Standard IETF (RFC 5798) | Propriétaire Cisco |
| Routeurs actifs simultanés | 1 (Active) | 1 (Master) | Jusqu'à 4 (load-balancing) |
| Préemption par défaut | Désactivée | Activée | Activée |
| Rôle principal | Active/Standby | Master/Backup | AVG/AVF |

## Vérification

```bash
Router# show standby brief
Interface   Grp  Pri P State    Active          Standby         Virtual IP
Gi0/1       1    110 P Active   local           192.168.1.2     192.168.1.1

Router# show vrrp brief
Router# show glbp brief
```

## Ce qu'il faut retenir

- Les **FHRP** fournissent une IP de passerelle virtuelle partagée par plusieurs routeurs, avec bascule automatique transparente pour les hôtes.
- **HSRP** (Cisco) et **VRRP** (standard) : un seul routeur actif à la fois ; **GLBP** (Cisco) répartit activement la charge entre jusqu'à 4 routeurs.
- `preempt` doit être activé explicitement en HSRP pour qu'un routeur revenant en ligne reprenne son rôle prioritaire (activé par défaut en VRRP).

## Pour aller plus loin

- [RFC 5798 — Virtual Router Redundancy Protocol (VRRP) Version 3](https://www.rfc-editor.org/rfc/rfc5798)
- [Cisco — HSRP Configuration Guide](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/ipapp_fhrp/configuration/xe-16/fhp-xe-16-book.html)
