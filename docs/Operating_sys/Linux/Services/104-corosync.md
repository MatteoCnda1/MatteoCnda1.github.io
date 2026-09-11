---
id: 104-corosync
title: corosync — couche de communication cluster
sidebar_position: 104
tags: [linux, services, ha-cluster]
---

# corosync — couche de communication cluster

`corosync` fournit la **couche de communication et de membership** d'un cluster Linux : il détecte quels nœuds sont vivants, diffuse des messages de manière fiable et ordonnée entre eux (totem protocol), et sert de fondation à des gestionnaires de ressources comme **pacemaker**. Seul, corosync ne décide de rien : il informe pacemaker de l'état du cluster.

## Installation

```bash
sudo apt install corosync
sudo dnf install corosync
sudo systemctl enable --now corosync
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/corosync/corosync.conf` | Configuration du cluster (nœuds, anneaux réseau, quorum) |
| `/etc/corosync/authkey` | Clé partagée d'authentification entre nœuds (générée par `corosync-keygen`) |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `corosync-cfgtool -s` | État des anneaux réseau (rings) |
| `corosync-quorumtool` | État du quorum du cluster |
| `corosync-keygen` | Générer la clé d'authentification partagée |
| `journalctl -u corosync -f` | Suivre les événements de membership |

## Exemple de configuration

```conf
totem {
    version: 2
    cluster_name: mon_cluster
    transport: knet
}

nodelist {
    node {
        ring0_addr: 10.0.0.1
        nodeid: 1
    }
    node {
        ring0_addr: 10.0.0.2
        nodeid: 2
    }
}

quorum {
    provider: corosync_votequorum
    two_node: 1
}
```

`two_node: 1` évite le split-brain sur un cluster à seulement 2 nœuds (où le quorum classique à la majorité ne fonctionne pas).

## Sécurisation

- Toujours utiliser `authkey` (généré par `corosync-keygen`) — sans elle, un tiers sur le réseau peut injecter de faux messages de cluster.
- Isoler le trafic corosync sur un réseau dédié (VLAN privé entre nœuds), jamais exposé à Internet.
- Chiffrer le trafic (`crypto_cipher: aes256`, `crypto_hash: sha256` dans `totem{}`).
- Configurer correctement le **quorum** pour éviter le split-brain (un cluster à 2 nœuds sans arbitre tiers est fragile — envisager un qdevice).

## Logs & dépannage

- `journalctl -u corosync` — événements de membership, pertes de nœuds.
- `corosync-quorumtool -s` — diagnostic rapide de l'état du quorum.
- `corosync-cfgtool -s` — vérifier qu'aucun ring n'est marqué `FAULTY`.

## Voir aussi

- [pacemaker](./105-pacemaker.md) — la couche de décision/orchestration qui s'appuie sur corosync pour savoir quels nœuds sont disponibles.
- [keepalived](./103-keepalived.md) — alternative plus simple pour un besoin de simple bascule d'IP.
