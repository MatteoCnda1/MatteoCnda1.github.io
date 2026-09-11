---
id: 088-proftpd
title: proftpd — Serveur FTP
sidebar_position: 88
tags: [linux, services, partage-fichiers]
---

# proftpd

**ProFTPD** est un serveur FTP alternatif à [vsftpd](./087-vsftpd.md), plus modulaire : configuration proche de la syntaxe Apache (blocs `<Directory>`, `<Anonymous>`), support de modules (mod_tls, mod_sql pour authentifier contre une base de données, mod_vroot...), et possibilité de fichiers de config **par répertoire** (comme `.htaccess`).

## Installation

```bash
sudo apt install proftpd-basic     # Debian/Ubuntu
sudo dnf install proftpd           # RHEL/Fedora
sudo systemctl enable --now proftpd
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/proftpd/proftpd.conf` | Configuration principale |
| `/etc/proftpd/conf.d/` | Fragments de config additionnels |
| `/etc/proftpd/tls.conf` | Configuration FTPS (module mod_tls) |
| `.ftpaccess` (par répertoire, si activé) | Restrictions locales par dossier |

## Commandes utiles

```bash
systemctl status proftpd
proftpd -t                    # tester la syntaxe de config
ftpwho                        # lister les connexions actives
ftptop                        # équivalent "top" pour les sessions FTP
journalctl -u proftpd
```

## Exemple de configuration

```apache
ServerName "Serveur FTP"
DefaultRoot ~
RequireValidShell off

<Global>
  AllowOverwrite on
  PassivePorts 40000 40100
</Global>

<IfModule mod_tls.c>
  TLSEngine on
  TLSRequired on
  TLSRSACertificateFile /etc/ssl/certs/proftpd.pem
  TLSRSACertificateKeyFile /etc/ssl/private/proftpd.key
</IfModule>
```

`DefaultRoot ~` chroot chaque utilisateur dans son home, équivalent du `chroot_local_user` de vsftpd.

## Sécurisation

- Activer **mod_tls** et forcer `TLSRequired on` — comme vsftpd, FTP en clair expose tout.
- `DefaultRoot ~` pour chrooter systématiquement.
- Désactiver les modules non utilisés (mod_ident historique, notamment) — chaque module chargé est une surface d'attaque.
- Restreindre le range `PassivePorts` et n'ouvrir que celui-ci au firewall.
- Limiter les tentatives de connexion (`MaxLoginAttempts`) pour freiner le bruteforce.

## Logs & dépannage

```bash
journalctl -u proftpd
tail -f /var/log/proftpd/proftpd.log
ftpwho                          # sessions FTP actives en temps réel
```

## Voir aussi

- [vsftpd](./087-vsftpd.md) — alternative plus légère et plus simple à auditer
