---
id: 01-denial-of-service
title: Denial of Service (DoS / DDoS)
sidebar_position: 1
tags: [cybersecurite, red-team, reseau]
---

# Denial of Service (DoS / DDoS)

Dans MITRE ATT&CK, le **Denial of Service** relève de la tactique **Impact** (`TA0040`) : l'objectif n'est plus de voler des données ou de prendre pied sur un système, mais de **dégrader ou couper la disponibilité** d'un service (le « D » de la triade CIA).

## Index

1. [DoS vs DDoS](#1-dos-vs-ddos)
2. [Les trois familles d'attaques](#2-les-trois-familles-dattaques)
3. [hping3 — présentation](#3-hping3--présentation)
4. [hping3 — options principales](#4-hping3--options-principales)
5. [hping3 — exemples](#5-hping3--exemples)
6. [Autres outils](#6-autres-outils)
7. [Détection](#7-détection)
8. [Défense](#8-défense)

---

## 1. DoS vs DDoS

- **DoS** (Denial of Service) — une seule machine attaquante sature ou fait planter une cible.
- **DDoS** (Distributed DoS) — l'attaque est distribuée sur un grand nombre de machines (souvent un botnet), rendant le trafic malveillant difficile à distinguer du trafic légitime et à bloquer par simple filtrage IP.

## 2. Les trois familles d'attaques

### 2.1. Volumétriques (couche réseau)

Saturer la **bande passante** disponible en envoyant un volume de trafic supérieur à ce que le lien peut absorber.

- **UDP Flood** — envoi massif de paquets UDP vers des ports aléatoires ; la cible répond par des ICMP "Port Unreachable", consommant ses ressources.
- **ICMP Flood (Ping Flood)** — envoi massif de paquets ICMP Echo Request.
- **Attaques par amplification** — l'attaquant usurpe l'IP de la victime (*spoofing*) et interroge des serveurs tiers mal configurés (DNS, NTP, Memcached, CLDAP) dont la réponse est bien plus volumineuse que la requête. La victime reçoit un flot de réponses qu'elle n'a jamais demandées, démultipliant l'impact avec peu de bande passante attaquante (facteurs d'amplification de x10 à x50000 selon le protocole).

### 2.2. Protocolaires (couche transport)

Exploiter le fonctionnement même d'un protocole pour épuiser les ressources (tables de connexions, mémoire) plutôt que la bande passante.

- **SYN Flood** — envoi massif de paquets TCP SYN sans jamais compléter le three-way handshake. Le serveur alloue une ressource (entrée dans la table des connexions semi-ouvertes) pour chaque SYN reçu ; en la saturant, plus aucune connexion légitime ne peut s'établir.
- **Smurf Attack** — variante d'amplification ICMP historique via une adresse de broadcast (largement mitigée aujourd'hui).
- **Ping of Death / paquets malformés** — paquets délibérément invalides visant à faire planter une pile réseau mal implémentée (surtout historique).

### 2.3. Applicatives (couche 7)

Cibler l'application elle-même plutôt que le réseau, avec un volume de trafic parfois très faible.

- **Slowloris** — ouvre de nombreuses connexions HTTP et les maintient ouvertes en envoyant des en-têtes très lentement, épuisant le pool de connexions du serveur web sans jamais saturer la bande passante.
- **HTTP Flood** — requêtes HTTP GET/POST légitimes en apparence, mais en très grand nombre, ciblant souvent des endpoints coûteux (recherche, génération de rapports).
- **Slow POST (R-U-Dead-Yet)** — variante de Slowloris sur les requêtes POST.

## 3. hping3 — présentation

[hping3](https://github.com/antirez/hping) est un outil de **génération de paquets** ("ping sur stéroïdes") permettant de forger des paquets TCP/UDP/ICMP/RAW-IP avec un contrôle total sur les en-têtes. Historiquement utilisé pour l'audit de firewalls, le scan de ports, le fingerprinting — et, en mode flood, pour simuler des attaques DoS lors de tests d'infrastructure.

```bash
sudo apt install hping3      # Debian/Ubuntu, généralement préinstallé sur Kali
```

## 4. hping3 — options principales

| Option | Fonction |
|---|---|
| `-S` | Mode TCP SYN |
| `-A` | Mode TCP ACK |
| `-F` | Mode TCP FIN |
| `-1` | Mode ICMP |
| `-2` | Mode UDP |
| `-p <port>` | Port de destination |
| `-c <n>` | Nombre de paquets à envoyer |
| `-i u<µs>` | Intervalle entre paquets (en microsecondes) |
| `--fast` | Envoi rapide (10 paquets/s) |
| `--faster` | Envoi encore plus rapide (100 paquets/s) |
| `--flood` | Envoi le plus rapide possible, sans attendre les réponses (pas d'affichage) |
| `-a <ip>` | Usurper (*spoof*) l'adresse source |
| `-d <taille>` | Taille des données du paquet |
| `--rand-source` | Adresse source aléatoire à chaque paquet |

## 5. hping3 — exemples

À exécuter **uniquement en environnement de lab ou avec autorisation écrite** (voir cadre légal ci-dessous).

```bash
# Ping classique amélioré avec hping3
hping3 -1 target.lab

# Scanner un port TCP (SYN scan manuel)
hping3 -S -p 80 -c 3 target.lab

# Simuler un SYN flood sur le port 80 (test de résilience, en lab)
hping3 -S -p 80 --flood -a 10.0.0.99 target.lab

# Flood UDP
hping3 -2 --flood -p 53 target.lab
```

## 6. Autres outils

| Outil | Type |
|---|---|
| **LOIC / HOIC** | Outils historiques de flood HTTP/UDP/TCP, popularisés par des campagnes DDoS volontaires en 2010-2012 |
| **Slowloris (script Python)** | Implémentation dédiée de l'attaque applicative du même nom |
| **T50** | Générateur de paquets multi-protocoles orienté stress-test |
| **Scapy** | Bibliothèque Python permettant de forger n'importe quel paquet, y compris pour reproduire des scénarios DoS sur-mesure en lab |

## 7. Détection

- **NetFlow/sFlow** — pics soudains de volume ou de nombre de connexions par IP source.
- **IDS/IPS** (Suricata, Snort) — signatures pour SYN flood (ratio SYN/SYN-ACK anormal), amplification connue (réponses DNS/NTP volumineuses non sollicitées).
- Table de connexions TCP semi-ouvertes anormalement pleine sur les équipements réseau/serveurs.
- Alerting sur la baisse de disponibilité (latence, taux d'erreur HTTP 5xx) côté monitoring applicatif.

## 8. Défense

- **SYN Cookies** — le serveur ne réserve pas de ressource au SYN initial, il encode l'état dans le numéro de séquence de la réponse et ne l'alloue qu'à réception de l'ACK final. Contre-mesure standard et largement déployée par défaut sur les OS modernes.
- **Rate limiting** au niveau firewall/reverse proxy (connexions par IP/seconde).
- **Anti-spoofing (BCP38 / uRPF)** côté FAI/opérateur — empêche l'usurpation d'IP source nécessaire aux attaques par amplification.
- **Scrubbing centers / CDN anti-DDoS** (Cloudflare, AWS Shield, Akamai...) — absorbent le trafic volumétrique en périphérie avant qu'il n'atteigne l'infrastructure.
- **Anycast** — répartit le trafic entrant sur de multiples points de présence géographiques, diluant l'impact d'un DDoS distribué.
- Côté applicatif : timeouts stricts sur les connexions inactives (contre Slowloris), limitation du nombre de connexions simultanées par IP, WAF pour filtrer les floods HTTP applicatifs.

## Cadre légal

Réaliser une attaque par déni de service contre un système sans autorisation explicite est une infraction pénale dans la quasi-totalité des juridictions (en France : article 323-2 du Code pénal, jusqu'à 5 ans d'emprisonnement et 150 000 € d'amende, davantage en bande organisée ou sur un système étatique). Le contenu ci-dessus est destiné à des tests de résilience **en environnement de lab** ou dans le cadre d'un audit **sous contrat**.

## Voir aussi

- [Metasploit](../22-Security-Tools/metasploit.md) — dispose de modules `auxiliary/dos/*` pour ces mêmes techniques, packagés en modules
- [EvilLimiter](../22-Security-Tools/evillimiter.md) — dégrade la disponibilité au niveau local (LAN), une approche différente mais un objectif similaire
