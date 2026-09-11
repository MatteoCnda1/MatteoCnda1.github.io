---
id: 078-dnsmasq
title: dnsmasq — DNS / DHCP léger
sidebar_position: 78
tags: [linux, services, reseau]
---

# dnsmasq — DNS / DHCP léger

**dnsmasq** combine un serveur DNS cache/forwarder, un serveur DHCP et un serveur TFTP en un seul démon léger. Très utilisé sur les petits réseaux (LAN domestique, labo, routeurs embarqués/OpenWRT) là où BIND/ISC-DHCP seraient surdimensionnés.

## Installation

```bash
sudo apt install dnsmasq          # Debian/Ubuntu
sudo dnf install dnsmasq          # RHEL/Fedora
sudo systemctl enable --now dnsmasq
```

> Sur une machine avec NetworkManager, `dnsmasq` entre souvent en conflit avec le port 53 déjà tenu par `systemd-resolved` — désactiver le stub resolver (`DNSStubListener=no` dans `/etc/systemd/resolved.conf`) si besoin.

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/dnsmasq.conf` | Configuration principale |
| `/etc/dnsmasq.d/*.conf` | Fragments de config additionnels |
| `/etc/hosts` | Résolution DNS locale statique (utilisée par défaut) |
| `/etc/dnsmasq-leases` ou `/var/lib/misc/dnsmasq.leases` | Bail DHCP actifs |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status/restart dnsmasq` | Gérer le service |
| `dnsmasq --test` | Valider la config |
| `cat /var/lib/misc/dnsmasq.leases` | Voir les baux DHCP en cours |
| `dig @127.0.0.1 exemple.fr` | Tester la résolution |

## Exemple de configuration

```conf
# DNS : forwarders + cache
server=1.1.1.1
server=9.9.9.9
cache-size=1000

# DHCP : plage d'adresses sur eth0
interface=eth0
dhcp-range=192.168.1.100,192.168.1.200,12h
dhcp-option=option:router,192.168.1.1
```

### Usage PXE (boot réseau)

dnsmasq peut aussi servir de serveur PXE pour démarrer des machines sans disque ou déployer un OS par le réseau, en combinant DHCP + TFTP :

```conf
enable-tftp
tftp-root=/srv/tftp
dhcp-boot=pxelinux.0        # fichier de boot envoyé aux clients PXE
```

Le client DHCP-PXE reçoit une IP et l'emplacement du bootloader (`pxelinux.0`/`grubnetx64.efi`) à récupérer en TFTP, ce qui permet un déploiement d'OS entièrement réseau (courant pour du provisioning de serveurs ou des images de labo).

## Sécurisation

- Restreindre `interface=` à l'interface voulue — par défaut dnsmasq peut écouter sur toutes les interfaces.
- `bind-interfaces` pour forcer l'écoute stricte sur l'IP/interface déclarée.
- Ne pas exposer le DNS en résolveur ouvert à Internet (mêmes risques qu'un résolveur BIND ouvert).
- `dhcp-authoritative` seulement si dnsmasq est le seul serveur DHCP du segment (évite les conflits de baux).

## Logs & dépannage

```bash
journalctl -u dnsmasq -f
dnsmasq --test                       # valide la conf avant reload
systemctl reload dnsmasq
```

## Voir aussi

- [bind9 / named](./077-bind9-named.md) et [unbound](./079-unbound.md) — pour un usage DNS pur à plus grande échelle
- [isc-dhcp-server / dhcpd](./081-isc-dhcp-server-dhcpd.md) et [kea-dhcp4-server](./080-kea-dhcp4-server.md) — serveurs DHCP dédiés pour un réseau plus grand
