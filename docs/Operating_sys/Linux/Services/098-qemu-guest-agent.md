---
id: 098-qemu-guest-agent
title: qemu-guest-agent — communication VM ↔ hyperviseur
sidebar_position: 98
tags: [linux, services, virtualisation]
---

# qemu-guest-agent — communication VM ↔ hyperviseur

Contrairement aux autres fiches de ce lot, `qemu-guest-agent` tourne **à l'intérieur de la VM invitée** (pas sur l'hôte). Il fournit un canal de communication (via un port série virtio) entre l'hyperviseur et l'invité, permettant à l'hôte de demander des actions coordonnées : gel du système de fichiers avant un snapshot, arrêt propre, récupération de l'IP réelle de la VM, etc.

## Installation

```bash
# À l'intérieur de la VM invitée
sudo apt install qemu-guest-agent      # Debian/Ubuntu
sudo dnf install qemu-guest-agent      # Fedora/RHEL
sudo systemctl enable --now qemu-guest-agent
```

Côté hôte, il faut aussi déclarer le canal virtio-serial dans la définition XML de la VM (`<channel type='unix'><target type='virtio' name='org.qemu.guest_agent.0'/></channel>`).

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/sysconfig/qemu-ga` (RHEL) | Options de démarrage du démon |
| Aucun fichier de conf majeur côté Debian — configuration minimale par défaut | |

## Commandes utiles

Côté **hôte**, piloté via `virsh` :

```bash
virsh domifaddr <vm> --source agent    # IP réelle de la VM (via l'agent, plus fiable que le bail DHCP)
virsh guestinfo <vm>
virsh domfsfreeze <vm>                  # geler les FS avant un snapshot cohérent
virsh domfsthaw <vm>
```

## Exemple de configuration

XML côté hôte pour activer le canal (à ajouter dans la définition libvirt de la VM) :

```xml
<channel type='unix'>
  <target type='virtio' name='org.qemu.guest_agent.0'/>
</channel>
```

## Sécurisation

- Le canal guest agent permet à l'hôte d'exécuter certaines actions dans l'invité (gel FS, arrêt, exécution de commandes limitées) : ne l'activer que sur des VM de confiance dont on contrôle aussi l'hôte.
- Ne pas exposer le socket virtio-serial à un tiers non fiable ayant accès à l'hyperviseur.

## Logs & dépannage

```bash
# Dans la VM invitée
journalctl -u qemu-guest-agent
# Côté hôte, si "guest agent is not responding" :
virsh domifaddr <vm> --source agent   # échoue si l'agent n'est pas démarré dans la VM
```

## Voir aussi

- [libvirtd](./095-libvirtd.md) — l'hôte qui communique avec cet agent
