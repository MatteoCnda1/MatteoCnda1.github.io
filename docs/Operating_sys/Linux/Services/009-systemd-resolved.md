---
id: 009-systemd-resolved
title: systemd-resolved — résolution DNS
sidebar_position: 9
tags: [linux, services, reseau]
---

# systemd-resolved

Résolveur DNS local de systemd : il centralise la résolution de noms pour tout le système, avec cache, et peut faire du DNS-over-TLS ou du DNSSEC. Il expose une interface D-Bus utilisée par `resolvectl` (anciennement `systemd-resolve`) et gère `/etc/resolv.conf` via un stub.

## Installation

Fourni nativement avec systemd.

```bash
sudo systemctl enable --now systemd-resolved

# /etc/resolv.conf doit pointer vers le stub généré par resolved
sudo ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/systemd/resolved.conf` | Configuration principale (DNS, FallbackDNS, DNSSEC, DNSOverTLS) |
| `/etc/systemd/resolved.conf.d/*.conf` | Fragments de config additionnels |
| `/run/systemd/resolve/stub-resolv.conf` | Fichier généré, pointé par `/etc/resolv.conf` (résolveur stub sur `127.0.0.53`) |
| `/run/systemd/resolve/resolv.conf` | Résolveurs DNS réels utilisés en amont (pour les outils qui veulent les vrais serveurs) |

## Commandes utiles

```bash
systemctl status systemd-resolved
resolvectl status                 # DNS utilisé par interface
resolvectl query example.com      # tester une résolution
resolvectl dns eth0               # serveurs DNS associés à une interface
resolvectl flush-caches           # vider le cache DNS
resolvectl statistics             # stats du cache
```

## Exemple de configuration

Forcer DNS-over-TLS et DNSSEC (`/etc/systemd/resolved.conf`) :

```ini
[Resolve]
DNS=1.1.1.1 9.9.9.9
DNSOverTLS=yes
DNSSEC=yes
FallbackDNS=8.8.8.8
```

## Sécurisation

- Activer `DNSOverTLS=yes` pour chiffrer les requêtes DNS sortantes et éviter l'interception/le MITM sur un réseau non fiable.
- Activer `DNSSEC=yes` (ou `allow-downgrade`) pour valider l'authenticité des réponses DNS.
- Vérifier que `/etc/resolv.conf` pointe bien vers le stub `127.0.0.53` et non directement vers un DNS tiers, pour que resolved reste dans la boucle (cache, DNSSEC appliqués).
- Attention au **split DNS par interface** (`resolvectl domain`) mal configuré : un domaine interne peut fuiter vers un résolveur public, ou inversement.

## Logs & dépannage

```bash
journalctl -u systemd-resolved -f
resolvectl status                 # diagnostic n°1 : quel DNS est utilisé où
resolvectl query <domaine> -v     # requête verbeuse (voir DNSSEC, TTL, serveur interrogé)
```

Problème classique : `/etc/resolv.conf` écrasé par un autre outil (NetworkManager, dhclient) → revérifier le lien symbolique vers le stub.

## Voir aussi

- [systemd-networkd](./008-systemd-networkd.md) — souvent activé en tandem avec systemd-resolved sur les serveurs.
- [NetworkManager](./007-networkmanager.md) — gère aussi la résolution DNS quand il est actif, potentiel conflit à vérifier.
