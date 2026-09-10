---
id: 01-networks
title: Réseaux Docker
sidebar_position: 1
tags: [conteneurs, reseau, outil]
---

# Réseaux Docker

> Chaque conteneur reçoit par défaut sa propre pile réseau isolée (un [network namespace](../Namespaces/index.md)). Docker gère la connectivité entre conteneurs et vers l'extérieur via des **drivers réseau** configurables.

## Les drivers réseau

| Driver | Comportement |
|---|---|
| **bridge** | Réseau virtuel privé sur l'hôte (par défaut). Les conteneurs communiquent entre eux et sortent via NAT. |
| **host** | Le conteneur partage **directement** la pile réseau de l'hôte — aucune isolation réseau, aucune traduction de ports. |
| **none** | Aucune interface réseau (sauf loopback) — isolation réseau totale. |
| **overlay** | Réseau qui s'étend sur **plusieurs hôtes** (Docker Swarm) — hors du cadre d'un seul hôte. |
| **macvlan** | Le conteneur reçoit sa propre adresse MAC, visible comme un appareil physique sur le réseau local. |

## Le bridge par défaut vs un bridge personnalisé

C'est la distinction la plus importante au quotidien :

```text
Bridge par défaut ("bridge")           Bridge personnalisé ("mon-reseau")

┌────────────────────────────┐       ┌────────────────────────────┐
│  web01        db01           │       │  web01        db01           │
│  172.17.0.2   172.17.0.3      │       │  172.18.0.2   172.18.0.3      │
│                                │       │                                │
│  web01 ne peut PAS joindre     │       │  web01 peut joindre "db01"     │
│  "db01" par son nom — doit     │       │  directement par son NOM       │
│  connaître son IP (fragile)    │       │  (DNS automatique intégré)     │
└────────────────────────────┘       └────────────────────────────┘
```

Le bridge par défaut (celui utilisé si on ne précise rien) **ne fait pas** de résolution DNS entre conteneurs — c'est une limitation historique. Un bridge **créé explicitement** (`docker network create`) active automatiquement la résolution par nom entre les conteneurs qui y sont connectés. Conclusion pratique : **toujours créer un réseau dédié** plutôt que de compter sur le bridge par défaut (Compose le fait automatiquement, voir [Docker Compose](../Docker_Compose/index.md)).

## Commandes

```bash
docker network ls
docker network inspect mon-reseau
docker network create mon-reseau
docker network create --driver bridge --subnet 172.20.0.0/16 --gateway 172.20.0.1 mon-reseau

docker run --network mon-reseau --name web01 nginx
docker network connect mon-reseau <conteneur-déjà-lancé>
docker network disconnect mon-reseau <conteneur>

docker network rm mon-reseau
docker network prune
```

Un conteneur peut être connecté à **plusieurs réseaux simultanément** — utile pour un reverse-proxy qui doit voir à la fois un réseau "frontend" public et un réseau "backend" privé, sans que les services backend soient directement exposés.

## Publier des ports vers l'hôte

Par défaut, un conteneur sur un réseau bridge n'est **pas** accessible depuis l'extérieur de l'hôte — il faut publier explicitement un port :

```bash
docker run -p 8080:80 nginx          # hôte:8080 → conteneur:80
docker run -p 127.0.0.1:8080:80 nginx # n'écouter QUE sur localhost (pas toutes les interfaces)
docker run -p 8080:80/udp nginx       # préciser le protocole
docker run -P nginx                   # publier TOUS les ports EXPOSE sur des ports aléatoires
```

> ⚠️ Piège classique : `-p` **contourne** les règles `iptables`/`ufw`/`nftables` configurées manuellement sur l'hôte (voir [Pare-feu Linux](../../Operating_sys/Linux/Security/04-pare-feu-nftables-ufw-fail2ban.md)), car Docker manipule directement les tables NAT du noyau. Un port publié via `-p` peut donc rester exposé même si un pare-feu semble le bloquer — il faut configurer Docker lui-même (`daemon.json`, ou bind sur `127.0.0.1` uniquement) plutôt que de compter sur le pare-feu système seul.

## `host` : sortir de l'isolation réseau

```bash
docker run --network host nginx
```

Le conteneur partage directement les interfaces réseau de l'hôte — pas de NAT, pas de mapping de port (`nginx` écoutera directement sur le port 80 de l'hôte). Gain de performance réseau, mais **perte totale d'isolation réseau** : à réserver à des cas précis (outils de diagnostic réseau, très haute performance), pas un usage par défaut.

## Résolution DNS entre conteneurs

Sur un réseau personnalisé, chaque conteneur peut joindre les autres par leur **nom** (ou l'alias fourni via `--network-alias`) :

```bash
docker network create mon-reseau
docker run -d --network mon-reseau --name db postgres
docker run --network mon-reseau alpine ping db     # résolution DNS automatique
```

## Ce qu'il faut retenir

- Toujours créer un **réseau dédié** (`docker network create`) plutôt que de compter sur le bridge par défaut, qui ne fait pas de résolution DNS entre conteneurs.
- `-p hôte:conteneur` publie un port — attention, ça manipule directement les règles NAT du noyau et peut **contourner** un pare-feu configuré à côté.
- `--network host` supprime toute isolation réseau (performance maximale, sécurité minimale) ; `--network none` fait l'inverse.
- Un conteneur peut appartenir à plusieurs réseaux à la fois, pattern courant pour isoler un frontend public d'un backend privé.
