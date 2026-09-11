---
id: 016-fail2ban
title: fail2ban — protection contre les attaques
sidebar_position: 16
tags: [linux, services, securite]
---

# fail2ban — protection contre les attaques

`fail2ban` surveille les fichiers de logs (SSH, HTTP, mail...) et **bannit dynamiquement** (via le pare-feu) les adresses IP qui multiplient les échecs d'authentification, en réponse au brute force automatisé.

## Installation

```bash
sudo apt install fail2ban
sudo systemctl enable --now fail2ban
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/fail2ban/jail.conf` | Configuration par défaut (ne pas éditer directement) |
| `/etc/fail2ban/jail.local` | Surcharges locales (fichier à éditer) |
| `/etc/fail2ban/jail.d/*.local` | Surcharges par jail, une par fichier |
| `/etc/fail2ban/filter.d/` | Expressions régulières de détection par service |

## Commandes utiles

```bash
sudo systemctl status fail2ban
sudo fail2ban-client status
sudo fail2ban-client status sshd
sudo fail2ban-client set sshd unbanip 203.0.113.5
sudo fail2ban-client set sshd banip 203.0.113.5
```

## Exemple de configuration

```ini
# /etc/fail2ban/jail.local
[sshd]
enabled = true
port    = 22
filter  = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime  = 3600
findtime = 600
```

## Sécurisation

- Activer un `jail` dédié pour chaque service exposé (SSH, nginx-http-auth, postfix...), pas seulement SSH.
- `bantime` croissant (`bantime.increment = true`) pour pénaliser plus durement les récidivistes.
- Whitelister ses propres IP de gestion (`ignoreip`) pour ne pas se bannir soi-même.
- Combiner avec `ufw`/`nftables` : fail2ban ajoute des règles temporaires, il ne remplace pas une politique de pare-feu de base.

## Logs & dépannage

```bash
journalctl -u fail2ban
sudo tail -f /var/log/fail2ban.log
sudo fail2ban-client status sshd    # voir les IP actuellement bannies
```

## Voir aussi

- [Pare-feu — nftables, ufw, fail2ban](../Security/04-pare-feu-nftables-ufw-fail2ban.md) — cours complet, y compris l'intégration avec le pare-feu.
- [SSH — accès distant et durcissement](../Security/02-ssh-durcissement.md) — le service le plus souvent protégé par fail2ban.
