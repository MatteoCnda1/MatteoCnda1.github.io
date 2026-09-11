---
id: 119-logstash
title: Logstash — traitement de logs
sidebar_position: 119
tags: [linux, services, logs]
---

# Logstash — traitement de logs

**Logstash** (Elastic) est un pipeline de **traitement de logs** : il reçoit des événements (souvent depuis [Filebeat](./118-filebeat.md) ou Kafka), les parse/transforme/enrichit (grok, filtres), puis les envoie vers une destination (typiquement Elasticsearch). Plus lourd que Filebeat, c'est la brique de transformation de la stack "ELK" (Elasticsearch, Logstash, Kibana).

## Installation

```bash
curl -fsSL https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elastic.gpg
echo "deb [signed-by=/usr/share/keyrings/elastic.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt update && sudo apt install logstash
sudo systemctl enable --now logstash
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/logstash/logstash.yml` | Configuration du nœud (heap, chemins) |
| `/etc/logstash/conf.d/*.conf` | Pipelines (blocs `input {}`, `filter {}`, `output {}`) |
| `/etc/logstash/pipelines.yml` | Déclaration de plusieurs pipelines multiples |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `logstash -t` (ou `--config.test_and_exit`) | Valider la syntaxe d'un pipeline |
| `logstash -f pipeline.conf` | Lancer un pipeline précis manuellement |
| `curl localhost:9600/_node/stats` | API de monitoring interne (débit, erreurs) |

## Exemple de configuration

```
input {
  beats {
    port => 5044
  }
}

filter {
  grok {
    match => { "message" => "%{COMBINEDAPACHELOG}" }
  }
}

output {
  elasticsearch {
    hosts => ["http://localhost:9200"]
    index => "nginx-logs-%{+YYYY.MM.dd}"
  }
}
```

## Sécurisation

- Activer TLS sur l'input beats (port 5044) et l'authentification vers Elasticsearch (API key).
- Limiter la heap JVM (`-Xms`/`-Xmx` dans `jvm.options`) pour éviter qu'un pic de charge ne sature la machine.
- Valider/assainir les champs issus du `grok`/`dissect` avant indexation si les logs proviennent de sources non fiables (injection dans les requêtes en aval).

## Logs & dépannage

- `journalctl -u logstash -f` — erreurs de pipeline, échecs de connexion à l'output.
- `logstash -t` — premier réflexe après toute modification de config.
- API `_node/stats` (port 9600) — repérer un pipeline congestionné (events_in vs events_out).

## Voir aussi

- [filebeat](./118-filebeat.md) — source amont typique.
- [fluentd](./120-fluentd.md) — alternative plus légère à Logstash dans le même rôle de traitement de logs.
