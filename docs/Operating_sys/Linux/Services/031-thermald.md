---
id: 031-thermald
title: thermald — Gestion thermique CPU
sidebar_position: 31
tags: [linux, services, systeme]
---

# thermald

**thermald** (Linux Thermal Daemon, Intel) surveille la température du CPU et applique des politiques de limitation (throttling) **avant** que la protection matérielle d'urgence du processeur ne se déclenche brutalement. Il vise un compromis plus fin entre performance et température qu'une coupure thermique pure et dure — surtout utile sur laptops et machines fanless.

## Installation

```bash
# Debian/Ubuntu
sudo apt install thermald

# Fedora/RHEL
sudo dnf install thermald

sudo systemctl enable --now thermald
```

Principalement pertinent sur CPU **Intel** (s'appuie sur les interfaces DTS/PowerClamp spécifiques Intel) ; peu ou pas utile sur AMD/ARM.

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/thermald/thermal-conf.xml` | Configuration personnalisée des seuils/politiques thermiques |
| `/etc/thermald/thermal-cpu-cdev-order.xml` | Ordre de priorité des mécanismes de refroidissement disponibles |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status thermald` | État du démon |
| `thermald --no-daemon --loglevel=debug` | Lancer en avant-plan avec logs détaillés (debug) |
| `dbus-send --system --print-reply --dest=org.freedesktop.thermald /org/freedesktop/thermald org.freedesktop.thermald.GetTemperature` | Interroger la température via D-Bus |
| `cat /sys/class/thermal/thermal_zone*/temp` | Lire directement les zones thermiques du noyau (en millidegrés) |

## Exemple de configuration

```xml
<!-- /etc/thermald/thermal-conf.xml -->
<ThermalConfiguration>
  <Platform>
    <Name>Custom Passive Policy</Name>
    <ProductName>*</ProductName>
    <Preference>QUIET</Preference>
  </Platform>
</ThermalConfiguration>
```

La préférence `QUIET` privilégie le throttling CPU plutôt que la montée en vitesse des ventilateurs — utile sur du matériel où le bruit est prioritaire sur la performance brute.

## Sécurisation

Pas d'enjeu de sécurité réseau — thermald agit uniquement en local sur le matériel. Point de vigilance opérationnel :

- Sans thermald (ou équivalent), un CPU Intel en surchauffe soutenue déclenche une protection matérielle brutale (throttling agressif voire arrêt), ce qui peut se traduire par des coupures de service inattendues sur un serveur mal ventilé — thermald lisse cette dégradation.
- Vérifier qu'aucun conflit n'existe avec un profil [tuned](./030-tuned.md) qui désactiverait le throttling pour maximiser la performance : sur du matériel avec un refroidissement limité, c'est contre-productif.

## Logs & dépannage

```bash
journalctl -u thermald
cat /sys/class/thermal/thermal_zone*/temp   # température brute par zone (diviser par 1000 pour °C)
```

Des baisses de performance inexpliquées et intermittentes sur un laptop sont un symptôme classique de throttling thermique actif — croiser avec `journalctl -u thermald` pour confirmer.
