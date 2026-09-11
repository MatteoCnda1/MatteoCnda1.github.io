---
id: 020-rsyslog
title: rsyslog — centralisation des logs
sidebar_position: 20
tags: [linux, services, logs]
---

# rsyslog

`rsyslog` est le démon de journalisation syslog historique de la plupart des distributions Linux (successeur de sysklogd). Il reçoit les messages de log du noyau, des applications et de `systemd-journald`, les filtre/route selon des règles, et les écrit dans des fichiers locaux ou les transmet à un serveur de logs distant. C'est la brique classique de **centralisation des logs** sur une flotte de serveurs.

## Installation

```bash
sudo apt install rsyslog          # Debian/Ubuntu (souvent déjà présent)
sudo dnf install rsyslog          # RHEL/Fedora
sudo systemctl enable --now rsyslog
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/rsyslog.conf` | Configuration principale (modules, règles globales) |
| `/etc/rsyslog.d/*.conf` | Fragments de configuration additionnels (bonne pratique pour ne pas éditer le fichier principal) |
| `/var/log/` | Répertoire de destination par défaut des fichiers de logs |
| `/var/spool/rsyslog/` | Files d'attente en cas d'indisponibilité de la destination (mode disque) |

## Commandes utiles

```bash
systemctl status rsyslog
systemctl restart rsyslog
rsyslogd -N1                       # valider la syntaxe de la config sans démarrer
logger "message de test"           # envoyer un message de test dans le journal
journalctl -u rsyslog              # logs du démon lui-même
```

## Exemple de configuration

```
# /etc/rsyslog.d/10-remote.conf
# Router tous les logs "auth" vers un fichier dédié
auth,authpriv.*   /var/log/auth-custom.log

# Envoyer tous les logs vers un serveur central (UDP)
*.*   @logserver.exemple.fr:514

# Envoyer en TCP fiable avec mise en file d'attente disque
*.*   @@logserver.exemple.fr:514
```

Le `@` simple envoie en UDP (rapide, non garanti) ; `@@` utilise TCP (fiable, recommandé pour de la centralisation sérieuse).

## Sécurisation

- Chiffrer le transport vers un serveur distant (module `omrelp` + TLS, ou tunnel stunnel/VPN) plutôt qu'un syslog UDP en clair sur le réseau.
- Restreindre les permissions des fichiers de logs (`/var/log` en `640`, propriétaire `syslog`/`root`) pour éviter la lecture par des utilisateurs non privilégiés.
- Activer la mise en file d'attente disque (`$WorkDirectory`) pour ne pas perdre de logs en cas de coupure réseau vers le serveur central.
- Sur le serveur central : limiter les IP autorisées à envoyer des logs (pare-feu) et surveiller l'espace disque dédié aux logs.

## Logs & dépannage

```bash
journalctl -u rsyslog -f           # suivre les logs du démon en direct
rsyslogd -N1                       # tester la config avant de recharger
tail -f /var/log/syslog            # (Debian/Ubuntu) ou /var/log/messages (RHEL)
```

## Voir aussi

- [systemd-journald](./021-systemd-journald.md) — coexiste avec rsyslog, peut lui transmettre les logs
- [logrotate](./022-logrotate.md) — gère la rotation des fichiers produits par rsyslog
