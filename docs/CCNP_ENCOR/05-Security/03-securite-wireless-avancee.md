---
id: 03-securite-wireless-avancee
title: "Sécurité Wi-Fi avancée : EAP, rogue AP, WIPS"
sidebar_position: 3
tags: [reseau, cybersecurite]
---

# Sécurité Wi-Fi avancée : EAP, rogue AP, WIPS

> Au-delà de WPA2/WPA3-Personal (CCNA 2), une architecture d'entreprise s'appuie sur les variantes **EAP** pour l'authentification 802.1X sans fil, et doit activement **détecter** les points d'accès non autorisés (**rogue AP**).

## Variantes EAP courantes

| Méthode EAP | Principe | Usage |
|---|---|---|
| **EAP-TLS** | Authentification par **certificat** des deux côtés (client ET serveur) | Le plus sûr, nécessite une infrastructure PKI (gestion de certificats client) |
| **PEAP** (Protected EAP) | Tunnel TLS **côté serveur uniquement**, puis authentification classique (MSCHAPv2) à l'intérieur | Répandu : pas besoin de certificat côté client, juste identifiant/mot de passe |
| **EAP-FAST** | Utilise un PAC (Protected Access Credential) au lieu d'un certificat serveur | Alternative Cisco à PEAP, évite la gestion de certificats serveur |
| **EAP-TTLS** | Similaire à PEAP (tunnel TLS + authentification interne), standard IETF plus ouvert | Utilisé hors écosystème Microsoft/Cisco |

**EAP-TLS** offre la sécurité la plus robuste (authentification mutuelle par certificat, résistant nativement au phishing d'identifiants) mais impose une infrastructure de gestion de certificats sur **chaque poste client** — un coût opérationnel que **PEAP** évite en ne nécessitant qu'un certificat côté serveur, au prix d'une sécurité légèrement moindre (reste vulnérable si un utilisateur est trompé par un faux portail de connexion, un certificat serveur mal validé).

```bash
! Configuration WLAN 802.1X sur WLC (exemple simplifié)
(WLC) > config wlan security wpa akm 802.1x enable 1
(WLC) > config wlan radius_server auth add 1 192.168.1.200 1812 ascii MaCleRadius123
```

## Rogue AP : la menace du point d'accès non autorisé

```text
   TYPES DE ROGUE AP :

   ROGUE MALVEILLANT
   → un attaquant installe volontairement un AP non autorisé,
     souvent avec le MÊME SSID que le réseau légitime (evil
     twin), pour intercepter les identifiants de connexion
     des utilisateurs qui s'y connectent par erreur

   ROGUE ACCIDENTEL
   → un employé branche un routeur Wi-Fi personnel (ex. pour
     "améliorer" sa couverture perçue), créant une brèche de
     sécurité INVOLONTAIRE (souvent SANS aucune sécurité
     configurée sur ce routeur personnel, offrant un accès
     direct au réseau interne en contournant tous les contrôles)
```

## Détection de rogue AP

```text
   Les AP légitimes (en mode local ou dédiés en monitor mode)
   scannent en permanence TOUS les canaux disponibles, comparant
   les SSID/BSSID détectés à une liste de référence connue :

   1. Un BSSID INCONNU est détecté émettant sur le réseau surveillé
   2. Le WLC le classe comme ROGUE (suspect)
   3. VÉRIFICATION DE PROXIMITÉ CÂBLÉE (rogue detection avancée) :
      le WLC vérifie si ce rogue AP est ÉGALEMENT visible sur le
      réseau FILAIRE interne (via son adresse MAC vue dans la
      table CDP/ARP du réseau câblé) — si OUI, c'est un rogue
      CONNECTÉ AU RÉSEAU INTERNE (menace CRITIQUE), sinon c'est
      un AP voisin externe sans lien avec le réseau (menace faible,
      ex. le Wi-Fi du café d'à côté)
```

```bash
(WLC) > config rogue detection enable
(WLC) > show rogue ap summary
(WLC) > show rogue ap detailed <MAC>
```

## WIPS (Wireless Intrusion Prevention System)

```text
   Au-delà de la simple DÉTECTION, un WIPS peut réagir ACTIVEMENT :

   ROGUE CONTAINMENT : envoie des trames de désauthentification
   CIBLÉES aux clients tentant de se connecter à un rogue AP
   identifié comme menace, les empêchant activement de s'y
   associer — une contre-mesure ACTIVE, à utiliser avec
   PRÉCAUTION (implications légales/réglementaires selon les
   juridictions, car cela perturbe intentionnellement une
   communication radio, même malveillante)
```

## Ce qu'il faut retenir

- **EAP-TLS** (certificats des deux côtés, le plus sûr) vs **PEAP** (tunnel TLS serveur seulement + authentification classique, le plus répandu en pratique pour son coût opérationnel réduit).
- Un **rogue AP** peut être malveillant (evil twin) ou accidentel (routeur personnel branché par un employé) — les deux représentent une brèche de sécurité réelle.
- La **vérification de proximité câblée** distingue un rogue connecté au réseau interne (menace critique) d'un AP voisin externe sans rapport.
- Un **WIPS** peut activement contenir (déconnecter) un rogue AP détecté, une mesure à manier avec précaution réglementaire.

## Pour aller plus loin

- [Cisco — Wireless Intrusion Prevention System (wIPS) Deployment Guide](https://www.cisco.com/c/en/us/td/docs/wireless/controller/technotes/8-3/b_cisco_wips_deployment_guide.html)
- [RFC 3748 — Extensible Authentication Protocol (EAP)](https://www.rfc-editor.org/rfc/rfc3748)
