---
id: 132-sonarqube
title: SonarQube — analyse de code
sidebar_position: 132
tags: [linux, services, ci-cd]
---

# SonarQube — analyse de code

[SonarQube](https://www.sonarsource.com/products/sonarqube/) est une plateforme d'analyse statique de code : qualité, bugs, vulnérabilités, dette technique et couverture de tests, avec un tableau de bord centralisé. Il s'intègre typiquement dans un pipeline CI (Jenkins, GitLab CI) via le `sonar-scanner`, qui envoie les résultats d'analyse au serveur.

## Installation

```bash
# Nécessite un JDK 17+ et une base PostgreSQL dédiée
sudo apt install openjdk-17-jre-headless

# Téléchargement du serveur
wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-<version>.zip
unzip sonarqube-<version>.zip -d /opt/sonarqube

# Le service n'est pas packagé nativement : créer un unit file dédié (voir exemple)
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/opt/sonarqube/conf/sonar.properties` | Configuration principale (base de données, port, ES) |
| `/opt/sonarqube/logs/` | Logs applicatifs |

## Commandes utiles

```bash
systemctl status sonarqube
journalctl -u sonarqube -f

# Depuis un projet, lancer une analyse
sonar-scanner -Dsonar.projectKey=mon-projet -Dsonar.host.url=http://localhost:9000 -Dsonar.login=<token>
```

## Exemple de configuration

```ini
# /opt/sonarqube/conf/sonar.properties
sonar.jdbc.url=jdbc:postgresql://localhost/sonarqube
sonar.jdbc.username=sonar
sonar.jdbc.password=<mot de passe>
sonar.web.port=9000
```

Unit file minimal :

```ini
# /etc/systemd/system/sonarqube.service
[Unit]
Description=SonarQube
After=network.target postgresql.service

[Service]
Type=forking
ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop
User=sonarqube
Restart=always

[Install]
WantedBy=multi-user.target
```

## Sécurisation

- Changer immédiatement le mot de passe admin par défaut (`admin`/`admin`).
- Placer l'interface web derrière un [reverse proxy](./049-nginx.md) avec TLS, ne pas l'exposer nue.
- Utiliser des **tokens** dédiés par projet/CI pour l'authentification du scanner plutôt qu'un compte utilisateur.
- Restreindre l'accès réseau à la base PostgreSQL dédiée à l'hôte local ou au réseau interne.
- SonarQube requiert des réglages kernel spécifiques (`vm.max_map_count`) à cause d'Elasticsearch embarqué — les appliquer sans sur-ouvrir le système.

## Logs & dépannage

```bash
tail -f /opt/sonarqube/logs/sonar.log /opt/sonarqube/logs/web.log /opt/sonarqube/logs/es.log
```

Un échec de démarrage fréquent vient de `vm.max_map_count` trop bas (`sysctl -w vm.max_map_count=524288`) — SonarQube embarque Elasticsearch en interne.

## Voir aussi

- [elasticsearch](./075-elasticsearch.md) — le moteur d'indexation embarqué par SonarQube
- [jenkins](./129-jenkins.md) / [gitlab-runner](./131-gitlab-runner.md) — pipelines qui déclenchent typiquement une analyse SonarQube
