---
id: 00-introduction-concepts
title: Introduction & concepts LXC
sidebar_position: 1
tags: [conteneurs, linux]
---

# Introduction & concepts LXC

> **LXC** (LinuX Containers, 2008) est le projet qui a le premier rendu utilisables, via une CLI simple, les mécanismes noyau (namespaces + cgroups) déjà vus dans [Qu'est-ce qu'un conteneur ?](../Containers/01-quest-ce-quun-conteneur.md). Docker s'est d'ailleurs appuyé sur `liblxc` à ses tout débuts (avant de développer son propre runtime, `libcontainer`, devenu `runc`).

## Conteneur système : la philosophie LXC

Comme évoqué dans le cours sur les fondamentaux des conteneurs, il existe deux grandes philosophies :

```text
   Approche Docker (conteneur applicatif)     Approche LXC (conteneur système)

   ┌───────────────────────┐                  ┌───────────────────────┐
   │   PID 1 = l'application │                  │   PID 1 = init/systemd  │
   │   (ex: nginx)            │                  │   (comme une vraie      │
   │                           │                  │    machine)              │
   │   Un seul processus       │                  │   Plusieurs services :   │
   │   principal, éphémère     │                  │   sshd, cron, syslog,    │
   │   reconstruit plutôt      │                  │   application...         │
   │   que modifié              │                  │                          │
   │                           │                  │   Persistant, on s'y     │
   │   Pas d'accès SSH par     │                  │   connecte, on l'admin-  │
   │   défaut (image minimale) │                  │   istre comme une VM     │
   └───────────────────────┘                  └───────────────────────┘
```

Un conteneur LXC démarre un **init complet** (systemd, généralement) et se comporte comme une machine Linux à part entière : plusieurs processus, ses propres services, on peut s'y connecter en SSH, y installer des paquets, le mettre à jour — exactement comme une VM, sauf que ce n'est techniquement qu'un ensemble de [namespaces](../Namespaces/index.md) et de [cgroups](../cgroups/index.md) autour de processus qui partagent le noyau de l'hôte.

## LXC vs Docker : quand utiliser quoi

| | LXC | Docker |
|---|---|---|
| **Paradigme** | Conteneur *système* (VM légère) | Conteneur *applicatif* (un process) |
| **Init** | systemd/init complet, plusieurs processus | Généralement un seul processus |
| **Cycle de vie** | Persistant, administré comme une machine | Éphémère, reconstruit à partir d'une image |
| **Cas d'usage typique** | Remplacer des VM légères, labs réseau, hébergement multi-tenant | Packager et déployer une application |
| **Format de distribution** | Pas de format "image" portable standard (historiquement) | Image OCI standardisée, registres (Docker Hub...) |

Les deux reposent **exactement sur les mêmes briques noyau** (namespaces, cgroups) — la différence est entièrement dans la philosophie d'usage et l'outillage autour, pas dans le mécanisme d'isolation lui-même.

## LXC, LXD, Incus : ne pas confondre

C'est la source de confusion n°1 en 2026, donc à clarifier tout de suite :

- **LXC** = la bibliothèque bas niveau (`liblxc`) et son jeu d'outils historique en ligne de commande, préfixés `lxc-` (`lxc-create`, `lxc-start`, `lxc-ls`...). Gestion **locale uniquement**, un conteneur à la fois, pas d'API réseau.
- **LXD** = une couche de gestion développée par Canonical par-dessus LXC : démon avec API REST, CLI unifiée (`lxc launch`, `lxc list`...), gestion du stockage/réseau/clustering, images précompilées prêtes à l'emploi. C'est ce que la plupart des gens utilisent aujourd'hui en pratique plutôt que les outils `lxc-*` bruts.
- **Incus** = un **fork communautaire de LXD**, créé en 2023 sous l'égide du projet Linux Containers après des désaccords de gouvernance avec Canonical. Incus reprend l'essentiel de LXD (même CLI `incus`, quasi les mêmes commandes) et est devenu le choix par défaut sur de nombreuses distributions (Debian le propose nativement depuis Debian 13).

```text
   liblxc + lxc-*        (bas niveau, historique, un conteneur à la fois)
        │
        ▼
   LXD (Canonical)   ──fork 2023──▶   Incus (communautaire, Linux Containers)
   commande `lxc`                     commande `incus`
   (toujours maintenu)                (API/CLI quasi identiques à LXD)
```

Ce cours couvre : les outils **`lxc-*` bruts** (le socle, utile à comprendre même si on utilise LXD/Incus au quotidien — voir [Référence des commandes lxc-*](./03-reference-commandes-lxc.md)), puis la couche **LXD/Incus** qui est l'usage recommandé en pratique (voir [LXD & Incus](./04-lxd-incus.md)).

## Conteneurs privilégiés vs non privilégiés

- **Privilégié** : le root du conteneur correspond au **root réel de l'hôte** (UID 0 = UID 0). Plus de compatibilité, mais une évasion de conteneur donne directement les droits root sur l'hôte.
- **Non privilégié** (recommandé) : grâce au [user namespace](../Namespaces/index.md), le root du conteneur (UID 0 côté conteneur) est mappé vers un UID **non privilégié et sans pouvoir particulier** côté hôte (ex. UID 100000). Une évasion de conteneur ne donne alors accès qu'à un utilisateur ordinaire de l'hôte, pas à root.

```text
   Conteneur non privilégié           Vu depuis l'hôte

   root (UID 0)          ────────▶    UID 100000  (utilisateur ordinaire,
   utilisateur (UID 1000) ────────▶    UID 101000   aucun privilège spécial)
```

LXC (comme LXD/Incus) permet de créer des conteneurs non privilégiés facilement — une différence importante avec Docker, où le mode rootless doit être activé explicitement (voir [Container Security](../Container_security/index.md)).

## Ce qu'il faut retenir

- LXC repose sur les **mêmes briques noyau** que Docker (namespaces, cgroups) mais avec une philosophie **conteneur système** (persistant, multi-processus, comme une VM légère) plutôt qu'applicatif.
- Trois couches à distinguer : **LXC** (`liblxc` + `lxc-*`, bas niveau), **LXD** (Canonical, API + CLI `lxc`), **Incus** (fork communautaire de LXD en 2023, CLI `incus`).
- Les conteneurs **non privilégiés** (recommandés) mappent le root du conteneur vers un UID sans pouvoir sur l'hôte, via les user namespaces.
