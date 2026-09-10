---
id: 01-quest-ce-quun-reseau
title: "Qu'est-ce qu'un réseau ? LAN, WAN, WLAN, architectures"
sidebar_position: 1
tags: [reseau]
---

# Qu'est-ce qu'un réseau ? LAN, WAN, WLAN, architectures

> Un **réseau informatique** est un ensemble d'équipements (hôtes, commutateurs, routeurs) interconnectés capables d'échanger des données selon des règles communes (protocoles). L'objectif est le partage de ressources : fichiers, applications, périphériques, connexion Internet.

## Types de réseaux par étendue géographique

```text
   PAN          LAN              MAN            WAN
   (qq m)     (bâtiment/         (ville)      (pays/monde)
              campus)
   Bluetooth   Salle, immeuble   Fibre         Internet,
   USB         entreprise        métropolitaine liaisons opérateur
```

| Type | Étendue | Exemple |
|---|---|---|
| **PAN** (Personal Area Network) | Quelques mètres | Bluetooth, USB |
| **LAN** (Local Area Network) | Bâtiment, campus | Réseau d'entreprise, réseau domestique |
| **WLAN** (Wireless LAN) | LAN sans fil | Wi-Fi (802.11) |
| **MAN** (Metropolitan Area Network) | Ville | Boucle fibre métropolitaine |
| **WAN** (Wide Area Network) | Pays, international | Internet, liaisons inter-sites opérateur (MPLS, VPN) |
| **SAN** (Storage Area Network) | Datacenter | Réseau dédié au stockage (iSCSI, FC) |

Un **LAN** est administré par une seule organisation, à haut débit et faible latence. Un **WAN** interconnecte des LAN distants, généralement via un opérateur télécom, à débit plus limité et latence plus élevée.

## Internet, Intranet, Extranet

```text
   INTRANET                EXTRANET               INTERNET
   Réseau interne à         Intranet ouvert       Réseau public
   une organisation,        partiellement à       mondial, interconnexion
   accès restreint aux      des partenaires       de milliers de réseaux
   employés                 externes (VPN,        autonomes (AS)
                             accès authentifié)
```

- **Internet** : interconnexion mondiale de réseaux autonomes (AS), sans administration centrale unique, régie par des protocoles standardisés (IETF/RFC) et des registres d'adressage (IANA/RIR).
- **Intranet** : réseau privé basé sur les mêmes technologies (IP, HTTP) mais dont l'accès est restreint aux membres d'une organisation.
- **Extranet** : extension contrôlée de l'intranet à des tiers autorisés (fournisseurs, partenaires), typiquement via VPN ou authentification dédiée.

## Architecture client-serveur vs peer-to-peer

```text
   CLIENT-SERVEUR                    PEER-TO-PEER (P2P)

   [Client] ─┐                       [Hôte A] ←──→ [Hôte B]
   [Client] ─┼──→ [Serveur]              ↑             ↑
   [Client] ─┘    (rôle dédié)           └─────────────┘
                                       [Hôte C] (chaque nœud est
                                       à la fois client et serveur)
```

| Critère | Client-serveur | Peer-to-peer |
|---|---|---|
| Rôles | Dédiés (serveur fournit, client consomme) | Symétriques (chaque nœud client **et** serveur) |
| Centralisation | Ressources/administration centralisées | Décentralisé |
| Scalabilité | Limitée par la capacité du serveur | Scalable (charge répartie) |
| Exemples | Web (HTTP), messagerie (SMTP/IMAP), DNS | BitTorrent, certaines architectures blockchain |

En entreprise, l'architecture **client-serveur** domine (contrôle, sécurité, sauvegarde centralisée). Le **P2P** est utilisé pour le partage de fichiers distribué ou certains protocoles réseau eux-mêmes (ex. les routeurs OSPF échangent en pair-à-pair).

## Ce qu'il faut retenir

- Un réseau se classe par **étendue** : PAN < LAN < MAN < WAN.
- **Internet** = interconnexion mondiale de réseaux autonomes ; **Intranet** = réseau interne privé ; **Extranet** = intranet ouvert à des tiers de confiance.
- **Client-serveur** : rôles dédiés, centralisé. **Peer-to-peer** : rôles symétriques, décentralisé.

## Pour aller plus loin

- [Wikipedia — Réseau informatique](https://fr.wikipedia.org/wiki/R%C3%A9seau_informatique)
- [Wikipedia — Peer-to-peer](https://fr.wikipedia.org/wiki/Pair_%C3%A0_pair)
