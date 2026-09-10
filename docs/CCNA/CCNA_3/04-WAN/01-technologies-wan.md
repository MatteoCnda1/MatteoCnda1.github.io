---
id: 01-technologies-wan
title: "Technologies WAN : lignes louées, MPLS, PPP, PPPoE"
sidebar_position: 1
tags: [reseau]
---

# Technologies WAN : lignes louées, MPLS, PPP, PPPoE

> Un **WAN** interconnecte des sites distants via l'infrastructure d'un opérateur télécom. Contrairement au LAN (propriété/gestion entière de l'organisation), le WAN implique un tiers (le fournisseur d'accès), avec des contraintes de coût, débit et latence différentes.

## Panorama des technologies WAN

```text
   LIGNE LOUÉE (leased line)             Circuit DÉDIÉ, point-à-point,
                                          bande passante garantie, coût élevé

   MPLS (Multiprotocol Label Switching)  Réseau opérateur PARTAGÉ entre
                                          clients, commutation par labels
                                          (rapide), QoS native possible

   VPN SUR INTERNET PUBLIC                Tunnel chiffré (IPsec) sur
                                          Internet classique — coût
                                          faible, bande passante non
                                          garantie (best-effort)

   FIBRE/xDSL/câble opérateur              Accès Internet "classique",
                                          souvent combiné à un VPN pour
                                          sécuriser le trafic inter-site
```

| Technologie | Bande passante garantie | Coût | Usage typique |
|---|---|---|---|
| Ligne louée | Oui (dédiée) | Élevé | Liaison critique entre 2 sites majeurs |
| MPLS | Oui (SLA opérateur) | Moyen-élevé | Réseau d'entreprise multi-sites |
| VPN sur Internet | Non (best-effort) | Faible | Petites succursales, télétravail |

## PPP (Point-to-Point Protocol)

```text
   Protocole de couche 2 pour liens SÉRIE point-à-point (historique :
   modems, liaisons louées série ; toujours pertinent en labo/examen
   et pour certains accès WAN opérateur)

   Fonctionnalités clés apportées par rapport à HDLC (propriétaire,
   plus basique) :
   - Authentification (PAP ou CHAP)
   - Multiplexage multi-protocoles
   - Détection d'erreur, contrôle de qualité de lien (LCP)
   - Compression optionnelle
```

```bash
Router(config)# interface serial 0/0/0
Router(config-if)# encapsulation ppp
Router(config-if)# ppp authentication chap
```

### PAP vs CHAP

```text
   PAP (Password Authentication Protocol)
   → identifiants envoyés EN CLAIR lors de l'établissement du lien
   → vulnérable à l'interception, OBSOLÈTE en pratique

   CHAP (Challenge Handshake Authentication Protocol)
   → mécanisme de DÉFI-RÉPONSE (challenge/response) basé sur un
     hash (MD5), le mot de passe LUI-MÊME n'est JAMAIS transmis
     sur le lien → bien plus sûr, à privilégier systématiquement
```

```bash
Router(config)# username R2 password MonSecret123    ! identifiant = hostname du PAIR distant
Router(config)# interface serial 0/0/0
Router(config-if)# ppp authentication chap
```

## PPPoE (PPP over Ethernet)

```text
   Utilisé massivement par les FAI grand public (ADSL/fibre) :
   encapsule PPP (authentification, gestion de session) à
   l'intérieur de trames Ethernet, pour offrir sur un lien Ethernet
   physique les mêmes fonctionnalités (auth, comptabilité) qu'un
   lien série PPP dédié historique.
```

```bash
Router(config)# interface gigabitEthernet 0/1
Router(config-if)# no ip address
Router(config-if)# pppoe enable
Router(config-if)# pppoe-client dial-pool-number 1

Router(config)# interface dialer 1
Router(config-if)# ip address negotiated             ! IP publique attribuée dynamiquement par le FAI
Router(config-if)# encapsulation ppp
Router(config-if)# dialer pool 1
Router(config-if)# ppp authentication chap
Router(config-if)# ppp chap hostname mon_identifiant_fai
Router(config-if)# ppp chap password MonMotDePasseFAI
```

## Vérification PPP

```bash
Router# show interfaces serial 0/0/0
Serial0/0/0 is up, line protocol is up
  Encapsulation PPP, LCP Open, ...

Router# debug ppp authentication      ! observer l'échange CHAP en temps réel (diagnostic)
```

## Ce qu'il faut retenir

- Le WAN implique un opérateur tiers ; ligne louée (dédiée, chère) vs MPLS (partagé avec SLA) vs VPN sur Internet (best-effort, économique).
- **PPP** apporte authentification (PAP/CHAP), multi-protocole et contrôle de qualité de lien, par rapport à HDLC.
- **CHAP** (défi-réponse, mot de passe jamais transmis) doit toujours être préféré à **PAP** (identifiants en clair).
- **PPPoE** encapsule PPP dans Ethernet — utilisé par la majorité des FAI grand public (ADSL/fibre).

## Pour aller plus loin

- [RFC 1661 — The Point-to-Point Protocol (PPP)](https://www.rfc-editor.org/rfc/rfc1661)
- [RFC 1994 — PPP Challenge Handshake Authentication Protocol (CHAP)](https://www.rfc-editor.org/rfc/rfc1994)
- [RFC 2516 — PPP over Ethernet (PPPoE)](https://www.rfc-editor.org/rfc/rfc2516)
