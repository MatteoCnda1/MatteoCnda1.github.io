---
id: 040-iscsid
title: iscsid — Stockage iSCSI
sidebar_position: 40
tags: [linux, services, stockage]
---

# iscsid — Stockage iSCSI

**iscsid** est le démon client **iSCSI** (*Internet SCSI*) : il gère les sessions vers des cibles (*targets*) de stockage distantes exposées sur le réseau IP, faisant apparaître un LUN distant comme un disque local (`/dev/sdX`).

## Installation

```bash
sudo apt install open-iscsi
sudo systemctl enable --now iscsid
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/iscsi/iscsid.conf` | Configuration du démon (timeouts, authentification CHAP) |
| `/etc/iscsi/initiatorname.iscsi` | IQN (identifiant unique) de cet initiateur |
| `/var/lib/iscsi/` | Métadonnées des sessions/nodes découverts |

## Commandes utiles

```bash
systemctl status iscsid
iscsiadm -m discovery -t sendtargets -p <ip-target>   # découvrir les cibles disponibles
iscsiadm -m node -T <iqn-cible> -p <ip-target> --login # se connecter à une cible
iscsiadm -m session                                    # lister les sessions actives
iscsiadm -m node -T <iqn-cible> --logout                # se déconnecter
lsblk                                                    # vérifier l'apparition du disque iSCSI
```

## Exemple de configuration

```
# /etc/iscsi/iscsid.conf — authentification CHAP
node.session.auth.authmethod = CHAP
node.session.auth.username = client1
node.session.auth.password = motdepasse_fort
```

## Sécurisation

- Activer **CHAP** (authentification mutuelle) — sans elle, n'importe quel hôte du réseau IP peut découvrir et monter les LUN exposés.
- Isoler le trafic iSCSI sur un **VLAN/réseau dédié** (jamais en clair sur le réseau de production) : le protocole ne chiffre pas les données par défaut.
- Restreindre l'accès aux cibles par IP/IQN côté serveur de stockage (ACL sur le target), en plus du CHAP.
- Combiner avec [multipathd](./039-multipathd.md) pour la redondance de chemins plutôt qu'un lien réseau unique.

## Logs & dépannage

```bash
journalctl -u iscsid
iscsiadm -m session -P 3          # détail complet d'une session (état, portails)
dmesg | grep -i iscsi
```

## Voir aussi

- [multipathd](./039-multipathd.md) — redondance de chemins pour les LUN iSCSI
