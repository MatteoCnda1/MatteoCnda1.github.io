---
id: 080-kea-dhcp4-server
title: kea-dhcp4-server — Serveur DHCP moderne (ISC Kea)
sidebar_position: 80
tags: [linux, services, reseau]
---

# kea-dhcp4-server — Serveur DHCP moderne (ISC Kea)

**Kea** est le successeur officiel d'ISC-DHCP (voir [isc-dhcp-server/dhcpd](./081-isc-dhcp-server-dhcpd.md), désormais en fin de vie). Architecture modulaire (démons séparés IPv4/IPv6/DDNS), configuration en **JSON**, API REST de contrôle (`kea-ctrl-agent`), et hooks extensibles — pensé pour l'intégration avec des outils modernes (bases de données pour les baux, automatisation).

## Installation

```bash
sudo apt install kea-dhcp4-server      # Debian/Ubuntu récents
sudo systemctl enable --now kea-dhcp4-server
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/kea/kea-dhcp4.conf` | Configuration du démon DHCPv4 (format JSON) |
| `/var/lib/kea/kea-leases4.csv` | Fichier de baux (par défaut, backend mémoire+fichier) |
| `/etc/kea/kea-ctrl-agent.conf` | API REST de contrôle (optionnelle) |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status/restart kea-dhcp4-server` | Gérer le service |
| `kea-dhcp4 -t /etc/kea/kea-dhcp4.conf` | Valider la config |
| `kea-shell` | Client CLI pour l'API de contrôle |

## Exemple de configuration

```json
{
  "Dhcp4": {
    "interfaces-config": { "interfaces": [ "eth0" ] },
    "lease-database": { "type": "memfile", "persist": true },
    "subnet4": [
      {
        "subnet": "192.168.1.0/24",
        "pools": [ { "pool": "192.168.1.100 - 192.168.1.200" } ],
        "option-data": [
          { "name": "routers", "data": "192.168.1.1" },
          { "name": "domain-name-servers", "data": "192.168.1.1" }
        ]
      }
    ]
  }
}
```

## Sécurisation

- Restreindre `interfaces-config` aux interfaces réseau voulues (ne pas écouter partout par défaut).
- Protéger l'API de contrôle (`kea-ctrl-agent`) si activée : authentification, écoute locale uniquement.
- Utiliser un backend de baux persistant en base (MySQL/PostgreSQL, via hook) en production pour la haute disponibilité, plutôt que le fichier `memfile` seul.
- Limiter la plage d'adresses distribuées à ce qui est strictement nécessaire (réduit la fenêtre d'exposition en cas de rogue DHCP concurrent).

## Logs & dépannage

```bash
journalctl -u kea-dhcp4-server -f
kea-dhcp4 -t /etc/kea/kea-dhcp4.conf     # test de config avant reload
cat /var/lib/kea/kea-leases4.csv         # baux actifs
```

## Voir aussi

- [isc-dhcp-server / dhcpd](./081-isc-dhcp-server-dhcpd.md) — le prédécesseur historique que Kea remplace
- [dnsmasq](./078-dnsmasq.md) — alternative DHCP légère pour petits réseaux
