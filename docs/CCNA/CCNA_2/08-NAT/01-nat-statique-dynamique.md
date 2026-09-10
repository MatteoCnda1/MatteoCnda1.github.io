---
id: 01-nat-statique-dynamique
title: "NAT statique et dynamique : configuration IOS"
sidebar_position: 1
tags: [reseau, cheatsheet]
---

# NAT statique et dynamique : configuration IOS

> Le NAT traduit des adresses IP **privées** (RFC 1918) en adresses **publiques** routables sur Internet. Ce cours couvre la configuration complète sur Cisco IOS (le concept a été introduit en CCNA 1).

## Terminologie NAT Cisco

```text
   inside local    : adresse PRIVÉE d'un hôte interne (vue interne)
   inside global    : adresse PUBLIQUE de cet hôte APRÈS traduction
                       (vue externe, celle utilisée sur Internet)
   outside local    : adresse d'un hôte externe TELLE QUE VUE depuis
                       l'intérieur (rarement différente en pratique)
   outside global   : adresse RÉELLE d'un hôte externe sur Internet

   ┌─────────────────────┐          ┌──────────────────────┐
   │   RÉSEAU INTERNE      │          │      INTERNET          │
   │   (inside)            │          │      (outside)          │
   │                        │          │                         │
   │  192.168.1.10          │  NAT     │   203.0.113.5           │
   │  (inside LOCAL)        │ ══════►  │   (inside GLOBAL,       │
   │                        │          │    même hôte, vu        │
   │                        │          │    depuis l'extérieur)  │
   └─────────────────────┘          └──────────────────────┘
```

## Déclaration des interfaces inside/outside (préalable obligatoire)

```bash
Router(config)# interface gigabitEthernet 0/0
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# ip nat inside                     ! interface côté réseau privé

Router(config)# interface gigabitEthernet 0/1
Router(config-if)# ip address 203.0.113.1 255.255.255.252
Router(config-if)# ip nat outside                    ! interface côté Internet/public
```

Sans cette double déclaration (`ip nat inside` sur l'interface interne, `ip nat outside` sur l'interface externe), **aucune** traduction NAT ne s'applique, même si les règles de traduction elles-mêmes sont correctement configurées — erreur de configuration très fréquente.

## NAT statique (correspondance fixe 1:1)

```bash
Router(config)# ip nat inside source static 192.168.1.50 203.0.113.10
! toute IP privée 192.168.1.50 correspond TOUJOURS à l'IP publique 203.0.113.10
```

**Cas d'usage concret** : un serveur web interne (192.168.1.50) doit être accessible en permanence depuis Internet sous une adresse publique fixe (203.0.113.10) — nécessaire pour un enregistrement DNS public stable pointant vers ce serveur.

### NAT statique avec redirection de port (PAT statique / port forwarding)

```bash
Router(config)# ip nat inside source static tcp 192.168.1.50 80 203.0.113.1 8080
! le trafic vers 203.0.113.1:8080 est redirigé vers 192.168.1.50:80
! (permet de partager UNE SEULE IP publique entre plusieurs services internes,
!  différenciés par le port)
```

## NAT dynamique (pool d'adresses publiques)

```bash
! 1. Définir le pool d'adresses publiques disponibles
Router(config)# ip nat pool POOL_PUBLIC 203.0.113.10 203.0.113.20 netmask 255.255.255.0

! 2. Définir quels hôtes internes sont éligibles (via une ACL)
Router(config)# access-list 1 permit 192.168.1.0 0.0.0.255

! 3. Lier l'ACL au pool
Router(config)# ip nat inside source list 1 pool POOL_PUBLIC
```

Contrairement au NAT statique, la correspondance IP privée ↔ IP publique n'est **pas fixe** : elle est attribuée dynamiquement depuis le pool, à la demande, et libérée après un délai d'inactivité — un hôte peut donc se voir attribuer une IP publique différente d'une session à l'autre.

**Limite pratique** : si le nombre d'hôtes internes actifs dépasse la taille du pool, les hôtes excédentaires ne peuvent pas obtenir de traduction tant qu'une adresse ne se libère pas — c'est précisément la limite que le **PAT** (cours suivant) résout en autorisant le partage d'une même IP publique entre plusieurs hôtes simultanément.

## Vérification et diagnostic

```bash
Router# show ip nat translations
Pro Inside global      Inside local       Outside local      Outside global
tcp 203.0.113.10:80    192.168.1.50:80    ---                ---
--- 203.0.113.10       192.168.1.50       ---                ---

Router# show ip nat statistics
Router# clear ip nat translation *          ! vide la table de traduction
Router# debug ip nat                        ! observe les traductions en temps réel (usage ponctuel)
```

## Ce qu'il faut retenir

- **inside local** = IP privée réelle ; **inside global** = IP publique après traduction ; les interfaces doivent être marquées `ip nat inside`/`ip nat outside`.
- **NAT statique** (`ip nat inside source static`) = correspondance fixe 1:1, pour un serveur exposé en permanence ; possibilité de rediriger un port spécifique.
- **NAT dynamique** (pool + ACL + `ip nat inside source list ... pool ...`) = attribution à la demande depuis un pool, limitée par sa taille.
- `show ip nat translations` affiche la table de traduction active ; `clear ip nat translation *` la vide.

## Pour aller plus loin

- [RFC 3022 — Traditional IP Network Address Translator](https://www.rfc-editor.org/rfc/rfc3022)
- [Cisco — Configuring NAT for IP Address Conservation](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/ipaddr_nat/configuration/xe-16/nat-xe-16-book.html)
