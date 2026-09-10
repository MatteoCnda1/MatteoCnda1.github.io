---
id: 01-architecture-wireless-roaming-rrm
title: "Architecture WLC, roaming rapide et RRM"
sidebar_position: 1
tags: [reseau]
---

# Architecture WLC, roaming rapide et RRM

> Au-delà des bases WLC/CAPWAP vues en CCNA 2, une architecture wireless d'entreprise à grande échelle doit gérer le **roaming** entre AP sans coupure perceptible et l'**allocation automatique** des canaux/puissances radio sur des centaines d'AP.

## CAPWAP : tunnel de contrôle et de données

```text
   ┌──────────────────────────────────────────────┐
   │                     WLC                            │
   └────────┬───────────────────────┬───────────┘
             │ Tunnel CAPWAP           │ Tunnel CAPWAP
             │ (contrôle + données)    │ (contrôle + données)
        ┌────▼────┐               ┌────▼────┐
        │   AP1     │               │   AP2     │
        └─────────┘               └─────────┘

   Deux canaux CAPWAP distincts entre chaque AP et le WLC :
   - Canal de CONTRÔLE (chiffré DTLS par défaut) : configuration,
     gestion RF
   - Canal de DONNÉES (chiffrement DTLS optionnel selon le mode) :
     trafic utilisateur réel des clients Wi-Fi
```

## Modes de déploiement d'AP légers

| Mode | Comportement |
|---|---|
| **Local mode** | Tout le trafic (contrôle + données clients) transite via le tunnel CAPWAP jusqu'au WLC — mode par défaut |
| **FlexConnect** | Le trafic de données peut être **commuté localement** sur le switch d'accès (sans passer par le WLC), utile pour une succursale distante avec un lien WAN limité vers le WLC central |
| **Monitor mode** | L'AP ne sert AUCUN client, dédié uniquement à la surveillance RF (détection de rogue AP, analyse spectrale) |
| **Sniffer mode** | L'AP capture le trafic 802.11 pour analyse (équivalent Wireshark radio) |

**FlexConnect** est particulièrement pertinent en architecture multi-sites : sans lui, la perte du lien WAN vers le WLC central couperait **tout** le service Wi-Fi de la succursale (le trafic client devant transiter par le tunnel CAPWAP) — avec FlexConnect en mode "Local Switching", les clients déjà connectés peuvent continuer à communiquer localement même en cas de coupure WAN temporaire.

## Roaming : le défi de la continuité de session

```text
   Un client mobile passe de AP1 à AP2 (même SSID/ESS) —
   SANS mécanisme d'accélération, chaque roaming répète
   INTÉGRALEMENT le processus complet :

   Scanning → Authentication (potentiellement 802.1X/EAP,
   LENT : plusieurs échanges avec un serveur RADIUS distant)
   → Association → DHCP éventuel

   → pour la VoIP ou une visioconférence, ce délai (parfois
     plusieurs centaines de ms en 802.1X classique) est
     PERCEPTIBLE et gênant (coupure audio audible)
```

## 802.11r, 802.11k, 802.11v : le trio d'accélération du roaming

| Norme | Nom | Apport |
|---|---|---|
| **802.11r** | Fast BSS Transition (FT) | Pré-négocie les clés de sécurité **avant** le roaming effectif — élimine la re-authentification complète 802.1X à chaque changement d'AP |
| **802.11k** | Radio Resource Management | Le client reçoit une **liste des AP voisins** (avec leur canal) directement du réseau, évitant un scan complet de tous les canaux avant de décider où basculer |
| **802.11v** | Wireless Network Management | Le réseau peut **suggérer activement** à un client de basculer vers un meilleur AP (BSS Transition Management), plutôt que de laisser le client décider seul et parfois tardivement |

```bash
! Sur le WLC (interface CLI simplifiée à titre d'exemple)
(WLC) > config wlan security ft enable 1            ! active 802.11r sur le WLAN 1
(WLC) > config wlan security ft over-the-ds enable 1  ! FT via le système de distribution (plus rapide que over-the-air)
```

Ensemble, ces trois normes réduisent le temps de roaming de plusieurs centaines de millisecondes à quelques dizaines de millisecondes — la différence entre une coupure audible en VoIP et une transition totalement transparente pour l'utilisateur.

## RRM (Radio Resource Management) : allocation automatique

```text
   Sans RRM : un administrateur doit configurer MANUELLEMENT
   le canal et la puissance d'émission de CHAQUE AP — source
   d'erreurs (deux AP voisins sur le même canal = interférence
   co-canal) et impraticable à grande échelle (centaines d'AP)

   RRM (piloté par le WLC) :

   DCA (Dynamic Channel Assignment) : ajuste AUTOMATIQUEMENT le
   canal de chaque AP pour minimiser les interférences avec ses
   voisins radio détectés

   TPC (Transmit Power Control) : ajuste AUTOMATIQUEMENT la
   puissance d'émission de chaque AP (assez fort pour couvrir
   la zone voulue, assez faible pour ne pas interférer avec les
   AP voisins au-delà du nécessaire)

   Coverage Hole Detection : détecte les zones de couverture
   insuffisante (clients signalant un signal faible) et ajuste
   automatiquement la puissance des AP voisins en réponse
```

```bash
(WLC) > config advanced 802.11a channel global auto     ! active DCA sur la bande 5 GHz
(WLC) > config advanced 802.11a tx-power-control global auto  ! active TPC
```

## Ce qu'il faut retenir

- **CAPWAP** sépare un tunnel de contrôle (toujours chiffré DTLS) et un tunnel de données entre AP et WLC ; **FlexConnect** permet la commutation locale du trafic client en succursale, tolérant une coupure WAN.
- **802.11r** (Fast Transition), **802.11k** (liste d'AP voisins) et **802.11v** (le réseau suggère le basculement) réduisent drastiquement le délai de roaming — critique pour la VoIP/vidéo sur Wi-Fi.
- **RRM** automatise l'allocation de canal (**DCA**) et de puissance (**TPC**) sur l'ensemble des AP, éliminant la configuration manuelle à grande échelle.

## Pour aller plus loin

- [IEEE 802.11r-2008 — Fast BSS Transition](https://standards.ieee.org/ieee/802.11r/4147/)
- [Cisco — Radio Resource Management White Paper](https://www.cisco.com/c/en/us/td/docs/wireless/controller/technotes/8-8/b_RRM_White_Paper.html)
