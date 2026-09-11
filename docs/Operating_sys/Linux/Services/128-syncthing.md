---
id: 128-syncthing
title: Syncthing — synchronisation de fichiers pair-à-pair
sidebar_position: 128
tags: [linux, services, sauvegarde]
---

# Syncthing — synchronisation de fichiers pair-à-pair

**Syncthing** synchronise des dossiers en continu entre plusieurs machines **sans serveur central** : chaque nœud communique directement avec les autres (P2P, chiffré), à la manière d'un Dropbox auto-hébergé et décentralisé. Contrairement à Nextcloud, il n'y a pas de "serveur" au sens strict — chaque instance est un pair égal aux autres.

## Installation

```bash
sudo apt install syncthing

# Lancer en tant que service pour un utilisateur donné (pas en root)
sudo systemctl enable --now syncthing@<utilisateur>
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `~/.local/state/syncthing/config.xml` | Configuration principale : dossiers partagés, appareils connus, options réseau |
| `~/.local/state/syncthing/cert.pem` / `key.pem` | Certificat/clé d'identité du nœud (générés automatiquement) |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl start/stop/enable/status syncthing@<user>` | Gérer l'instance d'un utilisateur |
| Interface web `http://localhost:8384` | Administration principale (ajout de dossiers/appareils) |
| `syncthing cli show system` | État du nœud en CLI |
| `syncthing cli config devices list` | Lister les appareils connus |

## Exemple de configuration

L'essentiel se configure via l'interface web (ajout d'un dossier + ID d'appareil distant à autoriser), mais un extrait typique de `config.xml` :

```xml
<folder id="docs" path="/home/user/Documents" type="sendreceive">
    <device id="AUTRE-APPAREIL-ID-..."/>
</folder>
```

## Sécurisation

- L'authentification entre nœuds repose sur des **ID d'appareil** (empreinte de certificat) : ne connecter que des appareils dont l'ID a été vérifié par un canal fiable.
- Protéger l'**interface web GUI** (`http://localhost:8384`) par un utilisateur/mot de passe si elle écoute au-delà de `localhost` (option "GUI Authentication").
- Ne pas exposer l'interface web directement sur Internet sans reverse proxy + HTTPS.
- Utiliser le mode `sendonly`/`receiveonly` pour un dossier quand la synchronisation bidirectionnelle n'est pas nécessaire (réduit la surface d'erreur/conflit).

## Logs & dépannage

```bash
journalctl -u syncthing@<utilisateur>
syncthing cli show system         # état général, connectivité
syncthing cli show errors         # erreurs de synchronisation en cours
```

## Voir aussi

- [rsync](./121-rsync.md) — synchronisation ponctuelle client/serveur, à comparer au modèle P2P continu de Syncthing
- [nextcloud](./127-nextcloud.md) — alternative centralisée avec bien plus de fonctionnalités (partage web, apps)
