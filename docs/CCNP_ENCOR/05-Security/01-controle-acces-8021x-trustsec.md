---
id: 01-controle-acces-8021x-trustsec
title: "802.1X et Cisco TrustSec : contrôle d'accès réseau"
sidebar_position: 1
tags: [reseau, cybersecurite, cheatsheet]
---

# 802.1X et Cisco TrustSec : contrôle d'accès réseau

> **802.1X** authentifie un appareil **avant** de lui accorder l'accès au réseau (filaire ou sans fil), remplaçant la confiance implicite ("branché = autorisé") par une vérification d'identité systématique. **TrustSec** va plus loin en appliquant des politiques basées sur l'**identité** plutôt que sur l'adresse IP/VLAN.

## Les trois rôles 802.1X

```text
   ┌──────────┐  EAPOL (802.1X)  ┌──────────────┐  RADIUS   ┌──────────┐
   │ SUPPLICANT │ ◄─────────────► │  AUTHENTICATOR │ ◄────────► │   SERVEUR   │
   │ (le poste    │                  │  (le switch/AP  │            │  D'AUTHENT.  │
   │  à           │                  │   — relaie SANS  │            │  (RADIUS,     │
   │  authentifier)│                  │   connaître les   │            │   ex. Cisco   │
   │              │                  │   identifiants)    │            │   ISE)        │
   └──────────┘                  └──────────────┘            └──────────┘
```

- **Supplicant** : le logiciel client sur le poste (intégré nativement à Windows/macOS/Linux) qui présente les identifiants.
- **Authenticator** : le switch ou AP — **relaie** les échanges d'authentification, mais ne possède jamais lui-même les identifiants ni la logique de validation.
- **Serveur d'authentification** (RADIUS, souvent Cisco ISE) : valide réellement l'identité et détermine les autorisations.

## Port fermé jusqu'à authentification réussie

```text
   AVANT authentification :

   [Poste] ──X── (port BLOQUÉ pour TOUT trafic sauf EAPOL) ──X── [Réseau]

   APRÈS authentification réussie :

   [Poste] ────── (port OUVERT, VLAN attribué selon la politique
                    RADIUS — ex. VLAN 10 pour un employé, VLAN 99
                    "invité" en cas d'échec ou d'absence de
                    supplicant) ────── [Réseau]
```

## Configuration de base (switch)

```bash
Switch(config)# aaa new-model
Switch(config)# radius server ISE1
Switch(config-radius-server)# address ipv4 192.168.1.200 auth-port 1812 acct-port 1813
Switch(config-radius-server)# key MaCleRadius123

Switch(config)# aaa authentication dot1x default group radius
Switch(config)# aaa authorization network default group radius
Switch(config)# dot1x system-auth-control                  ! active 802.1X globalement

Switch(config)# interface fastEthernet 0/1
Switch(config-if)# switchport mode access
Switch(config-if)# authentication port-control auto        ! contrôle géré par 802.1X
Switch(config-if)# dot1x pae authenticator
```

## MAB : Mac Authentication Bypass (pour les appareils sans supplicant)

```text
   PROBLÈME : imprimantes, caméras IP, téléphones anciens n'ont
   souvent AUCUN support 802.1X natif (pas de supplicant possible)

   MAB : le switch AUTHENTIFIE l'appareil par sa SIMPLE ADRESSE MAC
   auprès du serveur RADIUS (bien moins sûr qu'un vrai 802.1X,
   une MAC se falsifie facilement — mais mieux qu'aucun contrôle)

   ORDRE typique de tentative sur un port : 802.1X d'abord
   (si supplicant présent) → bascule automatique vers MAB
   si pas de réponse EAPOL après timeout
```

```bash
Switch(config-if)# mab
! avec 802.1X déjà configuré, le switch tente MAB automatiquement
! en absence de réponse 802.1X
```

## Cisco TrustSec : segmentation par identité (SGT)

```text
   MODÈLE TRADITIONNEL (basé sur le VLAN/IP)          TRUSTSEC (basé sur l'identité)

   Politique liée à l'ADRESSE IP/VLAN                   Politique liée au SGT (Security
   → si un utilisateur se déplace de                     Group Tag), ATTACHÉ à l'identité
     sous-réseau (VLAN différent), sa                     de l'utilisateur/appareil
     politique de sécurité doit être                       AU MOMENT de l'authentification
     RECONFIGURÉE pour le nouveau VLAN                      802.1X — SUIT l'utilisateur
                                                             où qu'il se connecte, quel
                                                             que soit le VLAN/sous-réseau
```

```text
   1. Un utilisateur s'authentifie via 802.1X
   2. Le serveur RADIUS (ISE) lui attribue un SGT selon son
      rôle (ex. SGT 10 = "Employés", SGT 20 = "Invités",
      SGT 30 = "Serveurs Finance")
   3. Ce SGT est propagé dans le réseau (inline tagging ou
      via SXP - SGT Exchange Protocol sur les équipements
      ne supportant pas le tagging natif)
   4. Les politiques de sécurité (SGACL) s'appliquent ENTRE
      SGT, PAS entre sous-réseaux IP :
      "SGT Invités NE PEUT JAMAIS atteindre SGT Serveurs
      Finance", quel que soit le VLAN physique de connexion
```

**Avantage clé** : une politique TrustSec définie une fois ("Invités ne peuvent pas atteindre Finance") reste valide **indépendamment** de la topologie IP/VLAN sous-jacente — pas besoin de réécrire des dizaines d'ACL basées sur IP à chaque changement de plan d'adressage ou de déplacement d'utilisateur entre sites.

## Ce qu'il faut retenir

- **802.1X** bloque un port jusqu'à authentification réussie via un **supplicant** (poste), relayée par l'**authenticator** (switch/AP) vers un **serveur RADIUS**.
- **MAB** authentifie par adresse MAC les appareils sans supplicant (imprimantes, caméras) — moins sûr, mais un filet de sécurité minimal.
- **TrustSec (SGT)** détache la politique de sécurité de l'IP/VLAN pour l'attacher à l'**identité** de l'utilisateur, propagée par le réseau et appliquée via des SGACL entre groupes.

## Pour aller plus loin

- [IEEE 802.1X-2020 Standard](https://standards.ieee.org/ieee/802.1X/7264/)
- [Cisco — TrustSec Configuration Guide](https://www.cisco.com/c/en/us/td/docs/switches/lan/trustsec/configuration/guide/trustsec.html)
