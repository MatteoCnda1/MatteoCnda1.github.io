---
id: 015-nftables
title: nftables — pare-feu Linux
sidebar_position: 15
tags: [linux, services, securite]
---

# nftables — pare-feu Linux

`nftables` est le successeur moderne d'`iptables`, intégré au noyau Linux comme moteur de filtrage unifié (remplace aussi `ip6tables`, `arptables`, `ebtables`). C'est le moteur bas niveau que pilotent `ufw` et `firewalld`.

## Installation

```bash
sudo apt install nftables      # ou dnf install nftables
sudo systemctl enable --now nftables
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/nftables.conf` | Ruleset chargé au démarrage du service |
| `/etc/nftables/` | Fichiers additionnels inclus selon la distribution |

## Commandes utiles

```bash
sudo systemctl status nftables
sudo nft list ruleset                 # voir les règles actives
sudo nft list tables
sudo nft add table inet filter
sudo nft add chain inet filter input { type filter hook input priority 0 \; }
sudo nft add rule inet filter input tcp dport 22 accept
sudo nft delete rule inet filter input handle <n>
sudo nft -f /etc/nftables.conf        # recharger le fichier de conf
```

## Exemple de configuration

```nft
#!/usr/sbin/nft -f
flush ruleset

table inet filter {
  chain input {
    type filter hook input priority 0; policy drop;
    ct state established,related accept
    iif lo accept
    tcp dport 22 accept
    tcp dport { 80, 443 } accept
  }
}
```

## Sécurisation

- Politique par défaut **drop** sur la chaîne `input`, avec acceptation explicite du strict nécessaire.
- Toujours autoriser `ct state established,related` pour ne pas casser les connexions déjà ouvertes (retours de requêtes sortantes).
- Grouper les règles par table `inet` (couvre IPv4 **et** IPv6 en une seule définition) pour éviter les oublis IPv6.
- Sauvegarder le ruleset (`nft list ruleset > backup.nft`) avant toute modification importante.

## Logs & dépannage

```bash
journalctl -u nftables
sudo nft monitor                      # observer les paquets/événements en temps réel
sudo nft -c -f /etc/nftables.conf     # valider la syntaxe sans appliquer
```

## Voir aussi

- [Pare-feu — nftables, ufw, fail2ban](../Security/04-pare-feu-nftables-ufw-fail2ban.md) — cours complet sur l'architecture netfilter, la syntaxe et le durcissement.
- [Linux Firewalling](../Networking/02-linux-firewalling.md) — vue réseau du filtrage sous Linux.
