---
id: 099-openvpn
title: OpenVPN — VPN
sidebar_position: 99
tags: [linux, services, vpn]
---

# OpenVPN — VPN

**OpenVPN** est une solution de VPN mature basée sur TLS (via OpenSSL), fonctionnant en mode routé (TUN, couche 3) ou pont (TAP, couche 2). Historiquement le standard de facto avant l'arrivée de WireGuard, encore très répandu pour sa flexibilité (authentification par certificats, intégration LDAP/RADIUS, traversée de proxy HTTP).

## Installation

```bash
sudo apt install openvpn easy-rsa     # Debian/Ubuntu
sudo dnf install openvpn easy-rsa     # Fedora/RHEL
```

Chaque tunnel correspond à une instance systemd nommée d'après le fichier de config :

```bash
sudo systemctl enable --now openvpn@monvpn   # charge /etc/openvpn/monvpn.conf
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/openvpn/server/<nom>.conf` | Config serveur |
| `/etc/openvpn/client/<nom>.conf` (ou `.ovpn`) | Config client |
| `/etc/openvpn/easy-rsa/` | PKI pour générer certificats serveur/client |

## Commandes utiles

```bash
systemctl status openvpn@<nom>
openvpn --config client.ovpn --verb 4    # test manuel en avant-plan, verbeux
```

## Exemple de configuration

```conf
# client.ovpn (extrait minimal)
client
dev tun
proto udp
remote vpn.exemple.fr 1194
ca ca.crt
cert client.crt
key client.key
cipher AES-256-GCM
```

## Sécurisation

- Utiliser exclusivement des **chiffrements AEAD modernes** (`AES-256-GCM`, `AES-128-GCM`) — éviter les vieux ciphers CBC non authentifiés.
- Activer `tls-auth`/`tls-crypt` : ajoute une couche HMAC qui protège contre le DoS et le fingerprinting du port OpenVPN avant même la négociation TLS.
- Révoquer systématiquement les certificats des postes perdus/compromis (`easyrsa revoke`, publier la CRL).
- Restreindre les routes poussées au strict nécessaire (`push "route ..."`) plutôt qu'un accès tout-réseau par défaut.

## Logs & dépannage

```bash
journalctl -u openvpn@<nom>
# ou selon la distro :
tail -f /var/log/openvpn/openvpn.log
```

## Voir aussi

- [wg-quick (WireGuard)](./100-wg-quick.md) et [strongSwan](./101-strongswan.md) — deux alternatives VPN, plus modernes/légères pour WireGuard, orientée IPsec/entreprise pour strongSwan
