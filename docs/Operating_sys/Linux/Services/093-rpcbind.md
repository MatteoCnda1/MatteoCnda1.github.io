---
id: 093-rpcbind
title: rpcbind — RPC / NFS
sidebar_position: 93
tags: [linux, services, partage-fichiers]
---

# rpcbind

**rpcbind** est un service d'annuaire pour les programmes **ONC RPC** (Open Network Computing Remote Procedure Call) : il traduit un numéro de programme RPC (ex: NFS, NIS) en port TCP/UDP effectivement utilisé, ces derniers étant attribués dynamiquement. C'est un prérequis historique de **NFSv3**. NFSv4 s'en passe largement (port fixe 2049), ce qui simplifie beaucoup le filtrage réseau.

## Installation

```bash
sudo apt install rpcbind
sudo systemctl enable --now rpcbind
```

Généralement installé automatiquement comme dépendance de `nfs-kernel-server` (voir [nfs-server](./092-nfs-server.md)).

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/default/rpcbind` (Debian) | Options de démarrage du démon (ex: écoute restreinte) |
| `/etc/netconfig` | Configuration des transports réseau supportés par RPC |

## Commandes utiles

```bash
rpcinfo -p                      # lister les services RPC enregistrés et leurs ports
rpcinfo -p localhost
systemctl status rpcbind
journalctl -u rpcbind
```

## Exemple de configuration

```bash
# /etc/default/rpcbind (Debian) — restreindre l'écoute au loopback + réseau interne
OPTIONS="-w -h 127.0.0.1 -h 192.168.1.10"
```

## Sécurisation

- **Ne jamais exposer rpcbind sur Internet** — il a historiquement servi de vecteur d'attaques par amplification DDoS et de reconnaissance des services RPC actifs.
- Restreindre l'écoute (`-h`) aux interfaces/réseaux internes nécessaires.
- Filtrer le port 111 (TCP/UDP) au firewall pour n'autoriser que les clients NFS légitimes.
- Migrer vers **NFSv4** quand possible pour réduire la dépendance à rpcbind (port unique 2049, plus simple à sécuriser qu'un annuaire RPC à ports dynamiques).

## Logs & dépannage

```bash
journalctl -u rpcbind
rpcinfo -p                      # diagnostic principal : quels services RPC sont enregistrés
```

Problème fréquent : montage NFSv3 qui échoue avec "RPC: Program not registered" → rpcbind n'est pas démarré ou le service NFS ne s'y est pas correctement enregistré (redémarrer `nfs-server` après `rpcbind`).

## Voir aussi

- [nfs-server](./092-nfs-server.md) — le service qui dépend de rpcbind en NFSv3
