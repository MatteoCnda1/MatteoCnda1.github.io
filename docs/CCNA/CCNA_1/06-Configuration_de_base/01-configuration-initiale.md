---
id: 01-configuration-initiale
title: "Configuration initiale d'un routeur/switch Cisco"
sidebar_position: 1
tags: [reseau, cheatsheet]
---

# Configuration initiale d'un routeur/switch Cisco

> Séquence type de mise en service d'un équipement Cisco neuf : nom d'hôte, bannière, interfaces, et documentation minimale — la base indispensable avant toute configuration avancée.

## Configuration du nom d'hôte et bannières

```bash
Router> enable
Router# configure terminal
Router(config)# hostname R1
R1(config)# banner motd #
Accès reserve au personnel autorise. Toute tentative non autorisee sera journalisee.
#
```

- Le **hostname** apparaît dans le prompt et facilite l'identification en environnement multi-équipements.
- Le **banner motd** (message of the day) s'affiche à **toute** connexion (avant authentification) — utilisé pour un avertissement légal, jamais pour du contenu sensible puisqu'il est visible avant tout login.
- Le délimiteur (`#` ici) peut être n'importe quel caractère absent du message ; tout le texte entre les deux occurrences du délimiteur devient la bannière.

## Configuration des interfaces

```bash
R1(config)# interface gigabitEthernet 0/0
R1(config-if)# description Lien vers LAN utilisateurs
R1(config-if)# ip address 192.168.1.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# exit

R1(config)# interface gigabitEthernet 0/1
R1(config-if)# description Lien WAN vers FAI
R1(config-if)# ip address 203.0.113.1 255.255.255.252
R1(config-if)# no shutdown
```

- `description` : texte libre purement documentaire (visible via `show interfaces` / `show running-config`), essentiel pour la maintenance en environnement de production.
- `no shutdown` : **obligatoire** — toutes les interfaces routeur sont administrativement désactivées par défaut à la configuration initiale (contrairement aux ports switch, actifs par défaut).

## Interface de management sur un switch (SVI)

```bash
Switch(config)# interface vlan 1
Switch(config-if)# ip address 192.168.1.2 255.255.255.0
Switch(config-if)# no shutdown
Switch(config-if)# exit
Switch(config)# ip default-gateway 192.168.1.1
```

Un switch de couche 2 n'a pas besoin d'adresse IP pour commuter des trames, mais en attribue une (via une **SVI**, Switched Virtual Interface, typiquement sur le VLAN de management) pour permettre son administration à distance (SSH, SNMP).

## Configuration IPv6 de base

```bash
R1(config)# ipv6 unicast-routing
R1(config)# interface gigabitEthernet 0/0
R1(config-if)# ipv6 address 2001:DB8:1::1/64
R1(config-if)# ipv6 address fe80::1 link-local
R1(config-if)# no shutdown
```

## Sauvegarde de la configuration en cours

```bash
R1# copy running-config startup-config
Destination filename [startup-config]?     ! valider avec Entrée
Building configuration...
[OK]
```

**Point critique** : toute modification via `configure terminal` n'affecte que la **running-config** (en RAM). Sans ce `copy run start` (ou son équivalent `write memory` / `wr`), la configuration est **perdue** au prochain redémarrage — cause fréquente de "perte de configuration" en environnement réel.

## Documentation réseau minimale

Avant toute configuration en production, documenter :
- Schéma de topologie physique et logique (adressage IP, VLANs).
- Table d'adressage (nom d'hôte, interface, IP, masque, passerelle).
- Convention de nommage cohérente (ex. `SITE-ROLE-NUM`, ex. `PARIS-CORE-SW01`).

## Ce qu'il faut retenir

- Séquence type : `hostname` → `banner motd` → configuration des interfaces (`description`, `ip address`, `no shutdown`) → `copy running-config startup-config`.
- Les interfaces **routeur** sont désactivées par défaut (`shutdown` implicite) ; les ports **switch** sont actifs par défaut.
- Un switch utilise une **SVI** (interface VLAN virtuelle) pour son adresse de management.
- Oublier `copy run start` = perte de toute la configuration au prochain reboot.

## Pour aller plus loin

- [Cisco — IOS Configuration Fundamentals Command Reference](https://www.cisco.com/c/en/us/support/ios-nx-os-software/ios-software-releases-listing.html)
