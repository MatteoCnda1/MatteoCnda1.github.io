---
id: 002-cron
title: cron — Tâches planifiées
sidebar_position: 2
tags: [linux, services, systeme]
---

# cron — Tâches planifiées

`cron` (démon `crond`/`cron`) exécute des commandes à intervalles réguliers définis par une syntaxe de crontab. C'est le planificateur de tâches historique et le plus répandu sous Unix/Linux, alternative plus simple aux timers systemd pour la majorité des usages classiques (sauvegardes, rotation, scripts de maintenance).

## Installation

```bash
sudo apt install cron          # Debian/Ubuntu (souvent déjà présent)
sudo dnf install cronie        # Fedora/RHEL
sudo pacman -S cronie          # Arch

sudo systemctl enable --now cron    # Debian/Ubuntu
sudo systemctl enable --now crond   # RHEL/Fedora/Arch
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/crontab` | Crontab système (avec colonne utilisateur) |
| `/etc/cron.d/` | Fragments de crontab système (paquets tiers) |
| `/etc/cron.{hourly,daily,weekly,monthly}/` | Scripts exécutés automatiquement à ces fréquences |
| `/var/spool/cron/crontabs/<user>` | Crontab personnelle d'un utilisateur (éditée via `crontab -e`) |
| `/etc/cron.allow` / `/etc/cron.deny` | Liste blanche/noire des utilisateurs autorisés à avoir une crontab |

## Commandes utiles

```bash
crontab -e            # éditer sa propre crontab
crontab -l             # lister sa crontab
crontab -u alice -e    # éditer la crontab d'un autre utilisateur (root requis)
crontab -r              # supprimer sa crontab (attention, sans confirmation)
systemctl status cron
```

## Exemple de configuration

```cron title="crontab -e"
# minute heure jour mois jour_semaine commande
0 3 * * *      /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
*/15 * * * *   /usr/local/bin/healthcheck.sh
0 0 1 * *      /usr/local/bin/rapport-mensuel.sh
```

Sauvegarde tous les jours à 3h, healthcheck toutes les 15 minutes, rapport le 1er de chaque mois à minuit.

## Sécurisation

- Toujours rediriger stdout/stderr (`>> log 2>&1`) : une tâche cron qui échoue silencieusement est le piège classique.
- Restreindre qui peut avoir une crontab via `/etc/cron.allow` (liste blanche) plutôt que `/etc/cron.deny`.
- Utiliser des **chemins absolus** dans les scripts : cron n'a pas le `$PATH` complet d'un shell interactif.
- Éviter de mettre des secrets en clair dans une crontab lisible par plusieurs utilisateurs ; préférer un fichier de variables d'environnement à permissions restreintes, sourcé par le script.

## Logs & dépannage

```bash
journalctl -u cron -f                 # Debian/Ubuntu
journalctl -u crond -f                # RHEL/Fedora
grep CRON /var/log/syslog             # historique des exécutions (Debian)
run-parts --test /etc/cron.daily      # tester ce que /etc/cron.daily exécuterait
```

Cause fréquente de « ça marche en manuel mais pas en cron » : environnement (`$PATH`, variables) différent — toujours tester avec `env -i` pour reproduire l'environnement minimal de cron.

## Voir aussi

- [atd](./003-atd.md) — exécution différée ponctuelle plutôt que récurrente
- [systemd-timesyncd](./004-systemd-timesyncd.md)
