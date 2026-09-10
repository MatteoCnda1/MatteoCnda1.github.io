---
id: 01-wifi-fondamentaux
title: "Wi-Fi (802.11) : normes, fréquences, architecture"
sidebar_position: 1
tags: [reseau]
---

# Wi-Fi (802.11) : normes, fréquences, architecture

> Le **Wi-Fi** (IEEE 802.11) transmet des données par ondes radio, sans câble physique — un support **partagé** (contrairement à un câble Ethernet dédié), ce qui impose des mécanismes d'accès et de sécurité spécifiques.

## Normes 802.11 principales

| Norme (nom marketing Wi-Fi) | Fréquence | Débit théorique max |
|---|---|---|
| 802.11b | 2,4 GHz | 11 Mbps |
| 802.11g | 2,4 GHz | 54 Mbps |
| 802.11n (Wi-Fi 4) | 2,4 GHz et/ou 5 GHz | 600 Mbps |
| 802.11ac (Wi-Fi 5) | 5 GHz | ~6,9 Gbps |
| 802.11ax (Wi-Fi 6/6E) | 2,4 / 5 / 6 GHz | ~9,6 Gbps |

## Bandes de fréquence : 2,4 GHz vs 5 GHz

```text
   2,4 GHz                              5 GHz

   Portée plus grande (meilleure        Portée plus courte (moins
   pénétration des obstacles)           bonne pénétration des murs)

   Seulement 3 canaux NON               Beaucoup plus de canaux
   CHEVAUCHANTS utilisables             non chevauchants disponibles
   (1, 6, 11 en usage domestique)       (moins de saturation)

   Plus de congestion (Bluetooth,       Moins d'interférences
   micro-ondes, autres réseaux          (bande moins utilisée par
   partagent la même bande)             d'autres technologies)

   Débit maximal plus faible            Débit maximal plus élevé
```

Le choix de bande est un compromis **portée vs débit/interférences** — les points d'accès modernes émettent souvent simultanément sur les deux bandes (dual-band).

## Modes d'architecture Wi-Fi

```text
   MODE AD HOC (IBSS)                    MODE INFRASTRUCTURE (BSS)

   [Hôte]◄──────►[Hôte]                  [Hôte]──┐
   Communication directe                  [Hôte]──┼──► [Point d'accès (AP)]
   entre stations, sans AP                [Hôte]──┘         │
   (rarement utilisé en                                     ▼
    entreprise)                                    [Réseau filaire/Internet]
```

| Terme | Définition |
|---|---|
| **BSS** (Basic Service Set) | Un AP + les stations qui lui sont associées |
| **BSSID** | Adresse MAC de l'AP, identifiant unique du BSS |
| **SSID** | Nom du réseau Wi-Fi, configurable, diffusé (ou masqué) |
| **ESS** (Extended Service Set) | Plusieurs BSS reliés par un même réseau filaire, partageant le même SSID (permet le roaming) |

## Processus d'association à un AP

```text
   1. SCANNING (passif ou actif)
      Passif : écoute les trames BEACON périodiques de l'AP (contiennent
               le SSID si non masqué, les débits supportés, le canal)
      Actif  : envoie une trame PROBE REQUEST, l'AP répond par
               PROBE RESPONSE

   2. AUTHENTICATION
      Vérification d'identité (Open, PSK, ou 802.1X/EAP selon la
      sécurité configurée)

   3. ASSOCIATION
      La station s'enregistre formellement auprès de l'AP
      (table d'association), devient membre du BSS
```

## CSMA/CA : accès au support partagé

```text
   Ethernet filaire : CSMA/CD (Collision Detection)
   → une station peut DÉTECTER une collision pendant l'émission

   Wi-Fi : CSMA/CA (Collision AVOIDANCE)
   → une station NE PEUT PAS détecter une collision en émettant
     (elle n'écoute pas pendant qu'elle émet sur son unique antenne)
   → stratégie PRÉVENTIVE : écoute le support avant d'émettre,
     attend un délai aléatoire (backoff) si occupé, et utilise
     un accusé de réception (ACK) explicite pour confirmer la
     bonne réception (son absence = collision probable, retransmission)
```

## Cas d'usage concret : roaming entre AP

Un utilisateur mobile se déplaçant dans un bâtiment avec plusieurs AP configurés sur le **même SSID/ESS** bascule automatiquement d'un AP à l'autre quand le signal du premier faiblit — un mécanisme géré côté client (le client décide quand basculer, en comparant la puissance de signal reçue de plusieurs BSSID partageant le même SSID), potentiellement assisté côté infrastructure par des mécanismes de roaming rapide (802.11r) pour éviter une interruption perceptible (utile pour la VoIP sur Wi-Fi).

## Ce qu'il faut retenir

- 2,4 GHz = plus de portée, moins de débit, plus de congestion ; 5 GHz = inverse.
- **BSS** = un AP + ses stations associées (identifié par le **BSSID**, la MAC de l'AP) ; **ESS** = plusieurs BSS partageant un même SSID pour permettre le roaming.
- Association en 3 étapes : scanning (beacon/probe) → authentication → association.
- Wi-Fi utilise **CSMA/CA** (prévention, avec ACK) plutôt que CSMA/CD (détection, impossible en half-duplex radio).

## Pour aller plus loin

- [IEEE 802.11 Standard](https://standards.ieee.org/ieee/802.11/7028/)
- [Wikipedia — Wi-Fi](https://fr.wikipedia.org/wiki/Wi-Fi)
