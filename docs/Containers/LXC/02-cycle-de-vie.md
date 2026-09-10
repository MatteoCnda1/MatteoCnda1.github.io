---
id: 02-cycle-de-vie
title: Cycle de vie d'un conteneur LXC
sidebar_position: 3
tags: [conteneurs, linux]
---

# Cycle de vie d'un conteneur LXC

> Contrairement à un conteneur Docker (pensé pour être jetable), un conteneur LXC est pensé pour être **persistant et administré comme une machine** — le cycle de vie reflète cette différence.

## Les états

```text
                lxc-create
   ────────────────────────▶  STOPPED
                                 │  │
                    lxc-start    │  │
                                 ▼  │
                              RUNNING
                                 │  │
                     lxc-freeze │  │  lxc-stop
                                 ▼  │
                              FROZEN │
                                 │  │
                   lxc-unfreeze │  │
                                 ▼  ▼
                              RUNNING → STOPPED

                  lxc-destroy (depuis STOPPED)
                                 │
                                 ▼
                            (supprimé)
```

- **STOPPED** : le conteneur existe sur disque (son rootfs, sa config) mais ne tourne pas.
- **RUNNING** : l'init du conteneur (systemd, généralement) tourne, avec tous ses services.
- **FROZEN** : tous les processus du conteneur sont gelés (cgroup freezer), comme une mise en pause — état intermédiaire, pas un arrêt.

## De la création à la suppression

```bash
# 1. Créer un conteneur à partir d'un template/image (voir cours suivant pour le détail)
lxc-create -n mon-conteneur -t download -- -d debian -r bookworm -a amd64

# 2. Démarrer
lxc-start -n mon-conteneur

# 3. Vérifier l'état
lxc-info -n mon-conteneur
lxc-ls --fancy

# 4. Interagir (voir cours suivant pour le détail de toutes les commandes)
lxc-attach -n mon-conteneur

# 5. Arrêter proprement (envoie un signal d'arrêt à l'init, comme un shutdown normal)
lxc-stop -n mon-conteneur

# 6. Supprimer définitivement (doit être arrêté)
lxc-destroy -n mon-conteneur
```

## Où vit un conteneur LXC

Contrairement à Docker (couches d'image + couche inscriptible en `overlay2`), un conteneur LXC classique a par défaut un **système de fichiers racine dédié et complet**, stocké sous `/var/lib/lxc/<nom>/rootfs/` (emplacement variable selon le backend de stockage choisi) :

```text
/var/lib/lxc/mon-conteneur/
├── config              (fichier de configuration : réseau, limites, montages...)
└── rootfs/             (système de fichiers complet : /bin, /etc, /var, /home...)
    ├── bin/
    ├── etc/
    ├── var/
    └── ...
```

C'est cohérent avec la philosophie "conteneur système" : pas de notion de couches réutilisables entre conteneurs par défaut (sauf backends de stockage avancés comme `zfs`/`btrfs`/`overlayfs` qui permettent des clones légers — voir [LXD & Incus](./04-lxd-incus.md), qui gère ça nativement).

## Arrêt propre vs forcé

```bash
lxc-stop -n mon-conteneur              # envoie un signal d'arrêt normal (shutdown)
lxc-stop -n mon-conteneur --kill       # arrêt immédiat, sans laisser le temps aux services de se terminer
lxc-stop -n mon-conteneur --timeout 30 # attendre 30s avant de forcer
```

## Geler un conteneur

Utile pour un instantané cohérent (par exemple juste avant un `lxc-snapshot`, voir la [référence de commandes](./03-reference-commandes-lxc.md)), sans arrêter réellement les services :

```bash
lxc-freeze -n mon-conteneur
lxc-info -n mon-conteneur      # State: FROZEN
lxc-unfreeze -n mon-conteneur
```

## Ce qu'il faut retenir

- Cycle : **STOPPED → RUNNING → (FROZEN) → STOPPED → détruit**, `lxc-create`/`lxc-destroy` gérant la création/suppression du rootfs sur disque.
- Un conteneur LXC classique a un **rootfs complet et dédié** (pas de couches d'image comme Docker), stocké sous `/var/lib/lxc/<nom>/`.
- `lxc-stop` fait un arrêt propre (signal de shutdown) par défaut ; `--kill` force un arrêt immédiat.
