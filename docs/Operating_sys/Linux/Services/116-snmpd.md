---
id: 116-snmpd
title: snmpd — agent SNMP
sidebar_position: 116
tags: [linux, services, monitoring]
---

# snmpd

Agent **SNMP** (Simple Network Management Protocol, Net-SNMP) qui expose l'état d'une machine (CPU, mémoire, interfaces réseau, process) à des outils de supervision tiers (Zabbix, PRTG, LibreNMS...) via des requêtes SNMP GET/WALK sur des OID standardisés (MIB). Très répandu pour la supervision d'équipements réseau (switches, routeurs) et de serveurs.

## Installation

```bash
sudo apt install snmpd snmp

sudo systemctl enable --now snmpd
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/snmp/snmpd.conf` | Configuration principale : communautés (v1/v2c) ou utilisateurs (v3), ACL, OID exposés |

## Commandes utiles

```bash
systemctl status|restart snmpd
snmpwalk -v2c -c public localhost .1.3.6.1.2.1.1    # interroger l'agent local en v2c
snmpget -v3 -u user -l authPriv -a SHA -A authpass -x AES -X privpass localhost sysUpTime.0
```

## Exemple de configuration

```
# /etc/snmp/snmpd.conf
rocommunity public 10.0.0.0/24
sysLocation "Salle serveur"
```

Autorise les lectures SNMP v2c avec la communauté `public`, uniquement depuis le sous-réseau `10.0.0.0/24`.

## Sécurisation

- **Éviter SNMPv1/v2c en production** : la communauté circule en clair sur le réseau. Préférer **SNMPv3** (authentification + chiffrement).
- Ne jamais laisser la communauté par défaut `public` accessible depuis l'extérieur — cible classique de reconnaissance réseau.
- Restreindre les OID exposés en lecture (`view`) au strict nécessaire.
- Filtrer le port UDP/161 par firewall aux seules IP des serveurs de supervision légitimes.

## Logs & dépannage

```bash
journalctl -u snmpd -f
snmpd -f -Le -Dread_config   # lancer en foreground avec logs verbeux pour déboguer
```

## Voir aussi

- [snmptrapd](./117-snmptrapd.md) — réception de traps SNMP (notifications poussées par l'agent, complémentaire au polling)
