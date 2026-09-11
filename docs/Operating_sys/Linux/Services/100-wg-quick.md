---
id: 100-wg-quick
title: wg-quick — WireGuard
sidebar_position: 100
tags: [linux, services, vpn]
---

# wg-quick — WireGuard

**WireGuard** est un VPN moderne intégré au noyau Linux depuis 5.6, reposant sur une cryptographie fixe et moderne (Curve25519, ChaCha20-Poly1305) plutôt que sur la négociation TLS d'OpenVPN. Résultat : configuration minimaliste, performances nettement supérieures, code source très réduit (donc plus auditable). `wg-quick` est le script/service qui monte une interface WireGuard à partir d'un fichier de config.

## Installation

```bash
sudo apt install wireguard          # Debian/Ubuntu (inclut wireguard-tools)
sudo dnf install wireguard-tools    # Fedora/RHEL
```

Activation via une instance systemd nommée d'après l'interface :

```bash
sudo systemctl enable --now wg-quick@wg0   # charge /etc/wireguard/wg0.conf
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/wireguard/wg0.conf` | Config de l'interface (clé privée locale + peers) |
| `/etc/wireguard/privatekey` / `publickey` | Paire de clés (générées avec `wg genkey`) |

## Commandes utiles

```bash
wg genkey | tee privatekey | wg pubkey > publickey   # générer une paire de clés
systemctl status wg-quick@wg0
wg show                          # état de l'interface et des peers (handshake, trafic)
wg-quick up/down wg0             # monter/démonter manuellement
```

## Exemple de configuration

```ini
# /etc/wireguard/wg0.conf (côté serveur)
[Interface]
Address = 10.10.0.1/24
PrivateKey = <clé privée serveur>
ListenPort = 51820

[Peer]
PublicKey = <clé publique du client>
AllowedIPs = 10.10.0.2/32
```

## Sécurisation

- Chaque peer est authentifié par sa **clé publique** : révoquer un accès = simplement retirer son bloc `[Peer]`, pas de PKI/CRL à gérer.
- Restreindre `AllowedIPs` au strict nécessaire par peer (évite qu'un client compromis usurpe le trafic d'un autre).
- Protéger les fichiers `privatekey` (`chmod 600`) — la sécurité repose entièrement sur leur confidentialité.
- Choisir un `ListenPort` non standard si on veut limiter le bruit de scan automatisé (protection marginale, pas une vraie sécurité).

## Logs & dépannage

```bash
journalctl -u wg-quick@wg0
wg show wg0             # vérifier "latest handshake" pour diagnostiquer une connexion qui ne s'établit pas
```

## Voir aussi

- [OpenVPN](./099-openvpn.md) — alternative plus ancienne, PKI complète et compatibilité plus large
- [strongSwan](./101-strongswan.md) — alternative IPsec orientée entreprise/site-à-site
