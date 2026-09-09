---
id: 04-geolocalisation-image
title: Géolocalisation d'une image
sidebar_position: 5
tags: [osint]
---

# Géolocalisation d'une image

Déterminer **où une photo a été prise** est une compétence OSINT emblématique, popularisée par le collectif d'investigation **Bellingcat** pour vérifier des images de conflits. Cette fiche présente la méthode complète et les outils, dans le cadre éthique posé en introduction.

## Les deux approches

Localiser une image repose sur deux grandes voies, à tenter dans l'ordre :

1. **Les métadonnées (EXIF)** — parfois la photo contient directement les coordonnées GPS. Rapide, mais souvent absent.
2. **Les indices visuels (géolocalisation manuelle)** — quand il n'y a pas de métadonnées, on déduit le lieu à partir de ce que montre l'image. Plus long, mais c'est le cœur du métier.

La méthodologie de référence (Bellingcat) enchaîne : **EXIF → recherche d'image inversée → analyse des indices visuels → confirmation cartographique**. On va la parcourir.

## Étape 1 — Les métadonnées EXIF

Les appareils photo et smartphones enregistrent des **métadonnées EXIF** dans les fichiers image : modèle de l'appareil, date et heure de prise de vue, réglages, et parfois les **coordonnées GPS** exactes. Quand elles sont présentes, c'est la solution la plus directe.

**Outils pour lire l'EXIF :**

```bash
# ExifTool, l'outil de référence (ligne de commande)
exiftool photo.jpg
# Filtrer sur la localisation
exiftool -gps:all photo.jpg
```

On peut aussi utiliser des sites en ligne (exif.tools, exifdata.com...) ou, sous Windows, l'onglet « Détails » des propriétés du fichier.

**Limite majeure à connaître** : les **réseaux sociaux suppriment généralement les métadonnées EXIF** à l'upload (Facebook, Instagram, Twitter...). Une image récupérée sur un réseau social n'aura donc quasiment jamais de GPS. Les EXIF se trouvent surtout sur des images brutes, envoyées par messagerie non compressée, ou hébergées telles quelles. Ne jamais compter dessus, mais toujours vérifier — c'est gratuit et rapide.

Cas d'usage défensif direct : c'est **exactement pour ça** qu'il faut se méfier de partager des photos brutes. Une photo prise chez soi et envoyée sans traitement peut contenir les coordonnées GPS de son domicile. Vérifier l'EXIF de ses propres photos est un réflexe de protection.

## Étape 2 — La recherche d'image inversée

