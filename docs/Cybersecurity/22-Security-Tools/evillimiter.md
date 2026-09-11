---
id: evillimiter
title: EvilLimiter
sidebar_position: 3
tags: [cybersecurite, reseau, red-team, arp-spoofing]
---

# EvilLimiter

## Index

1. [Objectif](#1-objectif)
2. [Fonctionnement](#2-fonctionnement)
3. [Installation](#3-installation)
4. [Commandes principales](#4-commandes-principales)
5. [Options ligne de commande](#5-options-ligne-de-commande)
6. [Exemples d'utilisation](#6-exemples-dutilisation)
7. [Limites](#7-limites)
8. [Détection](#8-détection)
9. [Défense](#9-défense)

---

## 1. Objectif

[EvilLimiter](https://github.com/bitbrute/evillimiter) surveille, analyse et **limite la bande passante** (upload/download) d'appareils sur un réseau local, **sans accès physique ni droits administrateur** sur les appareils ciblés.

## 2. Fonctionnement

L'outil combine deux mécanismes :

- **ARP Spoofing** — usurpation d'identité sur le protocole ARP pour s'intercaler entre l'hôte ciblé et la passerelle (comme pour un MITM classique, voir le [guide WiFi](../07-Wifi/01-Wifi-Penetration-Testing.md#22-man-in-the-middle-attack)).
- **Traffic Shaping** (`tc`/`iptables` sous le capot) — mise en forme du trafic qui transite désormais par la machine de l'attaquant, pour réguler le débit de l'hôte visé.

Résultat : l'appareil ciblé voit son débit throttlé (ou coupé) sans qu'aucune modification ne soit faite sur lui.

## 3. Installation

```bash
git clone https://github.com/bitbrute/evillimiter.git
cd evillimiter
sudo python3 setup.py install
```

Prérequis : distribution Linux, Python 3 (les dépendances Python manquantes s'installent automatiquement).

## 4. Commandes principales

| Commande | Fonction |
|---|---|
| `scan` | Détecte les appareils actifs sur le réseau (option `--range` pour une plage personnalisée) |
| `hosts` | Liste les appareils détectés avec leurs identifiants |
| `add` | Ajoute manuellement un hôte à la liste |
| `limit <id(s)> <débit>` | Applique un débit maximal à un ou plusieurs hôtes |
| `block <id(s)>` | Coupe la connexion Internet des hôtes ciblés |
| `free <id(s)>` | Retire toutes les restrictions |
| `monitor` | Affiche l'utilisation de bande passante en temps réel |
| `analyze` | Évalue la consommation d'un hôte sans le limiter |
| `watch` | Détecte les reconnexions d'hôtes déjà limités sous une nouvelle IP |

## 5. Options ligne de commande

| Option | Fonction |
|---|---|
| `-i [interface]` | Interface réseau à utiliser |
| `-g [ip]` | Adresse IP de la passerelle |
| `-m [mac]` | Adresse MAC de la passerelle |
| `-n [netmask]` | Masque réseau |
| `-f` | Réinitialise les règles `iptables`/`tc` (nettoyage après un plantage) |
| `--colorless` | Désactive la coloration du terminal |

## 6. Exemples d'utilisation

```bash
sudo evillimiter -i eth0

scan
hosts

# Limiter 3 appareils à 200 kbit/s
limit 4,5,6 200kbit

# Limiter tout le réseau à 1 Gbit/s
limit all 1gbit

# Surveiller le trafic avec un rafraîchissement de 1000ms
monitor --interval 1000

# Analyser la consommation de deux hôtes pendant 120 secondes, sans les limiter
analyze 2,3 --duration 120

# Retirer toutes les restrictions
free all
```

## 7. Limites

- **IPv4 uniquement** : l'ARP spoofing ne fonctionne pas sur IPv6, ce qui limite l'outil aux réseaux (ou aux hôtes) encore en IPv4.
- Inefficace si le réseau applique une **protection ARP** (DHCP snooping + Dynamic ARP Inspection sur un switch managé, ports isolés).
- Purement local (nécessite d'être sur le même segment L2 que la cible).

## 8. Détection

- Alertes ARP (changements MAC/IP suspects) via des outils comme `arpwatch` ou XArp.
- Latence/débit anormalement dégradé signalé par l'utilisateur ciblé.
- Journalisation DHCP snooping sur un switch managé montrant une correspondance MAC/port incohérente.

## 9. Défense

- **Dynamic ARP Inspection (DAI)** + **DHCP Snooping** sur les switches manageables — bloque l'ARP spoofing à la source.
- **Port Security** pour limiter les adresses MAC autorisées par port.
- Segmentation réseau (VLAN) pour réduire la portée d'un ARP spoofing à un segment restreint.
- Sur un poste isolé : entrées ARP statiques pour la passerelle (peu scalable, mais efficace en environnement critique).

## Cadre légal

Limiter ou couper la connexion d'un appareil qui ne vous appartient pas, sans autorisation, constitue une atteinte à un système de traitement de données. À réserver à son propre réseau, à des environnements de lab, ou à des audits autorisés.

## Voir aussi

- [WiFi Penetration Testing Guide](../07-Wifi/01-Wifi-Penetration-Testing.md) — la technique d'ARP Spoofing/MITM sous-jacente
- [PCredz](./pcredz.md) — pour exploiter le trafic intercepté une fois en position MITM
