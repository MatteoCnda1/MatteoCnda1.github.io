---
id: 118-filebeat
title: Filebeat — collecte de logs
sidebar_position: 118
tags: [linux, services, logs]
---

# Filebeat — collecte de logs

**Filebeat** (Elastic) est un agent léger de **collecte de logs** : il surveille des fichiers de log (ou d'autres sources) sur une machine et transmet leur contenu vers Logstash, Elasticsearch ou Kafka. C'est le "Beat" le plus utilisé de la suite Elastic Beats — conçu pour être minimal en ressources et fiable (il retient sa position de lecture, pas de perte en cas de redémarrage).

## Installation

```bash
curl -fsSL https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elastic.gpg
echo "deb [signed-by=/usr/share/keyrings/elastic.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt update && sudo apt install filebeat
sudo systemctl enable --now filebeat
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/filebeat/filebeat.yml` | Configuration principale (inputs, output) |
| `/etc/filebeat/modules.d/` | Modules préconfigurés (nginx, system, mysql...) |
| `/var/lib/filebeat/registry/` | Position de lecture de chaque fichier suivi (pour ne rien relire/perdre) |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `filebeat test config` | Valider la syntaxe de la configuration |
| `filebeat test output` | Tester la connexion vers la destination (Logstash/Elasticsearch) |
| `filebeat modules enable nginx` | Activer un module préconfiguré |
| `filebeat -e` | Lancer en avant-plan avec logs détaillés (debug) |

## Exemple de configuration

```yaml
filebeat.inputs:
  - type: log
    paths:
      - /var/log/nginx/access.log
    fields:
      service: nginx

output.logstash:
  hosts: ["logstash.internal:5044"]
```

## Sécurisation

- Activer TLS entre Filebeat et sa destination (Logstash/Elasticsearch) — les logs en clair sur le réseau peuvent contenir des données sensibles.
- Restreindre les permissions de lecture des fichiers suivis (Filebeat tourne généralement avec un utilisateur dédié, pas root).
- Utiliser l'authentification (API key Elasticsearch, ou credentials Logstash) plutôt qu'un output ouvert.

## Logs & dépannage

- `journalctl -u filebeat -f` — erreurs de parsing, problèmes de connexion à l'output.
- `filebeat test output` — premier réflexe en cas de logs qui n'arrivent pas à destination.
- Registre de position (`/var/lib/filebeat/registry/`) — à supprimer avec précaution pour forcer une relecture complète des fichiers (déduplication à gérer côté destination sinon).

## Voir aussi

- [logstash](./119-logstash.md) — destination fréquente de Filebeat pour du traitement/enrichissement avant indexation.
- [fluentd](./120-fluentd.md) — alternative à la stack Elastic Beats/Logstash.
