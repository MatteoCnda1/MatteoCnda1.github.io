---
id: 006-ntpd
title: ntpd — Serveur NTP
sidebar_position: 6
tags: [linux, services, systeme, reseau]
---

# ntpd — Serveur NTP

`ntpd` est l'implémentation **historique** de référence du protocole NTP (Network Time Protocol), fournie par le paquet `ntp`. Elle a largement cédé la place à [chrony](./005-chrony.md) sur les distributions modernes (plus simple à configurer, meilleure gestion des réseaux instables), mais reste présente sur des systèmes plus anciens ou dans des environnements où sa maturité et sa richesse fonctionnelle (authentification, broadcast, référence matérielle GPS/PPS) sont spécifiquement recherchées.

## Installation

```bash
sudo apt install ntp
sudo dnf install ntp

# Désactiver le client par défaut avant d'activer ntpd
sudo systemctl disable --now systemd-timesyncd
sudo systemctl enable --now ntp        # nom du service Debian/Ubuntu
sudo systemctl enable --now ntpd       # nom du service RHEL/Fedora
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/ntp.conf` | Configuration principale (serveurs, restrictions d'accès) |
| `/var/lib/ntp/ntp.drift` | Fichier de dérive de l'horloge |
| `/etc/ntp/keys` (optionnel) | Clés d'authentification NTP |

## Commandes utiles

```bash
ntpq -p                     # lister les serveurs NTP configurés et leur état
ntpstat                     # statut simplifié de la synchronisation
ntpdate -q pool.ntp.org     # tester la résolution sans modifier l'horloge (obsolète mais toujours pratique en diagnostic)
systemctl status ntp
```

## Exemple de configuration

```ini title="/etc/ntp.conf"
server 0.fr.pool.ntp.org iburst
server 1.fr.pool.ntp.org iburst

restrict default nomodify notrap nopeer noquery
restrict 127.0.0.1
restrict ::1
```

Les lignes `restrict` limitent par défaut ce que les clients distants peuvent faire (pas de modification de configuration, pas de requêtes d'information) ; seule la loopback est pleinement autorisée.

## Sécurisation

- Toujours garder des lignes `restrict default noquery nomodify notrap` — un `ntpd` mal restreint est un vecteur classique d'**attaque par amplification NTP** (la commande `monlist`, désactivée par défaut sur les versions récentes, a été massivement exploitée par le passé).
- Ne jamais exposer `ntpd` en mode serveur ouvert sur Internet sans restriction — ne servir que le réseau interne légitime.
- Sur un déploiement neuf, préférer directement [chrony](./005-chrony.md), plus simple à sécuriser correctement par défaut.

## Logs & dépannage

```bash
journalctl -u ntp -f
ntpq -p                      # colonne "reach" doit progresser vers 377 (octal) = synchro stable
```

Si la synchro ne converge pas : vérifier que le port UDP 123 est ouvert en sortie, et que les serveurs listés dans `ntp.conf` sont joignables (`ntpq -p` affiche un `*` devant la source actuellement utilisée comme référence).

## Voir aussi

- [chrony](./005-chrony.md) — remplaçant moderne recommandé
- [systemd-timesyncd](./004-systemd-timesyncd.md) — alternative légère
