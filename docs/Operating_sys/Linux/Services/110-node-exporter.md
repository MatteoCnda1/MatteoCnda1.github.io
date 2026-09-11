---
id: 110-node-exporter
title: node_exporter — export métriques Linux
sidebar_position: 110
tags: [linux, services, monitoring]
---

# node_exporter

Agent officiel de l'écosystème Prometheus qui expose les métriques matérielles et système d'une machine Linux (CPU, mémoire, disque, réseau) sur un endpoint HTTP `/metrics`, au format texte Prometheus. Ne fait rien d'autre que collecter et exposer — c'est Prometheus qui vient le scraper. Binaire `node_exporter`.

## Installation

```bash
# Debian/Ubuntu
sudo apt install prometheus-node-exporter

sudo systemctl enable --now prometheus-node-exporter
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/default/prometheus-node-exporter` | Options de démarrage (collecteurs activés/désactivés) |
| unit systemd | Définit `ExecStart` avec les flags `--collector.*` |

Pas de fichier de config déclaratif classique : node_exporter se pilote via des **flags de ligne de commande** au lancement.

## Commandes utiles

```bash
systemctl status|restart prometheus-node-exporter
curl localhost:9100/metrics | head -30    # voir les métriques exposées
node_exporter --collectors.disable-defaults --collector.cpu   # ne lancer qu'un collecteur
```

## Exemple de configuration

```bash
# /etc/default/prometheus-node-exporter
ARGS="--collector.systemd --collector.processes"
```

Active des collecteurs optionnels (état des unités systemd, liste des processus) désactivés par défaut pour limiter le volume de métriques.

## Sécurisation

- Aucune authentification native : restreindre l'accès au port 9100 par firewall (seul Prometheus doit pouvoir le scraper).
- Ne pas exposer sur une interface publique.
- Désactiver les collecteurs non nécessaires pour réduire la surface d'information exposée (`--collector.<nom>.disable`).

## Logs & dépannage

```bash
journalctl -u prometheus-node-exporter -f
curl -s localhost:9100/metrics | grep node_load1   # vérifier qu'une métrique précise remonte
```

## Voir aussi

- [Prometheus](./108-prometheus.md) — le scraper qui consomme ces métriques
