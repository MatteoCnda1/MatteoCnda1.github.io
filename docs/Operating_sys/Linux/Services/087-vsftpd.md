---
id: 087-vsftpd
title: vsftpd — Serveur FTP
sidebar_position: 87
tags: [linux, services, partage-fichiers]
---

# vsftpd

**vsftpd** (*Very Secure FTP Daemon*) est un serveur FTP léger et orienté sécurité, très répandu comme alternative simple à Samba/NFS quand le client ne parle que FTP. Le protocole FTP transmet les identifiants **en clair** par défaut — vsftpd supporte FTPS (FTP sur TLS) pour corriger ça.

## Installation

```bash
sudo apt install vsftpd            # Debian/Ubuntu
sudo dnf install vsftpd            # RHEL/Fedora
sudo systemctl enable --now vsftpd
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/vsftpd.conf` (ou `/etc/vsftpd/vsftpd.conf`) | Configuration principale |
| `/etc/vsftpd.userlist` | Liste blanche/noire d'utilisateurs autorisés |
| `/etc/ftpusers` (PAM) | Utilisateurs interdits de connexion FTP |
| `/var/ftp/` | Racine FTP anonyme par défaut |

## Commandes utiles

```bash
systemctl status vsftpd
systemctl restart vsftpd
ftp localhost                # client de test basique
journalctl -u vsftpd
```

## Exemple de configuration

```ini
anonymous_enable=NO
local_enable=YES
write_enable=YES
chroot_local_user=YES
ssl_enable=YES
rsa_cert_file=/etc/ssl/certs/vsftpd.pem
rsa_private_key_file=/etc/ssl/private/vsftpd.key
force_local_data_ssl=YES
force_local_logins_ssl=YES
pasv_min_port=40000
pasv_max_port=40100
```

`chroot_local_user=YES` enferme chaque utilisateur dans son propre home — évite qu'il navigue dans le reste du filesystem. Le range `pasv_min_port`/`pasv_max_port` est nécessaire pour ouvrir un firewall en mode passif (FTP actif est quasi impossible derrière NAT).

## Sécurisation

- **Désactiver l'anonyme** (`anonymous_enable=NO`) sauf besoin explicite de dépôt public.
- **Forcer FTPS** (`force_local_data_ssl`/`force_local_logins_ssl`) — le FTP en clair expose identifiants et données.
- **chroot** systématique des utilisateurs locaux.
- Restreindre le **range de ports passifs** et n'ouvrir que celui-ci + le port 21 au firewall.
- Préférer **SFTP (via SSH)** quand c'est possible : plus simple à sécuriser, un seul port, pas de mode actif/passif à gérer.

## Logs & dépannage

```bash
journalctl -u vsftpd
tail -f /var/log/vsftpd.log     # si xferlog_enable/dual_log_enable activés
```

Problème fréquent : connexions passives qui échouent derrière un firewall/NAT → vérifier `pasv_address` (IP publique à annoncer) et l'ouverture du range de ports passifs.

## Voir aussi

- [proftpd](./088-proftpd.md) — alternative plus modulaire (fichier de config par répertoire type `.htaccess`)
- [SSH — accès distant et durcissement](../Security/02-ssh-durcissement.md) — pour SFTP comme alternative à FTP
