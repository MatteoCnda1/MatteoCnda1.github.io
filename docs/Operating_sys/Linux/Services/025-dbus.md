---
id: 025-dbus
title: dbus — Communication entre processus
sidebar_position: 25
tags: [linux, services, systeme]
---

# dbus

**D-Bus** est un bus de messages inter-processus (IPC) qui permet aux applications et aux services système de communiquer entre eux et de s'exposer des méthodes/signaux. Il tourne via le démon `dbus-daemon` (ou `dbus-broker`, l'implémentation moderne compatible utilisée par défaut sur beaucoup de distributions récentes) et fait partie du socle sur lequel reposent `systemd`, `polkit`, `NetworkManager` et la plupart des environnements de bureau.

## Installation

```bash
# Debian/Ubuntu
sudo apt install dbus

# Fedora/RHEL
sudo dnf install dbus-broker

# Activation (généralement déjà actif par défaut, démarré par systemd via socket activation)
sudo systemctl enable --now dbus
```

Il existe deux bus distincts : le **bus système** (`system_bus_socket`, communication entre services système, ex: NetworkManager ↔ polkit) et le **bus session** (un par utilisateur connecté, communication entre applications graphiques).

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/dbus-1/system.conf` | Configuration principale du bus système |
| `/etc/dbus-1/system.d/*.conf` | Politiques d'accès par service (qui peut appeler quelle interface) |
| `/usr/share/dbus-1/system-services/*.service` | Définitions des services activables à la demande sur le bus système |
| `/etc/dbus-1/session.conf` | Configuration du bus session utilisateur |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status dbus` | État du démon |
| `busctl list` | Lister les services connectés au bus système |
| `busctl tree <service>` | Explorer les objets exposés par un service |
| `busctl call <service> <objet> <interface> <méthode>` | Appeler une méthode D-Bus manuellement |
| `dbus-monitor --system` | Observer en temps réel les messages qui transitent sur le bus système |
| `dbus-send --system --print-reply ...` | Envoyer un message D-Bus depuis un script |

## Exemple de configuration

```xml
<!-- /etc/dbus-1/system.d/mon-service.conf -->
<!DOCTYPE busconfig PUBLIC "-//freedesktop//DTD D-BUS Bus Configuration 1.0//EN"
  "http://www.freedesktop.org/standards/dbus/1.0/busconfig.dtd">
<busconfig>
  <policy user="monservice">
    <allow own="com.example.MonService"/>
    <allow send_destination="com.example.MonService"/>
  </policy>
</busconfig>
```

Ce fichier autorise l'utilisateur `monservice` à posséder le nom `com.example.MonService` sur le bus et à recevoir des appels dessus — sans cette policy explicite, D-Bus refuse par défaut (deny by default).

## Sécurisation

- Ne jamais donner de règle `<allow send_destination="*"/>` large sans restriction d'interface : ça ouvre l'accès à tous les services du bus.
- Vérifier que les fichiers dans `/etc/dbus-1/system.d/` n'accordent des droits qu'aux utilisateurs/groupes strictement nécessaires.
- Le bus système est une surface d'attaque en cas de compromission d'un processus non privilégié : une politique trop permissive peut permettre une élévation de privilèges via un service system exposé (ex: appeler une méthode privilégiée de NetworkManager ou logind).
- Auditer régulièrement `busctl list` pour repérer un service inattendu enregistré sur le bus système.

## Logs & dépannage

```bash
journalctl -u dbus              # logs du démon
dbus-monitor --system           # observer le trafic en direct (debug)
busctl list                     # services actuellement connectés
```

Un service qui ne démarre pas et logue une erreur `org.freedesktop.DBus.Error.ServiceUnknown` indique généralement un fichier `.service` D-Bus manquant ou mal nommé dans `/usr/share/dbus-1/system-services/`.

## Voir aussi

- [polkit](./026-polkit.md) — s'appuie directement sur D-Bus pour ses vérifications d'autorisation
