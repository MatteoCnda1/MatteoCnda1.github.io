---
id: 084-dovecot
title: Dovecot — serveur IMAP/POP3
sidebar_position: 84
tags: [linux, services, mail]
---

# Dovecot — serveur IMAP/POP3

**Dovecot** est un agent de livraison de courrier (MDA) qui expose les boîtes mail aux clients via **IMAP** et **POP3**. Il complète un MTA comme [Postfix](./082-postfix.md) ou [Exim4](./083-exim4.md) : le MTA reçoit/route le mail, Dovecot le stocke et le sert au client (Thunderbird, Outlook, webmail...).

## Installation

```bash
sudo apt install dovecot-imapd dovecot-pop3d
sudo systemctl enable --now dovecot
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/dovecot/dovecot.conf` | Point d'entrée principal (inclut les autres fichiers) |
| `/etc/dovecot/conf.d/10-mail.conf` | Emplacement de stockage (Maildir/mbox) |
| `/etc/dovecot/conf.d/10-auth.conf` | Mécanismes d'authentification |
| `/etc/dovecot/conf.d/10-ssl.conf` | Configuration TLS |

## Commandes utiles

```bash
systemctl status dovecot
doveconf -n                    # config effective (non-défaut uniquement)
doveadm mailbox list -u user@example.com
doveadm reload                 # recharger la config sans coupure
```

## Exemple de configuration

```ini
# /etc/dovecot/conf.d/10-mail.conf
mail_location = maildir:~/Maildir

# /etc/dovecot/conf.d/10-ssl.conf
ssl = required
ssl_cert = </etc/ssl/certs/mail.crt
ssl_key = </etc/ssl/private/mail.key
```

## Sécurisation

- Forcer `ssl = required` — jamais d'authentification en clair sur le réseau.
- Désactiver les mécanismes d'authentification faibles (`disable_plaintext_auth = yes` hors TLS).
- Restreindre `login_trusted_networks` si Dovecot est derrière un proxy.
- Limiter les tentatives de connexion (protection brute force, via [fail2ban](./016-fail2ban.md) avec le filtre `dovecot`).

## Logs & dépannage

```bash
journalctl -u dovecot -f
tail -f /var/log/mail.log
doveconf -n                     # vérifier la config chargée
doveadm log errors
```

## Voir aussi

- [postfix](./082-postfix.md) — MTA typiquement couplé à Dovecot pour une stack mail complète
- [fail2ban](./016-fail2ban.md) — protection contre le bruteforce IMAP/POP3
