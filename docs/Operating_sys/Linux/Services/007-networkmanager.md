---
id: 007-networkmanager
title: NetworkManager — gestion réseau
sidebar_position: 7
tags: [linux, services, reseau]
---

# NetworkManager

Démon de gestion réseau (`NetworkManager`) orienté postes de travail et machines mobiles : il détecte les interfaces, gère Wi-Fi/Ethernet/VPN et bascule automatiquement entre connexions. Fourni par le paquet `network-manager` (Debian/Ubuntu) ou `NetworkManager` (Fedora/Arch), pilotable en CLI via `nmcli` ou en TUI via `nmtui`.

## Installation

```bash
# Debian/Ubuntu
sudo apt install network-manager
# Fedora
sudo dnf install NetworkManager
# Arch
sudo pacman -S networkmanager

sudo systemctl enable --now NetworkManager
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/NetworkManager/NetworkManager.conf` | Configuration principale du démon (plugins, DNS, gestion des interfaces) |
| `/etc/NetworkManager/system-connections/*.nmconnection` | Profils de connexion (Wi-Fi, Ethernet, VPN), au format INI |
| `/etc/NetworkManager/conf.d/*.conf` | Fragments de config additionnels (drop-ins) |
| `/etc/NetworkManager/dispatcher.d/` | Scripts exécutés sur changement d'état réseau (voir aussi `networkd-dispatcher` pour l'équivalent côté `systemd-networkd`) |

## Commandes utiles

```bash
systemctl status NetworkManager
systemctl restart NetworkManager

nmcli general status              # état général
nmcli device status                # liste des interfaces et leur état
nmcli connection show               # profils de connexion connus
nmcli connection show --active      # connexions actives
nmcli device wifi list              # scanner les réseaux Wi-Fi
nmcli connection up "<nom-profil>"  # activer un profil
nmcli connection down "<nom-profil>"
```

## Exemple de configuration

Profil Ethernet statique minimal (`/etc/NetworkManager/system-connections/lan.nmconnection`, permissions `600`) :

```ini
[connection]
id=lan
type=ethernet
interface-name=eth0

[ipv4]
method=manual
addresses=192.168.1.10/24
gateway=192.168.1.1
dns=192.168.1.1;
```

## Sécurisation

- Les fichiers `.nmconnection` contiennent parfois des secrets (mots de passe Wi-Fi/VPN) : vérifier qu'ils sont en `600 root:root`.
- Désactiver la gestion automatique des interfaces serveur non prévues pour NetworkManager (`unmanaged-devices` dans `NetworkManager.conf`) pour éviter des reconfigurations intempestives.
- Sur un serveur, préférer désactiver le MAC randomization Wi-Fi/Ethernet par défaut si non souhaité (`wifi.scan-rand-mac-address=no`) pour rester cohérent avec le filtrage réseau en place.
- Restreindre qui peut modifier les connexions via Polkit (`org.freedesktop.NetworkManager.*` dans les règles Polkit) plutôt que de laisser tout utilisateur local reconfigurer le réseau.

## Logs & dépannage

```bash
journalctl -u NetworkManager -f
nmcli general logging               # niveau de log actuel
nmcli connection show "<profil>"    # détail d'un profil (diagnostiquer une conf erronée)
nmcli device show eth0              # état détaillé d'une interface
```

## Voir aussi

- [systemd-networkd](./008-systemd-networkd.md) — l'alternative légère orientée serveurs ; NetworkManager et systemd-networkd sont **concurrents** (un seul actif à la fois sur une distribution donnée, rarement les deux ensemble).
- [VPN avec nmcli (IPsec / strongSwan)](../Networking/vpn-nmcli.md) — usage VPN détaillé de `nmcli`, déjà couvert en profondeur dans ce cours dédié.
