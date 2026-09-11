---
id: 082-postfix
title: Postfix — serveur SMTP
sidebar_position: 82
tags: [linux, services, mail]
---

# Postfix — serveur SMTP

**Postfix** est un agent de transfert de courrier (MTA) open source, conçu comme une alternative plus simple et plus sûre à Sendmail. C'est le MTA le plus utilisé sur les serveurs Linux modernes, pour l'envoi/réception de mails (relais SMTP applicatif, ou serveur mail complet couplé à Dovecot).

## Installation

```bash
sudo apt install postfix          # Debian/Ubuntu (assistant de config à l'install)
sudo dnf install postfix          # RHEL/Fedora
sudo systemctl enable --now postfix
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/postfix/main.cf` | Configuration principale (domaine, réseaux de confiance, TLS...) |
| `/etc/postfix/master.cf` | Définition des services (smtp, submission, pickup...) |
| `/etc/aliases` | Redirections d'adresses locales (`root: admin@example.com`) |
| `/etc/postfix/sender_canonical`, `virtual` | Réécriture d'adresses, domaines virtuels |

## Commandes utiles

```bash
systemctl status postfix
postfix check                 # vérifier la config
postconf mydomain             # lire un paramètre
postqueue -p                  # voir la file d'attente
postsuper -d ALL              # vider la file (attention)
mailq                         # alias de postqueue -p
```

## Exemple de configuration

```ini
# /etc/postfix/main.cf (extrait minimal)
myhostname = mail.example.com
mydomain = example.com
myorigin = $mydomain
inet_interfaces = all
mydestination = $myhostname, localhost.$mydomain, $mydomain
mynetworks = 127.0.0.0/8 [::1]/128
smtpd_tls_cert_file = /etc/ssl/certs/mail.crt
smtpd_tls_key_file = /etc/ssl/private/mail.key
smtpd_use_tls = yes
```

`mynetworks` restreint qui peut relayer sans authentification — un point critique (voir Sécurisation).

## Sécurisation

- Ne **jamais** laisser `mynetworks` ouvert (`0.0.0.0/0`) : c'est la cause n°1 des serveurs transformés en relais de spam ouverts.
- Activer TLS obligatoire pour la soumission (`smtpd_tls_security_level = encrypt` sur le port 587).
- Mettre en place **SPF, DKIM (voir OpenDKIM) et DMARC** côté DNS pour l'anti-spoofing.
- Limiter les tentatives et activer `smtpd_recipient_restrictions` pour rejeter les domaines/destinataires invalides en amont.
- Restreindre la taille des messages (`message_size_limit`) contre les abus.

## Logs & dépannage

```bash
journalctl -u postfix -f
tail -f /var/log/mail.log        # Debian/Ubuntu (rsyslog)
postfix check                    # erreurs de config
postqueue -p                     # messages bloqués en file
```

## Voir aussi

- [exim4](./083-exim4.md) — MTA alternatif à Postfix
- [dovecot](./084-dovecot.md) — pour compléter Postfix (MTA) avec un MDA IMAP/POP3, la stack mail classique
- [opendkim](./085-opendkim.md) — signature DKIM sortante, s'intègre directement avec Postfix (milter)