Si la photo (ou un élément qu'elle contient) a déjà été publiée en ligne, la **recherche inversée** peut la retrouver et révéler son contexte (légende, lieu, article). Le principe : le moteur crée une empreinte de l'image et cherche des correspondances visuelles dans son index.

**Les moteurs à utiliser** (les essayer tous, ils ont des forces différentes) :
- **Google Lens / Google Images** — le plus puissant pour reconnaître des **monuments, lieux et scènes** connus. Disponible sur mobile et via lens.google.com.
- **Yandex Images** — souvent **le meilleur** pour la reconnaissance de lieux et de visages, particulièrement sur l'Europe de l'Est ; incontournable en géolocalisation.
- **TinEye** — spécialisé dans la **traçabilité** (retrouver où et depuis quand une image circule, les versions modifiées).
- **Bing Visual Search** — un moteur de plus à croiser.

**Astuce clé** : recadrer l'image pour **isoler un élément distinctif** (un bâtiment, une enseigne, une montagne) avant de lancer la recherche. Chercher sur l'élément marquant plutôt que sur toute la scène donne de bien meilleurs résultats. Google Images et Lens permettent de sélectionner une zone.

## Étape 3 — L'analyse des indices visuels

C'est le cœur de la géolocalisation manuelle, quand ni l'EXIF ni la recherche inversée n'ont suffi. On examine méthodiquement l'image pour en extraire des indices, en appliquant le principe **du plus grand au plus petit** : partir des éléments massifs (relief, gros bâtiments) pour restreindre la zone, puis affiner avec les détails.

Les indices à chercher systématiquement :

- **Le relief et la végétation** — une montagne à la forme reconnaissable (une recherche inversée dessus peut l'identifier), le type de végétation (tropicale, tempérée, aride) qui indique un climat et une région.
- **L'architecture** — le style des bâtiments, les matériaux de construction, typiques d'une région ou d'un pays.
- **Les panneaux et enseignes** — la **langue** et l'**alphabet** (indice de pays immédiat), les noms de commerces (cherchables), les codes postaux ou préfixes téléphoniques affichés.
- **La signalisation routière** — la forme, la couleur, la typographie des panneaux varient selon les pays ; les marquages au sol aussi.
- **Les véhicules** — le **côté de conduite** (gauche/droite), le format des **plaques d'immatriculation** (couleur, format), les modèles courants.
- **Les infrastructures de détail** — poteaux électriques, bornes, mobilier urbain, type de prises, tout élément dont le style est régional.
- **Les uniformes et tenues** — forces de l'ordre, tenues traditionnelles.
- **Les ombres** — leur direction et leur longueur donnent l'orientation et l'heure ; un outil comme **SunCalc** permet, connaissant une date, de recouper la position du soleil pour confirmer une orientation ou une latitude.

Chaque indice **restreint la zone** possible. En les combinant, on passe d'un pays à une région, puis à une ville, puis à une rue.

## Étape 4 — La confirmation cartographique

Une fois une hypothèse de lieu formée, on la **confirme** avec les outils cartographiques :

- **Google Maps / Google Earth** — pour naviguer sur la zone, vérifier la disposition des lieux, comparer les vues aériennes.
- **Google Street View** — l'outil de confirmation ultime : on se place virtuellement dans la rue supposée et on compare les détails (bâtiments, panneaux, mobilier) avec la photo. Une correspondance précise confirme la localisation.
- **OpenStreetMap et Overpass Turbo** — pour des recherches fines : Overpass Turbo permet d'interroger la carte par caractéristiques (« trouve tous les points d'eau / églises / antennes dans cette zone »), très utile pour valider un détail spécifique.

La confirmation n'est acquise que lorsque **plusieurs éléments concordent** entre la photo et la réalité cartographique. Un seul point commun peut être une coïncidence.

## Les outils basés sur l'IA

Une évolution récente : des modèles d'**IA de géolocalisation** analysent une image et proposent une localisation, parfois avec une précision étonnante. Des outils comme **GeoSpy** (initialement pour les enquêteurs) ou des modèles généralistes récents obtiennent de bons résultats. Bellingcat a d'ailleurs testé plusieurs modèles d'IA sur ce type de tâche.

À utiliser avec **prudence** : ces outils donnent une **hypothèse**, pas une preuve. Ils se trompent, et il faut **toujours confirmer manuellement** (Street View, indices croisés). Ils accélèrent la piste initiale mais ne remplacent pas la méthode. Leur existence souligne aussi un risque : une photo publiée peut être localisée par n'importe qui, très vite.

## Cas d'usage et éthique

- **Défensif / personnel** : comprendre à quel point une photo trahit un lieu, pour protéger sa vie privée (vérifier l'EXIF avant de partager, éviter les photos qui révèlent son domicile).
- **Journalisme d'investigation** : vérifier l'authenticité et le lieu d'images (le cœur du travail de Bellingcat sur les conflits).
- **Entraînement** : c'est un excellent exercice via les **challenges de géolocalisation** (GeoGuessr pour le jeu, challenges OSINT dédiés) — la façon idéale et éthique de progresser, sans cibler personne.

Rappel : géolocaliser la photo d'une personne réelle pour la retrouver ou la surveiller sans consentement est une atteinte grave à la vie privée. On s'entraîne sur des défis et des lieux publics, pas sur des individus.

## Ce qu'il faut retenir

- Méthode Bellingcat : **EXIF → recherche inversée → indices visuels → confirmation cartographique**.
- **EXIF** (via **ExifTool**) : parfois des coordonnées GPS directes, mais **les réseaux sociaux les suppriment** — à vérifier systématiquement, sans compter dessus. Réflexe défensif : vérifier l'EXIF de ses propres photos.
- **Recherche inversée** : **Google Lens** (monuments/scènes), **Yandex** (souvent le meilleur pour les lieux), **TinEye** (traçabilité). Astuce : **recadrer sur l'élément distinctif**.
- **Indices visuels**, du plus grand au plus petit : relief/végétation, architecture, langue des **panneaux**, signalisation, **plaques et côté de conduite**, mobilier urbain, **ombres** (SunCalc). Chaque indice restreint la zone.
- **Confirmation** : Google **Street View** (comparaison directe), Earth, OpenStreetMap/**Overpass Turbo** ; valider par **plusieurs concordances**.
- **IA de géoloc** (GeoSpy, modèles récents) : accélèrent la piste mais donnent une hypothèse à **toujours confirmer** manuellement.
- S'entraîner via des **challenges** (GeoGuessr, défis OSINT), jamais sur des individus réels.
