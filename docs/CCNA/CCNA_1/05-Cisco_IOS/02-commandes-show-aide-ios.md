---
id: 02-commandes-show-aide-ios
title: "Aide contextuelle et commandes show IOS"
sidebar_position: 2
tags: [reseau, cheatsheet]
---

# Aide contextuelle et commandes show IOS

> IOS fournit une **aide contextuelle intégrée** (`?`) à chaque niveau de la CLI, et un ensemble très riche de commandes **show** pour l'inspection de l'état d'un équipement — la base de tout diagnostic réseau.

## Aide contextuelle

```bash
Router> ?                    ! liste toutes les commandes disponibles à ce niveau
Router# co?                  ! liste les commandes commençant par "co"
                              ! (configure, connect, copy...)
Router# configure ?          ! liste les mots-clés possibles après "configure"
Router(config)# interface ?  ! liste les types d'interfaces disponibles sur l'équipement
```

- `?` seul : liste toutes les commandes du mode courant.
- `<début>?` (collé, sans espace) : complète les commandes commençant par ces lettres.
- `<commande> ?` (avec espace) : liste les arguments/mots-clés suivants possibles.

## Commandes `show` essentielles

```bash
Router# show running-config          ! configuration ACTIVE en mémoire (RAM)
Router# show startup-config          ! configuration de démarrage (NVRAM)
Router# show version                 ! version IOS, uptime, quantité de mémoire, registre de config
Router# show ip interface brief      ! état résumé de toutes les interfaces (IP, up/down)
Router# show interfaces              ! détail complet par interface (erreurs, débit, duplex)
Router# show ip route                ! table de routage IPv4
Router# show ipv6 route              ! table de routage IPv6
Router# show cdp neighbors           ! équipements Cisco voisins découverts (CDP)
Router# show mac address-table       ! table d'adresses MAC (switch)
Router# show vlan brief              ! liste des VLANs configurés (switch)
Router# show arp                     ! table de résolution ARP
Router# show ipv6 neighbors          ! table de voisinage NDP
Router# show clock                   ! horloge système
Router# show processes cpu           ! utilisation CPU
Router# show flash                   ! contenu de la mémoire flash (images IOS)
Router# show logging                 ! journal des événements système
```

## `show ip interface brief` — lecture du résultat

```bash
Router# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.1.1     YES manual up                    up
GigabitEthernet0/1     unassigned      YES unset  administratively down down
Vlan1                  unassigned      YES unset  down                  down
```

| Colonne | Signification |
|---|---|
| **Status** (couche 1) | `up` = câble/signal physique OK ; `administratively down` = interface désactivée manuellement (`shutdown`) ; `down` = pas de signal physique |
| **Protocol** (couche 2) | `up` = protocole de liaison fonctionnel ; `down` = pas d'encapsulation compatible en face |

Un couple **Status=down / Protocol=down** indique généralement un problème physique (câble débranché, port distant désactivé). **Status=up / Protocol=down** indique un problème de couche 2 (mismatch d'encapsulation, keepalives absents).

## CDP et LLDP : découverte de voisins

```bash
Router# show cdp neighbors detail
-------------------------
Device ID: Switch1
Platform: cisco WS-C2960-24TT,  Capabilities: Switch IGMP
Interface: GigabitEthernet0/0,  Port ID (outgoing port): GigabitEthernet0/1
Holdtime : 156 sec
```

- **CDP** (Cisco Discovery Protocol) : propriétaire Cisco, actif par défaut, découvre les équipements Cisco directement connectés (plateforme, interface, IP).
- **LLDP** (Link Layer Discovery Protocol, standard IEEE 802.1AB) : équivalent multi-constructeur, à activer explicitement (`lldp run`).

```bash
Router(config)# lldp run
Router# show lldp neighbors
```

## Commandes de test réseau

```bash
Router# ping 192.168.1.1
Router# ping 2001:DB8::1
Router# traceroute 8.8.8.8
Router# telnet 192.168.1.254
Router# show ip route 192.168.1.0    ! vérifie une route spécifique
```

## Ce qu'il faut retenir

- `?` fournit une aide contextuelle à chaque niveau (liste des commandes, complétion, arguments possibles).
- `show running-config` = config active en RAM (perdue au reboot si non sauvegardée) ; `show startup-config` = config persistante en NVRAM.
- `show ip interface brief` : lire **Status** (couche 1) et **Protocol** (couche 2) séparément pour localiser un problème.
- **CDP** (propriétaire Cisco) et **LLDP** (standard) découvrent les équipements voisins directement connectés.

## Pour aller plus loin

- [Cisco — CDP Overview](https://www.cisco.com/c/en/us/tech/lan-switching/cisco-discovery-protocol-cdp/index.html)
- [IEEE 802.1AB — LLDP](https://standards.ieee.org/ieee/802.1AB/6047/)
