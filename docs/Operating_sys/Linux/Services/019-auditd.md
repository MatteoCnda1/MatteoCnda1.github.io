---
id: 019-auditd
title: auditd — audit de sécurité
sidebar_position: 19
tags: [linux, services, securite]
---

# auditd — audit de sécurité

`auditd` est le démon d'audit du noyau Linux : il journalise des événements système précis (appels système, accès fichiers, authentifications) selon des règles configurables, indépendamment des logs applicatifs classiques. C'est la source que consultent SELinux (refus AVC) et les outils de conformité (PCI-DSS, CIS Benchmarks).

## Installation

```bash
sudo apt install auditd audispd-plugins    # ou dnf install audit
sudo systemctl enable --now auditd
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/audit/auditd.conf` | Configuration du démon (rotation, taille des logs) |
| `/etc/audit/rules.d/*.rules` | Règles d'audit (surveillance de fichiers, syscalls) |
| `/var/log/audit/audit.log` | Journal d'audit |

## Commandes utiles

```bash
sudo systemctl status auditd
sudo auditctl -l                       # lister les règles actives
sudo auditctl -w /etc/passwd -p wa -k passwd_changes   # surveiller un fichier
sudo ausearch -k passwd_changes        # rechercher par clé
sudo aureport -au                      # rapport d'authentifications
sudo augenrules --load                 # recharger les règles depuis rules.d/
```

## Exemple de configuration

```
# /etc/audit/rules.d/audit.rules
-w /etc/passwd -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/sudoers -p wa -k privilege_escalation
-a always,exit -F arch=b64 -S execve -k exec_commands
```

## Sécurisation

- Surveiller au minimum : `/etc/passwd`, `/etc/shadow`, `/etc/sudoers`, les binaires setuid, et les modifications de règles d'audit elles-mêmes (auto-surveillance).
- Utiliser des **clés** (`-k`) systématiques sur chaque règle pour retrouver rapidement les événements liés dans `ausearch -k`.
- Protéger `/var/log/audit/` avec des permissions strictes et une rotation dédiée — c'est une cible de choix pour un attaquant voulant effacer ses traces.
- Envoyer les logs d'audit vers un collecteur central (rsyslog/SIEM) pour résister à une compromission locale.

## Logs & dépannage

```bash
journalctl -u auditd
sudo ausearch -ts today -k exec_commands
sudo aureport --summary
```

## Voir aussi

- [Audit, détection et gestion des vulnérabilités](../Security/06-audit-detection-patch.md) — cours complet sur auditd, la détection d'anomalies et le patch management.
- [SELinux](./018-selinux.md) — auditd journalise ses refus (AVC denials).
