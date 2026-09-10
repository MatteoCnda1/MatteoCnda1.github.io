---
id: 01-modes-cli-navigation
title: "Modes CLI Cisco IOS et navigation"
sidebar_position: 1
tags: [reseau, cheatsheet]
---

# Modes CLI Cisco IOS et navigation

> **IOS** (Internetwork Operating System) est le système d'exploitation des équipements Cisco (routeurs, switches). L'accès se fait via une CLI hiérarchisée en **modes**, chacun donnant accès à un sous-ensemble de commandes.

## Hiérarchie des modes

```text
   ┌────────────────────────────────────────────────────────────┐
   │ USER EXEC MODE                                                │
   │ Router>                                                        │
   │ Commandes limitées (show basiques, ping, telnet)              │
   └───────────────────────────┬────────────────────────────────┘
                                │ enable
                                ▼
   ┌────────────────────────────────────────────────────────────┐
   │ PRIVILEGED EXEC MODE                                          │
   │ Router#                                                        │
   │ Accès complet en lecture (show, debug, copy, reload)           │
   └───────────────────────────┬────────────────────────────────┘
                                │ configure terminal
                                ▼
   ┌────────────────────────────────────────────────────────────┐
   │ GLOBAL CONFIGURATION MODE                                     │
   │ Router(config)#                                                │
   │ Modifie la configuration globale (hostname, routage...)       │
   └───┬───────────┬────────────────┬────────────────┬───────────┘
       │interface   │line             │router           │...
       ▼           ▼                ▼                 ▼
   Router(config-if)# Router(config-line)# Router(config-router)#
   (config. par        (console/vty)         (protocole de routage)
    interface)
```

## Commandes de navigation entre modes

```bash
Router> enable                          ! user exec → privileged exec
Router# configure terminal              ! privileged exec → global config
Router(config)# interface gi0/0         ! global config → config interface
Router(config-if)# exit                 ! remonte d'un niveau
Router(config-if)# end                  ! retour direct en privileged exec (raccourci)
Router# disable                         ! privileged exec → user exec
Router# exit                            ! ferme la session (déconnexion)

! Ctrl+Z : équivalent clavier de "end" depuis n'importe quel sous-mode config
```

## Interfaces multiples : la commande `interface range`

```bash
Router(config)# interface range gigabitEthernet 0/1 - 4
Router(config-if-range)# switchport mode access
Router(config-if-range)# no shutdown
! applique la commande identiquement à Gi0/1, Gi0/2, Gi0/3 et Gi0/4
```

## Raccourcis clavier essentiels

| Raccourci | Action |
|---|---|
| `Tab` | Complétion automatique de la commande |
| `Ctrl+A` | Aller au début de la ligne |
| `Ctrl+E` | Aller à la fin de la ligne |
| `Ctrl+R` | Réafficher la ligne actuelle |
| `Ctrl+W` | Effacer le mot précédent |
| `Ctrl+Shift+6` | Interrompre une commande en cours (ex. ping/traceroute long) |
| `↑` / `Ctrl+P` | Rappeler la commande précédente (historique) |
| `no <commande>` | Annule/désactive une commande de configuration |

## Édition et abréviation des commandes

IOS accepte l'**abréviation** de toute commande tant qu'elle reste non ambiguë :

```bash
Router# show running-config
Router# sh run              ! équivalent, abrégé
Router# conf t               ! configure terminal
Router(config)# int gi0/0    ! interface gigabitEthernet0/0
```

## Ce qu'il faut retenir

- Trois modes principaux : **User exec** (`>`), **Privileged exec** (`#`), **Global config** (`(config)#`), avec des sous-modes de configuration (interface, line, router).
- `enable` monte d'un niveau vers privileged, `configure terminal` vers global config ; `exit`/`end`/`Ctrl+Z` redescendent.
- `interface range` applique une commande à plusieurs interfaces simultanément.
- Les commandes peuvent être **abrégées** tant que l'abréviation reste unique.

## Pour aller plus loin

- [Cisco — Cisco IOS Command Reference](https://www.cisco.com/c/en/us/support/ios-nx-os-software/ios-software-releases-listing.html)
