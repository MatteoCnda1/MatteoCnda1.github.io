---
id: 061-tomcat
title: Tomcat — Serveur Java
sidebar_position: 61
tags: [linux, services, applicatif]
---

# Tomcat — Serveur Java

**Apache Tomcat** est un conteneur de servlets Java (implémentation de référence des spécifications Jakarta Servlet/JSP), utilisé pour déployer des applications web Java packagées en **WAR**. C'est l'un des deux standards historiques du domaine avec [Jetty](./062-jetty.md), plus lourd mais très répandu en entreprise.

## Installation

```bash
sudo apt install tomcat10       # paquet distro, ou installation manuelle depuis tomcat.apache.org
sudo systemctl enable --now tomcat10
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/tomcat10/server.xml` | Configuration principale : connecteurs réseau, hôtes virtuels |
| `/etc/tomcat10/web.xml` | Configuration par défaut des applications déployées |
| `/etc/tomcat10/tomcat-users.xml` | Utilisateurs pour l'interface de management (Manager App) |
| `/var/lib/tomcat10/webapps/` | Répertoire de déploiement des fichiers `.war` |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl start/restart/status tomcat10` | Gestion du service |
| `journalctl -u tomcat10` | Logs systemd |
| `catalina.sh version` | Version et infos Java utilisées |

## Exemple de configuration

Connecteur HTTP dans `server.xml` (typiquement derrière un reverse proxy) :

```xml
<Connector port="8080" protocol="HTTP/1.1"
           connectionTimeout="20000"
           address="127.0.0.1" />
```

Lier le connecteur sur `127.0.0.1` empêche l'accès direct depuis l'extérieur — le trafic passe obligatoirement par le reverse proxy.

## Sécurisation

- **Supprimer ou protéger** les applications par défaut livrées avec Tomcat (`/manager`, `/host-manager`, `/examples`, `/docs`) — cibles classiques de scan automatisé.
- Restreindre `tomcat-users.xml` à des comptes forts, et limiter l'accès au Manager App par IP (`RemoteAddrValve`).
- Lier les connecteurs en local (`127.0.0.1`) et exposer uniquement via un reverse proxy TLS.
- Exécuter sous un utilisateur dédié non privilégié, jamais `root`.
- Maintenir la version de Tomcat et du JDK à jour (CVE régulières sur le parsing de requêtes/AJP — l'attaque *Ghostcat* en 2020 ciblait précisément un connecteur AJP mal exposé).

## Logs & dépannage

- `/var/log/tomcat10/catalina.out` — logs principaux (stdout/stderr du process).
- `/var/log/tomcat10/localhost_access_log.*.txt` — logs d'accès HTTP.
- `journalctl -u tomcat10 -f` si géré par systemd.
- Un déploiement WAR qui échoue silencieusement se diagnostique dans `catalina.out`, pas dans les logs du reverse proxy.

## Voir aussi

- [Jetty](./062-jetty.md) — alternative plus légère à Tomcat pour le même usage
- [nginx](./049-nginx.md) — reverse proxy typique devant Tomcat
