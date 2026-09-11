---
id: 008-systemd-networkd
title: systemd-networkd — gestion réseau
sidebar_position: 8
tags: [linux, services, reseau]
---

# systemd-networkd

Démon de gestion réseau intégré à systemd, orienté **serveurs et environnements headless** (pas d'interface graphique). Plus léger que NetworkManager, configuré par de simples fichiers `.network`/`.netdev`/`.link` plutôt que via un outil interactif.

## Installation

Fourni nativement avec systemd sur la plupart des distributions modernes (pas de paquet séparé à installer en général).

```bash
sudo systemctl enable --now systemd-networkd
# Souvent utilisé avec systemd-resolved pour le DNS
sudo systemctl enable --now systemd-resolved
```

:::note
Ne pas activer en même temps que NetworkManager sur la même interface — les deux démons entreraient en conflit pour la gérer.
:::

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/systemd/network/*.network` | Configuration IP d'une ou plusieurs interfaces (adresse, route, DNS) |
| `/etc/systemd/network/*.netdev` | Définition d'interfaces virtuelles (bridge, bond, VLAN, WireGuard...) |
| `/etc/systemd/network/*.link` | Renommage/paramètres bas niveau d'une interface physique (MAC, MTU) |

Les fichiers sont numérotés/préfixés (`10-lan.network`) : l'ordre alphabétique détermine la priorité en cas de correspondances multiples.

## Commandes utiles

```bash
systemctl status systemd-networkd
networkctl status                 # vue d'ensemble des interfaces gérées
networkctl status eth0            # détail d'une interface
networkctl list                   # interfaces connues du démon
networkctl reload                 # recharger la config sans redémarrer le service
```

## Exemple de configuration

IP statique sur `eth0` (`/etc/systemd/network/10-eth0.network`) :

```ini
[Match]
Name=eth0

[Network]
Address=192.168.1.10/24
Gateway=192.168.1.1
DNS=192.168.1.1
```

DHCP simple :

```ini
[Match]
Name=eth0

[Network]
DHCP=yes
```

## Sécurisation

- Utiliser `[Match]` avec `MACAddress=` plutôt que seulement `Name=` sur des serveurs où l'ordre de nommage des interfaces peut varier, pour éviter d'appliquer une config au mauvais NIC.
- Restreindre les permissions des fichiers `.network` contenant des IP internes sensibles (`644` suffit généralement, pas de secret dedans contrairement aux profils NetworkManager).
- Désactiver `IPForward=` si la machine n'a pas vocation à router du trafic (évite qu'elle serve de relais involontaire).
- Combiner avec `systemd-resolved` en mode DNSSEC/DNS-over-TLS si le résolveur le supporte, plutôt que du DNS en clair par défaut.

## Logs & dépannage

```bash
journalctl -u systemd-networkd -f
networkctl status eth0            # état "routable"/"degraded"/"no-carrier" et cause
udevadm test-builtin net_setup_link /sys/class/net/eth0   # déboguer un .link non appliqué
```

## Voir aussi

- [NetworkManager](./007-networkmanager.md) — l'alternative orientée desktop, concurrente et non cumulable.
- [systemd-resolved](./009-systemd-resolved.md) — le résolveur DNS souvent utilisé en tandem avec systemd-networkd.
