---
id: 124-bacula
title: Bacula — sauvegarde centralisée
sidebar_position: 124
tags: [linux, services, sauvegarde]
---

# Bacula — sauvegarde centralisée

**Bacula** est une solution de sauvegarde réseau centralisée de niveau entreprise, organisée en plusieurs démons : le **Director** (orchestration, planification), le **Storage Daemon** (écriture sur le support de stockage) et le **File Daemon** (agent installé sur chaque machine à sauvegarder). Adapté à la sauvegarde de parcs de machines hétérogènes depuis un point de contrôle unique.

## Installation

```bash
# Sur le serveur (Director + Storage Daemon)
sudo apt install bacula-director bacula-sd bacula-console

# Sur chaque machine cliente (agent)
sudo apt install bacula-fd

sudo systemctl enable --now bacula-director bacula-sd
sudo systemctl enable --now bacula-fd   # côté client
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/bacula/bacula-dir.conf` | Configuration du Director : jobs, clients, plannings, rétention |
| `/etc/bacula/bacula-sd.conf` | Configuration du Storage Daemon : périphériques/pools de stockage |
| `/etc/bacula/bacula-fd.conf` | Configuration du File Daemon côté client |
| `/etc/bacula/bconsole.conf` | Connexion de la console d'administration au Director |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status bacula-director` | État du Director |
| `bconsole` | Console interactive d'administration |
| `run job=<nom>` (dans bconsole) | Lancer un job de sauvegarde manuellement |
| `status director` / `status client=<nom>` | État du système ou d'un client |
| `restore` (dans bconsole) | Assistant de restauration interactif |

## Exemple de configuration

```
# Extrait /etc/bacula/bacula-dir.conf
Job {
  Name = "Backup-serveur-web"
  Type = Backup
  Client = serveur-web-fd
  FileSet = "Full Set"
  Schedule = "Quotidien"
  Storage = File1
  Pool = Default
}
```

## Sécurisation

- Chaque **File Daemon** doit avoir un mot de passe distinct configuré côté Director ET côté client — ne pas réutiliser le même secret partout.
- Chiffrer les échanges Director ↔ Storage ↔ File Daemon (`TLS Enable = yes` dans les confs) pour éviter l'interception des données sauvegardées en transit.
- Limiter l'accès réseau aux ports Bacula (9101-9103) aux seules machines concernées.
- Tester des restaurations réelles périodiquement, pas seulement vérifier que les jobs se terminent en succès.

## Logs & dépannage

```bash
journalctl -u bacula-director -u bacula-sd -u bacula-fd
tail -f /var/log/bacula/bacula.log
# Dans bconsole :
status director
messages
```

## Voir aussi

- [bareos](./125-bareos.md) — fork communautaire de Bacula, architecture quasi identique
