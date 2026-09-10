---
id: 02-configuration-wlan
title: "Sécurité Wi-Fi et configuration WLC"
sidebar_position: 2
tags: [reseau, cybersecurite, cheatsheet]
---

# Sécurité Wi-Fi et configuration WLC

## Évolution des mécanismes de sécurité Wi-Fi

```text
   WEP (1997)            WPA (2003)           WPA2 (2004)         WPA3 (2018)

   Chiffrement RC4        TKIP (patch          AES-CCMP            AES-GCMP,
   avec IV court           logiciel de WEP,     (chiffrement        SAE (remplace
   (24 bits),               clés dynamiques      robuste par         PSK, résiste
   CASSABLE en               par paquet)         bloc, standard      aux attaques
   quelques minutes                              de facto depuis     par dictionnaire
   → OBSOLÈTE,             → transitoire,        20 ans)              hors-ligne)
     jamais à utiliser       déjà obsolète
```

**WEP ne doit plus jamais être utilisé** (cassable en quelques minutes avec des outils publics, faille structurelle du vecteur d'initialisation). **WPA2** reste très répandu ; **WPA3** est recommandé sur tout matériel qui le supporte, notamment pour sa résistance aux attaques hors-ligne sur mot de passe faible.

## Modes d'authentification WPA2/WPA3

| Mode | Usage | Authentification |
|---|---|---|
| **Personal (PSK)** | Domestique, petite entreprise | Clé pré-partagée unique pour tous |
| **Enterprise (802.1X/EAP)** | Entreprise | Identifiants individuels via un serveur **RADIUS**, intégration Active Directory possible |

Le mode **Enterprise** permet une authentification individuelle (traçabilité, révocation d'accès par utilisateur sans changer une clé partagée par tous) et est le standard recommandé en environnement professionnel.

## Configuration d'un AP autonome (IOS)

```bash
AccessPoint(config)# dot11 ssid ENTREPRISE_WIFI
AccessPoint(config-ssid)# authentication open
AccessPoint(config-ssid)# authentication key-management wpa version 2
AccessPoint(config-ssid)# wpa-psk ascii MonMotDePasseSolide123!

AccessPoint(config)# interface dot11radio 0
AccessPoint(config-if)# ssid ENTREPRISE_WIFI
AccessPoint(config-if)# encryption mode ciphers aes-ccm
AccessPoint(config-if)# no shutdown
```

## Architecture centralisée : WLC (Wireless LAN Controller)

```text
   AP AUTONOME (mode classique)         AP LÉGER (Lightweight) + WLC

   [AP1] configuré individuellement     [AP1]──┐
   [AP2] configuré individuellement     [AP2]──┼──► [WLC] (contrôleur
   [AP3] configuré individuellement     [AP3]──┘     centralisé,
   (gestion fastidieuse à grande                       gère TOUS les AP :
    échelle, pas de coordination                       config, RF,
    RF entre AP)                                        roaming, sécurité)

   → adapté à un ou quelques AP          → adapté à un déploiement
                                            à grande échelle (campus,
                                            multi-sites)
```

Les AP légers communiquent avec le WLC via le protocole **CAPWAP** (Control And Provisioning of Wireless Access Points). Le WLC centralise la configuration (SSID, sécurité, puissance d'émission), coordonne les canaux radio entre AP voisins pour limiter les interférences, et facilite le roaming rapide entre AP.

## Diagnostic Wi-Fi courant

```text
   Symptômes typiques et pistes :

   - Débit faible malgré bon signal → congestion du canal (trop
     de réseaux voisins sur le même canal), interférences 2,4 GHz
   - Déconnexions fréquentes         → interférences, AP en
                                        surchauffe/saturation, roaming
                                        mal configuré (pas de 802.11r)
   - Zones mortes (pas de signal)    → mauvais positionnement des AP,
                                        obstacles physiques (murs porteurs,
                                        métal)
```

## Ce qu'il faut retenir

- **WEP** = obsolète, jamais à utiliser. **WPA2** = standard actuel répandu. **WPA3** = recommandé sur matériel compatible.
- **Personal (PSK)** = clé partagée unique ; **Enterprise (802.1X/EAP)** = authentification individuelle via RADIUS, standard en entreprise.
- Un **WLC** centralise la gestion de nombreux AP légers via **CAPWAP**, adapté aux déploiements à grande échelle.

## Pour aller plus loin

- [Wi-Fi Alliance — Security](https://www.wi-fi.org/discover-wi-fi/security)
- [Cisco — Wireless LAN Controller Configuration Guide](https://www.cisco.com/c/en/us/support/wireless/wireless-lan-controller-software/products-installation-and-configuration-guides-list.html)
