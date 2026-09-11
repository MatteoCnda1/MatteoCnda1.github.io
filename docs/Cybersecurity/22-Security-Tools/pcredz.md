---
id: pcredz
title: PCredz
sidebar_position: 4
tags: [cybersecurite, reseau, red-team, forensics, credentials]
---

# PCredz

## Index

1. [Objectif](#1-objectif)
2. [Protocoles supportés](#2-protocoles-supportés)
3. [Installation](#3-installation)
4. [Options](#4-options)
5. [Exemples d'utilisation](#5-exemples-dutilisation)
6. [Fichiers de sortie](#6-fichiers-de-sortie)
7. [Limites](#7-limites)
8. [Détection](#8-détection)
9. [Défense](#9-défense)

---

## 1. Objectif

[PCredz](https://github.com/lgandx/PCredz) (Laurent Gaffie) extrait des **identifiants et jetons d'authentification** depuis du trafic réseau — soit un fichier PCAP existant, soit une capture live sur une interface. C'est l'outil naturel après une position MITM (ARP spoofing, [rogue AP](../07-Wifi/02-wifi-pumpkin3-pro-modules.md), TAP réseau) : il transforme un flux de paquets bruts en identifiants exploitables. Déjà cité dans le [guide de pentest WiFi](../07-Wifi/01-Wifi-Penetration-Testing.md#22-man-in-the-middle-attack) pour l'analyse post-MITM.

## 2. Protocoles supportés

Extraction sur trafic IPv4 **et** IPv6 :

| Protocole | Ce qui est extrait |
|---|---|
| **NTLM** | Hashes NTLMv1/v2 (HTTP, SMB, LDAP, MSSQL, DCE-RPC...) |
| **Kerberos** | Hash AS-REQ Pre-Auth (etype 23) |
| **HTTP** | Authentification Basic, champs de formulaire (mots de passe, clés API, tokens) |
| **FTP** | Commandes USER/PASS |
| **IRC** | Authentification NICK/USER/PASS |
| **SMTP** | AUTH PLAIN et AUTH LOGIN |
| **IMAP** | Authentification LOGIN |
| **POP3** | Commandes USER/PASS |
| **LDAP** | Simple Bind (mots de passe en clair) |
| **SNMP** | Community strings (v1/v2c) |
| **MSSQL** | Authentification protocole TDS |
| **Cartes bancaires** | Extraction de numéros de carte (optionnel) |

Sorties **directement compatibles Hashcat** : NTLMv1 (`-m 5500`), NTLMv2 (`-m 5600`), Kerberos (`-m 7500`).

## 3. Installation

```bash
# Docker (recommandé)
docker build -t pcredz .
docker run --rm -v $(pwd):/data pcredz -f /data/capture.pcap
docker run --rm --net=host -v $(pwd):/data pcredz -i eth0 -v   # capture live

# Debian/Ubuntu
sudo apt-get install python3-pip libpcap-dev
pip3 install pcapy-ng

# Fedora/RHEL
sudo dnf install python3-pip libpcap-devel
pip3 install pcapy-ng

# Arch Linux
sudo pacman -S python-pip libpcap
pip3 install pcapy-ng
```

Détection automatique du type de couche liaison (Ethernet, Linux Cooked Capture, Raw IP).

## 4. Options

```
Requis (au choix) :
  -f FILE         Fichier PCAP à analyser
  -d DIR          Répertoire à analyser récursivement
  -i INTERFACE    Interface pour une capture live

Optionnel :
  -v              Mode verbeux (affiche aussi les doublons)
  -t              Affiche les timestamps
  -o DIR          Répertoire de sortie des logs (défaut : ./)
  -c              Désactive la détection de cartes bancaires
  --disable PROTO Désactive un protocole (répétable) : NTLM, HTTP, FTP, IRC,
                  LDAP, SMTP, Kerberos, SNMP, MSSQL
  --exclude-host IP  Exclut une IP de la capture (répétable)
```

## 5. Exemples d'utilisation

```bash
# Analyser un fichier PCAP unique
./Pcredz -f capture.pcap

# Analyser récursivement un dossier de PCAP
./Pcredz -d /forensics/network-captures/

# Capture live sur une interface (root requis)
sudo ./Pcredz -i eth0

# Capture live en excluant sa propre IP (cas classique en pentest MITM)
sudo ./Pcredz -i eth0 --exclude-host $(hostname -I | awk '{print $1}') -v

# Ne garder que les hashes NTLM
./Pcredz -f capture.pcap --disable HTTP --disable FTP --disable IRC \
  --disable LDAP --disable SMTP --disable Kerberos --disable SNMP --disable MSSQL

# Craquer les hashes NTLMv2 obtenus
hashcat -m 5600 logs/NTLMv2.txt wordlist.txt
```

## 6. Fichiers de sortie

```
logs/
├── NTLMv1.txt / NTLMv2.txt      # hashcat -m 5500 / -m 5600
├── MSKerb.txt                   # hashcat -m 7500
├── HTTP-Basic.txt / HTTP-PasswordFields.txt
├── FTP-Plaintext.txt / IRC-Plaintext.txt / SMTP-Plaintext.txt
├── LDAP-Simple.txt / MSSQL-Plaintext.txt
└── SNMPv1.txt
CredentialDump-Session.log       # timeline complète de la session
```

Déduplication automatique (une même credential n'est loggée qu'une fois, sauf `-v`).

## 7. Limites

- N'extrait que ce qui **n'est pas chiffré** (ou dont le chiffrement est cassable, type NTLM) — inefficace sur du trafic TLS/SSH correctement configuré.
- Nécessite d'être en **position d'interception** (MITM, TAP, port mirroring) pour la capture live : PCredz seul n'obtient pas le trafic, il l'analyse.
- Performances dépendantes du volume : gros PCAP (1 Go+) → 1-2 minutes de traitement.

## 8. Détection

- Toute position d'interception amont (ARP spoofing, rogue AP) reste détectable par les moyens habituels (voir [EvilLimiter](./evillimiter.md#8-détection)) — PCredz lui-même, en aval, ne génère aucun trafic détectable puisqu'il analyse passivement.

## 9. Défense

- **Chiffrer** systématiquement les protocoles historiquement en clair (FTP → SFTP/FTPS, HTTP → HTTPS, LDAP → LDAPS, SMTP/IMAP/POP3 → variantes TLS).
- Désactiver **NTLM** au profit de Kerberos pur sur les environnements Active Directory quand c'est possible ; a minima forcer NTLMv2 et désactiver le relais SMB (signing SMB).
- Protections anti-MITM en amont (DAI/DHCP Snooping, 802.1X) pour empêcher l'interception qui rend PCredz utile.

## Cadre légal

Intercepter et extraire des identifiants sur un réseau qui ne vous appartient pas, sans autorisation, est une infraction pénale (interception de correspondances, atteinte à un système de traitement de données). À réserver aux audits autorisés et environnements de lab.

## Voir aussi

- [EvilLimiter](./evillimiter.md) et le [guide WiFi](../07-Wifi/01-Wifi-Penetration-Testing.md) — pour obtenir la position MITM que PCredz exploite ensuite
- [Metasploit](./metasploit.md) — pour la suite de l'exploitation une fois des identifiants obtenus
