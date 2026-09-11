---
id: 027-irqbalance
title: irqbalance — Optimisation des interruptions CPU
sidebar_position: 27
tags: [linux, services, systeme]
---

# irqbalance

**irqbalance** répartit dynamiquement les interruptions matérielles (IRQ) entre les cœurs CPU disponibles, au lieu de les laisser toutes s'accumuler sur le CPU 0 par défaut. Sur un serveur avec beaucoup de trafic réseau ou d'I/O disque, ça évite qu'un seul cœur devienne un goulot d'étranglement pendant que les autres restent inactifs.

## Installation

```bash
# Debian/Ubuntu
sudo apt install irqbalance

# Fedora/RHEL
sudo dnf install irqbalance

sudo systemctl enable --now irqbalance
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/default/irqbalance` (Debian) ou `/etc/sysconfig/irqbalance` (RHEL) | Options de démarrage du démon |
| `/proc/interrupts` | État courant des IRQ et de leur répartition (lecture seule, pas un fichier de config) |
| `/proc/irq/<n>/smp_affinity` | Affinité CPU d'une IRQ spécifique (peut être fixée manuellement, irqbalance la respecte si `IRQBALANCE_BANNED_CPUS` l'exclut) |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status irqbalance` | État du démon |
| `irqbalance --debug` | Lancer en avant-plan avec logs détaillés (diagnostic) |
| `cat /proc/interrupts` | Voir la répartition actuelle des IRQ par CPU |
| `watch -n1 'cat /proc/interrupts'` | Observer la répartition en temps réel |

## Exemple de configuration

```bash
# /etc/default/irqbalance
IRQBALANCE_ARGS="--banirq=45"
```

Exclut l'IRQ 45 de la répartition automatique (utile si elle doit rester épinglée manuellement sur un CPU dédié, par exemple pour une carte réseau à faible latence).

## Sécurisation

Pas d'enjeu de sécurité directe — irqbalance est un outil de performance/fiabilité, pas d'exposition réseau. Bonnes pratiques d'exploitation :

- Sur des serveurs avec isolation de CPU pour des workloads temps réel (`isolcpus`, NUMA pinning), désactiver irqbalance ou le configurer pour bannir les CPU isolés (`IRQBALANCE_BANNED_CPUS`), sinon il peut réaffecter des IRQ sur ces cœurs et casser l'isolation voulue.
- Sur les VM avec peu de vCPU (1-2), irqbalance apporte peu de valeur et peut être désactivé.

## Logs & dépannage

```bash
journalctl -u irqbalance
irqbalance --debug          # voir en direct les décisions de répartition
cat /proc/interrupts        # constater si un CPU reste anormalement chargé
```

Si un seul cœur reste saturé malgré irqbalance actif, vérifier qu'aucune règle manuelle (`smp_affinity` fixée en dur, ou `IRQBALANCE_BANNED_CPUS`) n'empêche la réaffectation.
