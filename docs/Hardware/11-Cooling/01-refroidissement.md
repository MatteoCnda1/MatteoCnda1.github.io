---
id: 01-refroidissement
title: Cooling — Refroidissement
sidebar_position: 1
tags: [hardware]
---

# Cooling — Refroidissement

> Tout composant électronique produit de la chaleur en fonctionnant (dissipation par effet Joule) ; au-delà d'un certain seuil, la chaleur endommage ou ralentit délibérément les composants ([throttling](#le-throttling-thermique)). Le refroidissement évacue cette chaleur pour maintenir des températures de fonctionnement sûres.

## TDP : la mesure de référence

Le **TDP** (Thermal Design Power) indique la quantité de chaleur, en watts, qu'un système de refroidissement doit être capable d'évacuer pour maintenir un composant à sa température maximale sous charge soutenue — une indication pour dimensionner le refroidissement, pas une mesure exacte de la consommation électrique instantanée (qui peut dépasser le TDP sur de courtes périodes, notamment en *boost*).

## Le trajet de la chaleur

```text
   Puce (CPU/GPU)
        │  contact direct (via pâte thermique — voir plus bas)
        ▼
   Dissipateur (radiateur métallique, ailettes)
        │  convection (air) ou conduction (liquide)
        ▼
   Air ambiant du boîtier
        │  extraction par les ventilateurs du boîtier
        ▼
   Air extérieur à la machine
```

À chaque étape, un goulot d'étranglement possible : un mauvais contact thermique, un dissipateur sous-dimensionné, ou un boîtier mal ventilé peuvent tous limiter l'efficacité globale, même avec un excellent composant à l'étape précédente.

## Air vs liquide (watercooling)

```text
   Refroidissement à air                  Refroidissement liquide (AIO)

   ┌──────────┐                          ┌──────────┐   ┌──────────┐
   │  CPU       │                          │  CPU       │   │ Radiateur  │
   │  ┌──────┐  │                          │  ┌──────┐  │   │ (ventilé)  │
   │  │Dissip.│  │                          │  │Waterblock│──▶│            │
   │  └──────┘  │                          │  └──────┘  │   └──────┬───┘
   │  Ventilateur│                          └──────────┘          │
   └──────────┘                          Pompe fait circuler       │
   directement sur                       le liquide en boucle ◀────┘
   le dissipateur                        fermée entre le CPU
                                          et un radiateur distant
```

- **Air** : simple, fiable, sans risque de fuite, entretien minimal — souvent suffisant même pour des configurations performantes.
- **Liquide (AIO, All-In-One)** : déplace la chaleur vers un radiateur plus grand, souvent plus éloigné du composant — permet de meilleures performances thermiques dans un espace contraint, au prix d'une pompe (pièce mécanique de plus, source de panne potentielle) et d'un risque (faible mais réel) de fuite.

Contrairement à une idée reçue, le watercooling n'est pas automatiquement "plus performant" que l'air à qualité égale de dissipateur — la comparaison dépend fortement de la taille du radiateur/dissipateur, du nombre et de la qualité des ventilateurs.

## Pâte thermique : combler les micro-imperfections

Même polies, les surfaces métalliques du CPU/GPU et du dissipateur ont des micro-irrégularités invisibles à l'œil nu, qui piègent de l'air (mauvais conducteur thermique) entre les deux. La **pâte thermique** (thermal paste), un composé conducteur, comble ces interstices pour maximiser le contact thermique réel entre les deux surfaces. Une pâte thermique dégradée ou mal appliquée (trop, trop peu, séchée après plusieurs années) est une cause fréquente de surchauffe progressive sur un système par ailleurs sain.

## Pression d'air dans le boîtier

```text
   Pression positive              Pression négative           Équilibrée

   Plus d'air ENTRE               Plus d'air SORT              Entrée ≈ Sortie
   que n'en sort                  qu'il n'en entre

   → moins de poussière            → aspire l'air (et la           → compromis entre
     accumulée (l'air sort           poussière) par toutes          filtration et
     par les interstices,            les ouvertures non filtrées     évacuation
     pas l'inverse)                  du boîtier
```

Le nombre et l'orientation des ventilateurs de boîtier (pas seulement ceux sur le CPU/GPU) déterminent ce flux global — un aspect souvent négligé qui influence pourtant directement la température de **tous** les composants, y compris ceux sans ventilateur dédié (RAM, VRM de la carte mère, SSD).

## Le throttling thermique

Quand un composant atteint sa température limite, il réduit automatiquement sa fréquence (et donc sa performance) pour limiter la production de chaleur — un mécanisme de protection, pas une panne. Symptôme typique : des performances qui chutent progressivement pendant une charge soutenue (rendu vidéo, jeu prolongé) alors qu'elles étaient normales au démarrage de la tâche — voir [Hardware Diagnostics](../17-Hardware-Diagnostics/index.md) pour identifier ce cas.

## Surveiller les températures sous Linux

```bash
sensors                          # températures des capteurs matériels (nécessite lm-sensors)
sudo sensors-detect               # détecter les capteurs disponibles (première installation)
watch -n1 sensors                 # suivi en temps réel

nvidia-smi --query-gpu=temperature.gpu --format=csv -l 1   # température GPU NVIDIA en continu
```

## Ce qu'il faut retenir

- Le **TDP** dimensionne le refroidissement nécessaire, ce n'est pas une mesure exacte de la consommation instantanée.
- **Air** (simple, fiable) vs **liquide/AIO** (meilleure évacuation dans un espace contraint, pompe en plus) — ni l'un ni l'autre n'est automatiquement supérieur, ça dépend du dimensionnement.
- La **pâte thermique** comble les micro-imperfections de contact — sa dégradation dans le temps est une cause fréquente de surchauffe progressive.
- Le **throttling** est une protection automatique (réduction de fréquence), pas une panne — reconnaissable à une baisse de performance progressive sous charge soutenue.

## Pour aller plus loin

- [Wikipedia — Thermal design power](https://en.wikipedia.org/wiki/Thermal_design_power)
- [Wikipedia — Computer cooling](https://en.wikipedia.org/wiki/Computer_cooling)
