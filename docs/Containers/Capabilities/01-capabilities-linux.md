---
id: 01-capabilities-linux
title: Capabilities Linux
sidebar_position: 1
tags: [conteneurs, linux, cybersecurite]
---

# Capabilities Linux

> Historiquement sous Unix, un processus est soit **root** (tous les pouvoirs), soit un **utilisateur normal** (aucun pouvoir spécial) — un modèle binaire, tout ou rien. Les *capabilities* découpent les super-pouvoirs de root en une trentaine de droits granulaires, qu'on peut accorder ou retirer indépendamment.

## Le problème que ça résout

Beaucoup de programmes ont besoin d'**un seul** privilège root pour fonctionner — par exemple, `ping` a besoin de créer un socket réseau brut (`CAP_NET_RAW`), sans avoir besoin de pouvoir monter des systèmes de fichiers ou charger des modules noyau. Avant les capabilities, la seule solution était de lancer le programme entièrement en root (setuid), lui donnant *tous* les pouvoirs pour n'en utiliser qu'un seul — un manque flagrant au principe de **moindre privilège**.

```text
Modèle Unix classique                 Modèle avec capabilities

   root                                   root
    │ tous les pouvoirs                    │
    ▼                                      ├── CAP_NET_RAW        (sockets bruts)
 processus                                 ├── CAP_NET_BIND_SERVICE (ports < 1024)
 (tout ou rien)                            ├── CAP_SYS_ADMIN      (admin système, très large)
                                            ├── CAP_CHOWN          (changer propriétaire)
   user                                    ├── CAP_DAC_OVERRIDE   (ignorer les permissions fichiers)
    │ aucun pouvoir                        └── ... (~40 capabilities au total)
    ▼                                              │
 processus                                         ▼
                                        processus avec UNE ou QUELQUES
                                        capabilities précises, sinon
                                        aucun privilège root
```

## Le lien avec les conteneurs

Un conteneur Docker tourne souvent avec l'utilisateur `root` **à l'intérieur** du conteneur (par défaut, sauf configuration contraire — voir [Container Security](../Container_security/index.md)). Sans les capabilities, ce root aurait potentiellement tous les pouvoirs sur le système — y compris ceux qui permettraient de s'évader du conteneur. Docker retire donc par défaut la grande majorité des capabilities dangereuses, ne laissant qu'un **sous-ensemble restreint** suffisant pour la plupart des usages applicatifs.

## Quelques capabilities importantes

| Capability | Pouvoir accordé |
|---|---|
| `CAP_CHOWN` | Changer le propriétaire de n'importe quel fichier |
| `CAP_DAC_OVERRIDE` | Ignorer les vérifications de permissions fichiers (lecture/écriture/exécution) |
| `CAP_NET_BIND_SERVICE` | Se lier à un port réseau < 1024 sans être root complet |
| `CAP_NET_RAW` | Créer des sockets bruts (utilisé par `ping`, des sniffers) |
| `CAP_SETUID` / `CAP_SETGID` | Changer l'UID/GID du processus |
| `CAP_SYS_ADMIN` | Fourre-tout très large (montages, namespaces, etc.) — quasi équivalent à root, à éviter |
| `CAP_SYS_PTRACE` | Tracer/déboguer d'autres processus (`strace`, `gdb`) |
| `CAP_SYS_MODULE` | Charger des modules dans le noyau — très dangereux dans un conteneur |

`CAP_SYS_ADMIN` et `CAP_SYS_MODULE` sont particulièrement sensibles : elles permettent quasiment de sortir de l'isolation du conteneur si elles sont accordées.

## Gérer les capabilities avec Docker

Par défaut, Docker conserve un ensemble restreint (environ 14 capabilities) et retire le reste. On peut ajuster finement :

```bash
# Retirer une capability précise
docker run --cap-drop=NET_RAW nginx

# Retirer TOUTES les capabilities, puis n'en ajouter qu'une seule (principe de moindre privilège)
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE mon-app

# À l'opposé, --privileged donne TOUTES les capabilities + désactive
# seccomp/AppArmor + accès aux périphériques de l'hôte : à éviter en
# production, réservé au debug/CI
docker run --privileged ...
```

## Inspecter les capabilities

```bash
# Voir les capabilities d'un processus en cours (depuis l'hôte ou dans le conteneur)
getpcaps <PID>

# Auditer les fichiers avec des capabilities attachées (setuid moderne)
getcap -r / 2>/dev/null
```

## Ce qu'il faut retenir

- Les capabilities découpent les pouvoirs de **root** en droits granulaires (~40), au lieu du modèle tout-ou-rien classique — application du **principe de moindre privilège**.
- Docker retire par défaut la plupart des capabilities dangereuses ; `--cap-drop=ALL --cap-add=<uniquement le nécessaire>` est la pratique recommandée.
- `CAP_SYS_ADMIN` et `CAP_SYS_MODULE` sont quasi équivalentes à un accès root complet — à éviter absolument dans un conteneur.
- `--privileged` désactive toute cette protection (capabilities + seccomp + AppArmor) : à n'utiliser qu'en dernier recours, jamais en production sur du code non maîtrisé.
