---
id: 018-selinux
title: SELinux — contrôle d'accès de sécurité
sidebar_position: 18
tags: [linux, services, securite]
---

# SELinux — contrôle d'accès de sécurité

SELinux est, comme AppArmor, un contrôle d'accès obligatoire (MAC) intégré au noyau, mais basé sur un modèle d'**étiquettes** (contexte de sécurité) appliquées à chaque fichier et processus, plutôt que sur des chemins de fichiers. Standard sur RHEL/Fedora/CentOS.

## Installation

Généralement préinstallé sur RHEL/Fedora. Outils de gestion :

```bash
sudo dnf install policycoreutils policycoreutils-python-utils setroubleshoot-server
```

SELinux lui-même n'est pas un "service" à démarrer/arrêter comme les autres (c'est une fonctionnalité noyau activée dès le boot via `/etc/selinux/config` + le chargeur de démarrage).

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/selinux/config` | Mode global : `enforcing`, `permissive`, `disabled` |
| `/etc/selinux/targeted/` | Politique active et ses règles |
| `/var/log/audit/audit.log` | Journal des refus SELinux (via auditd) |

## Commandes utiles

```bash
sestatus                          # état courant (mode, politique chargée)
getenforce / setenforce 0|1       # lire / changer le mode à chaud (0=permissive, 1=enforcing)
ls -Z /var/www/html               # voir le contexte SELinux d'un fichier
semanage fcontext -a -t httpd_sys_content_t "/data/web(/.*)?"
restorecon -Rv /data/web          # réappliquer les contextes par défaut
getsebool -a | grep httpd         # lister les booleans liés à un service
setsebool -P httpd_can_network_connect on
```

## Exemple de configuration

```bash
# Autoriser nginx à servir des fichiers depuis un répertoire non standard
sudo semanage fcontext -a -t httpd_sys_content_t "/data/web(/.*)?"
sudo restorecon -Rv /data/web
```

## Sécurisation

- Ne **jamais** désactiver SELinux (`disabled`) pour "faire marcher" un service — utiliser le mode `permissive` temporairement pour diagnostiquer, puis corriger le contexte/policy.
- Préférer `semanage`/`restorecon` (contextes) aux booleans larges, et les booleans (`setsebool`) aux solutions plus radicales.
- Auditer périodiquement les refus (`ausearch -m avc`) pour détecter des tentatives d'accès anormales, pas seulement des erreurs de config.

## Logs & dépannage

```bash
journalctl -t setroubleshoot
sudo ausearch -m avc -ts recent      # derniers refus SELinux
sudo sealert -a /var/log/audit/audit.log   # explications lisibles des refus (setroubleshoot)
```

## Voir aussi

- [SELinux](../Security/05-selinux.md) — cours complet : modèle par étiquettes, modes, comparaison avec AppArmor.
- [Audit, détection et gestion des vulnérabilités](../Security/06-audit-detection-patch.md) — auditd, qui journalise les refus SELinux.
