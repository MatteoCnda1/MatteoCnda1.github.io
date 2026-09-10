---
id: 02-securisation-acces-ssh
title: "Sécurisation des accès : mots de passe et SSH"
sidebar_position: 2
tags: [reseau, cybersecurite, cheatsheet]
---

# Sécurisation des accès : mots de passe et SSH

> Un équipement Cisco expose plusieurs points d'accès (console physique, lignes VTY pour l'accès distant, mode privileged) qui doivent chacun être sécurisés individuellement — la configuration par défaut n'impose **aucun** mot de passe.

## Les lignes d'accès

```text
   ┌─────────────────────────────────────────────────────────┐
   │  CONSOLE (line con 0)                                      │
   │  Accès physique direct (câble console), 1 seule session    │
   ├─────────────────────────────────────────────────────────┤
   │  AUX (line aux 0)                                          │
   │  Port auxiliaire, historiquement pour modem de secours      │
   ├─────────────────────────────────────────────────────────┤
   │  VTY (line vty 0 4, voire 0 15 sur IOS récents)             │
   │  Accès à DISTANCE (Telnet/SSH), plusieurs sessions          │
   │  simultanées selon le nombre de lignes déclarées             │
   └─────────────────────────────────────────────────────────┘
```

## Mot de passe console

```bash
R1(config)# line console 0
R1(config-line)# password C0nsoleP@ss
R1(config-line)# login
R1(config-line)# exec-timeout 5 0     ! déconnexion après 5 min d'inactivité
R1(config-line)# exit
```

## Mot de passe privileged exec (enable)

```bash
R1(config)# enable secret Adm1nS3cr3t!    ! CHIFFRÉ (MD5/scrypt), toujours préférer à "enable password"
```

`enable secret` **prime toujours** sur `enable password` si les deux sont configurés — `enable password` (en clair dans la running-config sauf avec `service password-encryption`) est obsolète et ne doit plus être utilisé.

```bash
R1(config)# service password-encryption   ! chiffre (faiblement, réversible) tous les mots de passe en clair restants dans la config
```

## Configuration SSH (accès distant sécurisé)

```bash
! 1. Nom de domaine et hostname (requis pour générer les clés RSA)
R1(config)# hostname R1
R1(config)# ip domain-name entreprise.local

! 2. Génération des clés RSA
R1(config)# crypto key generate rsa
How many bits in the modulus [512]: 2048

! 3. Compte utilisateur local
R1(config)# username admin privilege 15 secret Adm1nS3cr3t!

! 4. Activation de SSH version 2 uniquement (v1 obsolète et vulnérable)
R1(config)# ip ssh version 2
R1(config)# ip ssh time-out 60
R1(config)# ip ssh authentication-retries 3

! 5. Configuration des lignes VTY
R1(config)# line vty 0 4
R1(config-line)# transport input ssh      ! désactive Telnet, n'autorise QUE SSH
R1(config-line)# login local              ! authentification via les comptes "username" locaux
R1(config-line)# exec-timeout 10 0
```

## Pourquoi désactiver Telnet

```text
   TELNET                              SSH

   Authentification et données         Authentification et données
   transmises EN CLAIR                 CHIFFRÉES (RSA + AES/3DES)

   → un attaquant en sniffing sur      → même en sniffing, le trafic
     le réseau lit directement le        capturé est illisible sans
     mot de passe et les commandes       la clé privée
     tapées
```

`transport input ssh` (plutôt que `transport input all` ou `transport input telnet ssh`) élimine complètement ce risque en n'autorisant que le protocole chiffré sur les lignes VTY.

## Vérification

```bash
R1# show ip ssh
SSH Enabled - version 2.0
Authentication timeout: 60 secs; Authentication retries: 3

R1# show users              ! sessions actives (console/VTY)
R1# show running-config | include ssh
```

## Ce qu'il faut retenir

- Trois points d'accès à sécuriser : **console** (`line console 0`), **VTY** (`line vty 0 4`, accès distant), **privileged exec** (`enable secret`).
- `enable secret` (chiffré) prime toujours sur `enable password` (obsolète) — ne jamais utiliser ce dernier en production.
- SSH nécessite : `ip domain-name`, `crypto key generate rsa` (≥ 2048 bits), un compte `username`, puis `transport input ssh` sur les VTY.
- **Toujours désactiver Telnet** (`transport input ssh` uniquement) : Telnet transmet identifiants et commandes en clair.

## Pour aller plus loin

- [Cisco — Configuring Secure Shell (SSH)](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/sec_usr_ssh/configuration/xe-16/sec-usr-ssh-xe-16-book.html)
- [RFC 4251 — The Secure Shell (SSH) Protocol Architecture](https://www.rfc-editor.org/rfc/rfc4251)
