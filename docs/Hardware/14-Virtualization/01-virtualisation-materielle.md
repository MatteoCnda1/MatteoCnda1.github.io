---
id: 01-virtualisation-materielle
title: Virtualisation matérielle
sidebar_position: 1
tags: [hardware, conteneurs]
---

# Virtualisation matérielle

> Contrairement aux [conteneurs](../../Containers/Containers/01-quest-ce-quun-conteneur.md) (qui partagent le noyau de l'hôte), une machine virtuelle simule un **matériel complet** — CPU virtuel, RAM virtuelle, disque virtuel — et fait tourner son propre noyau dessus. Ce cours couvre les extensions matérielles qui rendent cette simulation efficace.

## Pourquoi la virtualisation matérielle existe

Avant les extensions matérielles dédiées (années 2000), un hyperviseur devait **intercepter et traduire logiciellement** chaque instruction sensible du CPU virtuel (*trap-and-emulate* ou même réécriture de code, la *binary translation*) — un surcoût de performance important. Les extensions **Intel VT-x** et **AMD-V** ajoutent un mode d'exécution processeur dédié qui permet à l'hyperviseur de laisser le CPU exécuter la plupart des instructions **directement**, en n'interceptant que les opérations réellement sensibles (accès à du matériel partagé, par exemple).

```text
   Sans virtualisation matérielle          Avec VT-x / AMD-V

   Hyperviseur intercepte/traduit          CPU a un mode dédié : la VM
   PRESQUE CHAQUE instruction               exécute directement la plupart
   → lent, complexe                         des instructions, seules les
                                             opérations sensibles sont
                                             interceptées par l'hyperviseur
                                             → bien plus rapide
```

## Activer la virtualisation

Ces extensions sont souvent **désactivées par défaut** dans le [firmware UEFI/BIOS](../12-Firmware/01-bios-uefi.md) :

```bash
# Vérifier si le CPU supporte la virtualisation (et si elle est activée)
egrep -c '(vmx|svm)' /proc/cpuinfo    # vmx = Intel VT-x, svm = AMD-V ; 0 = non supporté/désactivé

lscpu | grep Virtualization             # affiche directement le type supporté
kvm-ok                                  # sur Debian/Ubuntu, diagnostic dédié KVM
```

## Types d'hyperviseurs

```text
   Type 1 (bare-metal)                    Type 2 (hébergé)

   ┌────┐┌────┐┌────┐                    ┌────┐┌────┐┌────┐
   │ VM1  ││ VM2  ││ VM3  │                    │ VM1  ││ VM2  ││ VM3  │
   └────┘└────┘└────┘                    └────┘└────┘└────┘
   ┌──────────────────┐                  ┌──────────────────┐
   │    Hyperviseur      │                  │    Hyperviseur      │
   │  (tourne DIRECTEMENT│                  │  (une application  │
   │   sur le matériel)   │                  │   dans un OS hôte) │
   └──────────────────┘                  └──────────────────┘
                                           ┌──────────────────┐
                                           │   OS hôte (Linux,   │
                                           │   Windows...)        │
                                           └──────────────────┘
```

- **Type 1** (ESXi, Xen, Hyper-V en mode natif) : l'hyperviseur est le premier logiciel à démarrer, directement sur le matériel — performance maximale, typique des serveurs de production.
- **Type 2** (VirtualBox, VMware Workstation) : l'hyperviseur tourne comme une application au sein d'un système d'exploitation classique — plus simple à utiliser, typique du poste de travail.

**KVM** (Kernel-based Virtual Machine), sous Linux, brouille un peu cette distinction : c'est un module du noyau Linux qui transforme le noyau lui-même en hyperviseur type 1, tout en restant un système Linux normal par ailleurs utilisable comme un OS classique.

## IOMMU : la virtualisation pour les périphériques

De même que VT-x/AMD-V virtualise le CPU, l'**IOMMU** (Intel VT-d, AMD-Vi) virtualise l'accès des **périphériques** à la mémoire. Sans IOMMU, un périphérique passé directement à une VM (voir *passthrough* ci-dessous) aurait un accès **DMA** direct à toute la RAM physique de la machine hôte — un risque de sécurité et d'isolation majeur, mentionné aussi dans le cours [Sécurité matérielle](../13-Hardware-Security/01-securite-materielle.md). L'IOMMU force chaque périphérique à passer par une table de traduction d'adresses, limitant son accès mémoire réel aux seules zones autorisées par l'hyperviseur.

## PCI Passthrough : donner un périphérique physique à une VM

Grâce à l'IOMMU, il est possible de dédier un périphérique [PCIe](../07-Buses-Interfaces/index.md) physique (typiquement un GPU) directement à **une seule** VM, qui y accède alors presque comme si elle tournait nativement sur le matériel — utile pour des VM de jeu ou de calcul GPU-intensif, où la virtualisation logicielle classique du GPU introduirait un surcoût de performance inacceptable.

## Virtualisation imbriquée (nested virtualization)

Faire tourner un hyperviseur **à l'intérieur** d'une machine virtuelle elle-même virtualisée — utile pour tester des environnements de virtualisation en CI, ou pour certains scénarios de développement. Nécessite un support explicite (souvent à activer manuellement) tant côté CPU physique que côté configuration de l'hyperviseur hôte, avec un surcoût de performance à chaque niveau d'imbrication.

## Ce qu'il faut retenir

- **VT-x/AMD-V** permettent au CPU d'exécuter directement la plupart des instructions d'une VM, plutôt que l'hyperviseur ne les traduise logiciellement — souvent désactivées par défaut dans le firmware.
- **Type 1** (bare-metal, serveurs) vs **Type 2** (hébergé, poste de travail) ; **KVM** transforme le noyau Linux lui-même en hyperviseur type 1.
- L'**IOMMU** (VT-d/AMD-Vi) sécurise l'accès mémoire des périphériques passés à une VM, rendant possible le **PCI passthrough** (ex : GPU dédié à une VM) sans compromettre l'isolation.

## Pour aller plus loin

- [Wikipedia — Hardware-assisted virtualization](https://en.wikipedia.org/wiki/Hardware-assisted_virtualization)
- [Documentation Linux KVM](https://www.linux-kvm.org/page/Documents)
- [Arch Wiki — PCI passthrough via OVMF](https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF) — guide très détaillé et régulièrement mis à jour.
