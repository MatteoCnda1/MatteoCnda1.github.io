---
id: 130-jenkins-agent
title: Jenkins Agent — nœud d'exécution
sidebar_position: 130
tags: [linux, services, ci-cd]
---

# Jenkins Agent — nœud d'exécution

Un **agent Jenkins** (autrefois « slave ») est un nœud distinct du serveur [Jenkins](./129-jenkins.md) qui exécute réellement les étapes des jobs (build, tests, déploiement). Le serveur reste le contrôleur (planification, UI, stockage des résultats), l'agent apporte la puissance de calcul et l'isolation par machine/environnement.

## Installation

```bash
# Nécessite un JDK compatible avec la version du contrôleur
sudo apt install openjdk-21-jre-headless

# Récupérer agent.jar depuis le contrôleur
curl -O http://<jenkins-server>:8080/jnlpJars/agent.jar
```

Le lien se fait soit en **JNLP/WebSocket** (l'agent se connecte au serveur), soit en **SSH** (le serveur se connecte à l'agent) — configuré côté serveur dans `Manage Jenkins → Nodes`.

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `~/.jenkins/` ou `/home/jenkins/workspace/` | Répertoire de travail de l'agent (checkouts, builds) |
| unit file systemd custom | Nécessaire pour faire tourner l'agent en démon permanent (voir exemple ci-dessous) |

## Commandes utiles

```bash
# Lancement manuel en JNLP
java -jar agent.jar -url http://<server>:8080/ -secret <secret> -name <agent-name> -workDir "/home/jenkins"

systemctl status jenkins-agent
journalctl -u jenkins-agent -f
```

## Exemple de configuration

Unit file systemd pour faire tourner un agent en service permanent :

```ini
# /etc/systemd/system/jenkins-agent.service
[Unit]
Description=Jenkins Agent
After=network.target

[Service]
User=jenkins
WorkingDirectory=/home/jenkins
ExecStart=/usr/bin/java -jar /home/jenkins/agent.jar -url http://jenkins.local:8080/ -secret @/home/jenkins/secret-file -name build-agent-1 -workDir "/home/jenkins"
Restart=always

[Install]
WantedBy=multi-user.target
```

## Sécurisation

- Exécuter l'agent sous un utilisateur **dédié non-root**, sans accès sudo.
- Ne jamais réutiliser un agent pour exécuter du code non fiable (pull requests externes) sans isolation (conteneur/VM éphémère) — un agent compromis peut souvent atteindre le contrôleur.
- Restreindre le réseau : l'agent n'a besoin que d'accéder au contrôleur, pas d'exposition entrante.
- Faire tourner les builds dans des conteneurs éphémères (agents Docker/Kubernetes dynamiques) plutôt que sur un agent permanent partagé, pour limiter la persistance en cas de compromission.

## Logs & dépannage

Logs applicatifs de l'agent dans son propre workspace, plus `journalctl -u jenkins-agent` si géré en service systemd. Vérifier la connectivité réseau vers le contrôleur en cas de déconnexion répétée.

## Voir aussi

- [jenkins](./129-jenkins.md) — le serveur contrôleur
