---
id: 129-jenkins
title: Jenkins — serveur CI/CD
sidebar_position: 129
tags: [linux, services, ci-cd]
---

# Jenkins — serveur CI/CD

[Jenkins](https://www.jenkins.io/) est un serveur d'intégration et de déploiement continu (CI/CD) open source, historiquement l'un des plus utilisés. Il orchestre des **jobs** (pipelines) déclenchés par des événements (push Git, planification, webhook) et délègue l'exécution à des **agents** (voir [`jenkins-agent`](./130-jenkins-agent.md)).

## Installation

```bash
# Debian/Ubuntu
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list
sudo apt update && sudo apt install jenkins

# Activation
sudo systemctl enable --now jenkins
```

Nécessite un JDK (Java 17/21 selon la version). Écoute par défaut sur le port `8080`.

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/default/jenkins` | Variables d'environnement du service (port, JAVA_OPTS, JENKINS_HOME) |
| `/var/lib/jenkins/` | `JENKINS_HOME` — jobs, config, plugins, workspace |
| `/var/lib/jenkins/config.xml` | Configuration globale de l'instance |
| `/var/lib/jenkins/jobs/<job>/config.xml` | Définition d'un job |
| `/var/lib/jenkins/secrets/initialAdminPassword` | Mot de passe initial à la première installation |

## Commandes utiles

```bash
systemctl status jenkins
systemctl restart jenkins
cat /var/lib/jenkins/secrets/initialAdminPassword   # première connexion

# CLI Jenkins (nécessite un jar client)
java -jar jenkins-cli.jar -s http://localhost:8080/ list-jobs
java -jar jenkins-cli.jar -s http://localhost:8080/ build <job>
```

## Exemple de configuration

```
# /etc/default/jenkins
HTTP_PORT=8080
JAVA_ARGS="-Djava.awt.headless=true -Xmx2g"
```

Un pipeline se déclare généralement en code, via un `Jenkinsfile` versionné dans le dépôt du projet (`pipeline { agent any; stages { stage('Build') { steps { sh 'make' } } } }`), plutôt que dans la config XML directement.

## Sécurisation

- Ne jamais exposer l'interface `8080` directement sur Internet : la placer derrière un [reverse proxy](./049-nginx.md) avec TLS.
- Désactiver l'inscription libre des comptes (`Configure Global Security`), activer une authentification forte (SSO/LDAP).
- Gérer les secrets (tokens, clés SSH) via le plugin **Credentials**, jamais en clair dans un `Jenkinsfile`.
- Limiter les droits par job/dossier (matrice d'autorisation), ne pas laisser tous les utilisateurs exécuter du Groovy arbitraire (script console = RCE potentiel).
- Maintenir Jenkins et ses plugins à jour : c'est une cible fréquente (RCE historiques sur des plugins obsolètes).

## Logs & dépannage

```bash
journalctl -u jenkins -f
tail -f /var/log/jenkins/jenkins.log      # selon distribution
```

En cas de démarrage bloqué : vérifier l'espace disque sous `JENKINS_HOME` et la version du JDK utilisée.

## Voir aussi

- [jenkins-agent](./130-jenkins-agent.md) — l'agent d'exécution associé
- [gitlab-runner](./131-gitlab-runner.md) — équivalent côté GitLab CI
