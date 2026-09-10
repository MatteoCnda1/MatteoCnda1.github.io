---
id: 02-acl-ipv6-bonnes-pratiques
title: "ACL IPv6 et bonnes pratiques de placement"
sidebar_position: 2
tags: [reseau, cybersecurite]
---

# ACL IPv6 et bonnes pratiques de placement

> IPv6 n'a **pas** d'ACL "standard" distincte des "étendues" : toute ACL IPv6 est nativement capable de filtrer sur protocole, source, destination et port, dans une syntaxe unifiée.

## Configuration ACL IPv6

```bash
Router(config)# ipv6 access-list FILTRE_IPV6
Router(config-ipv6-acl)# permit tcp 2001:DB8:1::/64 any eq 443
Router(config-ipv6-acl)# permit tcp 2001:DB8:1::/64 any eq 80
Router(config-ipv6-acl)# permit icmp any any nd-ns          ! autoriser NDP (Neighbor Solicitation)
Router(config-ipv6-acl)# permit icmp any any nd-na          ! autoriser NDP (Neighbor Advertisement)
Router(config-ipv6-acl)# deny ipv6 any any log

Router(config)# interface gigabitEthernet 0/1
Router(config-if)# ipv6 traffic-filter FILTRE_IPV6 in
```

**Point critique spécifique à IPv6** : contrairement à ARP (couche 2, non filtrable par une ACL de couche 3), **NDP fonctionne via ICMPv6** — une ACL IPv6 mal conçue peut donc **bloquer par erreur** les messages NS/NA/RS/RA nécessaires au fonctionnement de base du réseau (résolution d'adresse, autoconfiguration). Il faut explicitement autoriser ces types ICMPv6 si l'ACL applique un deny général.

```text
   Types ICMPv6 à ne jamais bloquer sans réflexion :

   nd-ns / nd-na  : Neighbor Solicitation/Advertisement (= "ARP" IPv6)
   router-solicitation / router-advertisement : SLAAC
   Sans eux : plus de résolution d'adresse, plus d'autoconfiguration
              → panne réseau totale sur le segment concerné
```

Notez qu'IOS insère par défaut deux lignes **implicites** en tête de chaque ACL IPv6 pour autoriser ces échanges NDP — un comportement qu'il faut connaître pour ne pas les recréer inutilement, mais qui ne dispense pas de la vigilance en cas de `deny ipv6 any any` explicite mal placé avant.

## Bonnes pratiques générales de placement et de conception

```text
   1. STANDARD → près de la DESTINATION (filtre seulement sur la source)
   2. ÉTENDUE  → près de la SOURCE (filtre complet, évite le trafic
                 inutile de traverser tout le réseau avant d'être bloqué)
   3. Une ACL par interface, par protocole, et par SENS (in/out)
      → maximum théorique : 2 ACL IPv4 (in+out) par interface
   4. Toujours placer les règles les PLUS SPÉCIFIQUES en premier
      (évaluation séquentielle : une règle générale trop tôt peut
       masquer une exception plus spécifique placée après)
   5. Documenter chaque ACL (commentaire ou nom explicite) — une
      ACL non documentée devient vite un risque en environnement
      de production avec rotation d'équipe
   6. Toujours tester avec `show access-lists` (compteurs de matches)
      après déploiement pour valider le comportement réel
```

## ACL et plan de management : se protéger soi-même

```bash
! Piège classique : appliquer une ACL restrictive sur une interface
! de management SANS s'être explicitement autorisé en premier —
! coupe l'accès SSH à l'équipement lui-même, nécessitant un accès
! console physique pour se rattraper

Router(config)# ip access-list extended MGMT_ACCESS
Router(config-ext-nacl)# permit tcp host 192.168.1.100 any eq 22   ! poste admin AUTORISÉ en premier
Router(config-ext-nacl)# deny tcp any any eq 22 log
Router(config-ext-nacl)# permit ip any any                          ! ne pas bloquer le reste du trafic normal
```

**Recommandation pratique avant tout déploiement d'ACL sur une interface distante** : programmer un `reload in 10` (annulé ensuite si tout va bien) permet de récupérer automatiquement l'accès si l'ACL déployée coupe la connexion de management par erreur, sans nécessiter un déplacement physique.

```bash
Router# reload in 10
Reload scheduled in 10 minutes
! ... appliquer et tester l'ACL ...
Router# reload cancel          ! si tout fonctionne correctement
```

## Ce qu'il faut retenir

- IPv6 n'a qu'un seul type d'ACL (équivalent des ACL étendues IPv4), configuré via `ipv6 access-list` + `ipv6 traffic-filter`.
- Une ACL IPv6 mal conçue peut **casser NDP** (résolution d'adresse, SLAAC) si les types ICMPv6 nécessaires ne sont pas explicitement autorisés.
- Placement : ACL **standard** près de la destination, ACL **étendue** près de la source.
- `reload in 10` + test avant `reload cancel` est un filet de sécurité classique avant de déployer une ACL sur une interface de management distante.

## Pour aller plus loin

- [Cisco — IPv6 Access Control Lists](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/ipv6/configuration/xe-16/ip6-xe-16-book/ip6-acl-xe.html)
- [RFC 4443 — ICMPv6](https://www.rfc-editor.org/rfc/rfc4443)
