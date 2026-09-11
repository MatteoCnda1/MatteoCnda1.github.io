---
id: 028-haveged
title: haveged — Génération d'entropie
sidebar_position: 28
tags: [linux, services, systeme]
---

# haveged

**haveged** est un démon qui alimente le pool d'entropie du noyau en exploitant les variations imprévisibles du timing d'exécution du CPU (jitter matériel), quand les sources d'entropie classiques (interruptions clavier/souris/disque) sont insuffisantes — typiquement sur des serveurs headless ou des VM/conteneurs, où le manque d'entropie peut ralentir voire bloquer des opérations cryptographiques au démarrage (génération de clés SSH, TLS...).

## Installation

```bash
# Debian/Ubuntu
sudo apt install haveged

# Fedora/RHEL
sudo dnf install haveged

sudo systemctl enable --now haveged
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/default/haveged` (Debian) | Options de démarrage (seuil bas de la watermark, verbosité) |
| `/proc/sys/kernel/random/entropy_avail` | Niveau d'entropie disponible dans le pool du noyau (lecture, pas config) |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status haveged` | État du démon |
| `cat /proc/sys/kernel/random/entropy_avail` | Vérifier le niveau d'entropie actuel |
| `haveged -w 1024 -v 1 -F` | Lancer en avant-plan, verbeux, sans démoniser (debug) |

## Exemple de configuration

```bash
# /etc/default/haveged
DAEMON_ARGS="-w 1024"
```

`-w 1024` fixe la watermark basse à 1024 bits : haveged réalimente le pool dès que l'entropie disponible descend sous ce seuil.

## Sécurisation

- Depuis le noyau Linux 5.6+, le générateur `getrandom()`/CRNG intégré s'initialise de façon beaucoup plus fiable qu'auparavant (notamment via l'instruction CPU `RDRAND`/`RDSEED` sur x86 récent), réduisant fortement l'utilité réelle de haveged sur les systèmes modernes.
- haveged reste pertinent sur des VM/conteneurs anciens, des architectures sans RDRAND, ou pendant le tout premier boot avant que le CRNG kernel soit jugé « initialisé ».
- Ne pas considérer haveged comme une source cryptographiquement certifiée au même titre qu'un TRNG matériel dédié (voir [rngd](./029-rngd.md)) — c'est un palliatif logiciel, pas une racine de confiance matérielle.

## Logs & dépannage

```bash
journalctl -u haveged
cat /proc/sys/kernel/random/entropy_avail   # doit rester proche de 256 (max du pool) une fois haveged actif
```

Si une application se bloque au démarrage en attendant de l'entropie (`getrandom()` bloquant), vérifier que haveged (ou une alternative comme `jitterentropy-rngd`) est bien actif avant le service concerné dans l'ordre de démarrage systemd.

## Voir aussi

- [rngd](./029-rngd.md) — alternative/complément s'appuyant sur une source d'entropie matérielle (TPM, RDRAND) plutôt que sur le jitter CPU
