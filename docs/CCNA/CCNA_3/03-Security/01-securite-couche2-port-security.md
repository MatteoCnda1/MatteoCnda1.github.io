---
id: 01-securite-couche2-port-security
title: "Port Security : sécuriser l'accès physique aux ports"
sidebar_position: 1
tags: [reseau, cybersecurite, cheatsheet]
---

# Port Security : sécuriser l'accès physique aux ports

> **Port Security** restreint le nombre et/ou l'identité des adresses MAC autorisées sur un port de switch — contre-mesure directe aux attaques par **saturation de la table MAC** (CAM table overflow) et au branchement non autorisé d'équipements.

## L'attaque contrée : CAM table overflow

```text
   Un switch a une table MAC de TAILLE LIMITÉE (souvent quelques
   milliers d'entrées selon le modèle).

   ATTAQUE : un outil (ex. macof) génère des MILLIERS de trames
   avec des @MAC source ALÉATOIRES en quelques secondes.

   → la table MAC SATURE, ne peut plus apprendre de nouvelles entrées
   → le switch, ne sachant plus où envoyer les trames vers des
     destinations légitimes, se comporte comme un HUB : FLOOD sur
     TOUS les ports
   → l'attaquant, en écoute passive sur son port, capture le
     trafic destiné à d'autres hôtes du LAN (normalement invisible)
```

## Configuration de base

```bash
Switch(config)# interface fastEthernet 0/1
Switch(config-if)# switchport mode access             ! port security exige un port en mode access explicite
Switch(config-if)# switchport port-security
Switch(config-if)# switchport port-security maximum 2  ! nb max d'@MAC autorisées simultanément (défaut 1)
Switch(config-if)# switchport port-security violation shutdown
Switch(config-if)# switchport port-security mac-address sticky   ! apprend dynamiquement, puis FIGE dans la config
```

## Modes de violation

| Mode | Comportement en cas de dépassement |
|---|---|
| **protect** | Trafic de la MAC en trop **silencieusement ignoré**, pas de log, port reste up |
| **restrict** | Trafic ignoré **+ compteur de violation incrémenté + log/trap SNMP** |
| **shutdown** (défaut) | Port passé en **err-disabled** (désactivé), nécessite une intervention manuelle pour restaurer |

```bash
Switch# show port-security interface fastEthernet 0/1
Port Security              : Enabled
Port Status                : Secure-shutdown       ! port désactivé suite à violation
Violation Mode              : Shutdown
Maximum MAC Addresses        : 2
Total MAC Addresses           : 3
Security Violation Count       : 1
```

### Restaurer un port err-disabled

```bash
Switch(config)# interface fastEthernet 0/1
Switch(config-if)# shutdown
Switch(config-if)# no shutdown
! remise à zéro manuelle du compteur de violation nécessaire au redémarrage du port

! Ou, plus pratique en exploitation : restauration automatique après délai
Switch(config)# errdisable recovery cause psecure-violation
Switch(config)# errdisable recovery interval 300      ! restauration auto après 5 min
```

## Sticky MAC : apprentissage puis verrouillage

```text
   switchport port-security mac-address sticky

   1. Le switch APPREND dynamiquement les premières @MAC vues
      sur le port (comme d'habitude)
   2. Ces @MAC apprises sont AUTOMATIQUEMENT AJOUTÉES à la
      configuration running (visibles via show run)
   3. Une fois sauvegardées (copy run start), elles deviennent
      PERSISTANTES au reboot, sans ressaisie manuelle
```

Alternative à la saisie manuelle de chaque adresse MAC autorisée (`switchport port-security mac-address AAAA.BBBB.CCCC`), particulièrement utile pour un déploiement à grande échelle où saisir manuellement des centaines d'adresses MAC serait impraticable.

## Cas d'usage concret

Un port de switch dans une salle de réunion accessible au public ne doit accepter qu'**un seul** appareil connecté (empêcher un visiteur de brancher discrètement un switch non autorisé pour étendre le réseau ou lancer une attaque de couche 2) :

```bash
Switch(config-if)# switchport mode access
Switch(config-if)# switchport port-security
Switch(config-if)# switchport port-security maximum 1
Switch(config-if)# switchport port-security violation shutdown
Switch(config-if)# switchport port-security mac-address sticky
```

## Ce qu'il faut retenir

- Port Security limite le nombre/l'identité des @MAC autorisées par port, contre-mesure au **CAM table overflow** et aux branchements non autorisés.
- Trois modes de violation : **protect** (silencieux), **restrict** (log), **shutdown** (défaut, désactive le port jusqu'à intervention).
- **Sticky MAC** apprend dynamiquement puis fige les adresses dans la configuration persistante.
- `errdisable recovery` automatise la restauration d'un port désactivé après un délai, évitant une intervention manuelle systématique.

## Pour aller plus loin

- [Cisco — Configuring Port Security](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9200/software/release/17-3/configuration_guide/sec/b_173_sec_9200_cg/configuring_port_based_traffic_control.html)
