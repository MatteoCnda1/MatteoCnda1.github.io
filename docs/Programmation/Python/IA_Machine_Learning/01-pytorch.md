---
id: 01-pytorch
title: PyTorch
sidebar_position: 1
tags: [programmation, ia]
---

# PyTorch

> **PyTorch** (2016, Meta AI) est aujourd'hui le framework de **deep learning** dominant en recherche, et de plus en plus en production. Son idée centrale : manipuler des réseaux de neurones avec des **tenseurs** proches de NumPy, mais qui savent calculer automatiquement leurs propres gradients (**autograd**) — le mécanisme qui rend l'entraînement par rétropropagation possible sans dériver les formules à la main.

## Le tenseur : la brique de base

Un tenseur PyTorch ressemble à un tableau NumPy (voir [NumPy](../Data_Science/01-numpy.md)), avec deux capacités en plus : il peut vivre sur **GPU**, et il peut **retenir les opérations effectuées dessus** pour calculer un gradient ensuite.

```python
import torch

x = torch.tensor([1.0, 2.0, 3.0])
y = torch.zeros(3, 4)                  # tenseur 3x4 rempli de zéros
z = torch.randn(2, 3)                  # valeurs aléatoires (loi normale)

# Déplacer un tenseur sur GPU si disponible
device = "cuda" if torch.cuda.is_available() else "cpu"
x = x.to(device)
```

## Autograd : la dérivation automatique

```text
   Calcul en avant (forward)              Calcul du gradient en arrière (backward)

   x ──▶ [ x*2 ] ──▶ y ──▶ [ y+1 ] ──▶ z       ∂z/∂x calculé automatiquement
                                                 en remontant le graphe de calcul
   PyTorch enregistre CHAQUE opération          construit pendant le forward
   dans un graphe de calcul dynamique
   tant que requires_grad=True
```

```python
x = torch.tensor(2.0, requires_grad=True)
y = x ** 2 + 3 * x
y.backward()          # calcule dy/dx et le stocke dans x.grad
print(x.grad)          # tensor(7.)   (dérivée de x² + 3x en x=2 → 2x+3 = 7)
```

C'est ce mécanisme, appliqué à des millions de paramètres, qui permet d'entraîner un réseau de neurones : calculer l'erreur (la *loss*), puis `backward()` pour obtenir le gradient de chaque paramètre par rapport à cette erreur.

## Construire un réseau de neurones

```python
import torch.nn as nn

class ReseauSimple(nn.Module):
    def __init__(self):
        super().__init__()
        self.couche1 = nn.Linear(784, 128)   # 784 entrées (ex: image 28x28) → 128 neurones
        self.activation = nn.ReLU()
        self.couche2 = nn.Linear(128, 10)    # 128 → 10 classes de sortie

    def forward(self, x):
        x = self.activation(self.couche1(x))
        x = self.couche2(x)
        return x

modele = ReseauSimple().to(device)
```

`nn.Module` est la classe de base de tout composant réseau ; on définit les couches dans `__init__` et le trajet des données dans `forward`.

## La boucle d'entraînement

C'est le schéma que l'on retrouve dans quasiment tout code PyTorch d'entraînement :

```python
optimiseur = torch.optim.Adam(modele.parameters(), lr=0.001)
fonction_perte = nn.CrossEntropyLoss()

for epoch in range(10):
    for entrees, labels in dataloader:
        entrees, labels = entrees.to(device), labels.to(device)

        optimiseur.zero_grad()              # remettre les gradients à zéro
        sorties = modele(entrees)           # forward
        perte = fonction_perte(sorties, labels)
        perte.backward()                    # backward : calcule les gradients
        optimiseur.step()                   # met à jour les poids selon les gradients
```

```text
   zero_grad()  →  forward()  →  loss  →  backward()  →  step()
        │                                                    │
        └────────────────────── répété à chaque batch ───────┘
```

## Charger des données : `Dataset` et `DataLoader`

```python
from torch.utils.data import Dataset, DataLoader

class MonDataset(Dataset):
    def __init__(self, donnees, labels):
        self.donnees = donnees
        self.labels = labels

    def __len__(self):
        return len(self.donnees)

    def __getitem__(self, idx):
        return self.donnees[idx], self.labels[idx]

dataloader = DataLoader(MonDataset(X, y), batch_size=32, shuffle=True)
```

`DataLoader` gère automatiquement le découpage en *batches*, le mélange des données, et peut paralléliser le chargement.

## Mode entraînement vs évaluation

```python
modele.train()      # active dropout, batch norm en mode "apprentissage"
# ... entraînement ...

modele.eval()        # désactive dropout, batch norm en mode "inférence"
with torch.no_grad():  # désactive le calcul de gradient (plus rapide, moins de mémoire)
    predictions = modele(donnees_test)
```

Oublier `model.eval()` ou `torch.no_grad()` en inférence est une erreur très courante — le modèle continuerait à se comporter comme en entraînement (dropout actif) et gaspillerait de la mémoire à tracker des gradients inutiles.

## Sauvegarder et charger un modèle

```python
torch.save(modele.state_dict(), "modele.pth")

modele = ReseauSimple()
modele.load_state_dict(torch.load("modele.pth"))
modele.eval()
```

## Ce qu'il faut retenir

- Le **tenseur** est la structure de données centrale — un tableau façon NumPy, calculable sur GPU, qui retient ses opérations pour l'**autograd**.
- `loss.backward()` calcule automatiquement les gradients par rétropropagation à travers tout le graphe de calcul.
- La boucle d'entraînement type : `zero_grad() → forward() → loss → backward() → step()`.
- `model.train()`/`model.eval()` et `torch.no_grad()` changent le comportement du modèle et la gestion mémoire — à ne pas oublier en inférence.
