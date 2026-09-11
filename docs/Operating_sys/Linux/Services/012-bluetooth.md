---
id: 012-bluetooth
title: bluetooth — gestion Bluetooth (BlueZ)
sidebar_position: 12
tags: [linux, services, reseau]
---

# bluetooth (BlueZ)

Démon `bluetoothd`, cœur de la pile **BlueZ**, la stack Bluetooth standard sous Linux. Gère l'appairage, la connexion et le profil des périphériques Bluetooth (audio, HID, PAN...), exposé via D-Bus et piloté en CLI par `bluetoothctl`.

## Installation

```bash
# Debian/Ubuntu
sudo apt install bluez bluez-tools
# Fedora
sudo dnf install bluez bluez-tools
# Arch
sudo pacman -S bluez bluez-utils

sudo systemctl enable --now bluetooth
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/bluetooth/main.conf` | Configuration principale du démon (nom de l'appareil, classe, politiques de découverte) |
| `/var/lib/bluetooth/<MAC-adaptateur>/` | Données persistées par appareil appairé (clés de liaison) |
| `/etc/systemd/system/bluetooth.target.wants/` | Cibles systemd liées au démarrage du service |

## Commandes utiles

```bash
systemctl status bluetooth

bluetoothctl                    # shell interactif
  power on
  scan on
  devices                       # appareils détectés
  pair <MAC>
  trust <MAC>
  connect <MAC>
  disconnect <MAC>

hciconfig                       # état des adaptateurs (paquet bluez-tools)
rfkill list bluetooth           # vérifier si le Bluetooth est bloqué (soft/hard block)
```

## Exemple de configuration

Désactiver la découvrabilité par défaut (`/etc/bluetooth/main.conf`) :

```ini
[General]
DiscoverableTimeout = 0
Discoverable = false
Pairable = true
```

## Sécurisation

- Désactiver `Discoverable` par défaut (l'appareil ne doit être visible que le temps d'un appairage volontaire).
- N'accorder `trust` qu'aux appareils réellement possédés — un appareil "trusted" se reconnecte sans confirmation.
- Maintenir BlueZ à jour : plusieurs failles historiques (BlueBorne, KNOB, BLURtooth) touchent la pile Bluetooth elle-même, pas seulement la configuration.
- Sur un serveur sans besoin Bluetooth, désactiver et masquer le service plutôt que le laisser inactif (`systemctl disable --now bluetooth && systemctl mask bluetooth`) pour réduire la surface d'attaque.
- Utiliser `rfkill block bluetooth` pour une coupure matérielle/logicielle rapide si le service doit rester installé mais inutilisé temporairement.

## Logs & dépannage

```bash
journalctl -u bluetooth -f
bluetoothctl show                # état de l'adaptateur (Powered, Discoverable, Pairable)
hciconfig -a                     # détail bas niveau de l'adaptateur
dmesg | grep -i blue             # problèmes de détection matérielle/firmware
```

## Voir aussi

- Aucune autre fiche de ce lot directement liée — service indépendant des autres démons réseau (IP/DNS) couverts ici.
