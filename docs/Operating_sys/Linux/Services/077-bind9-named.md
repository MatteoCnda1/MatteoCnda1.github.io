---
id: 077-bind9-named
title: bind9 / named — Serveur DNS BIND
sidebar_position: 77
tags: [linux, services, reseau]
---

# bind9 / named — Serveur DNS BIND

**BIND** (Berkeley Internet Name Domain, paquet `bind9`) est le serveur DNS open source de référence, utilisable en **autoritaire** (héberger des zones) ou en **résolveur/cache**. Le démon s'appelle `named` — c'est le même logiciel, `bind9` étant le nom du paquet (Debian/Ubuntu) et `named` le nom du service/binaire (partout, y compris RHEL-like où le paquet s'appelle `bind`).

## Installation

```bash
# Debian/Ubuntu
sudo apt install bind9 bind9utils
sudo systemctl enable --now named

# RHEL/Fedora
sudo dnf install bind bind-utils
sudo systemctl enable --now named
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/bind/named.conf` (Debian) ou `/etc/named.conf` (RHEL) | Fichier principal, inclut les autres |
| `/etc/bind/named.conf.options` | Options globales (forwarders, recursion, listen-on) |
| `/etc/bind/named.conf.local` | Déclaration des zones locales |
| `/var/lib/bind/` ou `/var/named/` | Fichiers de zone (`db.exemple.fr`) |
| `/etc/bind/rndc.key` | Clé pour l'outil de contrôle `rndc` |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status/restart named` | Gérer le service |
| `named-checkconf` | Valider la syntaxe de `named.conf` |
| `named-checkzone <zone> <fichier>` | Valider un fichier de zone |
| `rndc reload` | Recharger la config sans redémarrer (à chaud) |
| `rndc status` | État du serveur |
| `dig @localhost exemple.fr` | Interroger le serveur localement |

## Exemple de configuration

```conf
// named.conf.local — zone autoritaire minimale
zone "exemple.fr" {
    type master;
    file "/etc/bind/db.exemple.fr";
    allow-transfer { 10.0.0.2; };   // limiter les transferts de zone
};
```

```conf
// named.conf.options — resolveur avec forwarders
options {
    recursion yes;
    allow-recursion { 10.0.0.0/24; };   // ne pas ouvrir en résolveur public !
    forwarders { 9.9.9.9; 1.1.1.1; };
    dnssec-validation auto;
};
```

## Sécurisation

- **Ne jamais** exposer un résolveur récursif ouvert à Internet (`allow-recursion any`) — sert de relais aux attaques d'amplification DNS.
- Restreindre `allow-transfer` aux IP des secondaires légitimes (empêche l'exfiltration de zone complète).
- Activer **DNSSEC** (`dnssec-validation auto`) pour valider les réponses reçues.
- Exécuter `named` en `chroot` ou confiné (AppArmor/SELinux profile fourni par le paquet).
- Séparer autoritaire et résolveur sur deux instances distinctes en production (bonne pratique DNS classique).

## Logs & dépannage

```bash
journalctl -u named -f
tail -f /var/log/syslog | grep named     # selon config syslog

named-checkconf -z          # valide config + toutes les zones déclarées
dig @localhost exemple.fr SOA
rndc status
```

## Voir aussi

- [unbound](./079-unbound.md) — résolveur DNS pur, alternative à BIND en mode cache (pas de fonction autoritaire)
- [dnsmasq](./078-dnsmasq.md) — alternative légère DNS+DHCP pour petits réseaux
