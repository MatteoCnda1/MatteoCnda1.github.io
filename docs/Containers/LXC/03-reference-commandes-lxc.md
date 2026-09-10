---
id: 03-reference-commandes-lxc
title: Référence complète des commandes lxc-*
sidebar_position: 4
tags: [conteneurs, linux, outil, cheatsheet]
---

# Référence complète des commandes lxc-*

> Aide-mémoire des outils bas niveau `liblxc` (préfixés `lxc-`). Pour l'usage quotidien, la couche [LXD/Incus](./04-lxd-incus.md) est recommandée, mais connaître ces commandes reste utile pour comprendre ce qui se passe en dessous — et Incus/LXD s'appuient dessus.

## Créer un conteneur

```bash
# Lister les templates disponibles
ls /usr/share/lxc/templates/

# Le template "download" télécharge une image toute prête depuis
# le serveur d'images officiel du projet Linux Containers — le plus simple
lxc-create -n mon-conteneur -t download -- -d debian -r bookworm -a amd64
lxc-create -n mon-conteneur -t download -- -d ubuntu -r noble -a amd64

# Lister les distributions/versions disponibles sans en choisir une
lxc-create -n test -t download -- --list

# Créer un conteneur non privilégié en tant qu'utilisateur normal
# (nécessite la config subuid/subgid vue au cours précédent)
lxc-create -n mon-conteneur -t download -- -d debian -r bookworm -a amd64
```

## Lister et inspecter

```bash
lxc-ls                          # liste simple des noms
lxc-ls --fancy                  # avec état, IP, mémoire, uptime
lxc-ls --fancy --running        # uniquement ceux en cours d'exécution

lxc-info -n mon-conteneur       # état, PID, IP, utilisation mémoire/CPU
lxc-info -n mon-conteneur -s    # uniquement le state (résumé court)

lxc-top                         # vue temps réel façon "top", pour tous les conteneurs
```

## Cycle de vie

```bash
lxc-start -n mon-conteneur
lxc-start -n mon-conteneur -d           # en arrière-plan (défaut) explicite
lxc-start -n mon-conteneur -F           # au premier plan, logs visibles directement (debug)

lxc-stop -n mon-conteneur               # arrêt propre
lxc-stop -n mon-conteneur --kill        # arrêt immédiat
lxc-stop -n mon-conteneur --reboot      # redémarrer le conteneur

lxc-freeze -n mon-conteneur
lxc-unfreeze -n mon-conteneur

lxc-destroy -n mon-conteneur            # supprimer (doit être arrêté)
lxc-destroy -n mon-conteneur -f         # forcer (arrête puis supprime)
```

## Accéder à un conteneur

```bash
# Attacher un shell DANS le conteneur (comme docker exec), sans passer par le réseau
lxc-attach -n mon-conteneur
lxc-attach -n mon-conteneur -- whoami
lxc-attach -n mon-conteneur --clear-env -- env    # environnement propre, sans hériter de l'hôte

# Console : accès au terminal comme si on était physiquement devant la machine
# (utile même sans réseau fonctionnel dans le conteneur)
lxc-console -n mon-conteneur
# Pour se détacher sans arrêter le conteneur : Ctrl+A puis Q
```

`lxc-attach` (entre dans les namespaces via `nsenter`, comme `docker exec`) et `lxc-console` (émule une vraie console physique) répondent à des besoins différents : `lxc-attach` pour l'usage courant, `lxc-console` en dépannage quand le réseau du conteneur ne répond pas.

## Configuration

```bash
# Voir/modifier la config d'un conteneur (fichier /var/lib/lxc/<nom>/config)
lxc-config -n mon-conteneur -l          # lister toutes les clés définies
cat /var/lib/lxc/mon-conteneur/config

# Exemples de clés courantes dans le fichier config
# lxc.net.0.type = veth
# lxc.net.0.link = lxcbr0
# lxc.cgroup2.memory.max = 512M
# lxc.cgroup2.cpu.max = 50000 100000
```

## Cloner, copier et snapshots

```bash
# Copier un conteneur (clone indépendant, duplique le rootfs)
lxc-copy -n mon-conteneur -N mon-conteneur-clone

# Copier en clone "léger" (copy-on-write, nécessite un backend de stockage compatible : btrfs, zfs, overlayfs)
lxc-copy -n mon-conteneur -N mon-conteneur-clone -s

# Snapshots (nécessite un backend de stockage compatible)
lxc-snapshot -n mon-conteneur                    # créer un instantané
lxc-snapshot -n mon-conteneur -L                  # lister les instantanés
lxc-snapshot -n mon-conteneur -r snap0            # restaurer un instantané
lxc-snapshot -n mon-conteneur -d snap0            # supprimer un instantané
```

## Réseau

```bash
# Voir les interfaces réseau attachées à un conteneur en cours
lxc-info -n mon-conteneur -i          # affiche l'adresse IP

# Autoriser un utilisateur non privilégié à utiliser un bridge donné
# (fichier /etc/lxc/lxc-usernet, vu au cours d'installation)
cat /etc/lxc/lxc-usernet
```

## Exécution en tant qu'utilisateur non privilégié

```bash
# Exécuter une commande LXC dans le contexte user-namespace approprié
# (utile en scripting, moins nécessaire au quotidien avec des alias/config)
lxc-usernsexec -- lxc-create -n test -t download -- -d debian -r bookworm -a amd64
```

## Diagnostic

```bash
lxc-checkconfig                        # vérifie le support noyau (voir cours Installation)
sudo journalctl -u lxc-net             # logs du service réseau LXC
sudo journalctl -u lxc@mon-conteneur   # logs du conteneur, s'il est géré via un service systemd lxc@
```

## Tableau récapitulatif

| Commande | Rôle |
|---|---|
| `lxc-create` | Créer un conteneur à partir d'un template |
| `lxc-ls` | Lister les conteneurs |
| `lxc-info` | Informations détaillées sur un conteneur |
| `lxc-top` | Vue temps réel de la conso ressources, tous conteneurs |
| `lxc-start` / `lxc-stop` | Démarrer / arrêter |
| `lxc-freeze` / `lxc-unfreeze` | Geler / dégeler |
| `lxc-attach` | Exécuter une commande dans un conteneur en cours |
| `lxc-console` | Accéder à la console (comme un accès physique) |
| `lxc-config` | Lire la configuration |
| `lxc-copy` | Cloner un conteneur |
| `lxc-snapshot` | Gérer les instantanés |
| `lxc-destroy` | Supprimer définitivement |
| `lxc-checkconfig` | Vérifier le support noyau |
| `lxc-usernsexec` | Exécuter dans le contexte user-namespace non privilégié |

## Ce qu'il faut retenir

- `lxc-create`/`lxc-start`/`lxc-attach`/`lxc-stop`/`lxc-destroy` couvrent le cycle de vie de base — schéma identique à celui vu au [cours précédent](./02-cycle-de-vie.md).
- `lxc-attach` (entrer dans un conteneur en cours) et `lxc-console` (accès type console physique) répondent à des besoins différents.
- Clonage/snapshots (`lxc-copy`, `lxc-snapshot`) nécessitent un backend de stockage adapté (btrfs/zfs/overlayfs) pour être efficaces (copy-on-write) plutôt qu'une simple copie complète.
- Ces commandes restent la **base bas niveau** ; en usage courant, [LXD/Incus](./04-lxd-incus.md) offre une CLI plus riche par-dessus.
