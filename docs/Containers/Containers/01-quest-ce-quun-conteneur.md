---
id: 01-quest-ce-quun-conteneur
title: Qu'est-ce qu'un conteneur ?
sidebar_position: 1
tags: [conteneurs, linux]
---

# Qu'est-ce qu'un conteneur ?

> Un conteneur n'est **pas une mini-machine virtuelle**. C'est un processus Linux normal, auquel on a restreint la vue du système avec des mécanismes du noyau. Comprendre ça change tout : pas d'hyperviseur, pas de second noyau, juste de l'isolation.

## Conteneur vs machine virtuelle

```text
Machines virtuelles                    Conteneurs

┌─────────┐ ┌─────────┐               ┌─────────┐ ┌─────────┐
│  App A  │ │  App B  │               │  App A  │ │  App B  │
├─────────┤ ├─────────┤               ├─────────┤ ├─────────┤
│ Bins/Libs│ │Bins/Libs│               │ Bins/Libs│ │Bins/Libs│
├─────────┤ ├─────────┤               └────┬────┘ └────┬────┘
│ Guest OS│ │ Guest OS│                     │           │
├─────────┴─┴─────────┤               ┌─────┴───────────┴─────┐
│      Hyperviseur      │               │   Moteur de conteneurs │
├────────────────────────┤               │  (Docker/containerd)   │
│    OS hôte / matériel   │               ├────────────────────────┤
└────────────────────────┘               │  Noyau Linux (partagé)  │
                                          ├────────────────────────┤
                                          │    OS hôte / matériel   │
                                          └────────────────────────┘
```

- **VM** : chaque VM embarque son propre noyau, virtualisé par un hyperviseur (KVM, ESXi...). Isolation forte mais lourde — démarrage en dizaines de secondes, gigaoctets par VM.
- **Conteneur** : tous les conteneurs **partagent le noyau de l'hôte**. Ce qui les isole, ce ne sont pas des couches de virtualisation matérielle, mais des fonctionnalités du noyau Linux lui-même. Démarrage en millisecondes, quelques mégaoctets.

## Les trois piliers techniques

Un conteneur, techniquement, c'est un processus Linux normal (visible avec `ps` depuis l'hôte) combiné à trois mécanismes noyau :

1. **Les namespaces** — donnent au processus une vue *isolée* du système : sa propre liste de processus, sa propre pile réseau, son propre système de fichiers monté... Voir [Namespaces](../Namespaces/index.md).
2. **Les cgroups** (control groups) — *limitent* les ressources que le processus peut consommer (CPU, RAM, I/O disque, nombre de processus). Voir [cgroups](../cgroups/index.md).
3. **Les capabilities** — *réduisent* les pouvoirs que le processus a même s'il tourne en root dans le conteneur, en découpant les super-pouvoirs de root en droits granulaires. Voir [Capabilities](../Capabilities/index.md).

En complément, **seccomp** filtre les appels système autorisés, et le système de fichiers en **union filesystem** (overlay2) donne au conteneur l'illusion d'un disque complet à partir de couches d'image empilées.

```text
   Processus "conteneurisé"
   ┌──────────────────────────────────────────┐
   │  Vue isolée du système                    │
   │  (namespaces : PID, réseau, mount, ...)   │  ← isolation
   ├──────────────────────────────────────────┤
   │  Ressources plafonnées (CPU, RAM, I/O)    │  ← cgroups
   ├──────────────────────────────────────────┤
   │  Pouvoirs réduits (même en "root")        │  ← capabilities
   ├──────────────────────────────────────────┤
   │  Appels système filtrés                   │  ← seccomp
   └──────────────────────────────────────────┘
                     │
                     ▼
         Noyau Linux unique de l'hôte
```

## Pourquoi ça a émergé maintenant

Ces mécanismes (namespaces, cgroups) existent dans le noyau Linux depuis le milieu des années 2000 — ils ne sont pas nouveaux. Ce qui a changé, c'est l'apparition d'outils qui les assemblent et les rendent utilisables simplement :

- **LXC** (2008) — premier outil grand public à combiner namespaces + cgroups pour offrir des "conteneurs système" proches d'une VM légère.
- **Docker** (2013) — popularise le conteneur *applicatif* (un conteneur = un process/service, pas un mini-OS complet), avec en plus le concept d'**image** portable et versionnée (voir [Images](../Images/index.md)) et un écosystème complet (registre, CLI, orchestration).
- **OCI** (2015) — standardise le format d'image et le runtime pour que l'écosystème ne dépende plus d'un seul projet. Voir [OCI](../OCI/index.md).

## Conteneur applicatif vs conteneur système

- **Conteneur applicatif** (approche Docker) : un conteneur fait tourner **un seul processus principal** (ex. un serveur nginx), est **éphémère** et **stateless** par défaut (les données persistantes vont dans un [volume](../Volumes/index.md)), et est reconstruit plutôt que mis à jour en place.
- **Conteneur système** (approche LXC) : un conteneur se comporte comme une **machine complète** avec son propre init, plusieurs processus, ses propres services — plus proche d'une VM légère qu'un simple conteneur applicatif.

## Ce qu'il faut retenir

- Un conteneur est un **processus Linux isolé**, pas une VM : il n'y a **qu'un seul noyau**, partagé par l'hôte et tous les conteneurs.
- L'isolation vient de trois briques du noyau : **namespaces** (vue isolée), **cgroups** (ressources limitées), **capabilities** (pouvoirs réduits) — complétées par **seccomp** (filtrage syscalls).
- Docker a popularisé le conteneur **applicatif** (un processus, éphémère) ; LXC propose des conteneurs **système** (plus proches d'une VM légère).
