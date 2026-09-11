---
id: 113-nagios
title: Nagios — monitoring
sidebar_position: 113
tags: [linux, services, monitoring]
---

# Nagios

Système de supervision historique (fin des années 90), toujours largement déployé. Fonctionne par **plugins** : chaque vérification (état d'un service, seuil CPU, ping...) est un exécutable indépendant qui retourne un code de sortie standardisé (0=OK, 1=WARNING, 2=CRITICAL, 3=UNKNOWN) et un texte. Nagios orchestre ces checks selon une configuration déclarative d'hôtes et de services.

## Installation

```bash
sudo apt install nagios4 nagios-plugins-contrib monitoring-plugins

sudo systemctl enable --now nagios4
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/nagios4/nagios.cfg` | Configuration principale, inclut les autres fichiers |
| `/etc/nagios4/conf.d/` | Définitions d'hôtes, services, contacts |
| `/usr/lib/nagios/plugins/` | Binaires des plugins de check (`check_ping`, `check_disk`...) |

## Commandes utiles

```bash
systemctl status|restart nagios4
nagios4 -v /etc/nagios4/nagios.cfg     # valider la configuration avant reload
/usr/lib/nagios/plugins/check_disk -w 20% -c 10% -p /   # tester un plugin manuellement
```

## Exemple de configuration

```cfg
define service {
    use                 generic-service
    host_name           web01
    service_description Disk /
    check_command        check_disk!20%!10%!/
}
```

Définit une vérification d'espace disque sur `web01`, avec seuils warning à 20% restant et critical à 10%.

## Sécurisation

- Toujours valider la config (`-v`) avant `reload` : une erreur de syntaxe empêche le redémarrage.
- Protéger l'interface web CGI (authentification, HTTPS).
- Restreindre les commandes externes (`check_external_commands`) si NRPE/NSCA n'est pas nécessaire.
- Sur les hôtes distants supervisés via NRPE, restreindre les IP autorisées à interroger l'agent.

## Logs & dépannage

```bash
journalctl -u nagios4 -f
tail -f /var/log/nagios4/nagios.log
```

## Voir aussi

- [Zabbix Server](./112-zabbix-server.md) — alternative plus moderne avec agents actifs
