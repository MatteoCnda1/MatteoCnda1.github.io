---
id: 085-opendkim
title: OpenDKIM — signature DKIM
sidebar_position: 85
tags: [linux, services, mail]
---

# OpenDKIM — signature DKIM

**OpenDKIM** signe (et vérifie) les emails sortants avec **DKIM** (DomainKeys Identified Mail) : une signature cryptographique ajoutée à l'en-tête du mail, vérifiable via une clé publique publiée en DNS. Avec **SPF** et **DMARC**, c'est un des trois piliers de l'authentification email moderne — indispensable pour ne pas finir en spam.

## Installation

```bash
sudo apt install opendkim opendkim-tools
sudo systemctl enable --now opendkim
```

Fonctionne comme un **milter** (mail filter) branché sur un MTA ([Postfix](./082-postfix.md) ou [Exim4](./083-exim4.md)), pas comme un serveur autonome.

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/opendkim.conf` | Configuration principale du démon |
| `/etc/opendkim/KeyTable` | Association sélecteur → chemin de clé privée |
| `/etc/opendkim/SigningTable` | Association domaine/adresse → sélecteur à utiliser |
| `/etc/opendkim/TrustedHosts` | Hôtes autorisés à signer via ce démon |
| `/etc/opendkim/keys/<domaine>/<sélecteur>.private` | Clé privée DKIM |

## Commandes utiles

```bash
sudo opendkim-genkey -s mail -d example.com -D /etc/opendkim/keys/example.com/
opendkim-testkey -d example.com -s mail -vvv   # vérifier que le DNS publie bien la clé publique
systemctl status opendkim
```

## Exemple de configuration

```
# /etc/opendkim/SigningTable
*@example.com    mail._domainkey.example.com

# /etc/opendkim/KeyTable
mail._domainkey.example.com example.com:mail:/etc/opendkim/keys/example.com/mail.private
```

```ini
# main.cf de Postfix pour brancher le milter OpenDKIM
milter_default_action = accept
milter_protocol = 6
smtpd_milters = inet:localhost:8891
non_smtpd_milters = inet:localhost:8891
```

Côté DNS, publier un enregistrement TXT `mail._domainkey.example.com` avec la clé publique générée par `opendkim-genkey`.

## Sécurisation

- Utiliser des clés **RSA 2048 bits minimum** (le défaut historique 1024 bits est trop faible).
- Restreindre `TrustedHosts` aux IP/réseaux réellement autorisés à signer.
- Coupler systématiquement avec **SPF** (enregistrement TXT) et **DMARC** (politique de rejet) — DKIM seul ne suffit pas.
- Faire tourner les clés (key rotation) périodiquement.

## Logs & dépannage

```bash
journalctl -u opendkim -f
opendkim-testkey -d example.com -s mail -vvv
# Vérifier une signature reçue : en-tête "Authentication-Results" du mail
```

## Voir aussi

- [postfix](./082-postfix.md) — MTA typique pour brancher OpenDKIM via milter
