---
id: 02-ntp-syslog-snmp
title: "NTP, Syslog et SNMP : supervision réseau"
sidebar_position: 2
tags: [reseau, cheatsheet]
---

# NTP, Syslog et SNMP : supervision réseau

> Trois services indispensables à l'exploitation d'un réseau : **NTP** synchronise l'horloge de tous les équipements (essentiel pour corréler des événements entre équipements), **Syslog** centralise les journaux, **SNMP** permet la supervision et l'inventaire automatisés.

## NTP (Network Time Protocol)

```text
   Hiérarchie de strates (stratum) NTP :

   Stratum 0 : horloge de référence physique (horloge atomique, GPS)
   Stratum 1 : serveur directement connecté à une source stratum 0
   Stratum 2 : serveur synchronisé sur un stratum 1
   Stratum 3 : ... etc (jusqu'à stratum 15, stratum 16 = non synchronisé)

   Plus le numéro de stratum est BAS, plus la source est proche
   de la référence physique et donc considérée plus fiable.
```

**Pourquoi c'est critique** : sans horloges synchronisées entre équipements, corréler des événements de sécurité ou de panne entre plusieurs logs (ex. reconstituer la chronologie d'une attaque à partir des logs de 5 équipements différents) devient quasiment impossible — un décalage de quelques minutes peut rendre une investigation inexploitable.

```bash
Router(config)# ntp server 192.168.1.100          ! pointe vers un serveur NTP interne/public
Router(config)# ntp server 129.6.15.28             ! ex. serveur NIST public (redondance)

! Configurer le fuseau horaire
Router(config)# clock timezone CET 1
Router(config)# clock summer-time CEST recurring

! Un routeur peut aussi servir de source NTP pour son LAN
Router(config)# ntp master 3                        ! agit comme serveur stratum 3
```

```bash
Router# show ntp status
Clock is synchronized, stratum 3, reference is 192.168.1.100
Router# show ntp associations
```

## Syslog : centralisation des journaux

```text
   Niveaux de sévérité Syslog (0 = le plus critique) :

   0 Emergency    → système inutilisable
   1 Alert        → action immédiate requise
   2 Critical     → condition critique
   3 Error        → condition d'erreur
   4 Warning      → condition d'avertissement
   5 Notice       → événement normal mais significatif
   6 Informational→ message informatif
   7 Debug        → message de débogage
```

```bash
Router(config)# logging host 192.168.1.50          ! envoie les logs vers un serveur Syslog centralisé
Router(config)# logging trap warnings                ! seulement niveau 4 (warning) et plus sévère
Router(config)# logging source-interface loopback 0   ! source cohérente même en cas de changement d'IP d'interface
Router(config)# service timestamps log datetime msec  ! horodatage précis (nécessite NTP pour être fiable !)
```

**Cas d'usage concret** : centraliser les logs de tous les équipements réseau vers un serveur Syslog unique (souvent couplé à un SIEM) permet une corrélation d'événements à l'échelle de l'infrastructure entière — impossible en consultant les logs équipement par équipement manuellement.

```bash
Router# show logging
Router# show logging | include %LINK-3-UPDOWN    ! filtre sur un type d'événement précis
```

## SNMP (Simple Network Management Protocol)

```text
   ┌──────────────────┐   GET/SET (interroge/modifie)   ┌──────────────────┐
   │  NMS               │ ───────────────────────────────►│  Agent SNMP        │
   │  (Network          │                                    │  (sur le routeur/  │
   │   Management        │ ◄───────────────────────────────  │   switch)          │
   │   Station)          │   RESPONSE                          │                    │
   │                     │                                    │  MIB (base de     │
   │                     │ ◄═══════════════════════════════  │  données locale    │
   │                     │   TRAP (alerte non sollicitée,       │  des objets         │
   │                     │   envoyée par l'agent SANS            │  supervisables)     │
   │                     │   requête préalable)                 │                    │
   └──────────────────┘                                    └──────────────────┘
```

| Version | Sécurité |
|---|---|
| **SNMPv1/v2c** | Community string en clair (mot de passe faible, transmis sans chiffrement) |
| **SNMPv3** | Authentification et chiffrement réels (recommandé, seul acceptable en production exposée) |

```bash
! SNMPv2c (community string — à éviter en production exposée)
Router(config)# snmp-server community MaCommunityRO RO         ! Read-Only
Router(config)# snmp-server community MaCommunityRW RW         ! Read-Write (dangereux si exposé)
Router(config)# snmp-server host 192.168.1.50 MaCommunityRO    ! destinataire des traps

! SNMPv3 (recommandé)
Router(config)# snmp-server group ADMINGROUP v3 priv
Router(config)# snmp-server user admin ADMINGROUP v3 auth sha AuthPass123 priv aes 128 PrivPass123
```

## Ce qu'il faut retenir

- **NTP** synchronise les horloges (hiérarchie de strates) — indispensable pour corréler des logs entre équipements.
- **Syslog** centralise les journaux par niveau de sévérité (0=Emergency à 7=Debug) ; `logging host` envoie vers un collecteur central.
- **SNMP** permet supervision (GET/SET) et alertes (TRAP) via une MIB ; **SNMPv3** (authentification + chiffrement) doit être préféré à v1/v2c (community string en clair).

## Pour aller plus loin

- [RFC 5905 — Network Time Protocol Version 4](https://www.rfc-editor.org/rfc/rfc5905)
- [RFC 5424 — The Syslog Protocol](https://www.rfc-editor.org/rfc/rfc5424)
- [RFC 3411 — SNMPv3 Architecture](https://www.rfc-editor.org/rfc/rfc3411)
