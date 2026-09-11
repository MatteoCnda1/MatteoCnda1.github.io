---
id: 02-wifi-pumpkin3-pro-modules
title: WiFi Pumpkin3 Pro — Catalogue des modules
sidebar_position: 3
tags: [cybersecurite, reseau, red-team, wifi]
---

# WiFi Pumpkin3 Pro — Catalogue des modules

[WiFi Pumpkin3](https://github.com/P0cL4bs/wifipumpkin3) est un framework de Rogue Access Point, déjà cité dans le [guide de pentest WiFi](./01-Wifi-Penetration-Testing.md) (section *Other frameworks*). Sa version **Pro** ajoute une couche de modules qui étendent le framework bien au-delà du simple point d'accès pirate : pilotage à distance, automatisation, phishing avancé, matériel embarqué...

> Documentation officielle (source de cette fiche) : [docs.wifipumpkin3.com/pro/modules](https://docs.wifipumpkin3.com/pro/modules/)
>
> Les commandes/paramètres exacts de chaque module évoluent avec les versions Pro — se référer à la page officielle d'un module avant utilisation.

## Index

1. [Modules réseau & reconnaissance](#1-modules-réseau--reconnaissance)
2. [Modules pilotage & automatisation](#2-modules-pilotage--automatisation)
3. [Modules matériel & portabilité](#3-modules-matériel--portabilité)
4. [Modules proxy (phishing avancé / MITM applicatif)](#4-modules-proxy-phishing-avancé--mitm-applicatif)
5. [Modules planifiés](#5-modules-planifiés)

---

## 1. Modules réseau & reconnaissance

| Module | Description |
|---|---|
| **wifi.recon** | Surveillance sans-fil et attaques de désauthentification 802.11 |
| **net.sniff** | Capture/analyse du trafic réseau transitant par le rogue AP |
| **LAN Recon** | Reconnaissance des hôtes présents sur le réseau local |
| **Find My Devices** | Découverte des autres nœuds WiFiPumpkin3 Pro joignables sur le réseau local (via mDNS) |
| **mDNS / Multicast DNS** | Annonce et inspection des services WP3 via mDNS/Bonjour |
| **Wardriving** | Cartographie des réseaux WiFi environnants en déplacement |
| **Beacon Generator** | Génération de trames *Beacon* 802.11, pour simulation ou stress-test réseau |
| **Wi-Fi Manager** | Scan Wi-Fi, gestion des identifiants et connexion automatique à des réseaux |

## 2. Modules pilotage & automatisation

| Module | Description |
|---|---|
| **Web UI** | Interface web d'administration du framework |
| **RESTful API** | API HTTP pour piloter WP3 Pro depuis l'extérieur |
| **Event Stream** | Flux d'événements en temps réel |
| **Session Manager** | Gestion de sessions interactives, comparable à une session Metasploit |
| **Scripts Runner / Exec Runtime** | Exécution de scripts/commandes personnalisés, avec variables de session |
| **Automation (.pulp)** | Exécution et composition de scénarios d'automatisation au format `.pulp` |
| **Alert UI** | Notifications et alertes dans l'interface |
| **Credentials Monitor** | Suivi en temps réel des identifiants collectés pendant une session |
| **Update Checker** | Vérification des mises à jour du framework |
| **Autostart** | Exécution automatique de commandes/scripts au démarrage du système |

## 3. Modules matériel & portabilité

| Module | Description |
|---|---|
| **Build Devices** | Fabrication d'un boîtier WiFiPumpkin3 portable et compact |
| **Battery Monitor** | Suivi de la batterie, pour un usage sur boîtier autonome/Raspberry Pi |
| **Bluetooth PAN** | Connectivité réseau via Bluetooth PAN |
| **ePaper UI** | Interface sur écran e-paper pour Raspberry Pi Zero |
| **TLS Support** | Mise en place de HTTPS/TLS pour la Web UI et l'API |
| **Reverse SSH Tunnel** | Tunnel SSH inversé pour exposer la Web UI/API via un VPS distant |
| **Control Hotspot** | Point d'accès de contrôle local via hostapd |
| **HTTP Server** | Serveur HTTP léger pour servir des fichiers ou répondre à des requêtes |

## 4. Modules proxy (phishing avancé / MITM applicatif)

| Module | Description |
|---|---|
| **Phishportal** | Proxy de portails de phishing, piloté par des templates au format YAML |
| **Flowtamper** | Proxy de manipulation de flux (altération de trafic à la volée), également piloté par templates |
| **Phishcloud** | Variante de Phishportal orientée services/hébergement cloud distant |

Ces trois modules s'intercalent en MITM entre la victime connectée au rogue AP et le service ciblé, et s'appuient sur des **templates** décrivant le comportement à reproduire (structure YAML documentée séparément pour chacun).

## 5. Modules planifiés

La documentation officielle liste également des **« Planned Modules »** prévus pour de futures versions, non détaillés à date de rédaction de cette fiche — se référer à la page officielle pour suivre la roadmap.

---

## Cadre légal

WiFi Pumpkin3 est un framework de Rogue Access Point : l'utiliser contre un réseau ou des utilisateurs sans autorisation explicite (interception de correspondances, accès frauduleux à un système) est une infraction pénale dans la plupart des juridictions. À réserver aux audits autorisés (pentest sous contrat, *rules of engagement* signées) et aux environnements de lab.

## Voir aussi

- [WiFi Penetration Testing Guide](./01-Wifi-Penetration-Testing.md) — le guide général sur les attaques WiFi
- [RouterSploit](../22-Security-Tools/routersploit.md) — pour la phase de post-exploitation côté routeur, une fois un client connecté au rogue AP
- [PCredz](../22-Security-Tools/pcredz.md) — pour analyser les identifiants capturés via `net.sniff`
