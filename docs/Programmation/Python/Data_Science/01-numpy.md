---
id: 01-numpy
title: NumPy
sidebar_position: 1
tags: [programmation, ia]
---

# NumPy

> **NumPy** (2006, héritier de Numeric/Numarray) est la fondation de tout l'écosystème scientifique Python — [Pandas](./02-pandas.md), [scikit-learn](../IA_Machine_Learning/03-scikit-learn.md), [PyTorch](../IA_Machine_Learning/01-pytorch.md) reposent tous dessus, directement ou dans leur philosophie. Son apport central : le **ndarray**, un tableau multidimensionnel homogène et des opérations **vectorisées** bien plus rapides que des boucles Python pures.

## Pourquoi pas des listes Python ?

```text
   Liste Python                              ndarray NumPy

   [1, 2, 3, 4, 5]                            array([1, 2, 3, 4, 5])
   → chaque élément est un objet Python        → bloc de mémoire contiguë,
     séparé (overhead important)                 type unique (ex: int64)
   → boucle "for" pour toute opération          → opérations vectorisées,
     (lent en Python pur)                         exécutées en code C compilé
                                                   (100x-1000x plus rapide)
```

```python
import numpy as np

# Boucle Python — lent
resultat = [x * 2 for x in liste_de_millions_de_valeurs]

# NumPy vectorisé — rapide (délègue le calcul à du code C optimisé)
resultat = tableau_numpy * 2
```

## Créer des tableaux

```python
a = np.array([1, 2, 3, 4])
b = np.array([[1, 2], [3, 4]])          # tableau 2D (matrice)

np.zeros((3, 4))                        # tableau 3x4 rempli de zéros
np.ones((2, 2))
np.arange(0, 10, 2)                     # [0, 2, 4, 6, 8], comme range()
np.linspace(0, 1, 5)                    # 5 valeurs régulièrement espacées entre 0 et 1
np.random.rand(3, 3)                    # valeurs aléatoires uniformes [0, 1)

a.shape                                 # dimensions, ex: (4,) ou (3, 4)
a.dtype                                 # type des éléments, ex: int64, float32
```

## Opérations vectorisées

```python
a = np.array([1, 2, 3])
b = np.array([10, 20, 30])

a + b            # array([11, 22, 33]) — élément par élément, sans boucle
a * 2            # array([2, 4, 6])
a > 1             # array([False, True, True]) — comparaison élément par élément

np.sqrt(a)
np.sum(a)
np.mean(a)
a.max(), a.min(), a.argmax()            # argmax : index de la valeur max
```

## Indexation et slicing

```python
m = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

m[0, 1]           # 2  → ligne 0, colonne 1
m[:, 0]           # array([1, 4, 7])  → toute la colonne 0
m[1, :]           # array([4, 5, 6])  → toute la ligne 1
m[0:2, 1:3]       # sous-matrice : lignes 0-1, colonnes 1-2

# Indexation booléenne : sélectionner selon une condition
m[m > 5]          # array([6, 7, 8, 9]) — tous les éléments > 5
```

## Le broadcasting

Le mécanisme qui permet d'opérer entre tableaux de formes **différentes**, sans les rendre explicitement identiques — NumPy "étire" virtuellement le plus petit tableau :

```text
   Tableau (3, 4)          +          Tableau (4,)             =          Résultat (3,4)

   ┌───┬───┬───┬───┐                  ┌───┬───┬───┬───┐                  chaque ligne du
   │ . │ . │ . │ . │                  │ a │ b │ c │ d │                  premier tableau
   │ . │ . │ . │ . │        +         └───┴───┴───┴───┘        =         reçoit [a,b,c,d]
   │ . │ . │ . │ . │                  (broadcasté sur                    ajouté élément
   └───┴───┴───┴───┘                   les 3 lignes)                     par élément
```

```python
matrice = np.ones((3, 4))
vecteur = np.array([1, 2, 3, 4])
matrice + vecteur       # le vecteur est appliqué à chacune des 3 lignes, sans le dupliquer explicitement
```

Le broadcasting évite d'écrire des boucles pour appliquer une opération ligne par ligne ou colonne par colonne — mais suit des règles de compatibilité de formes précises (les dimensions doivent être égales, ou l'une d'elles valoir 1).

## Reshape et transposition

```python
a = np.arange(12)             # [0, 1, ..., 11]
a.reshape(3, 4)                # réorganise en matrice 3x4, mêmes données
a.reshape(3, 4).T              # transposée : matrice 4x3

a.flatten()                    # remet en tableau 1D
```

## Algèbre linéaire

```python
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

A @ B                    # multiplication matricielle (équivalent np.matmul(A, B))
A.T                       # transposée
np.linalg.inv(A)          # matrice inverse
np.linalg.det(A)          # déterminant
np.linalg.eig(A)          # valeurs propres / vecteurs propres
```

> ⚠️ `A * B` fait une multiplication **élément par élément**, pas une multiplication matricielle — piège fréquent pour qui vient d'autres langages. Utiliser `@` (ou `np.matmul`) pour le produit matriciel.

## Ce qu'il faut retenir

- Le **ndarray** est homogène (un seul type) et contigu en mémoire — c'est ce qui permet des opérations **vectorisées** bien plus rapides que des boucles Python.
- Indexation par tranches (`[début:fin]`) et indexation **booléenne** (`tableau[condition]`) sont les deux outils de sélection à maîtriser.
- Le **broadcasting** permet d'opérer entre tableaux de formes différentes sans les dupliquer explicitement, selon des règles de compatibilité précises.
- `@` pour la multiplication matricielle, `*` pour l'élément par élément — ne pas confondre.
