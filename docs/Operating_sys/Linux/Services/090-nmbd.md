---
id: 090-nmbd
title: nmbd — NetBIOS Samba
sidebar_position: 90
tags: [linux, services, partage-fichiers]
---

# nmbd

**nmbd** est le second démon de la suite Samba : il gère la résolution de noms **NetBIOS** et l'annonce du serveur dans le voisinage réseau (*Network Neighborhood*/*Explorateur réseau* côté Windows), en implémentant le protocole NBNS (NetBIOS Name Service, équivalent WINS). Sur les réseaux modernes où la résolution de noms passe par DNS et où NetBIOS est désactivé côté clients Windows récents, nmbd devient optionnel — mais reste nécessaire pour la compatibilité avec du matériel/logiciel ancien.

## Installation

Installé avec le paquet `samba` (voir [smbd](./089-smbd.md)) :

```bash
sudo systemctl enable --now nmbd
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/samba/smb.conf` | Même fichier que smbd — section `[global]` (`workgroup`, `netbios name`, `wins support`) |

## Commandes utiles

```bash
systemctl status nmbd
nmblookup -B <ip> __SAMBA__     # tester la résolution NetBIOS
smbtree                         # parcourir le voisinage réseau SMB
journalctl -u nmbd
```

## Exemple de configuration

```ini
[global]
   workgroup = WORKGROUP
   netbios name = FILESERVER
   wins support = yes        # si ce serveur fait aussi office de serveur WINS
```

## Sécurisation

- NetBIOS (UDP 137/138) ne doit **jamais** être exposé sur Internet — réseau interne uniquement, filtré au firewall.
- Si aucun client legacy n'en a besoin, désactiver purement et simplement `nmbd` réduit la surface d'attaque.
- `wins support = yes` seulement sur un unique serveur du réseau (éviter les conflits WINS multiples).

## Logs & dépannage

```bash
journalctl -u nmbd
tail -f /var/log/samba/log.nmbd
smbtree                         # vérifier que le serveur apparaît dans le voisinage réseau
```

## Voir aussi

- [smbd](./089-smbd.md) — le démon de partage de fichiers, complémentaire
