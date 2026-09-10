---
id: 01-materiel-reseau
title: Matériel réseau
sidebar_position: 1
tags: [hardware, reseau]
---

# Matériel réseau

> Ce cours couvre le matériel physique qui compose un réseau — pour la configuration logique (VLAN, routage...), voir la section [Networking](../../networking/index.md). Ici : cartes réseau, switchs, routeurs, câblage, et les couches physique/liaison qu'ils implémentent.

## La carte réseau (NIC)

La **NIC** (Network Interface Controller) convertit les données numériques du système en signaux électriques (Ethernet cuivre), lumineux (fibre optique) ou radio (Wi-Fi) transmissibles sur le support physique, et inversement à la réception. Chaque NIC possède une **adresse MAC** unique, gravée en usine, qui l'identifie au niveau de la couche liaison (couche 2 du modèle OSI).

```bash
ip link show                # lister les interfaces réseau et leur adresse MAC
ethtool eth0                 # vitesse, duplex, statistiques de la carte
```

## Switch vs hub : pourquoi le hub a disparu

```text
   Hub (obsolète)                        Switch (moderne)

   Toute trame reçue est                 Le switch apprend quelle adresse MAC
   RÉPÉTÉE sur TOUS les ports              est sur quel port, et n'envoie la
   (sauf celui d'origine)                  trame QUE vers le port concerné

   PC A ──┐                               PC A ──┐
   PC B ──┼── HUB ── (tout le monde       PC B ──┼── SWITCH ── (seul le
   PC C ──┘    reçoit tout, même ce         PC C ──┘    destinataire réel
   PC D ──┘    qui ne le concerne pas)      PC D ──┘    reçoit la trame)
                → collisions fréquentes                 → pas de collision,
                → un seul domaine de                      bande passante dédiée
                  collision partagé                        par port
```

Le switch construit une **table d'adresses MAC** (quelle adresse MAC est vue sur quel port) en observant le trafic, et ne diffuse en broadcast que quand il ne connaît pas encore la destination — un gain massif en efficacité et en sécurité par rapport au hub, qui explique sa disparition quasi totale.

## Switch vs routeur : couche 2 vs couche 3

| | Switch | Routeur |
|---|---|---|
| **Couche OSI** | 2 (liaison de données) | 3 (réseau) |
| **Identifie par** | Adresse MAC | Adresse IP |
| **Rôle** | Relier des appareils au **sein** d'un même réseau local | Relier des réseaux **différents** entre eux (ex : réseau local ↔ Internet) |
| **Exemple typique** | Distribuer le réseau dans un bâtiment | La box internet qui relie le réseau domestique au FAI |

Un switch de niveau 3 (*Layer 3 switch*) existe aussi — un appareil qui combine commutation rapide et fonctions de routage basique, courant en entreprise pour segmenter le trafic entre VLAN sans passer par un routeur dédié.

## Câblage cuivre : catégories Ethernet

| Catégorie | Débit maximal | Usage typique |
|---|---|---|
| Cat 5e | 1 Gbit/s | Ancien standard domestique, encore très répandu |
| Cat 6 | 1-10 Gbit/s (selon distance) | Standard actuel recommandé |
| Cat 6a | 10 Gbit/s | Sur de plus longues distances que le Cat 6 |
| Cat 8 | 25-40 Gbit/s | Datacenters, courtes distances |

Le câble Ethernet cuivre utilise des **paires torsadées** (les fils sont torsadés ensemble par paires) pour réduire les interférences électromagnétiques entre paires — chaque paire torsadée annule une partie du bruit induit sur sa voisine par un effet d'annulation de champ.

## Fibre optique : monomode vs multimode

- **Multimode** : cœur de fibre plus large, la lumière rebondit selon plusieurs trajets ("modes") — moins chère, mais limitée en distance (quelques centaines de mètres à quelques km) à cause de la dispersion entre les différents trajets.
- **Monomode** : cœur très fin, un seul trajet de lumière possible — plus chère (laser plus précis nécessaire), mais portée bien supérieure (dizaines de km), utilisée pour les longues distances (backbone Internet, liaisons inter-datacenters).

## Alimentation par le câble : PoE

**Power over Ethernet** fait passer l'alimentation électrique sur le même câble Ethernet que les données — pratique pour des équipements comme des points d'accès Wi-Fi ou des caméras IP installés loin d'une prise secteur, alimentés uniquement via le switch (lui-même souvent appelé "switch PoE").

## Antennes et Wi-Fi : quelques bases matérielles

Le matériel Wi-Fi utilise des antennes pour émettre/recevoir sur les bandes 2,4 GHz et/ou 5/6 GHz. Le **MIMO** (Multiple Input, Multiple Output) utilise plusieurs antennes simultanément pour transmettre plusieurs flux de données en parallèle sur le même canal radio, augmentant le débit total sans bande passante radio supplémentaire — un principe similaire en esprit au multi-cœur côté CPU : faire plus de choses en parallèle plutôt que plus vite individuellement.

## Ce qu'il faut retenir

- Le **switch** a remplacé le hub en n'envoyant chaque trame qu'au port concerné (via une table d'adresses MAC), éliminant les collisions inutiles.
- **Switch** (couche 2, adresses MAC, au sein d'un réseau) vs **routeur** (couche 3, adresses IP, entre réseaux différents).
- Câblage cuivre : catégories Ethernet (5e à 8) ; fibre : **monomode** (longue distance) vs **multimode** (courte distance, moins chère).
- **PoE** transporte l'alimentation sur le câble de données ; **MIMO** utilise plusieurs antennes Wi-Fi en parallèle pour augmenter le débit.

## Pour aller plus loin

- [Wikipedia — Network switch](https://en.wikipedia.org/wiki/Network_switch)
- [Wikipedia — Ethernet](https://en.wikipedia.org/wiki/Ethernet)
- Voir aussi la section [Networking](../../networking/index.md) de ce site pour la configuration logique (VLAN, routage Cisco...).
