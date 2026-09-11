---
id: 001-ssh-sshd
title: ssh / sshd — Connexion distante sécurisée
sidebar_position: 1
tags: [linux, services, systeme, reseau]
---

# ssh / sshd — Connexion distante sécurisée

`sshd` est le démon du protocole SSH (Secure Shell), fourni par le paquet `openssh-server`. Il permet l'administration distante chiffrée d'une machine (shell, transfert de fichiers, tunneling). C'est l'un des services les plus exposés d'un serveur — le port 22 subit en permanence des tentatives automatisées.

> Le durcissement approfondi (clés, `Match`, 2FA...) est couvert par le cours dédié : [SSH — accès distant et durcissement](../Security/02-ssh-durcissement.md). Cette fiche reste volontairement une carte de référence rapide côté service.

## Installation

```bash
sudo apt install openssh-server        # Debian/Ubuntu
sudo dnf install openssh-server        # Fedora/RHEL
sudo pacman -S openssh                 # Arch

sudo systemctl enable --now sshd
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/ssh/sshd_config` | Configuration du serveur (port, auth, restrictions) |
| `/etc/ssh/ssh_config` | Configuration du client SSH par défaut |
| `/etc/ssh/ssh_host_*_key` | Clés d'hôte du serveur (identité de la machine) |
| `~/.ssh/authorized_keys` | Clés publiques autorisées à se connecter à cet utilisateur |
| `~/.ssh/known_hosts` | Empreintes des hôtes distants déjà validées (côté client) |

## Commandes utiles

```bash
systemctl status sshd
systemctl restart sshd
sshd -t                       # valider la syntaxe de sshd_config avant de recharger
ssh -v user@host              # connexion en mode verbeux (debug)
ssh-keygen -t ed25519         # générer une paire de clés
ssh-copy-id user@host         # déployer sa clé publique sur un serveur
```

## Exemple de configuration

```ini title="/etc/ssh/sshd_config"
Port 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers deploy admin
```

Désactive la connexion root directe et l'authentification par mot de passe, ne garde que l'authentification par clé pour les comptes listés.

## Sécurisation

- Toujours valider avec `sshd -t` avant de redémarrer, sinon un `sshd_config` invalide peut couper tout accès distant.
- `PermitRootLogin no` + `PasswordAuthentication no` : éliminent la quasi-totalité des attaques par brute force automatisées.
- Voir le [cours dédié](../Security/02-ssh-durcissement.md) pour : changement de port, `fail2ban`, `Match` blocks, authentification par certificat, 2FA.

## Logs & dépannage

```bash
journalctl -u sshd -f                          # suivre les connexions en temps réel
journalctl -u sshd | grep "Failed password"     # tentatives échouées
ss -tlnp | grep sshd                            # vérifier que le service écoute
```

## Voir aussi

- [SSH — accès distant et durcissement](../Security/02-ssh-durcissement.md) — cours complet
- [cron](./002-cron.md)
