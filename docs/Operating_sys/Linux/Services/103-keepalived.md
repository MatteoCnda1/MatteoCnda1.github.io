---
id: 103-keepalived
title: keepalived — haute disponibilité / VRRP
sidebar_position: 103
tags: [linux, services, ha-cluster]
---

# keepalived — haute disponibilité / VRRP

`keepalived` implémente le protocole **VRRP** (Virtual Router Redundancy Protocol) sous Linux : plusieurs machines partagent une **IP virtuelle (VIP)**, et si le nœud maître tombe, un nœud backup la reprend automatiquement. Cas d'usage typique : basculement automatique d'un reverse proxy, d'un routeur ou d'un load balancer sans intervention manuelle.

## Installation

```bash
sudo apt install keepalived        # Debian/Ubuntu
sudo dnf install keepalived        # RHEL/Fedora
sudo systemctl enable --now keepalived
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/keepalived/keepalived.conf` | Configuration principale (instances VRRP, VIP, scripts de check) |
| `/etc/keepalived/scripts/` | Scripts de vérification personnalisés (health checks) |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status keepalived` | État du service |
| `ip a` | Vérifier la présence de la VIP sur l'interface |
| `journalctl -u keepalived -f` | Suivre les transitions MASTER/BACKUP en direct |
| `killall -SIGUSR1 keepalived` | Forcer keepalived à dumper son état (`/tmp/keepalived.data`) |

## Exemple de configuration

```conf
vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 150
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass s3cr3t
    }
    virtual_ipaddress {
        192.168.1.100/24
    }
}
```

Le nœud avec la `priority` la plus haute devient MASTER et porte la VIP ; en cas de panne (absence d'annonces VRRP), le BACKUP prend le relais.

## Sécurisation

- Toujours définir `auth_pass` (authentification VRRP) — sans elle, n'importe qui sur le segment réseau peut injecter de fausses annonces VRRP et détourner la VIP.
- Restreindre VRRP au réseau L2 concerné (il n'est pas routable, mais isoler le VLAN dédié à la HA reste une bonne pratique).
- Utiliser des `track_script` avec un timeout raisonnable pour éviter les faux positifs de bascule.
- `virtual_router_id` unique par segment réseau pour éviter les collisions avec d'autres instances VRRP.

## Logs & dépannage

- `journalctl -u keepalived` — transitions d'état, erreurs de config.
- `ip a show eth0` — vérifier si la VIP est bien présente localement.
- `tcpdump -i eth0 vrrp` — observer les annonces VRRP sur le réseau en cas de bascule inattendue.

## Voir aussi

- [corosync](./104-corosync.md) / [pacemaker](./105-pacemaker.md) — une alternative plus complète (cluster à plusieurs ressources) là où keepalived se limite à une IP virtuelle et un mécanisme simple.
