---
id: 03-modes-de-transmission-bande-passante
title: "Unicast, broadcast, multicast, bande passante et latence"
sidebar_position: 3
tags: [reseau]
---

# Unicast, broadcast, multicast, bande passante et latence

> Trois modes de transmission gouvernent la façon dont un émetteur adresse un ou plusieurs destinataires, et trois métriques (bande passante, débit, latence) caractérisent la performance d'un lien réseau.

## Modes de transmission

```text
   UNICAST                BROADCAST               MULTICAST

   [A] ──────► [B]        [A] ──────► [B]          [A] ──────► [B] (abonné)
   (1 destinataire             ├──────► [C]              ├──────► [C] (abonné)
    précis)                    └──────► [D]              └───X    [D] (non abonné,
                            (TOUS les hôtes                        ne reçoit pas)
                             du domaine broadcast)
```

| Mode | Destinataire(s) | Adresse type | Exemple |
|---|---|---|---|
| **Unicast** | Un seul hôte précis | IP unique (ex. 192.168.1.10) | Navigation web, SSH |
| **Broadcast** | Tous les hôtes du domaine de broadcast | 255.255.255.255 ou adresse de broadcast dirigé (ex. 192.168.1.255) | Requête ARP, DHCP Discover |
| **Multicast** | Groupe d'hôtes abonnés | Plage 224.0.0.0 – 239.255.255.255 (IPv4) | Routage OSPF (224.0.0.5), streaming vidéo, IPTV |

IPv6 **supprime le broadcast** : il est remplacé par du multicast (ex. `ff02::1` = tous les nœuds du lien) et de l'anycast (voir le cours IPv6).

## Domaines de collision et de broadcast

```text
   DOMAINE DE COLLISION            DOMAINE DE BROADCAST
   (délimité par un switch         (délimité par un routeur
    ou un hub — 1 port switch      — toutes les interfaces
    = 1 domaine de collision)       d'un même VLAN/routeur)

   [PC]─┐                          ┌──────────────────────┐
   [PC]─┼─[HUB]  = 1 collision     │ [PC] [PC] [PC] [PC]   │
   [PC]─┘          domain           │    tous reliés par    │
                                    │    des switches       │
   [PC]─[Switch port] = 1 collision│    = 1 broadcast       │
        domain par port (full-dup) │    domain (jusqu'au    │
                                    │    routeur)            │
                                    └──────────────────────┘
```

Un **switch** segmente les domaines de collision (chaque port = son propre domaine, éliminant les collisions en full-duplex) mais ne segmente **pas** le domaine de broadcast : une trame broadcast est propagée sur tous les ports du switch (hors celui d'origine). Seul un **routeur** (ou une frontière de VLAN) arrête un broadcast.

## Bande passante, débit réel et latence

```text
   Bande passante (bandwidth)  : capacité THÉORIQUE maximale d'un lien
                                  (ex. 1 Gbps sur un lien Ethernet cuivre)

   Débit (throughput)          : quantité de données RÉELLEMENT transférée
                                  par unité de temps (toujours ≤ bande passante,
                                  dégradé par le trafic concurrent, les erreurs,
                                  l'overhead protocolaire)

   Goodput                     : débit utile, hors overhead protocolaire
                                  (en-têtes, retransmissions)

   Latence                     : délai de transmission d'un bit/paquet d'un
                                  point A à un point B (propagation + traitement
                                  + mise en file d'attente)

   Gigue (jitter)               : variation de la latence dans le temps
                                  (critique pour la VoIP/visioconférence)
```

| Métrique | Unité | Outil de mesure typique |
|---|---|---|
| Bande passante | bps, Kbps, Mbps, Gbps | Spécification du lien/interface |
| Débit | bps (mesuré) | `iperf`, transfert de fichier chronométré |
| Latence | ms (millisecondes) | `ping`, `traceroute` |
| Gigue | ms | Outils de mesure VoIP dédiés |

**Note de conversion** importante (souvent piégeuse à l'examen) : les débits réseau se mesurent en **bits** par seconde (Mbps, minuscule "b"), alors que les tailles de fichiers se mesurent en **octets** (MB, majuscule "B"). 1 octet = 8 bits, donc un lien à 100 Mbps transfère au mieux ~12,5 Mo/s en théorie.

## Ce qu'il faut retenir

- **Unicast** = 1 destinataire, **broadcast** = tous les hôtes du domaine (n'existe pas en IPv6), **multicast** = groupe d'abonnés.
- Un **switch** segmente les domaines de collision (par port) mais pas les domaines de broadcast ; seul un **routeur** arrête un broadcast.
- **Bande passante** = capacité théorique, **débit** = mesure réelle (toujours inférieure), **latence** = délai de transmission, **gigue** = variation de la latence.
- Bits (réseau, "b") ≠ octets (fichiers, "B") : diviser par 8 pour convertir.

## Pour aller plus loin

- [RFC 1112 — Host Extensions for IP Multicasting](https://www.rfc-editor.org/rfc/rfc1112)
- [Wikipedia — Bande passante (télécommunications)](https://fr.wikipedia.org/wiki/Bande_passante_(t%C3%A9l%C3%A9communications))
