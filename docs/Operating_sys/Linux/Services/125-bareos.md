---
id: 125-bareos
title: Bareos — sauvegarde réseau (fork de Bacula)
sidebar_position: 125
tags: [linux, services, sauvegarde]
---

# Bareos — sauvegarde réseau (fork de Bacula)

**Bareos** (*Backup Archiving Recovery Open Sourced*) est un fork communautaire de [Bacula](./124-bacula.md), créé en 2010 quand une partie des développeurs de Bacula a souhaité continuer sous licence pleinement libre (AGPL) avec un développement ouvert, face à une version Bacula de plus en plus orientée vers l'offre commerciale de son éditeur. L'architecture reprend le même modèle à trois démons (Director, Storage Daemon, File Daemon) et une bonne partie de la syntaxe de configuration est compatible.

## Installation

```bash
# Sur le serveur
sudo apt install bareos-director bareos-storage bareos-bconsole

# Sur chaque machine cliente
sudo apt install bareos-filedaemon

sudo systemctl enable --now bareos-director bareos-storage
sudo systemctl enable --now bareos-filedaemon   # côté client
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/bareos/bareos-dir.d/` | Configuration du Director, en fichiers séparés par type (jobs, clients, pools...) |
| `/etc/bareos/bareos-sd.d/` | Configuration du Storage Daemon |
| `/etc/bareos/bareos-fd.d/` | Configuration du File Daemon côté client |
| `/etc/bareos/bconsole.conf` | Connexion de la console au Director |

Différence notable avec Bacula : Bareos éclate la configuration en **répertoires de fichiers `.conf` par ressource** plutôt qu'un unique fichier monolithique — plus simple à gérer en configuration automatisée (Ansible, etc.).

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status bareos-director` | État du Director |
| `bconsole` | Console interactive d'administration |
| `run job=<nom> yes` (dans bconsole) | Lancer un job immédiatement |
| `status director` / `status client=<nom>` | État du système |
| `restore` (dans bconsole) | Assistant de restauration |

## Exemple de configuration

```
# /etc/bareos/bareos-dir.d/job/backup-web.conf
Job {
  Name = "backup-web"
  Client = "web-fd"
  JobDefs = "DefaultJob"
  FileSet = "web-fileset"
  Schedule = "quotidien"
}
```

## Sécurisation

- Identifiants distincts par File Daemon (ne pas partager le même secret entre clients).
- Activer TLS entre les démons (`TLS Enable = yes`) pour chiffrer les flux de sauvegarde.
- Restreindre l'accès réseau aux ports Bareos aux machines concernées uniquement.
- Documenter et tester la procédure de restauration : c'est elle qui compte en cas d'incident, pas seulement le succès des jobs.

## Logs & dépannage

```bash
journalctl -u bareos-director -u bareos-storage -u bareos-filedaemon
tail -f /var/log/bareos/bareos.log
# Dans bconsole :
status director
messages
```

## Voir aussi

- [Bacula](./124-bacula.md) — le projet d'origine, architecture et concepts quasi identiques
