---
id: 079-unbound
title: unbound — Résolveur DNS
sidebar_position: 79
tags: [linux, services, reseau]
---

# unbound — Résolveur DNS

**unbound** est un résolveur DNS **récursif et validant** (contrairement à BIND, il ne fait pas d'autoritaire) : il interroge lui-même la hiérarchie DNS depuis la racine plutôt que de forwarder vers un tiers, avec validation DNSSEC intégrée. Léger, orienté sécurité et vie privée — souvent utilisé comme résolveur local (ex: derrière un Pi-hole, ou pour éviter de dépendre d'un résolveur tiers).

## Installation

```bash
sudo apt install unbound          # Debian/Ubuntu
sudo dnf install unbound          # RHEL/Fedora
sudo systemctl enable --now unbound
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/unbound/unbound.conf` | Configuration principale |
| `/etc/unbound/unbound.conf.d/*.conf` | Fragments additionnels |
| `/var/lib/unbound/root.key` | Clé de confiance DNSSEC (root trust anchor) |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status/restart unbound` | Gérer le service |
| `unbound-checkconf` | Valider la config |
| `unbound-control status` | État et statistiques du résolveur |
| `unbound-control reload` | Recharger à chaud |
| `unbound-anchor` | Mettre à jour la clé de confiance DNSSEC |

## Exemple de configuration

```conf
server:
    interface: 127.0.0.1
    interface: 192.168.1.1
    access-control: 192.168.1.0/24 allow
    hide-identity: yes
    hide-version: yes
    qname-minimisation: yes    # réduit les infos envoyées aux serveurs amont (vie privée)
```

## Sécurisation

- `access-control` **toujours restreint** au réseau local — ne jamais autoriser `0.0.0.0/0` (résolveur ouvert = vecteur d'amplification DDoS).
- `hide-identity`/`hide-version` pour ne pas divulguer d'informations en reconnaissance.
- `qname-minimisation` activé par défaut sur les versions récentes — limite les métadonnées de requête exposées aux serveurs faisant autorité.
- Garder `root.key` à jour (`unbound-anchor`) pour que la validation DNSSEC reste fonctionnelle.

## Logs & dépannage

```bash
journalctl -u unbound -f
unbound-control stats_noreset      # statistiques de cache/requêtes
dig @127.0.0.1 exemple.fr +dnssec  # vérifier la validation DNSSEC (flag AD)
```

## Voir aussi

- [bind9 / named](./077-bind9-named.md) — serveur **autoritaire** ; unbound est son complément côté résolution
- [dnsmasq](./078-dnsmasq.md) — alternative plus légère mais sans validation DNSSEC native aussi poussée
