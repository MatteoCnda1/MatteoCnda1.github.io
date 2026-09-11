---
id: 089-smbd
title: smbd — Partage SMB/Samba
sidebar_position: 89
tags: [linux, services, partage-fichiers]
---

# smbd

**smbd** est le démon principal de **Samba**, qui implémente le protocole **SMB/CIFS** : il permet à une machine Linux de partager des fichiers/imprimantes avec des clients Windows (et Linux/macOS, qui parlent aussi SMB). C'est le pendant Linux d'un partage réseau Windows. `smbd` gère l'accès aux fichiers/impression ; la résolution de noms NetBIOS est gérée par [nmbd](./090-nmbd.md), et l'intégration à un domaine Active Directory par [winbind](./091-winbind.md).

## Installation

```bash
sudo apt install samba
sudo systemctl enable --now smbd
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/samba/smb.conf` | Configuration principale (partages, options globales) |
| `/var/lib/samba/private/` | Base des utilisateurs Samba (`smbpasswd`) |
| `/etc/samba/smbusers` | Correspondance utilisateurs Unix ↔ Samba |

## Commandes utiles

```bash
testparm                       # valider la syntaxe de smb.conf
smbclient -L //localhost -U user   # lister les partages depuis le client
smbstatus                      # voir les connexions/fichiers ouverts
smbpasswd -a utilisateur       # créer un utilisateur Samba
systemctl restart smbd
```

## Exemple de configuration

```ini
[global]
   workgroup = WORKGROUP
   security = user
   map to guest = never
   server min protocol = SMB2

[partage]
   path = /srv/partage
   valid users = @equipe
   read only = no
   browseable = yes
```

`security = user` impose une authentification (par opposition à `security = share`, obsolète et non sécurisé). `server min protocol = SMB2` désactive le protocole SMB1, historiquement vulnérable (EternalBlue/WannaCry).

## Sécurisation

- **Désactiver SMB1** (`server min protocol = SMB2` ou supérieur) — SMB1 est la cible de vulnérabilités majeures (MS17-010/EternalBlue).
- `map to guest = never` pour interdire tout accès invité implicite.
- Restreindre chaque partage à des groupes précis (`valid users`/`write list`).
- Activer le **signing SMB** (`server signing = mandatory`) pour empêcher le relais SMB.
- N'exposer smbd que sur les réseaux internes de confiance — jamais directement sur Internet.

## Logs & dépannage

```bash
journalctl -u smbd
tail -f /var/log/samba/log.smbd
smbstatus                      # sessions et verrous actifs
testparm                       # détecter une erreur de syntaxe avant redémarrage
```

## Voir aussi

- [nmbd](./090-nmbd.md) — résolution de noms NetBIOS, complémentaire de smbd
- [winbind](./091-winbind.md) — intégration à un domaine Active Directory
- [PCredz](../../../Cybersecurity/22-Security-Tools/pcredz.md) — SMB/NTLM fait partie des protocoles dont les hashs peuvent être capturés sur un réseau mal segmenté
