---
id: 02-dhcp-snooping-dai-ip-source-guard
title: "DHCP Snooping, Dynamic ARP Inspection, IP Source Guard"
sidebar_position: 2
tags: [reseau, cybersecurite, cheatsheet]
---

# DHCP Snooping, Dynamic ARP Inspection, IP Source Guard

> Trois mécanismes de sécurité de couche 2 **complémentaires**, construits l'un sur l'autre : **DHCP Snooping** établit une table de confiance, exploitée ensuite par **Dynamic ARP Inspection** (contre l'ARP spoofing, cours CCNA 1) et **IP Source Guard** (contre l'usurpation d'adresse IP).

## DHCP Snooping : établir une table de confiance

```text
   Attaque contrée : un FAUX serveur DHCP branché sur le réseau
   répond aux DHCP DISCOVER avant le serveur légitime (course de
   vitesse, ou simplement plus proche) → distribue une fausse
   passerelle/DNS → intercepte tout le trafic des victimes
   (attaque de l'homme du milieu via DHCP)

   DHCP Snooping classe chaque port en :
   - TRUSTED   : peut envoyer des réponses DHCP (OFFER/ACK) —
                 typiquement le port vers le VRAI serveur DHCP
   - UNTRUSTED : ne peut PAS envoyer de réponses DHCP (par défaut,
                 TOUS les ports) — les ports utilisateurs normaux
```

```bash
Switch(config)# ip dhcp snooping
Switch(config)# ip dhcp snooping vlan 10,20

! Port vers le VRAI serveur DHCP (ou l'uplink vers lui)
Switch(config)# interface gigabitEthernet 0/24
Switch(config-if)# ip dhcp snooping trust

! Limiter le débit de requêtes DHCP par port utilisateur (anti-DoS)
Switch(config)# interface fastEthernet 0/1
Switch(config-if)# ip dhcp snooping limit rate 10
```

Un port **untrusted** qui reçoit une trame DHCP OFFER/ACK (message normalement émis par un serveur) est automatiquement **bloqué** — empêchant un faux serveur DHCP connecté sur un port utilisateur normal de répondre aux clients. Le switch construit en parallèle une **table de liaison DHCP Snooping** (IP attribuée ↔ MAC ↔ port ↔ VLAN), qui devient la base de confiance pour DAI et IP Source Guard.

```bash
Switch# show ip dhcp snooping binding
MacAddress          IpAddress        Lease(sec)  Type            VLAN  Interface
aa:aa:aa:aa:aa:aa    192.168.1.11     86400       dhcp-snooping    10   FastEthernet0/1
```

## Dynamic ARP Inspection (DAI)

```text
   S'appuie DIRECTEMENT sur la table DHCP Snooping construite
   ci-dessus pour valider chaque réponse ARP reçue sur un port
   UNTRUSTED :

   ARP reply reçue : "192.168.1.11 est à aa:aa:aa:aa:aa:aa"
        │
        ▼
   Correspond-elle à une entrée de la table DHCP Snooping
   (même IP, même MAC, même port) ?
        │
   OUI ─┴─ NON
   │           │
   Autorisée   BLOQUÉE (trame ARP droppée, log généré)
```

```bash
Switch(config)# ip arp inspection vlan 10,20

! Le port trusted DHCP Snooping doit généralement aussi être trusted pour DAI
Switch(config)# interface gigabitEthernet 0/24
Switch(config-if)# ip arp inspection trust

! Limiter le débit de paquets ARP par port (anti-DoS)
Switch(config)# interface fastEthernet 0/1
Switch(config-if)# ip arp inspection limit rate 15
```

DAI contre directement l'**ARP spoofing** vu en CCNA 1 : un attaquant ne peut plus répondre à une requête ARP en prétendant être la passerelle (192.168.1.1) avec sa propre adresse MAC, car cette fausse réponse ne correspondra à aucune entrée légitime de la table DHCP Snooping — elle sera bloquée.

## IP Source Guard (IPSG)

```text
   Valide que l'ADRESSE IP SOURCE de chaque paquet émis depuis un
   port UNTRUSTED correspond bien à l'entrée de la table DHCP
   Snooping pour ce port (IP-MAC-port doivent correspondre) —
   contre l'usurpation d'adresse IP (IP spoofing) sur le LAN local.
```

```bash
Switch(config)# interface fastEthernet 0/1
Switch(config-if)# ip verify source              ! valide IP source uniquement
Switch(config-if)# ip verify source port-security  ! valide IP ET MAC source (combiné à Port Security)
```

## Chaîne de dépendance des trois mécanismes

```text
   DHCP SNOOPING (table de confiance : IP ↔ MAC ↔ port ↔ VLAN)
        │
        ├──► DYNAMIC ARP INSPECTION (valide les réponses ARP contre
        │     cette table → contre ARP spoofing)
        │
        └──► IP SOURCE GUARD (valide l'IP/MAC source des paquets
              contre cette table → contre IP spoofing)

   Sans DHCP Snooping actif, ni DAI ni IP Source Guard ne peuvent
   fonctionner correctement — ils dépendent de sa table de liaison.
```

## Ce qu'il faut retenir

- **DHCP Snooping** classe les ports trusted/untrusted et construit une table de liaison IP-MAC-port-VLAN — base de confiance pour les deux mécanismes suivants.
- **Dynamic ARP Inspection (DAI)** valide chaque réponse ARP contre cette table, contrant directement l'ARP spoofing.
- **IP Source Guard** valide l'IP (et optionnellement la MAC) source de chaque paquet contre la même table, contrant l'IP spoofing local.
- Les trois s'activent par VLAN et se combinent : DHCP Snooping est le **prérequis** des deux autres.

## Pour aller plus loin

- [Cisco — Configuring DHCP Snooping, DAI and IPSG](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9200/software/release/17-3/configuration_guide/sec/b_173_sec_9200_cg/configuring_dhcp.html)
