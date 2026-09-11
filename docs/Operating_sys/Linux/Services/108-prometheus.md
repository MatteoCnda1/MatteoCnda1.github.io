---
id: 108-prometheus
title: Prometheus — monitoring / métriques
sidebar_position: 108
tags: [linux, services, monitoring]
---

# Prometheus

Système de monitoring et de base de données de séries temporelles (TSDB) open source, devenu le standard de facto de l'observabilité cloud-native. Fonctionne en **pull** : il va lui-même récupérer (*scrape*) les métriques exposées en HTTP par les cibles, plutôt que d'attendre qu'elles les lui envoient. Binaire `prometheus`, paquet `prometheus`.

## Installation

```bash
# Debian/Ubuntu
sudo apt install prometheus

# Fedora/RHEL
sudo dnf install golang-github-prometheus

sudo systemctl enable --now prometheus
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/prometheus/prometheus.yml` | Configuration principale : cibles à scraper, règles d'alerte, intervalle |
| `/etc/prometheus/rules/*.yml` | Règles d'alerte et de recording |
| `/var/lib/prometheus/` | Données TSDB stockées sur disque |

## Commandes utiles

```bash
systemctl status|restart prometheus
promtool check config /etc/prometheus/prometheus.yml   # valider la config
promtool check rules /etc/prometheus/rules/*.yml        # valider les règles
curl localhost:9090/-/healthy                            # healthcheck
curl localhost:9090/api/v1/query?query=up                # requête PromQL via l'API
```

## Exemple de configuration

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: node
    static_configs:
      - targets: ['localhost:9100']   # node_exporter
```

Chaque `job_name` définit un groupe de cibles à scraper à intervalle régulier ; ici le `node_exporter` local sur son port par défaut.

## Sécurisation

- Pas d'authentification native : placer Prometheus derrière un reverse proxy (nginx/traefik) avec auth, ou activer le TLS/basic-auth natif (`web.config.yml` depuis Prometheus 2.24+).
- Restreindre l'écoute réseau (`--web.listen-address`) au réseau interne uniquement.
- Limiter la rétention (`--storage.tsdb.retention.time`) pour éviter la saturation disque.
- Ne jamais exposer l'API `/api/v1/admin/tsdb/delete_series` publiquement (permet de supprimer des données).

## Logs & dépannage

```bash
journalctl -u prometheus -f
curl localhost:9090/api/v1/targets   # état des cibles (up/down)
```

## Voir aussi

- [Grafana](./109-grafana-server.md) — visualisation des métriques collectées par Prometheus
- [node_exporter](./110-node-exporter.md) — la cible la plus courante à scraper
