---
id: 01-netflow-ip-sla
title: "NetFlow et IP SLA : visibilité et mesure de performance"
sidebar_position: 1
tags: [reseau, cheatsheet]
---

# NetFlow et IP SLA : visibilité et mesure de performance

> Au-delà de SNMP/Syslog (CCNA 3, supervision de l'état des équipements), **NetFlow** répond à la question "**qui parle à qui, avec quel protocole, combien de trafic**" et **IP SLA** mesure activement la **performance réelle** d'un chemin réseau (latence, gigue, perte).

## NetFlow : visibilité sur les flux de trafic

```text
   Un FLUX (flow) est identifié par un ensemble de 7 clés
   (5-tuple étendu) :

   IP source, IP destination, port source, port destination,
   protocole (TCP/UDP/...), interface d'entrée, type de service (ToS)

   Le routeur/switch AGRÈGE les paquets partageant ces 7 valeurs
   en UN SEUL enregistrement de flux (compteur de paquets/octets,
   horodatage début/fin), plutôt que d'enregistrer CHAQUE paquet
   individuellement — un compromis efficace entre détail et volume
   de données générées.
```

```text
   ┌─────────────────┐    export UDP     ┌──────────────────┐
   │  Équipement Cisco    │ ───────────────► │  Collecteur NetFlow  │
   │  (exportateur NetFlow)│    (port 2055     │  (analyse, stockage,  │
   │                        │     typique)      │   dashboards)          │
   └─────────────────┘                    └──────────────────┘
```

## Configuration (Flexible NetFlow)

```bash
! 1. Définir ce qui identifie un flux (record) et ce qui est collecté
Router(config)# flow record MON_RECORD
Router(config-flow-record)# match ipv4 source address
Router(config-flow-record)# match ipv4 destination address
Router(config-flow-record)# match transport source-port
Router(config-flow-record)# match transport destination-port
Router(config-flow-record)# collect counter bytes
Router(config-flow-record)# collect counter packets

! 2. Définir où exporter les données
Router(config)# flow exporter MON_EXPORTER
Router(config-flow-exporter)# destination 192.168.1.50
Router(config-flow-exporter)# transport udp 2055

! 3. Assembler record + exporter dans un monitor
Router(config)# flow monitor MON_MONITOR
Router(config-flow-monitor)# record MON_RECORD
Router(config-flow-monitor)# exporter MON_EXPORTER

! 4. Appliquer sur une interface, dans un sens
Router(config)# interface gigabitEthernet 0/1
Router(config-if)# ip flow monitor MON_MONITOR input
```

**Flexible NetFlow** (par opposition au NetFlow "classique" v5, figé sur un jeu de champs prédéfini) permet de choisir **précisément** quels champs identifier (match) et quels compteurs collecter — adapté à des besoins d'analyse spécifiques (ex. inclure le champ DSCP pour croiser QoS et volumétrie).

## Cas d'usage concret

Une entreprise constate une saturation récurrente d'un lien WAN sans savoir quelle application en est responsable. NetFlow, déployé sur l'interface WAN, révèle en quelques minutes que 80% du trafic provient d'un flux vers un port non standard — permettant d'identifier une sauvegarde cloud mal planifiée pendant les heures de pointe, sans avoir à capturer et analyser chaque paquet individuellement (ce qu'un simple `show interfaces` ne peut pas révéler : il donne un volume total, pas une répartition par flux).

## Vérification NetFlow

```bash
Router# show flow monitor MON_MONITOR cache
Router# show flow exporter statistics
```

## IP SLA : mesure active de performance

```text
   Contrairement à NetFlow (analyse PASSIVE du trafic RÉEL),
   IP SLA GÉNÈRE activement du trafic de TEST synthétique entre
   deux points, pour MESURER la performance du chemin (latence,
   gigue, perte, disponibilité) de façon PROACTIVE — AVANT même
   qu'un utilisateur ne se plaigne d'un problème.
```

```bash
! Test ICMP echo (latence/disponibilité simple)
Router(config)# ip sla 1
Router(config-ip-sla)# icmp-echo 192.168.100.1
Router(config-ip-sla-echo)# frequency 30           ! test toutes les 30s
Router(config)# ip sla schedule 1 life forever start-time now

! Test UDP jitter (mesure gigue/latence/perte — pertinent pour VoIP)
Router(config)# ip sla 2
Router(config-ip-sla)# udp-jitter 192.168.100.1 16384
Router(config)# ip sla schedule 2 life forever start-time now

! Utiliser un test IP SLA comme déclencheur pour une route flottante
! (basculement automatique si le lien surveillé se dégrade)
Router(config)# track 1 ip sla 1 reachability
Router(config)# ip route 0.0.0.0 0.0.0.0 <next-hop-secondaire> 200 track 1
```

**Cas d'usage concret combiné** : coupler IP SLA à une route flottante (vue en CCNA 2) permet un basculement **automatique et proactif** vers un lien WAN de secours dès que la latence/perte du lien principal dépasse un seuil défini — pas seulement en cas de coupure complète du lien (ce qu'une route statique simple détecterait de toute façon), mais aussi en cas de **dégradation silencieuse** de la qualité.

## Vérification IP SLA

```bash
Router# show ip sla statistics
Router# show ip sla configuration 1
Router# show track 1
```

## NetFlow vs IP SLA — complémentarité

| Critère | NetFlow | IP SLA |
|---|---|---|
| Nature | Analyse **passive** du trafic réel | Génère du trafic **actif** synthétique |
| Répond à | "Qui consomme quoi, avec qui ?" | "Quelle est la performance réelle du chemin ?" |
| Usage typique | Identification de trafic anormal, capacité | Détection proactive de dégradation, basculement automatique |

## Ce qu'il faut retenir

- **NetFlow** agrège le trafic réel en flux (7-tuple) et l'exporte vers un collecteur — répond à "qui parle à qui".
- **Flexible NetFlow** (record + exporter + monitor) permet de personnaliser précisément les champs collectés.
- **IP SLA** génère activement du trafic de test pour mesurer latence/gigue/perte, permettant une détection **proactive** de dégradation.
- Coupler IP SLA à un `track` + route flottante automatise le basculement en cas de dégradation, pas seulement de coupure complète.

## Pour aller plus loin

- [RFC 7011 — Specification of the IP Flow Information Export (IPFIX) Protocol](https://www.rfc-editor.org/rfc/rfc7011)
- [Cisco — IP SLA Configuration Guide](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/ipsla/configuration/xe-16/sla-xe-16-book.html)
