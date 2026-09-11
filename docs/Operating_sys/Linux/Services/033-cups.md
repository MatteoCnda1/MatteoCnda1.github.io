---
id: 033-cups
title: cups — Serveur d'impression
sidebar_position: 33
tags: [linux, services, impression]
---

# cups — Serveur d'impression

**CUPS** (Common UNIX Printing System) est le système d'impression standard sur Linux/macOS. Il gère les files d'attente, les pilotes (drivers PPD/IPP) et expose une interface web d'administration sur le port 631. Paquet : `cups`, démon : `cupsd`.

## Installation

```bash
sudo apt install cups              # Debian/Ubuntu
sudo dnf install cups              # Fedora/RHEL
sudo systemctl enable --now cups
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/cups/cupsd.conf` | Configuration du démon (écoute, accès, journalisation) |
| `/etc/cups/printers.conf` | Imprimantes configurées |
| `/etc/cups/ppd/*.ppd` | Fichiers de description de pilote par imprimante |
| `/etc/cups/cups-files.conf` | Chemins des fichiers système (logs, spool) |

## Commandes utiles

```bash
systemctl status cups
lpadmin -p <nom> -E -v <uri> -m everywhere   # ajouter une imprimante (IPP Everywhere)
lpstat -p -d                                  # état des imprimantes, imprimante par défaut
lpstat -o                                     # jobs en attente
cancel <job-id>                               # annuler un job
lp -d <imprimante> fichier.pdf                # imprimer en ligne de commande
```

## Exemple de configuration

```apache
# /etc/cups/cupsd.conf — limiter l'accès à l'interface web au réseau local
Listen localhost:631
Listen /var/run/cups/cups.sock
<Location />
  Order allow,deny
  Allow from 127.0.0.1
  Allow from 192.168.1.0/24
</Location>
```

## Sécurisation

- Ne pas exposer l'interface web (`:631`) au-delà du réseau local — `Listen localhost:631` ou restriction par `Allow from`.
- Désactiver le partage réseau (`Browsing Off`) si l'imprimante n'a pas besoin d'être découverte par d'autres postes.
- Restreindre l'administration à des utilisateurs du groupe `lpadmin`.
- Maintenir CUPS à jour : des CVE critiques (ex. CVE-2024-47176, exécution de code via `cups-browsed`) ont visé le service exposé sur Internet.

## Logs & dépannage

```bash
journalctl -u cups
tail -f /var/log/cups/error_log
cupsctl --debug-logging   # activer le logging détaillé temporairement
```

## Voir aussi

- [avahi-daemon](./011-avahi-daemon.md) — CUPS s'appuie souvent sur mDNS pour la découverte d'imprimantes réseau (IPP Everywhere/AirPrint)
