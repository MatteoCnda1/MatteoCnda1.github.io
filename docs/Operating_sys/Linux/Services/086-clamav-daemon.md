---
id: 086-clamav-daemon
title: ClamAV (clamav-daemon) — antivirus
sidebar_position: 86
tags: [linux, services, mail]
---

# ClamAV (clamav-daemon) — antivirus

**ClamAV** est un moteur antivirus open source, largement utilisé pour scanner les pièces jointes des mails (intégré à Postfix/Dovecot via milter/Sieve), les fichiers uploadés sur un serveur web, ou en scan à la demande. `clamav-daemon` (`clamd`) est le démon qui garde la base de signatures en mémoire pour scanner rapidement sans recharger à chaque exécution.

## Installation

```bash
sudo apt install clamav clamav-daemon
sudo systemctl enable --now clamav-freshclam   # mise à jour des signatures
sudo systemctl enable --now clamav-daemon
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/clamav/clamd.conf` | Configuration du démon `clamd` (socket, limites) |
| `/etc/clamav/freshclam.conf` | Configuration de la mise à jour des signatures |
| `/var/lib/clamav/` | Base de signatures virales |

## Commandes utiles

```bash
systemctl status clamav-daemon clamav-freshclam
freshclam                       # forcer une mise à jour des signatures
clamscan -r /chemin              # scan récursif manuel
clamdscan -r /chemin             # scan via le démon (plus rapide, socket)
clamdscan --version
```

## Exemple de configuration

```ini
# /etc/clamav/clamd.conf (extrait)
LocalSocket /var/run/clamav/clamd.ctl
MaxThreads 12
MaxFileSize 100M
```

## Sécurisation

- Toujours activer **freshclam** (mise à jour continue des signatures) — un antivirus non à jour est inutile.
- Restreindre l'accès au socket local (`LocalSocket`) aux utilisateurs/services qui en ont besoin (ex: Postfix).
- `MaxFileSize`/`StreamMaxLength` pour éviter les scans sur des fichiers énormes (déni de service).
- ClamAV détecte surtout des malwares **connus** (signatures) — le compléter avec d'autres contrôles (sandboxing, filtrage de types de fichiers) pour une défense en profondeur.

## Logs & dépannage

```bash
journalctl -u clamav-daemon -f
tail -f /var/log/clamav/clamav.log
tail -f /var/log/clamav/freshclam.log
```

## Voir aussi

- [postfix](./082-postfix.md) — intégration typique via milter (`clamav-milter`) pour scanner les mails entrants
