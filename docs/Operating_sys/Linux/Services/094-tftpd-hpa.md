---
id: 094-tftpd-hpa
title: tftpd-hpa — Serveur TFTP
sidebar_position: 94
tags: [linux, services, partage-fichiers]
---

# tftpd-hpa

**TFTP** (Trivial File Transfer Protocol) est un protocole de transfert de fichiers minimaliste, sans authentification, utilisé pour le **boot réseau** (PXE), le chargement de firmwares sur des équipements réseau (switches, routeurs), ou la sauvegarde de configurations Cisco/autres. `tftpd-hpa` est l'implémentation serveur la plus courante sous Debian/Ubuntu.

## Installation

```bash
sudo apt install tftpd-hpa
sudo systemctl enable --now tftpd-hpa
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/default/tftpd-hpa` | Options du démon (répertoire racine, mode, adresse d'écoute) |
| `/srv/tftp/` (ou configuré) | Racine des fichiers servis |

## Commandes utiles

```bash
systemctl status tftpd-hpa
tftp localhost -c get fichier.bin   # test client
journalctl -u tftpd-hpa
```

## Exemple de configuration

```bash
# /etc/default/tftpd-hpa
TFTP_USERNAME="tftp"
TFTP_DIRECTORY="/srv/tftp"
TFTP_ADDRESS="192.168.1.10:69"
TFTP_OPTIONS="--secure --create"
```

`--secure` chroot le processus dans `TFTP_DIRECTORY` (empêche l'accès au reste du filesystem) ; `--create` autorise l'upload de fichiers (à activer seulement si nécessaire).

## Sécurisation

- **TFTP n'a aucune authentification** ni chiffrement — à réserver strictement à un réseau d'administration isolé (VLAN dédié), jamais accessible depuis un réseau utilisateur ou Internet.
- Toujours utiliser `--secure` (chroot).
- Ne pas activer `--create` (upload) sauf besoin explicite — sinon n'importe quel client du réseau peut écrire des fichiers arbitraires sur le serveur.
- Restreindre l'écoute à l'interface/réseau d'administration (`TFTP_ADDRESS`).

## Logs & dépannage

```bash
journalctl -u tftpd-hpa
```

TFTP loggue peu par défaut — pour du diagnostic fin, ajouter `-v` dans `TFTP_OPTIONS` temporairement.

## Voir aussi

- [dnsmasq](./078-dnsmasq.md) — souvent combiné à tftpd-hpa pour un déploiement PXE complet (DHCP + TFTP)
