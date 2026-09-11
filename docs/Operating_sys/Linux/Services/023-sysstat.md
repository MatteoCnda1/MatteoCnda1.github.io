---
id: 023-sysstat
title: sysstat — statistiques système
sidebar_position: 23
tags: [linux, services, monitoring]
---

# sysstat

`sysstat` est une suite d'outils de collecte et d'analyse de statistiques système (CPU, mémoire, disque, réseau) : `sar`, `iostat`, `mpstat`, `pidstat`, `vmstat`-like. Un composant (`sadc`) collecte les métriques périodiquement en arrière-plan via un timer, ce qui permet ensuite de consulter l'**historique** de charge d'une machine (pas seulement l'instant présent).

## Installation

```bash
sudo apt install sysstat
sudo dnf install sysstat

# Activer la collecte périodique (souvent désactivée par défaut sur Debian/Ubuntu)
sudo systemctl enable --now sysstat
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/default/sysstat` (Debian) ou `/etc/sysconfig/sysstat` (RHEL) | Active/désactive la collecte, durée de rétention |
| `/etc/cron.d/sysstat` ou timers systemd (`sysstat-collect.timer`, `sysstat-summary.timer`) | Fréquence de collecte (par défaut toutes les 10 min) |
| `/var/log/sysstat/` (ou `/var/log/sa/`) | Fichiers binaires de données collectées, un par jour (`saDD`) |

## Commandes utiles

```bash
sar -u 1 5                # utilisation CPU, 5 échantillons toutes les 1s
sar -r                     # mémoire
sar -d                     # activité disque
sar -n DEV                 # activité réseau par interface
sar -f /var/log/sysstat/sa15   # rejouer les données collectées le 15 du mois

iostat -xz 1               # I/O disque détaillé, rafraîchi chaque seconde
mpstat -P ALL 1            # utilisation par cœur CPU
pidstat 1                  # statistiques par processus
```

## Exemple de configuration

```
# /etc/default/sysstat (Debian/Ubuntu)
ENABLED="true"
```

```
# Fréquence de collecte (crontab historique, remplacé par des timers sur les distros récentes)
*/10 * * * * root /usr/lib/sysstat/debian-sa1 1 1
```

## Sécurisation

- Les fichiers de données `sa*` peuvent révéler l'activité (charge, horaires de pic) d'un serveur — restreindre leur lecture aux administrateurs (`/var/log/sysstat` en `750`).
- Purger régulièrement l'historique (`HISTORY=` dans la config) pour limiter la rétention et l'espace disque utilisé.
- Outil purement passif/lecture seule — pas de surface d'attaque réseau, risque limité à la confidentialité des données collectées.

## Logs & dépannage

```bash
systemctl status sysstat
journalctl -u sysstat
sar -A                     # dump complet de toutes les stats disponibles pour la journée en cours, utile en diagnostic post-incident
```

## Voir aussi

- [acct](./024-acct.md) — complète sysstat avec un suivi par utilisateur/processus plutôt que système global
