---
id: 095-libvirtd
title: libvirtd — virtualisation KVM/libvirt
sidebar_position: 95
tags: [linux, services, virtualisation]
---

# libvirtd — virtualisation KVM/libvirt

`libvirtd` est le démon central de la stack **libvirt**, qui fournit une API unifiée pour piloter des hyperviseurs (principalement **KVM/QEMU** sous Linux, mais aussi Xen, LXC...). C'est la brique sur laquelle s'appuient `virsh`, virt-manager, et des outils d'infra comme Terraform (provider libvirt) ou OpenStack.

## Installation

```bash
# Debian/Ubuntu
sudo apt install libvirt-daemon-system libvirt-clients qemu-kvm
# Fedora/RHEL
sudo dnf install libvirt qemu-kvm
sudo systemctl enable --now libvirtd
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/libvirt/libvirtd.conf` | Configuration du démon (sockets, auth, logging) |
| `/etc/libvirt/qemu.conf` | Configuration du driver QEMU/KVM |
| `/etc/libvirt/qemu/*.xml` | Définitions des machines virtuelles (domains) |
| `/etc/libvirt/storage/*.xml` | Définitions des pools de stockage |
| `/etc/libvirt/qemu/networks/*.xml` | Définitions des réseaux virtuels |

## Commandes utiles

```bash
systemctl status libvirtd
virsh list --all              # lister les VM (domains)
virsh start/shutdown/destroy <vm>
virsh dominfo <vm>
virsh net-list --all
virsh pool-list --all
virsh edit <vm>                # éditer le XML d'une VM
```

## Exemple de configuration

```xml
<!-- extrait minimal de définition de domaine -->
<domain type='kvm'>
  <name>debian-test</name>
  <memory unit='GiB'>2</memory>
  <vcpu>2</vcpu>
  <os><type arch='x86_64'>hvm</type></os>
</domain>
```

## Sécurisation

- Utiliser le groupe `libvirt` avec parcimonie : en être membre équivaut souvent à un accès root aux VM et à leurs disques.
- Activer **SELinux/AppArmor avec sVirt** pour confiner chaque VM (isolation entre VM en cas de compromission de QEMU).
- Restreindre l'accès au socket libvirt distant (TLS + authentification SASL si `libvirtd` écoute en réseau, éviter le mode non authentifié).
- Séparer les pools de stockage des VM par niveau de confiance.

## Logs & dépannage

```bash
journalctl -u libvirtd
tail -f /var/log/libvirt/qemu/<vm>.log   # log spécifique à une VM
virt-host-validate                        # vérifie que l'hôte supporte bien la virtualisation
```

## Voir aussi

- [virtlogd](./096-virtlogd.md), [virtlockd](./097-virtlockd.md), [qemu-guest-agent](./098-qemu-guest-agent.md) — les autres composants de la stack KVM/libvirt
