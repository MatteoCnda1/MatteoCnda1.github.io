---
id: 029-rngd
title: rngd — Gestion d'entropie matérielle
sidebar_position: 29
tags: [linux, services, systeme]
---

# rngd

**rngd** (`rng-tools`) alimente le pool d'entropie du noyau à partir d'une **source matérielle** de nombres aléatoires : TPM, instruction CPU `RDRAND`/`RDSEED`, ou générateur matériel dédié exposé via `/dev/hwrng`. Contrairement à [haveged](./028-haveged.md) qui simule de l'aléa via le jitter d'exécution, rngd relaie une source physiquement conçue pour ça — quand elle est disponible et jugée fiable.

## Installation

```bash
# Debian/Ubuntu
sudo apt install rng-tools5

# Fedora/RHEL
sudo dnf install rng-tools

sudo systemctl enable --now rngd
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/default/rng-tools5` (Debian) ou `/etc/sysconfig/rngd` (RHEL) | Source à utiliser (`/dev/hwrng` par défaut), options de démarrage |
| `/dev/hwrng` | Périphérique exposant la source matérielle d'entropie (TPM, RDRAND via le driver kernel) |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status rngd` | État du démon |
| `rngd -f -v` | Lancer en avant-plan, verbeux (debug) |
| `cat /sys/class/misc/hw_random/rng_available` | Sources matérielles détectées par le noyau |
| `cat /sys/class/misc/hw_random/rng_current` | Source actuellement utilisée |
| `cat /proc/sys/kernel/random/entropy_avail` | Niveau d'entropie du pool |

## Exemple de configuration

```bash
# /etc/default/rng-tools5
HRNGDEVICE=/dev/hwrng
```

Force explicitement l'utilisation du device matériel plutôt qu'une source détectée automatiquement — utile si plusieurs sources sont disponibles et qu'on veut garantir laquelle est utilisée.

## Sécurisation

- Toujours vérifier la source réellement utilisée (`rng_current`) : sur une VM sans passthrough TPM ni support RDRAND exposé, `/dev/hwrng` peut être absent et rngd ne rien apporter.
- Ne jamais faire confiance aveuglément à une source matérielle non documentée/auditée pour des usages cryptographiques critiques — préférer une source dont l'implémentation a été publiquement analysée (RDRAND/RDSEED Intel/AMD, TPM 2.0 certifié).
- Sur les systèmes modernes, le CRNG du noyau (5.6+) mélange déjà plusieurs sources d'entropie (dont RDRAND directement) : rngd reste utile surtout en environnement virtualisé ou embarqué où l'entropie native est plus incertaine.

## Logs & dépannage

```bash
journalctl -u rngd
cat /sys/class/misc/hw_random/rng_available   # rien listé = pas de source matérielle exposée au kernel
```

Si rngd échoue au démarrage, la cause la plus fréquente est l'absence de `/dev/hwrng` (VM sans virtio-rng, ou driver TPM non chargé) — vérifier `dmesg | grep -i rng`.

## Voir aussi

- [haveged](./028-haveged.md) — alternative logicielle quand aucune source matérielle n'est disponible
