---
id: 010-networkd-dispatcher
title: networkd-dispatcher — actions réseau automatisées
sidebar_position: 10
tags: [linux, services, reseau]
---

# networkd-dispatcher

Démon qui surveille les changements d'état réseau rapportés par `systemd-networkd` (via D-Bus) et exécute des scripts en réaction — l'équivalent, côté `systemd-networkd`, des scripts `dispatcher.d` de NetworkManager.

## Installation

```bash
# Debian/Ubuntu
sudo apt install networkd-dispatcher
sudo systemctl enable --now networkd-dispatcher
```

Nécessite `systemd-networkd` actif : ce démon n'a aucun effet sans lui.

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/networkd-dispatcher/routable.d/` | Scripts exécutés quand une interface devient "routable" (a une route par défaut) |
| `/etc/networkd-dispatcher/off.d/` | Scripts exécutés quand une interface tombe |
| `/etc/networkd-dispatcher/no-carrier.d/` | Scripts exécutés en cas de perte du lien physique |
| `/etc/networkd-dispatcher/degraded.d/` | Scripts exécutés en cas d'état dégradé (IP obtenue mais pas de route par défaut, etc.) |

Chaque script doit être exécutable (`chmod +x`) et reçoit l'état et le nom d'interface en variables d'environnement (`$IFACE`, `$STATE`).

## Commandes utiles

```bash
systemctl status networkd-dispatcher
systemctl restart networkd-dispatcher

# Tester manuellement un script du dossier routable.d
sudo /etc/networkd-dispatcher/routable.d/mon-script eth0 routable
```

## Exemple de configuration

Script minimal qui redémarre un service VPN quand une interface devient routable (`/etc/networkd-dispatcher/routable.d/50-restart-vpn`) :

```bash
#!/bin/sh
if [ "$IFACE" = "eth0" ]; then
    systemctl restart wg-quick@wg0
fi
```

## Sécurisation

- Les scripts s'exécutent en tant que **root** : les permissions du dossier `/etc/networkd-dispatcher/*.d/` et de chaque script doivent être strictes (`root:root`, non modifiables par un utilisateur non privilégié).
- Éviter d'y placer des secrets en clair (identifiants, clés) — préférer un appel à un secret manager ou un fichier séparé bien protégé.
- Auditer régulièrement le contenu de ces dossiers : un script malveillant déposé là s'exécute automatiquement à chaque changement réseau, sans interaction utilisateur.

## Logs & dépannage

```bash
journalctl -u networkd-dispatcher -f
# Les scripts eux-mêmes n'ont pas de log dédié : rediriger leur sortie explicitement
# dans le script, ex: exec >> /var/log/networkd-dispatcher-custom.log 2>&1
```

## Voir aussi

- [systemd-networkd](./008-systemd-networkd.md) — le démon dont networkd-dispatcher consomme les événements d'état.
