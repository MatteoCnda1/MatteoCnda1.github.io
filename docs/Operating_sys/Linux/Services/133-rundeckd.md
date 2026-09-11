---
id: 133-rundeckd
title: Rundeck — automatisation d'administration
sidebar_position: 133
tags: [linux, services, ci-cd]
---

# Rundeck — automatisation d'administration

[Rundeck](https://www.rundeck.com/open-source) est une plateforme d'automatisation opérationnelle : elle expose des scripts/commandes d'administration (redémarrage de service, déploiement, tâche de maintenance) sous forme de **jobs** exécutables via une interface web, une API, ou une planification (cron intégré), avec contrôle d'accès et traçabilité (qui a lancé quoi, quand).

## Installation

```bash
# Nécessite un JDK 11+
sudo apt install openjdk-17-jre-headless

# Dépôt officiel
curl -O https://raw.githubusercontent.com/rundeck/packaging/main/scripts/deb-setup.sh
sudo bash deb-setup.sh
sudo apt install rundeck

sudo systemctl enable --now rundeckd
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/rundeck/rundeck-config.properties` | Configuration principale (base de données, URL) |
| `/etc/rundeck/realm.properties` | Utilisateurs et mots de passe (authentification simple) |
| `/etc/rundeck/framework.properties` | Paramètres du framework, répertoire des projets |
| `/var/rundeck/projects/` | Définitions des projets et jobs |

## Commandes utiles

```bash
systemctl status rundeckd
journalctl -u rundeckd -f

# CLI
rd jobs list --project <projet>
rd run --job <job-id>
```

## Exemple de configuration

```properties
# /etc/rundeck/rundeck-config.properties
grails.serverURL=https://rundeck.exemple.fr
dataSource.url = jdbc:postgresql://localhost/rundeck
```

Un job simple s'exécute via SSH sur les nœuds cibles définis dans l'inventaire du projet (`resources.xml` ou plugin de résolution dynamique type Ansible inventory).

## Sécurisation

- Remplacer l'authentification `realm.properties` (fichier plat) par LDAP/Active Directory en production.
- Restreindre les **ACL** (`/etc/rundeck/*.aclpolicy`) par projet et par job : Rundeck peut exécuter n'importe quelle commande shell sur des nœuds distants, un accès trop large équivaut à un accès root distribué.
- Stocker les identifiants SSH/clés via le **Key Storage** intégré (chiffré), jamais en clair dans un job.
- Placer l'interface derrière TLS et un reverse proxy.

## Logs & dépannage

```bash
tail -f /var/log/rundeck/service.log /var/log/rundeck/rundeck.log
```

## Voir aussi

- [ansible-pull](./134-ansible-pull.md) — une autre approche d'automatisation, en mode agent plutôt que centralisé
