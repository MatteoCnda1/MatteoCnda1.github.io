---
id: 062-jetty
title: Jetty — Serveur Java
sidebar_position: 62
tags: [linux, services, applicatif]
---

# Jetty — Serveur Java

**Jetty** (Eclipse Foundation) est un serveur web et conteneur de servlets Java, alternative à [Tomcat](./061-tomcat.md) réputée plus légère et plus simple à embarquer directement dans une application (usage courant : embarqué dans des outils comme SonarQube ou Solr plutôt que déployé comme serveur autonome).

## Installation

```bash
sudo apt install jetty10
sudo systemctl enable --now jetty10
```

Beaucoup d'applications (SonarQube, Elasticsearch historiquement...) embarquent leur propre instance de Jetty en interne — dans ce cas il n'y a pas de service `jetty` séparé à gérer, c'est le service de l'application elle-même qui l'inclut.

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/jetty10/start.ini` (ou `/etc/default/jetty10`) | Options de démarrage de la JVM et modules activés |
| `/etc/jetty10/jetty.xml` | Configuration du serveur (connecteurs, threads) |
| `/var/lib/jetty10/webapps/` | Répertoire de déploiement des `.war` |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl start/restart/status jetty10` | Gestion du service |
| `journalctl -u jetty10` | Logs systemd |
| `java -jar $JETTY_HOME/start.jar --list-modules` | Lister les modules Jetty activables |

## Exemple de configuration

Extrait `start.ini` activant HTTP et limitant l'écoute au loopback :

```ini
--module=http
jetty.http.host=127.0.0.1
jetty.http.port=8080
```

## Sécurisation

- Lier les connecteurs en local (`127.0.0.1`) et passer par un reverse proxy TLS pour l'exposition publique.
- Désactiver les modules non utilisés (`--list-modules` puis ne charger que le strict nécessaire) : chaque module actif est une surface d'attaque potentielle.
- Utilisateur système dédié non privilégié.
- Maintenir la JVM et Jetty à jour (CVE régulières côté JVM et parsing HTTP).

## Logs & dépannage

- `/var/log/jetty10/` (selon distribution/paquet) ou `journalctl -u jetty10 -f`.
- Quand Jetty est embarqué dans une autre application (SonarQube...), les logs pertinents sont ceux de cette application, pas un service `jetty` distinct.
- `java -jar start.jar --dry-run` pour voir la commande de démarrage effective sans lancer le serveur — utile pour diagnostiquer un problème de configuration de modules.

## Voir aussi

- [Tomcat](./061-tomcat.md) — alternative plus répandue en entreprise, conteneur de servlets Java complet
