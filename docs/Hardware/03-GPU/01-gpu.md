---
id: 01-gpu
title: GPU — Processeur graphique
sidebar_position: 1
tags: [hardware]
---

# GPU — Processeur graphique

> Un [CPU](../02-CPU/index.md) est optimisé pour exécuter **peu de tâches complexes très vite, en séquence** (quelques cœurs puissants). Un GPU (Graphics Processing Unit) suit la philosophie inverse : **énormément de tâches simples en parallèle** — des milliers de petits cœurs, chacun moins puissant qu'un cœur CPU, mais tous actifs en même temps.

## CPU vs GPU : deux philosophies

```text
   CPU (quelques cœurs puissants)         GPU (des milliers de cœurs simples)

   ┌─────┐┌─────┐┌─────┐┌─────┐          ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐
   │Cœur1 ││Cœur2 ││Cœur3 ││Cœur4 │          ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
   │ ALU   ││ ALU   ││ ALU   ││ ALU   │          ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
   │complexe│complexe│complexe│complexe│          └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
   └─────┘└─────┘└─────┘└─────┘          des milliers de petites unités ALU
   optimisé pour la latence :             optimisé pour le débit (throughput) :
   finir UNE tâche le plus vite            traiter des MILLIERS de tâches
   possible                                identiques en même temps
```

Pourquoi c'est pertinent pour le rendu graphique : afficher une image revient à calculer la couleur de **millions de pixels**, souvent avec des opérations très similaires (voire identiques) d'un pixel à l'autre — un problème massivement **parallélisable**, exactement ce pour quoi le GPU est taillé. Ce même profil de calcul (beaucoup d'opérations identiques sur beaucoup de données) se retrouve dans l'entraînement de réseaux de neurones — voir [PyTorch](../../Programmation/Python/IA_Machine_Learning/01-pytorch.md) — d'où l'usage massif des GPU en IA, bien au-delà du graphisme.

## Intégré vs dédié

| | GPU intégré | GPU dédié |
|---|---|---|
| **Emplacement** | Sur la même puce que le CPU | Carte séparée, connectée en [PCIe](../07-Buses-Interfaces/index.md) |
| **Mémoire** | Partage la RAM système | Sa propre mémoire dédiée (VRAM), beaucoup plus rapide |
| **Puissance** | Limitée, adaptée au bureau/vidéo légère | Bien plus élevée, jeu/rendu 3D/calcul intensif |
| **Consommation** | Faible | Élevée, alimentation dédiée nécessaire (voir [Power](../10-Power/index.md)) |

## VRAM : pourquoi une mémoire dédiée

La VRAM (Video RAM) d'un GPU dédié est optimisée pour un **débit énorme** (bande passante très large, souvent plusieurs centaines de Go/s) plutôt que pour la latence la plus faible possible — cohérent avec le profil de calcul massivement parallèle du GPU : peu importe le délai pour une donnée précise, ce qui compte c'est le volume total transféré par seconde pour nourrir des milliers de cœurs en continu.

## Le pipeline graphique, simplifié

```text
   Données 3D (sommets, textures)
         │
         ▼
   Vertex Shader        → positionne les sommets dans l'espace 3D → 2D (écran)
         │
         ▼
   Rasterization         → convertit les triangles en pixels candidats
         │
         ▼
   Fragment/Pixel Shader → calcule la couleur finale de chaque pixel
         │
         ▼
   Framebuffer            → image finale envoyée à l'écran
```

Les **shaders** sont de petits programmes exécutés par le GPU, massivement en parallèle (un par sommet, un par pixel) — c'est cette architecture de shaders programmables qui a ouvert la voie au calcul généraliste sur GPU (GPGPU).

## GPGPU : le calcul généraliste sur GPU

À partir du milieu des années 2000, les développeurs ont détourné les shaders programmables pour faire des calculs **non graphiques** massivement parallèles — calcul scientifique, cryptographie (cassage de hash), et surtout, depuis les années 2010, l'**entraînement de réseaux de neurones**.

- **CUDA** (NVIDIA, propriétaire) — la plateforme dominante en deep learning, très largement supportée par [PyTorch](../../Programmation/Python/IA_Machine_Learning/01-pytorch.md) et [TensorFlow](../../Programmation/Python/IA_Machine_Learning/02-tensorflow-keras.md).
- **ROCm** (AMD, ouvert) — alternative en développement actif, support croissant mais historiquement en retrait face à CUDA.
- **OpenCL** — standard ouvert multi-plateforme, moins dominant aujourd'hui côté IA que CUDA.

## Inspecter son GPU sous Linux

```bash
lspci | grep -i vga              # identifier le(s) GPU présents
nvidia-smi                       # état, utilisation, mémoire (GPU NVIDIA)
glxinfo | grep "OpenGL renderer"  # GPU utilisé pour le rendu OpenGL
```

## Ce qu'il faut retenir

- CPU = peu de cœurs puissants (latence) ; GPU = des milliers de cœurs simples (débit/parallélisme).
- Ce profil massivement parallèle explique à la fois le rendu graphique **et** l'usage des GPU en deep learning.
- **VRAM dédiée** ≠ RAM système : optimisée pour le débit, pas la latence individuelle.
- **CUDA** (NVIDIA) domine l'écosystème IA, **ROCm** (AMD) est l'alternative ouverte.

## Pour aller plus loin

- [Wikipedia — Graphics processing unit](https://en.wikipedia.org/wiki/Graphics_processing_unit)
- [Documentation développeur NVIDIA CUDA](https://developer.nvidia.com/cuda-zone)
- [Documentation ROCm (AMD)](https://rocm.docs.amd.com/)
