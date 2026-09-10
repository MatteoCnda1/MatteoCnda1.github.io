---
id: 01-acl-standard-etendues
title: "ACL standard et étendues : filtrage de trafic IPv4"
sidebar_position: 1
tags: [reseau, cybersecurite, cheatsheet]
---

# ACL standard et étendues : filtrage de trafic IPv4

> Une **ACL** (Access Control List) est une liste ordonnée de règles **permit/deny** appliquée au trafic traversant (ou destiné à) un routeur. Base fondamentale du filtrage réseau — bien avant tout firewall dédié.

## Traitement séquentiel et deny implicite

```text
   Une ACL est évaluée LIGNE PAR LIGNE, DANS L'ORDRE :

   ACL 10
   10 permit 192.168.1.10          ← testé en premier
   20 permit 192.168.1.0 0.0.0.255 ← testé seulement si la ligne 10 ne matche pas
   30 deny any                     ← "deny any" IMPLICITE existe même sans
                                       cette ligne écrite explicitement

   DÈS QU'UNE LIGNE MATCHE → la décision (permit/deny) est appliquée
   IMMÉDIATEMENT, aucune ligne suivante n'est évaluée.

   Si AUCUNE ligne ne matche → DENY IMPLICITE (tout le reste est
   bloqué par défaut, même si jamais écrit explicitement)
```

**Piège classique** : une ACL entièrement composée de lignes `deny` sans aucun `permit` bloque **tout** le trafic, à cause du deny implicite final — il faut toujours au moins un `permit` explicite pour laisser passer quelque chose.

## ACL standard (numérotée 1-99, 1300-1999)

```bash
! Filtre UNIQUEMENT sur l'adresse IP SOURCE — pas de distinction
! de destination, protocole ou port

Router(config)# access-list 10 permit 192.168.1.0 0.0.0.255
Router(config)# access-list 10 deny any

! Application sur une interface, dans un sens (in/out)
Router(config)# interface gigabitEthernet 0/1
Router(config-if)# ip access-group 10 out
```

**Limite structurelle** : ne filtrant que sur la source, une ACL standard doit être appliquée **au plus près de la destination** (sinon elle bloquerait aussi le trafic légitime vers d'autres destinations depuis la même source) — règle de placement à connaître.

## Masque générique (wildcard mask)

```text
   Masque générique = INVERSE du masque de sous-réseau

   Masque       0.0.0.255   → correspond à un /24 (255.255.255.0)
   Masque       0.0.0.0      → correspond à UNE SEULE adresse exacte
   Masque       255.255.255.255 → correspond à N'IMPORTE QUELLE adresse (= "any")

   Bit à 0 dans le wildcard = ce bit DOIT correspondre exactement
   Bit à 1 dans le wildcard = ce bit est IGNORÉ (peu importe sa valeur)
```

```bash
! Raccourcis équivalents
Router(config)# access-list 10 permit host 192.168.1.10
! équivaut à : access-list 10 permit 192.168.1.10 0.0.0.0

Router(config)# access-list 10 permit any
! équivaut à : access-list 10 permit 0.0.0.0 255.255.255.255
```

## ACL étendue (numérotée 100-199, 2000-2699)

```bash
! Filtre sur : protocole, IP source, IP destination, port source/destination

Router(config)# access-list 100 permit tcp 192.168.1.0 0.0.0.255 any eq 443
Router(config)# access-list 100 permit tcp 192.168.1.0 0.0.0.255 any eq 80
Router(config)# access-list 100 permit udp any any eq 53
Router(config)# access-list 100 deny ip any any log     ! "log" trace les paquets bloqués (utile en diagnostic)

Router(config)# interface gigabitEthernet 0/1
Router(config-if)# ip access-group 100 in
```

**Bonne pratique de placement** : une ACL étendue (filtrant sur source ET destination) doit être appliquée **au plus près de la source**, pour éviter de laisser transiter inutilement du trafic destiné à être bloqué plus loin.

## ACL nommées (plus lisibles, éditables ligne par ligne)

```bash
Router(config)# ip access-list extended FILTRE_LAN
Router(config-ext-nacl)# permit tcp 192.168.1.0 0.0.0.255 any eq 443
Router(config-ext-nacl)# permit tcp 192.168.1.0 0.0.0.255 any eq 80
Router(config-ext-nacl)# deny ip any any log
Router(config-ext-nacl)# exit

Router(config)# interface gigabitEthernet 0/1
Router(config-if)# ip access-group FILTRE_LAN in
```

**Avantage majeur des ACL nommées** : possibilité d'insérer/supprimer une ligne précise via un numéro de séquence, sans recréer toute l'ACL :

```bash
Router(config)# ip access-list extended FILTRE_LAN
Router(config-ext-nacl)# show access-list FILTRE_LAN     ! affiche les numéros de séquence
Router(config-ext-nacl)# 15 permit tcp 192.168.1.0 0.0.0.255 any eq 22
! insère une nouvelle règle entre la séquence 10 et 20 existantes
```

## Vérification

```bash
Router# show access-lists
Standard IP access list 10
    10 permit 192.168.1.0, wildcard bits 0.0.0.255 (152 matches)
    20 deny   any (8 matches)

Router# show ip interface gigabitEthernet 0/1 | include access list
```

## Ce qu'il faut retenir

- Une ACL est évaluée **séquentiellement**, s'arrête à la première correspondance, avec un **deny implicite** final.
- **Standard** (1-99) : filtre uniquement sur la source, à placer près de la **destination**.
- **Étendue** (100-199) : filtre sur protocole/source/destination/port, à placer près de la **source**.
- Le **masque générique** est l'inverse du masque de sous-réseau ; `host` et `any` sont des raccourcis.
- Les ACL **nommées** permettent l'édition ligne par ligne via numéro de séquence — préférées en production.

## Pour aller plus loin

- [Cisco — Access Control Lists: Overview and Guidelines](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/sec_data_acl/configuration/xe-16/sec-data-acl-xe-16-book.html)
