---
id: 024-acct
title: acct (psacct) — comptabilité des processus
sidebar_position: 24
tags: [linux, services, forensics]
---

# acct / psacct

`acct` (nommé `psacct` sur les distributions RHEL-like) est la **comptabilité des processus** du noyau Linux : chaque commande exécutée par chaque utilisateur est enregistrée (nom, utilisateur, durée CPU, heure de fin), dans un fichier binaire consultable après coup. Utile en forensics/audit pour répondre à « qui a exécuté quoi et quand » sur une machine.

## Installation

```bash
sudo apt install acct             # Debian/Ubuntu
sudo dnf install psacct           # RHEL/Fedora

sudo systemctl enable --now acct     # ou psacct selon la distro
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/var/log/account/pacct` (Debian) ou `/var/account/pacct` (RHEL) | Fichier binaire de comptabilité des processus |
| `/etc/default/acct` | Options de démarrage (Debian) |

## Commandes utiles

```bash
lastcomm                     # liste des commandes exécutées, la plus récente en premier
lastcomm <utilisateur>       # filtrer par utilisateur
lastcomm <commande>          # filtrer par nom de commande
sa                           # résumé statistique d'utilisation par commande
sa -u                        # résumé par utilisateur
accton on                    # activer manuellement la comptabilité (fait par le service normalement)
```

## Exemple d'utilisation

```bash
# Qui a exécuté la commande "rm" récemment ?
lastcomm rm

# Historique complet d'un utilisateur suspect
lastcomm suspect_user

# Résumé de consommation CPU par commande, trié
sa -m
```

## Sécurisation

- Le fichier `pacct` contient un historique d'activité sensible : restreindre sa lecture au root uniquement (`600`).
- Prévoir une rotation/purge (via `logrotate`, voir la [fiche dédiée](./022-logrotate.md)) — le fichier grossit en continu et n'a pas de rotation native.
- Ne remplace pas un vrai système d'audit (voir [auditd](../Security/06-audit-detection-patch.md)) : `acct` enregistre les commandes exécutées mais pas les appels système, accès fichiers, ou tentatives échouées — complémentaire, pas équivalent.
- Sur une machine compromise, un attaquant avec les droits root peut désactiver `acct` ou purger `pacct` : ce n'est pas un mécanisme anti-effacement, à combiner avec un envoi de logs vers un système externe pour un vrai suivi forensics.

## Logs & dépannage

```bash
systemctl status acct
ls -la /var/log/account/pacct     # vérifier que le fichier grossit bien
lastcomm | head -20               # test rapide de fonctionnement
```

## Voir aussi

- [Audit, détection et gestion des vulnérabilités](../Security/06-audit-detection-patch.md) — auditd, plus complet, pour un vrai suivi de sécurité
- [sysstat](./023-sysstat.md) — statistiques système globales, complémentaire à la comptabilité par processus
