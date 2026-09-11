---
id: 117-snmptrapd
title: snmptrapd — réception de traps SNMP
sidebar_position: 117
tags: [linux, services, monitoring]
---

# snmptrapd

Démon Net-SNMP qui **reçoit** les traps SNMP — des notifications poussées spontanément par un équipement (routeur, switch, onduleur...) lors d'un événement (lien down, seuil dépassé) — à la différence de `snmpd` qui répond à des requêtes de polling. Complète une supervision par polling avec de l'événementiel quasi temps réel.

## Installation

```bash
sudo apt install snmptrapd

sudo systemctl enable --now snmptrapd
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/snmp/snmptrapd.conf` | Communautés/utilisateurs autorisés à envoyer des traps, actions à déclencher |
| `/var/log/snmptrapd.log` | Journal des traps reçus (selon configuration) |

## Commandes utiles

```bash
systemctl status|restart snmptrapd
snmptrap -v2c -c public localhost '' .1.3.6.1.6.3.1.1.5.3   # envoyer un trap de test
tail -f /var/log/snmptrapd.log
```

## Exemple de configuration

```
# /etc/snmp/snmptrapd.conf
authCommunity log,execute public
traphandle default /usr/local/bin/handle_trap.sh
```

Accepte les traps avec la communauté `public`, les journalise, et exécute un script personnalisé pour chaque trap reçu (ex: notification Slack/email).

## Sécurisation

- Mêmes réserves que `snmpd` sur v1/v2c : préférer **SNMPv3** pour l'authentification/chiffrement des traps entrants.
- Restreindre par firewall les IP autorisées à envoyer des traps (UDP/162) aux seuls équipements légitimes.
- Valider/assainir tout script déclenché par `traphandle` — un trap est une donnée entrante non fiable par défaut.

## Logs & dépannage

```bash
journalctl -u snmptrapd -f
tail -f /var/log/snmptrapd.log
```

## Voir aussi

- [snmpd](./116-snmpd.md) — l'agent de polling, complémentaire à ce récepteur d'événements
