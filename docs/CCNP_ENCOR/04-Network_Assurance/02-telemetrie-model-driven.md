---
id: 02-telemetrie-model-driven
title: "Télémétrie orientée modèle (model-driven telemetry)"
sidebar_position: 2
tags: [reseau, automatisation]
---

# Télémétrie orientée modèle (model-driven telemetry)

> La télémétrie moderne remplace le **polling** SNMP traditionnel (l'outil de supervision interroge périodiquement chaque équipement) par un modèle de **publication continue** (l'équipement pousse lui-même ses données en streaming) — un changement fondamental de paradigme pour la supervision à grande échelle.

## Le problème du polling SNMP traditionnel

```text
   POLLING SNMP (pull)                    STREAMING TELEMETRY (push)

   [NMS] ──GET (toutes les 5 min)──►      [Équipement] ──publie en
                                            CONTINU (dès qu'une
   [NMS] ◄──── réponse ────                 donnée change, ou à
                                             intervalle très court,
   → données au MIEUX vieilles de            ex. 1s) ──►
     plusieurs minutes (résolution
     temporelle limitée par la              [Collecteur de
     fréquence de polling)                   télémétrie]

   → charge CPU côté équipement à          → quasi TEMPS RÉEL,
     CHAQUE requête (multiplié par            charge CPU réduite
     le nombre d'objets supervisés            (un seul flux continu
     × le nombre d'équipements)                plutôt que des requêtes
                                                répétées)
```

Le polling SNMP classique pose un problème de **scalabilité** : superviser des milliers d'objets sur des centaines d'équipements avec une résolution fine (ex. toutes les secondes) génère une charge de requêtes proportionnelle au produit (objets × équipements × fréquence) — souvent impraticable. Le streaming inverse le modèle : l'équipement publie lui-même, en continu, uniquement ce qui change.

## YANG : le modèle de données commun

```text
   Comme vu en CCNA 3, YANG (RFC 7950) décrit la STRUCTURE des
   données de configuration/état — la télémétrie orientée modèle
   s'appuie sur les MÊMES modèles YANG que NETCONF/RESTCONF,
   garantissant une COHÉRENCE entre configuration et supervision :
   la structure de données pour "lire l'état d'une interface" est
   la MÊME que celle utilisée pour la CONFIGURER.
```

## Protocoles de transport de la télémétrie

| Protocole | Principe |
|---|---|
| **gRPC / gNMI** (gRPC Network Management Interface) | Standard ouvert (issu de Google), transport binaire performant, de plus en plus dominant |
| **NETCONF avec souscription dynamique** | Extension de NETCONF (RFC 5277) permettant une souscription à des notifications périodiques |
| **gNOI** (gRPC Network Operations Interface) | Complète gNMI pour des opérations (reboot, mise à jour de certificats) plutôt que de la simple lecture |

```bash
! Exemple simplifié (syntaxe indicative, varie selon la plateforme)
Router(config)# telemetry ietf subscription 100
Router(config-mdt-subs)# encoding encode-kvgpb
Router(config-mdt-subs)# filter xpath /interfaces-ios-xe-oper:interfaces/interface
Router(config-mdt-subs)# stream yang-push
Router(config-mdt-subs)# update-policy periodic 1000    ! publication toutes les 1000 centisecondes (10s)
Router(config-mdt-subs)# receiver ip address 192.168.1.50 57500 protocol grpc-tcp
```

## Cisco DNA Center Assurance

```text
   DNA Center collecte la télémétrie de TOUT le réseau (câblé et
   sans fil) et applique du MACHINE LEARNING pour :

   - Établir une BASELINE de comportement normal par équipement/
     application (ex. latence habituelle d'un lien, débit type
     d'une application)
   - Détecter des ANOMALIES par rapport à cette baseline
     (dégradation progressive, pic anormal) AVANT qu'elles ne
     deviennent des pannes complètes signalées par les utilisateurs
   - Fournir un score de SANTÉ RÉSEAU agrégé, avec analyse de
     cause racine (root cause analysis) suggérée automatiquement
```

**Cas d'usage concret** : DNA Center Assurance détecte qu'un AP spécifique présente un taux de retransmission Wi-Fi progressivement croissant sur plusieurs jours (signal d'une dégradation matérielle imminente, ex. antenne défaillante) — une alerte proactive permet un remplacement planifié avant une panne complète perçue par les utilisateurs, alors qu'un monitoring SNMP classique n'aurait probablement montré qu'un statut "up" jusqu'à la panne effective.

## Ce qu'il faut retenir

- La **télémétrie orientée modèle** remplace le polling SNMP (pull, périodique, coûteux à grande échelle) par un **streaming continu** (push), s'appuyant sur les mêmes modèles **YANG** que NETCONF/RESTCONF.
- **gRPC/gNMI** est le transport dominant émergent pour ce streaming.
- **DNA Center Assurance** exploite cette télémétrie avec du machine learning pour établir des baselines, détecter des anomalies et suggérer des causes racines de façon proactive.

## Pour aller plus loin

- [Cisco — Model-Driven Telemetry Configuration Guide](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/prog/configuration/xe-16/prog-xe-16-book/model-driven-telemetry.html)
- [RFC 7950 — The YANG 1.1 Data Modeling Language](https://www.rfc-editor.org/rfc/rfc7950)
- [gRPC / gNMI Specification (OpenConfig)](https://github.com/openconfig/gnmi)
