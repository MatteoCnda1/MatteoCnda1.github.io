---
id: 109-grafana-server
title: Grafana — visualisation des métriques
sidebar_position: 109
tags: [linux, services, monitoring]
---

# Grafana (grafana-server)

Plateforme de visualisation et de dashboards pour des sources de données de métriques et de logs (Prometheus, InfluxDB, Elasticsearch, MySQL...). Ne collecte rien elle-même : elle interroge les sources configurées et affiche des tableaux de bord. Paquet/service `grafana-server`.

## Installation

```bash
# Dépôt officiel Grafana (apt)
sudo apt install -y apt-transport-https software-properties-common
sudo mkdir -p /etc/apt/keyrings
wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/grafana.gpg > /dev/null
echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee /etc/apt/sources.list.d/grafana.list
sudo apt update && sudo apt install grafana

sudo systemctl enable --now grafana-server
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/grafana/grafana.ini` | Configuration principale (port, auth, domaine) |
| `/etc/grafana/provisioning/datasources/` | Sources de données provisionnées par fichier |
| `/etc/grafana/provisioning/dashboards/` | Dashboards provisionnés par fichier |
| `/var/lib/grafana/grafana.db` | Base SQLite par défaut (utilisateurs, dashboards) |

## Commandes utiles

```bash
systemctl status|restart grafana-server
grafana-cli plugins install <plugin>       # installer un plugin
grafana-cli admin reset-admin-password <mdp>
curl localhost:3000/api/health              # healthcheck
```

## Exemple de configuration

```yaml
# /etc/grafana/provisioning/datasources/prometheus.yml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    url: http://localhost:9090
    access: proxy
    isDefault: true
```

Provisionner une source de données par fichier évite de la recréer manuellement à chaque déploiement.

## Sécurisation

- Changer le mot de passe admin par défaut (`admin`/`admin`) dès l'installation.
- Désactiver l'inscription libre (`[users] allow_sign_up = false`).
- Servir en HTTPS derrière un reverse proxy, ou activer TLS natif (`[server] protocol = https`).
- Limiter les permissions des comptes (rôle *Viewer* par défaut, *Admin* restreint).

## Logs & dépannage

```bash
journalctl -u grafana-server -f
tail -f /var/log/grafana/grafana.log
```

## Voir aussi

- [Prometheus](./108-prometheus.md) — source de données la plus courante
- [node_exporter](./110-node-exporter.md)
