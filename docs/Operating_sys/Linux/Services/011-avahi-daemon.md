---
id: 011-avahi-daemon
title: avahi-daemon — découverte réseau mDNS
sidebar_position: 11
tags: [linux, services, reseau]
---

# avahi-daemon

Implémentation libre de **mDNS/DNS-SD** (Zeroconf, équivalent de Bonjour d'Apple) : permet de découvrir et publier des services sur le réseau local sans serveur DNS central, via des noms en `.local` (ex: `mamachine.local`) et des annonces multicast.

## Installation

```bash
# Debian/Ubuntu
sudo apt install avahi-daemon avahi-utils
# Fedora
sudo dnf install avahi

sudo systemctl enable --now avahi-daemon
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/avahi/avahi-daemon.conf` | Configuration principale (interfaces autorisées, domaine `.local`, publication) |
| `/etc/avahi/services/*.service` | Fichiers XML décrivant les services publiés (imprimante, SSH, HTTP...) |
| `/etc/nsswitch.conf` | Doit inclure `mdns4_minimal [NOTFOUND=return]` pour que la résolution `.local` fonctionne côté client |

## Commandes utiles

```bash
systemctl status avahi-daemon

avahi-browse -a                 # lister tous les services annoncés sur le réseau
avahi-browse -rt _http._tcp     # services HTTP, avec résolution
avahi-resolve -n mamachine.local  # résoudre un nom .local en IP
avahi-publish -s "MonService" _http._tcp 8080   # publier un service ponctuellement en CLI
```

## Exemple de configuration

Publier un service SSH (`/etc/avahi/services/ssh.service`) :

```xml
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name replace-wildcards="yes">%h SSH</name>
  <service>
    <type>_ssh._tcp</type>
    <port>22</port>
  </service>
</service-group>
```

## Sécurisation

- Restreindre les interfaces d'écoute (`allow-interfaces=` dans `avahi-daemon.conf`) pour ne pas exposer mDNS sur une interface publique/WAN — mDNS n'est pensé que pour du LAN de confiance.
- Ne publier (`disable-publishing=no` par défaut) que ce qui est nécessaire ; désactiver la publication (`disable-publishing=yes`) si la machine n'a besoin que de **découvrir**, pas de s'annoncer.
- mDNS multicast est **non authentifié** : n'importe quel hôte du même segment L2 peut se faire passer pour un service annoncé — ne pas s'y fier pour des vérifications de confiance.
- Sur un réseau segmenté (VLAN), avahi ne traverse pas les routeurs par défaut (multicast local) : c'est une protection de fait, ne pas la contourner par un relais mDNS sans réflexion.

## Logs & dépannage

```bash
journalctl -u avahi-daemon -f
avahi-browse -a --terminate    # snapshot des services vus, puis quitte
systemctl status avahi-daemon  # vérifier que le service écoute bien sur les bonnes interfaces
```

Problème classique : résolution `.local` qui échoue côté client → vérifier `nsswitch.conf` et que le firewall local autorise UDP 5353 (multicast mDNS).

## Voir aussi

- [systemd-resolved](./009-systemd-resolved.md) — résolveur DNS système, distinct de la découverte mDNS d'avahi (les deux peuvent coexister).
