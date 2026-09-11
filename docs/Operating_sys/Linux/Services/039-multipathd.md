---
id: 039-multipathd
title: multipathd — Multipath stockage
sidebar_position: 39
tags: [linux, services, stockage]
---

# multipathd — Multipath stockage

**multipathd** gère le **Device Mapper Multipath (DM-Multipath)** : quand un serveur accède à un même LUN de stockage (SAN, iSCSI, FC) via plusieurs chemins physiques redondants, multipathd les fusionne en un seul périphérique logique, avec bascule automatique en cas de panne d'un chemin.

## Installation

```bash
sudo apt install multipath-tools
sudo systemctl enable --now multipathd
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/multipath.conf` | Configuration principale : blacklist, alias, politique de basculement |
| `/etc/multipath/wwids` | WWID des périphériques connus, généré automatiquement |
| `/etc/multipath/bindings` | Correspondance nom de périphérique ↔ WWID |

## Commandes utiles

```bash
systemctl status multipathd
multipath -ll                    # état détaillé de tous les devices multipath
multipath -f mpatha              # supprimer un device multipath
multipathd show paths            # état de chaque chemin individuel
multipathd show maps             # liste des maps configurées
```

## Exemple de configuration

```
# /etc/multipath.conf
defaults {
    user_friendly_names yes
    path_grouping_policy multibus
    path_checker tur
    failback immediate
}

blacklist {
    devnode "^sda$"    # exclure le disque système local du multipath
}
```

`path_grouping_policy multibus` répartit la charge sur tous les chemins actifs ; `failback immediate` restaure un chemin dès qu'il redevient disponible.

## Sécurisation

- Toujours **blacklister le disque système local** (`blacklist`) pour éviter que multipath ne tente de le gérer par erreur — cause fréquente de systèmes qui ne bootent plus.
- Vérifier régulièrement `multipath -ll` pour détecter des chemins en état `failed`/`faulty` avant qu'une panne complète ne survienne (perte de tous les chemins redondants).
- Documenter le mapping WWID ↔ nom d'hôte/LUN pour éviter toute confusion lors d'opérations de maintenance SAN.

## Logs & dépannage

```bash
journalctl -u multipathd
multipath -v3 -ll                # verbeux, utile pour diagnostiquer une configuration incorrecte
cat /var/log/messages | grep multipathd   # selon la distribution
```

## Voir aussi

- [iscsid](./040-iscsid.md) — multipath s'utilise fréquemment au-dessus d'un stockage iSCSI pour la redondance de chemins
