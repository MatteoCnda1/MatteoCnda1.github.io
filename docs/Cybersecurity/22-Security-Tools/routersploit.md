---
id: routersploit
title: RouterSploit
sidebar_position: 2
tags: [cybersecurite, pentest, exploitation, iot, reseau]
---

# RouterSploit

## Index

1. [Objectif](#1-objectif)
2. [Architecture modulaire](#2-architecture-modulaire)
3. [Installation](#3-installation)
4. [Commandes principales](#4-commandes-principales)
5. [Exemple complet](#5-exemple-complet)
6. [Limites](#6-limites)
7. [Détection](#7-détection)
8. [Défense](#8-défense)

---

## 1. Objectif

[RouterSploit](https://github.com/threat9/routersploit) est un framework d'exploitation open source dédié aux **appareils embarqués** : routeurs, caméras IP, NAS, objets connectés. Son interface et sa logique reprennent volontairement celles de Metasploit, en plus léger et spécialisé IoT/réseau domestique-entreprise.

Déjà cité dans le [guide de pentest WiFi](../07-Wifi/01-Wifi-Penetration-Testing.md) comme outil de post-exploitation une fois connecté à un réseau cible.

## 2. Architecture modulaire

Cinq familles de modules :

| Famille | Rôle |
|---|---|
| **exploits** | Exploitation de vulnérabilités identifiées sur l'appareil cible |
| **creds** | Test d'identifiants (bruteforce/dictionnaire) contre des services réseau (SSH, Telnet, HTTP, FTP...) |
| **scanners** | Vérification de la vulnérabilité d'une cible sans exploiter (équivalent `check` de Metasploit) |
| **payloads** | Génération de charges utiles pour différentes architectures embarquées (ARM, MIPS...) |
| **generic** | Attaques génériques ne ciblant pas une CVE précise |

## 3. Installation

```bash
git clone https://www.github.com/threat9/routersploit
cd routersploit
pip3 install -r requirements.txt
python3 rsf.py
```

- **Kali Linux** : installation directe via `pip` après clonage.
- **Docker** : `docker compose up --build -d` pour un déploiement conteneurisé.
- Dépendances clés : `requests`, `paramiko`, `pysnmp`. Le support Bluetooth Low Energy (`bluepy`) est optionnel.
- Le projet évolue vite : `git pull` régulièrement pour rester à jour.

## 4. Commandes principales

La console `rsf.py` reprend la syntaxe de msfconsole :

| Commande | Fonction |
|---|---|
| `search <mot-clé>` | Rechercher un module (marque, produit, CVE...) |
| `use <module>` | Charger un module |
| `show options` | Afficher les options |
| `set target <ip>` | Définir la cible |
| `check` | Vérifier si la cible est vulnérable, sans exploiter |
| `run` (ou `exploit`) | Lancer le module |
| `use scanners/autopwn` | Scanner automatiquement une cible contre l'ensemble des exploits connus |

## 5. Exemple complet

```bash
python3 rsf.py

# Scanner automatiquement une cible contre toute la base de modules
use scanners/autopwn
set target 192.168.1.1
run

# Une fois une vulnérabilité identifiée, charger l'exploit correspondant
use exploits/routers/netgear/dgn2200_pass_recovery
set target 192.168.1.1
check
run

# Tester des identifiants par défaut sur un service exposé
use creds/generic/ssh_bruteforce
set target 192.168.1.1
run
```

## 6. Limites

- Base de modules plus restreinte que Metasploit, ciblée sur des références/firmwares précis — inefficace sur du matériel récent ou peu documenté.
- Beaucoup de modules exploitent des **vulnérabilités anciennes** déjà corrigées sur les firmwares à jour.
- Peu adapté à l'exploitation de 0-day ou à des cibles fortement durcies.

## 7. Détection

- Requêtes HTTP/SNMP/Telnet répétées et automatisées (`scanners/autopwn` génère un trafic de reconnaissance massif et facilement identifiable).
- Tentatives d'authentification en rafale (module `creds`) détectables par un IDS ou le logging natif du device.

## 8. Défense

- Mettre à jour le **firmware** des routeurs/objets connectés (la majorité des modules ciblent des CVE déjà patchées).
- Changer les **identifiants par défaut** de tout appareil réseau.
- Désactiver l'administration à distance (Telnet/HTTP non chiffré, SNMP par défaut) quand elle n'est pas nécessaire.
- Segmenter le réseau IoT du reste du réseau interne (VLAN dédié).

## Cadre légal

L'usage de RouterSploit contre un équipement sans autorisation explicite du propriétaire est une infraction pénale. À réserver aux audits autorisés et aux environnements de lab.

## Voir aussi

- [Metasploit Framework](./metasploit.md) — le framework d'exploitation généraliste dont RouterSploit reprend la logique
- [WiFi Penetration Testing Guide](../07-Wifi/01-Wifi-Penetration-Testing.md) — section post-exploitation
