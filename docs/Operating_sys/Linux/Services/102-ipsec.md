---
id: 102-ipsec
title: ipsec — service historique de gestion IPsec
sidebar_position: 102
tags: [linux, services, vpn]
---

# ipsec — service historique de gestion IPsec

`ipsec` désigne à la fois la **commande** et, historiquement, le **service** (`ipsec.service`, via le script `starter`) utilisé pour piloter une pile IPsec sous Linux — fourni aussi bien par **strongSwan** que par son cousin **Libreswan**. C'est l'interface historique, progressivement remplacée par `swanctl` côté strongSwan (voir [strongSwan](./101-strongswan.md)) mais encore très répandue en production, notamment sur les configurations existantes et sur Libreswan.

## Installation

Fourni avec le paquet `strongswan` (composant `starter`) ou `libreswan` :

```bash
sudo apt install strongswan     # inclut le service ipsec (starter)
# ou
sudo apt install libreswan
sudo systemctl enable --now ipsec
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/ipsec.conf` | Définition des connexions (`conn ...`) |
| `/etc/ipsec.secrets` | Clés pré-partagées / références aux certificats |
| `/etc/ipsec.d/` | Certificats, CRL, clés privées |

## Commandes utiles

```bash
systemctl status ipsec
ipsec status                    # état des tunnels
ipsec statusall                 # état détaillé
ipsec up <nom-connexion>
ipsec down <nom-connexion>
ipsec reload                    # recharger après modif de ipsec.conf
ipsec verify                    # vérifier la configuration/les prérequis système
```

## Exemple de configuration

```ini
# /etc/ipsec.conf (extrait, tunnel site-à-site avec PSK)
conn site-a-b
    left=203.0.113.1
    right=203.0.113.2
    leftsubnet=10.1.0.0/24
    rightsubnet=10.2.0.0/24
    authby=secret
    auto=start
```

```
# /etc/ipsec.secrets
203.0.113.1 203.0.113.2 : PSK "un-secret-fort-genere-aleatoirement"
```

## Sécurisation

- Préférer une **clé pré-partagée forte générée aléatoirement** (jamais un mot de passe mémorisable) si on reste en PSK, sinon migrer vers des certificats.
- Restreindre `leftsubnet`/`rightsubnet` au strict nécessaire.
- Sur une configuration existante, envisager la migration vers `swanctl` (interface moderne, voir [strongSwan](./101-strongswan.md)) qui offre une gestion plus fine des reload sans coupure.

## Logs & dépannage

```bash
journalctl -u ipsec
ipsec statusall                 # diagnostic principal : SA établies, dernière négociation
```

## Voir aussi

- [strongSwan / swanctl](./101-strongswan.md) — l'interface moderne qui remplace progressivement `ipsec`/`starter`
- [VPN avec nmcli (IPsec / strongSwan)](../Networking/vpn-nmcli.md) — la même techno via NetworkManager
