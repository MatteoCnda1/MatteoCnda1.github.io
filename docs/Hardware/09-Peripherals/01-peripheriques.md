---
id: 01-peripheriques
title: Périphériques
sidebar_position: 1
tags: [hardware]
---

# Périphériques

> Tout ce qui connecte l'ordinateur au monde extérieur — clavier, souris, écran, imprimante — communique via des interfaces standardisées (voir [Bus & Interfaces](../07-Buses-Interfaces/index.md)) et des protocoles qui permettent à un même périphérique de fonctionner sans pilote spécifique sur des systèmes différents.

## Entrée vs sortie vs les deux

```text
   Entrée (Input)              Sortie (Output)              Entrée/Sortie
   → clavier, souris,          → écran, haut-parleurs,       → écran tactile,
     scanner, webcam             imprimante                    manette avec
                                                                retour de force
```

## HID : le protocole qui rend clavier/souris universels

**HID** (Human Interface Device) est une classe de périphériques USB standardisée qui permet à un clavier, une souris, ou une manette de fonctionner **sans pilote propriétaire** sur pratiquement n'importe quel système d'exploitation — le système utilise un pilote HID générique intégré, qui interprète les descripteurs que le périphérique lui-même communique (quelles touches, quels axes, quelle plage de valeurs). C'est ce qui permet de brancher n'importe quel clavier USB sur n'importe quel PC et qu'il fonctionne instantanément.

```bash
lsusb                          # lister les périphériques USB connectés
sudo cat /proc/bus/input/devices  # périphériques d'entrée reconnus par le noyau
```

## Écrans : les technologies principales

| Technologie | Principe | Points forts |
|---|---|---|
| **LCD/IPS** | Cristaux liquides filtrant une rétroéclairage LED | Bon rapport qualité/prix, angles de vue larges (IPS) |
| **VA** | Variante LCD, alignement vertical des cristaux | Meilleur contraste natif que l'IPS |
| **OLED** | Chaque pixel émet sa propre lumière (pas de rétroéclairage) | Noirs parfaits, contraste infini, mais risque de *burn-in* |

Le **taux de rafraîchissement** (60, 144, 240 Hz...) indique combien de fois par seconde l'image est renouvelée — pertinent pour la fluidité perçue, en particulier en jeu vidéo, indépendamment de la résolution.

## Connectique vidéo : DisplayPort vs HDMI

- **HDMI** : orienté grand public/audiovisuel (TV, consoles), gère aussi l'audio.
- **DisplayPort** : orienté PC, généralement plus performant en bande passante à une génération donnée, supporte le **daisy-chaining** (chaîner plusieurs écrans sur un seul câble via MST).

Les deux évoluent en versions qui augmentent la bande passante supportée (résolution × taux de rafraîchissement maximum) — au-delà d'un certain point, la limite n'est souvent plus l'écran ou la carte graphique, mais le **câble/la version du port** utilisée.

## Clavier : mécanique vs membrane

- **Membrane** : une feuille de caoutchouc sous les touches fait le contact — bon marché, silencieux, mais moins précis et moins durable.
- **Mécanique** : chaque touche a son propre interrupteur physique (*switch*) — plus précis, plus durable (dizaines de millions d'actionnements), plus bruyant selon le type de switch, personnalisable (switches interchangeables sur certains modèles).

## Souris : capteur optique vs laser

Les souris modernes utilisent un capteur optique (une mini-caméra qui photographie la surface plusieurs milliers de fois par seconde) pour détecter le mouvement — la distinction "laser" vs "optique LED" concerne surtout le type de source lumineuse utilisée pour éclairer cette surface, avec des compromis de précision selon le type de surface (le laser fonctionnant mieux sur des surfaces brillantes, mais parfois moins précis sur certains tapis).

## Imprimantes : jet d'encre vs laser

- **Jet d'encre** : projette des micro-gouttelettes d'encre liquide — bonne qualité photo, coût par page élevé sur gros volumes, cartouches qui peuvent sécher si peu utilisées.
- **Laser** : un tambour chargé électrostatiquement attire une poudre (toner), fixée ensuite par la chaleur — plus rapide, coût par page plus bas sur gros volumes, moins adaptée à la photo couleur fine.

## Ce qu'il faut retenir

- **HID** standardise clavier/souris/manettes pour fonctionner sans pilote spécifique, via USB.
- **OLED** offre un contraste supérieur au LCD/IPS au prix d'un risque de *burn-in* ; le taux de rafraîchissement est indépendant de la résolution.
- **DisplayPort** vise davantage le PC (daisy-chaining), **HDMI** le grand public/audiovisuel.
- **Mécanique** (switch dédié par touche, plus durable) vs **membrane** (moins cher, moins précis) pour les claviers.

## Pour aller plus loin

- [Wikipedia — Human interface device](https://en.wikipedia.org/wiki/Human_interface_device)
- [Wikipedia — DisplayPort](https://en.wikipedia.org/wiki/DisplayPort)
