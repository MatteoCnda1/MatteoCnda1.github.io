---
id: 03-scikit-learn
title: scikit-learn
sidebar_position: 3
tags: [programmation, ia]
---

# scikit-learn

> **scikit-learn** (2007) est la bibliothèque de référence pour le **machine learning classique** en Python — par opposition au deep learning ([PyTorch](./01-pytorch.md), [TensorFlow/Keras](./02-tensorflow-keras.md)). Régression, classification, clustering, réduction de dimension : scikit-learn couvre les algorithmes "traditionnels" (arbres de décision, forêts aléatoires, SVM, k-means...) avec une **API unifiée** qui rend les modèles interchangeables.

## L'API unifiée : `fit` / `predict` / `transform`

C'est l'idée centrale qui rend scikit-learn si prévisible à utiliser : **tous** les modèles, quel que soit l'algorithme, exposent la même interface.

```text
   Estimateur (Estimator)        → .fit(X, y)         apprend à partir des données
   Prédicteur                    → .predict(X)         produit des prédictions
   Transformateur (Transformer)  → .transform(X)        transforme les données
                                  → .fit_transform(X)    fit + transform en un appel
```

```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

# Ces trois modèles, pourtant très différents, s'utilisent EXACTEMENT pareil :
for Modele in [DecisionTreeClassifier, RandomForestClassifier, SVC]:
    modele = Modele()
    modele.fit(X_entrainement, y_entrainement)
    predictions = modele.predict(X_test)
```

Ça rend triviale la comparaison de plusieurs algorithmes sur le même problème — seule la ligne d'instanciation change.

## Un flux de travail complet

```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# 1. Séparer entraînement / test
X_entrainement, X_test, y_entrainement, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 2. Normaliser les features (fit UNIQUEMENT sur l'entraînement, jamais sur le test)
scaler = StandardScaler()
X_entrainement = scaler.fit_transform(X_entrainement)
X_test = scaler.transform(X_test)          # transform seul, pas fit — évite la fuite de données

# 3. Entraîner
modele = RandomForestClassifier(n_estimators=100, random_state=42)
modele.fit(X_entrainement, y_entrainement)

# 4. Évaluer
predictions = modele.predict(X_test)
print(accuracy_score(y_test, predictions))
print(classification_report(y_test, predictions))
```

> ⚠️ Piège classique : appeler `fit_transform` sur le jeu de **test** (au lieu de `transform` seul) provoque une **fuite de données** (*data leakage*) — le scaler "verrait" des statistiques du jeu de test, faussant l'évaluation en donnant une performance artificiellement optimiste.

## Pipelines : enchaîner prétraitement et modèle

```python
from sklearn.pipeline import Pipeline

pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("modele", RandomForestClassifier()),
])

pipeline.fit(X_entrainement, y_entrainement)     # applique scaler.fit_transform puis modele.fit
predictions = pipeline.predict(X_test)            # applique scaler.transform puis modele.predict
```

Un `Pipeline` élimine le risque de fuite de données vu plus haut (impossible d'oublier de refaire `transform` avant `predict`) et rend le flux entier réutilisable comme un seul objet.

## Validation croisée

Évaluer un modèle sur un **seul** découpage train/test peut donner un résultat trompeur (dépendant du hasard du découpage). La **validation croisée** répète l'entraînement/évaluation sur plusieurs découpages :

```python
from sklearn.model_selection import cross_val_score

scores = cross_val_score(modele, X, y, cv=5)     # 5-fold cross-validation
print(scores.mean(), scores.std())
```

## Recherche d'hyperparamètres

```python
from sklearn.model_selection import GridSearchCV

grille = {
    "n_estimators": [50, 100, 200],
    "max_depth": [None, 10, 20],
}

recherche = GridSearchCV(RandomForestClassifier(), grille, cv=5)
recherche.fit(X_entrainement, y_entrainement)

print(recherche.best_params_)
meilleur_modele = recherche.best_estimator_
```

`GridSearchCV` teste systématiquement toutes les combinaisons d'hyperparamètres de la grille, avec validation croisée pour chacune, et retient la meilleure.

## Les familles d'algorithmes couvertes

| Tâche | Exemples de modèles disponibles |
|---|---|
| **Classification** | `LogisticRegression`, `RandomForestClassifier`, `SVC`, `KNeighborsClassifier` |
| **Régression** | `LinearRegression`, `RandomForestRegressor`, `SVR` |
| **Clustering** (non supervisé) | `KMeans`, `DBSCAN`, `AgglomerativeClustering` |
| **Réduction de dimension** | `PCA`, `t-SNE` |
| **Prétraitement** | `StandardScaler`, `OneHotEncoder`, `SimpleImputer` (valeurs manquantes) |

## Sauvegarder un modèle entraîné

```python
import joblib

joblib.dump(pipeline, "mon_pipeline.pkl")
pipeline_charge = joblib.load("mon_pipeline.pkl")
```

## Ce qu'il faut retenir

- API unifiée `fit`/`predict`/`transform` : tous les modèles s'utilisent de la même façon, ce qui rend triviale la comparaison d'algorithmes.
- Toujours `fit_transform` sur l'**entraînement** et `transform` seul sur le **test** — l'inverse provoque une fuite de données.
- Les `Pipeline` enchaînent prétraitement + modèle en un seul objet réutilisable, éliminant ce risque d'erreur.
- `cross_val_score` (validation croisée) et `GridSearchCV` (recherche d'hyperparamètres) sont les outils standards pour évaluer et régler un modèle sérieusement, au-delà d'un simple split train/test.
