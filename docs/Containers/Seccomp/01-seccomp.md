---
id: 01-seccomp
title: Seccomp
sidebar_position: 1
tags: [conteneurs, linux, cybersecurite]
---

# Seccomp

> Seccomp (*secure computing mode*) est un mécanisme noyau qui **filtre les appels système (syscalls)** qu'un processus a le droit d'exécuter. Là où les [capabilities](../Capabilities/index.md) limitent *ce que root peut faire*, seccomp limite *quelles portes d'entrée vers le noyau* le processus a le droit d'utiliser du tout — capability ou pas.

## Pourquoi c'est nécessaire

Le noyau Linux expose environ **400 appels système**. Une application applicative classique (un serveur web, une API) n'en utilise réellement qu'une petite fraction — lire/écrire des fichiers, ouvrir des sockets, allouer de la mémoire. Le reste (créer des namespaces, charger des modules, manipuler des points de montage, appels obscurs hérités...) n'a souvent aucune raison d'être appelé par l'application, et représente une **surface d'attaque** en cas d'exploitation : si un attaquant arrive à exécuter du code arbitraire dans le conteneur, seccomp l'empêche d'appeler des syscalls dangereux même s'il a par ailleurs les capabilities pour le faire.

```text
                    Appel système demandé par le processus
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │      Filtre seccomp (BPF)       │
                    │  syscall autorisé ?              │
                    └───────────────────────────────┘
                         │                    │
                     OUI │                    │ NON
                         ▼                    ▼
                  Exécution normale      Processus tué / erreur
                  par le noyau           (EPERM) selon la politique
```

## Le profil par défaut de Docker

Docker applique automatiquement un **profil seccomp par défaut** à chaque conteneur, qui autorise en liste blanche (*allowlist*) environ 300 des ~400 syscalls, et bloque explicitement les plus dangereux — parmi lesquels :

- `mount` / `umount2` — monter/démonter des systèmes de fichiers
- `reboot` — redémarrer la machine hôte
- `init_module` / `delete_module` — charger/décharger des modules noyau
- `ptrace` — tracer/déboguer d'autres processus
- `clone` avec certains flags dangereux (création de nouveaux namespaces depuis l'intérieur du conteneur)

## Utiliser seccomp avec Docker

```bash
# Utiliser le profil par défaut de Docker (comportement normal)
docker run nginx

# Désactiver complètement seccomp (à éviter — perd toute la protection)
docker run --security-opt seccomp=unconfined nginx

# Utiliser un profil personnalisé (fichier JSON décrivant la liste blanche)
docker run --security-opt seccomp=/chemin/vers/profil.json nginx
```

Un profil seccomp personnalisé est un fichier JSON qui définit une action par défaut (`SCMP_ACT_ERRNO` pour bloquer, `SCMP_ACT_ALLOW` pour autoriser) et une liste d'exceptions. En pratique, on part quasi toujours du profil par défaut de Docker et on le restreint encore davantage pour une application spécifique, plutôt que d'en écrire un de zéro.

## Diagnostiquer un blocage seccomp

Quand une application se comporte bizarrement dans un conteneur (erreur `Operation not permitted` sur un appel qui marche très bien hors conteneur), seccomp est un suspect classique :

```bash
# Voir si le conteneur tourne avec un profil personnalisé ou "unconfined"
docker inspect <conteneur> --format '{{ .HostConfig.SecurityOpt }}'

# Journaux noyau : les refus seccomp y apparaissent parfois (selon la politique)
dmesg | grep -i seccomp
```

## Ce qu'il faut retenir

- Seccomp filtre **quels appels système** un processus peut exécuter — une couche indépendante des capabilities (qui filtrent *ce que root peut faire parmi les syscalls autorisés*).
- Docker applique un **profil par défaut** qui bloque déjà les syscalls les plus dangereux (`mount`, `reboot`, `init_module`, `ptrace`...).
- `--security-opt seccomp=unconfined` désactive cette protection : à réserver au debug, jamais en production.
- En cas de comportement anormal d'une app conteneurisée qui fonctionne hors conteneur, penser à vérifier seccomp (et [AppArmor](../../Operating_sys/Linux/Security/appArmor.md)) parmi les suspects.
