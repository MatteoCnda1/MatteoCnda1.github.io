---
id: 014-firewalld
title: firewalld — pare-feu dynamique
sidebar_position: 14
tags: [linux, services, securite]
---

# firewalld — pare-feu dynamique

`firewalld` est le pare-feu par défaut sur RHEL/Fedora/CentOS. Contrairement à `ufw` (statique, rechargement complet à chaque changement), il gère les règles **dynamiquement** (application à chaud, sans couper les connexions existantes) et organise la configuration autour de **zones** (ensembles de règles associées à une interface ou une source).

## Installation

```bash
sudo dnf install firewalld
sudo systemctl enable --now firewalld
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/firewalld/firewalld.conf` | Configuration générale (zone par défaut...) |
| `/etc/firewalld/zones/*.xml` | Définition des zones et de leurs règles |
| `/etc/firewalld/services/*.xml` | Définitions de services (ports associés à un nom) |
| `/usr/lib/firewalld/` | Zones/services par défaut fournis par le système |

## Commandes utiles

```bash
sudo systemctl status firewalld
firewall-cmd --state
firewall-cmd --get-zones
firewall-cmd --get-active-zones
firewall-cmd --zone=public --list-all
firewall-cmd --zone=public --add-service=https --permanent
firewall-cmd --zone=public --add-port=8080/tcp --permanent
firewall-cmd --reload                     # applique les règles --permanent
firewall-cmd --panic-on / --panic-off     # coupe tout le trafic en urgence
```

## Exemple de configuration

```bash
# Ouvrir HTTPS et un port applicatif de façon persistante, puis appliquer
firewall-cmd --zone=public --add-service=https --permanent
firewall-cmd --zone=public --add-port=8080/tcp --permanent
firewall-cmd --reload
firewall-cmd --zone=public --list-all
```

## Sécurisation

- Les zones (`public`, `internal`, `trusted`, `drop`...) permettent d'appliquer des politiques différentes par interface : assigner l'interface WAN à `public` (restrictive) et le LAN interne à `internal`.
- Toujours utiliser `--permanent` puis `--reload` pour persister ; une commande sans `--permanent` ne survit pas à un redémarrage (utile pour tester sans risque).
- Préférer `--add-service` (règles maintenues par le paquet) à `--add-port` en dur quand un service définit déjà son profil.
- `firewall-cmd --panic-on` en cas d'incident actif pour couper tout le trafic immédiatement.

## Logs & dépannage

```bash
journalctl -u firewalld
firewall-cmd --get-log-denied      # voir si les paquets refusés sont loggés
firewall-cmd --zone=public --list-all   # diagnostiquer une zone
```

## Voir aussi

- [Pare-feu — nftables, ufw, fail2ban](../Security/04-pare-feu-nftables-ufw-fail2ban.md) — l'équivalent Debian/Ubuntu et le fonctionnement de netfilter sous-jacent (firewalld pilote nftables depuis RHEL8+).
