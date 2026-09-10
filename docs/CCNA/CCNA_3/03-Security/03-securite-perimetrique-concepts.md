---
id: 03-securite-perimetrique-concepts
title: "Sécurité périmétrique : AAA, VPN, concepts de firewall"
sidebar_position: 3
tags: [reseau, cybersecurite]
---

# Sécurité périmétrique : AAA, VPN, concepts de firewall

> Au-delà de la sécurité de couche 2, un réseau d'entreprise s'appuie sur des mécanismes de contrôle d'accès centralisés (**AAA**), de confidentialité sur les liens externes (**VPN**) et de filtrage périmétrique (**firewall**).

## AAA : Authentication, Authorization, Accounting

```text
   AUTHENTICATION  : "Qui êtes-vous ?" — vérification d'identité
                      (login/mot de passe, certificat, MFA)

   AUTHORIZATION    : "Qu'avez-vous le droit de faire ?" — une fois
                      authentifié, détermine les privilèges accordés
                      (ex. niveau de privilège 15 = accès complet
                       vs niveau 1 = lecture seule)

   ACCOUNTING       : "Qu'avez-vous fait ?" — journalisation de
                      l'activité (commandes exécutées, durée de
                      session, volume de données) à des fins d'audit
```

## Authentification locale vs centralisée (RADIUS/TACACS+)

```text
   AUTHENTIFICATION LOCALE                CENTRALISÉE (RADIUS/TACACS+)

   username admin secret X                Chaque équipement interroge
   (base de comptes STOCKÉE               un SERVEUR AAA централisé
   LOCALEMENT sur chaque équipement)       (ex. Cisco ISE)

   Problème à grande échelle :             Avantage : un SEUL point de
   changer un mot de passe = le            gestion des comptes, révocation
   faire sur CHAQUE équipement              immédiate sur tous les
   individuellement                         équipements simultanément
```

| Critère | RADIUS | TACACS+ |
|---|---|---|
| Standard | Ouvert (IETF, RFC 2865) | Propriétaire Cisco |
| Transport | UDP | TCP |
| Chiffrement | Seul le mot de passe est chiffré | **Tout le paquet** est chiffré |
| Combinaison AAA | Authentification + Autorisation combinées | Authentification, Autorisation, Accounting **séparés** (plus granulaire) |
| Usage typique | Authentification réseau (Wi-Fi Enterprise, VPN) | Administration des équipements (contrôle fin des commandes autorisées) |

```bash
Router(config)# aaa new-model
Router(config)# radius server RADIUS1
Router(config-radius-server)# address ipv4 192.168.1.200
Router(config-radius-server)# key MaCléPartagée123

Router(config)# aaa authentication login default group radius local
! tente RADIUS en premier, bascule sur les comptes locaux si le
! serveur RADIUS est injoignable (continuité de service)
```

## VPN : concepts et cas d'usage

```text
   VPN SITE-TO-SITE                       VPN ACCÈS DISTANT (client)

   [Site A]══tunnel chiffré══[Site B]      [Télétravailleur]══tunnel══[Siège]
   (permanent, entre deux                  (à la demande, un utilisateur
    passerelles/routeurs)                   individuel se connecte au
                                             réseau d'entreprise)

   Usage : interconnecter des sites        Usage : accès distant sécurisé
   distants comme s'ils étaient sur         pour un poste nomade
   le même réseau local
```

| Technologie | Principe |
|---|---|
| **IPsec** | Suite de protocoles (AH, ESP, IKE) chiffrant au niveau IP — base des VPN site-to-site d'entreprise |
| **SSL/TLS VPN** (ex. AnyConnect) | S'appuie sur TLS, souvent via navigateur ou client léger — répandu pour l'accès distant individuel |
| **GRE over IPsec** | Encapsulation GRE (transporte du trafic non-IP ou multicast, ex. protocoles de routage) combinée au chiffrement IPsec |

## Concepts de firewall (approfondi en CCNP)

```text
   FILTRAGE SANS ÉTAT (stateless, type ACL classique)
   → évalue CHAQUE paquet indépendamment, sans mémoire du contexte
     de la connexion (pas de notion de "connexion déjà établie")

   FILTRAGE AVEC ÉTAT (stateful firewall)
   → maintient une TABLE D'ÉTAT des connexions en cours ; un paquet
     de retour appartenant à une connexion déjà autorisée en sortie
     est AUTOMATIQUEMENT autorisé en retour, sans règle explicite
     supplémentaire nécessaire pour le sens retour

   ZONE-BASED FIREWALL (ZBF, Cisco IOS)
   → regroupe les interfaces en ZONES DE SÉCURITÉ (ex. INSIDE,
     OUTSIDE, DMZ), avec des politiques appliquées entre PAIRES
     de zones plutôt qu'interface par interface
```

Une ACL classique est **sans état** (stateless) : elle doit explicitement autoriser le trafic retour d'une connexion, sinon celui-ci sera bloqué. Un firewall **avec état** simplifie considérablement les règles : autoriser une connexion sortante suffit, le retour est automatiquement permis grâce à sa table de suivi des connexions.

## Ce qu'il faut retenir

- **AAA** = Authentication (identité) + Authorization (droits) + Accounting (traçabilité).
- **RADIUS** (UDP, standard, chiffre seulement le mot de passe) vs **TACACS+** (TCP, propriétaire Cisco, chiffre tout le paquet, AAA séparés).
- **VPN site-to-site** relie deux réseaux en permanence (souvent IPsec) ; **VPN accès distant** connecte un utilisateur individuel (souvent SSL/TLS).
- Un firewall **avec état** (stateful) autorise automatiquement le trafic retour d'une connexion déjà établie, contrairement à une ACL classique (sans état).

## Pour aller plus loin

- [RFC 2865 — Remote Authentication Dial In User Service (RADIUS)](https://www.rfc-editor.org/rfc/rfc2865)
- [RFC 4301 — Security Architecture for the Internet Protocol (IPsec)](https://www.rfc-editor.org/rfc/rfc4301)
- [Cisco — Zone-Based Policy Firewall Design Guide](https://www.cisco.com/c/en/us/td/docs/solutions/Enterprise/Security/IOS_Firewall/IOS_Zone_Based_Firewall.html)
