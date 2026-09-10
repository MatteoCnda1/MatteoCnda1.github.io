---
id: 01-installation-linux
title: Installation de LXC sur Linux
sidebar_position: 2
tags: [conteneurs, linux, outil]
---

# Installation de LXC sur Linux

## Installer les outils LXC bruts (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install lxc lxc-templates bridge-utils

# Vérifier que le système remplit les prérequis noyau
lxc-checkconfig
```

`lxc-checkconfig` liste chaque fonctionnalité noyau nécessaire (namespaces, cgroups, support des conteneurs non privilégiés...) avec un `enabled`/`missing` — un bon premier réflexe après installation pour repérer un noyau mal configuré.

## Réseau : préparer un bridge

Par défaut, `lxc-net` fournit un bridge (`lxcbr0`) avec NAT et un serveur DHCP intégré (dnsmasq), suffisant pour débuter :

```bash
sudo systemctl enable --now lxc-net
sudo systemctl status lxc-net
ip addr show lxcbr0     # doit avoir une IP (ex. 10.0.3.1)
```

## Autoriser les conteneurs non privilégiés (utilisateur normal)

Pour qu'un utilisateur autre que root puisse créer des conteneurs [non privilégiés](./00-introduction-concepts.md#conteneurs-privilégiés-vs-non-privilégiés) (recommandé, voir le cours précédent), il faut lui attribuer une plage d'UID/GID dédiée via `subuid`/`subgid` :

```bash
# Vérifier / ajouter une plage de sub-UID et sub-GID pour son utilisateur
sudo usermod --add-subuids 100000-165536 --add-subgids 100000-165536 $USER
cat /etc/subuid
cat /etc/subgid

# Autoriser son utilisateur à utiliser des bridges réseau existants
echo "$USER veth lxcbr0 10" | sudo tee -a /etc/lxc/lxc-usernet
```

## Installer LXD ou Incus (recommandé pour l'usage quotidien)

Comme vu dans le cours [Introduction & concepts](./00-introduction-concepts.md), LXD/Incus est la couche de gestion à privilégier en pratique.

```bash
# Sur Debian 13+ : Incus est disponible directement via apt
sudo apt install incus
sudo usermod -aG incus-admin $USER      # se reconnecter ensuite

# Sur Ubuntu : LXD s'installe généralement via snap
sudo snap install lxd
sudo usermod -aG lxd $USER
```

Après installation, une étape d'initialisation configure le stockage et le réseau par défaut :

```bash
# Incus
incus admin init

# LXD
lxd init
```

Un assistant interactif pose quelques questions (backend de stockage — `zfs`, `btrfs`, ou simple répertoire ; création d'un bridge réseau ; activation de l'écoute réseau pour la gestion à distance). Répondre par les valeurs par défaut convient pour un usage local simple.

## Vérifier l'installation

```bash
# Outils bruts
sudo lxc-ls --fancy

# LXD/Incus
incus list        # ou : lxc list  (avec LXD)
incus info
```

## Ce qu'il faut retenir

- `lxc-checkconfig` valide que le noyau supporte tout ce dont LXC a besoin — à lancer juste après l'installation.
- Les conteneurs **non privilégiés** nécessitent une plage `subuid`/`subgid` attribuée à l'utilisateur (`usermod --add-subuids/--add-subgids`).
- En pratique, installer directement **Incus** (ou LXD) plutôt que de rester aux outils `lxc-*` bruts — `incus admin init`/`lxd init` configure stockage et réseau en quelques questions.
