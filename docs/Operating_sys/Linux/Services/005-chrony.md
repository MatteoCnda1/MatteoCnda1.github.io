---
id: 005-chrony
title: chrony / chronyd — Synchronisation NTP
sidebar_position: 5
tags: [linux, services, systeme, reseau]
---

# chrony / chronyd — Synchronisation NTP

`chrony` est le paquet, `chronyd` le démon qu'il fournit : un client **et** serveur NTP plus précis et plus réactif que `systemd-timesyncd`, capable de bien gérer les connexions intermittentes (laptops, VM) et de servir l'heure à d'autres machines. C'est le choix par défaut sur RHEL/Fedora et une alternative fréquente à `ntpd` ailleurs.

## Installation

```bash
sudo apt install chrony
sudo dnf install chrony        # souvent déjà présent par défaut sur RHEL/Fedora
sudo pacman -S chrony

sudo systemctl enable --now chronyd     # ou "chrony" selon la distribution
```

> Ne pas faire tourner `chronyd` et `systemd-timesyncd` en même temps : désactiver l'un des deux (`systemctl disable --now systemd-timesyncd`).

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/chrony/chrony.conf` (Debian) ou `/etc/chrony.conf` (RHEL) | Configuration principale |
| `/var/lib/chrony/drift` | Fichier de dérive de l'horloge (calibration) |
| `/etc/chrony/chrony.keys` | Clés pour l'authentification NTP (optionnel) |

## Commandes utiles

```bash
chronyc tracking          # état détaillé de la synchronisation
chronyc sources -v        # liste des serveurs NTP et leur qualité
chronyc sourcestats       # statistiques de dérive par source
chronyc makestep          # forcer une resynchronisation immédiate (au lieu d'ajuster progressivement)
systemctl status chronyd
```

## Exemple de configuration

```ini title="/etc/chrony/chrony.conf"
pool 2.fr.pool.ntp.org iburst
driftfile /var/lib/chrony/drift
makestep 1.0 3

# Autoriser un sous-réseau local à utiliser cette machine comme serveur NTP
allow 192.168.1.0/24
```

`iburst` accélère la première synchronisation, `makestep` autorise un ajustement brutal si le décalage dépasse 1 seconde lors des 3 premières mesures (utile après un arrêt prolongé de la VM).

## Sécurisation

- Restreindre `allow` au strict réseau interne si la machine sert de source NTP — ne jamais l'ouvrir en `0.0.0.0/0` (risque d'abus en attaque par amplification NTP).
- Utiliser `iburst` mais éviter `makestep` en illimité en production : un saut brutal et répété de l'horloge peut casser des applications sensibles au temps.
- Authentifier les échanges NTP avec des clés (`chrony.keys`) sur un réseau non fiable, pour éviter l'usurpation de serveur NTP (attaque MITM sur le temps, qui peut invalider des certificats ou des tokens TOTP).

## Logs & dépannage

```bash
journalctl -u chronyd -f
chronyc tracking            # "Leap status: Normal" = synchronisé correctement
chronyc activity            # nombre de sources en ligne/hors ligne
```

Si `chronyc tracking` affiche un `System time` très décalé en continu : vérifier la connectivité UDP/123 sortante et qu'aucun autre client NTP (`timesyncd`) n'est actif en parallèle.

## Voir aussi

- [systemd-timesyncd](./004-systemd-timesyncd.md) — alternative plus légère
- [ntpd](./006-ntpd.md) — implémentation NTP historique, comparaison
