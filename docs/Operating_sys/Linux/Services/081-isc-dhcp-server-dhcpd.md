---
id: 081-isc-dhcp-server-dhcpd
title: isc-dhcp-server / dhcpd — Serveur DHCP historique ISC
sidebar_position: 81
tags: [linux, services, reseau]
---

# isc-dhcp-server / dhcpd — Serveur DHCP historique ISC

`isc-dhcp-server` est le nom du paquet (Debian/Ubuntu) qui fournit le démon **`dhcpd`**, longtemps LE serveur DHCP de référence sous Linux. **ISC a officiellement mis fin de vie ce projet fin 2022** au profit de [Kea](./080-kea-dhcp4-server.md), son successeur — encore largement déployé en production existante, mais à éviter pour un nouveau déploiement.

## Installation

```bash
sudo apt install isc-dhcp-server
sudo systemctl enable --now isc-dhcp-server
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/dhcp/dhcpd.conf` | Configuration principale (syntaxe propre, non JSON) |
| `/etc/default/isc-dhcp-server` | Déclare l'interface d'écoute (`INTERFACESv4=`) |
| `/var/lib/dhcp/dhcpd.leases` | Fichier de baux actifs |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status/restart isc-dhcp-server` | Gérer le service |
| `dhcpd -t -cf /etc/dhcp/dhcpd.conf` | Valider la config |
| `cat /var/lib/dhcp/dhcpd.leases` | Voir les baux actifs |

## Exemple de configuration

```conf
default-lease-time 43200;
max-lease-time 86400;
authoritative;

subnet 192.168.1.0 netmask 255.255.255.0 {
    range 192.168.1.100 192.168.1.200;
    option routers 192.168.1.1;
    option domain-name-servers 192.168.1.1;
}
```

## Sécurisation

- `authoritative;` uniquement si ce serveur est bien le seul DHCP légitime du segment (sinon source de conflits, pas de faille de sécu en soi mais casse le réseau).
- Restreindre `INTERFACESv4` dans `/etc/default/isc-dhcp-server` à l'interface voulue.
- Surveiller l'apparition d'un **DHCP rogue** concurrent sur le réseau (outil comme `dhcp_probe` ou simplement `nmap --script broadcast-dhcp-discover`) — un attaquant sur le LAN peut répondre plus vite et rediriger le trafic (passerelle/DNS falsifiés).
- Prévoir une migration vers Kea : le paquet n'est plus maintenu par l'amont.

## Logs & dépannage

```bash
journalctl -u isc-dhcp-server -f
dhcpd -t -cf /etc/dhcp/dhcpd.conf
tail -f /var/lib/dhcp/dhcpd.leases
```

## Voir aussi

- [kea-dhcp4-server](./080-kea-dhcp4-server.md) — le successeur officiel, à privilégier pour tout nouveau déploiement
- [dnsmasq](./078-dnsmasq.md) — alternative légère pour petits réseaux
