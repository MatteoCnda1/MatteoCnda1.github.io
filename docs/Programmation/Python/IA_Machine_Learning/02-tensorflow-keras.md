---
id: 02-tensorflow-keras
title: TensorFlow & Keras
sidebar_position: 2
tags: [programmation, ia]
---

# TensorFlow & Keras

> **TensorFlow** (2015, Google) est l'autre grand framework de deep learning, historiquement dominant en production/industrie face à [PyTorch](./01-pytorch.md), plus présent en recherche. Depuis TensorFlow 2, **Keras** est son API officielle de haut niveau — au point que, dans la pratique quotidienne, on écrit surtout du Keras, TensorFlow restant le moteur de calcul en dessous.

## TensorFlow vs Keras : deux niveaux d'une même pile

```text
   Keras (API haut niveau)
   → Construire des modèles avec des couches, peu de code, très lisible
        │
        ▼
   TensorFlow (moteur de calcul bas niveau)
   → Tenseurs, graphe de calcul, différenciation automatique, exécution GPU/TPU
```

Avant TensorFlow 2 (2019), Keras était une bibliothèque **indépendante**, capable de tourner sur plusieurs moteurs (TensorFlow, Theano, CNTK). Depuis, Keras est intégré nativement à TensorFlow (`tf.keras`), et reste la façon recommandée de construire des modèles — on ne descend au niveau TensorFlow brut que pour des besoins avancés (opérations personnalisées, contrôle fin de la boucle d'entraînement).

## Tenseurs et exécution "eager"

```python
import tensorflow as tf

x = tf.constant([1.0, 2.0, 3.0])
y = tf.Variable([1.0, 2.0, 3.0])       # une "Variable" est modifiable (ex: poids d'un modèle)

z = x * 2 + 1
print(z.numpy())                       # convertir en tableau NumPy pour inspection
```

Depuis TensorFlow 2, l'exécution est **eager** par défaut (chaque opération s'exécute immédiatement, comme du Python normal) — contrairement à TensorFlow 1 où il fallait construire un graphe de calcul statique avant de l'exécuter dans une "session". Ce changement a nettement simplifié le débogage.

## Construire un modèle avec l'API Sequential

Pour un réseau simple, en pile de couches linéaire :

```python
from tensorflow import keras
from tensorflow.keras import layers

modele = keras.Sequential([
    layers.Dense(128, activation="relu", input_shape=(784,)),
    layers.Dropout(0.2),
    layers.Dense(10, activation="softmax"),
])

modele.summary()      # affiche l'architecture et le nombre de paramètres
```

## L'API fonctionnelle (pour des architectures plus complexes)

Dès qu'un modèle a plusieurs entrées/sorties, ou des branches non linéaires, l'**API fonctionnelle** remplace `Sequential` :

```python
entree = keras.Input(shape=(784,))
x = layers.Dense(128, activation="relu")(entree)
x = layers.Dropout(0.2)(x)
sortie = layers.Dense(10, activation="softmax")(x)

modele = keras.Model(inputs=entree, outputs=sortie)
```

## Compiler, entraîner, évaluer

Keras condense la boucle d'entraînement (que PyTorch écrit explicitement) en trois appels :

```python
modele.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

historique = modele.fit(
    X_entrainement, y_entrainement,
    batch_size=32,
    epochs=10,
    validation_data=(X_validation, y_validation),
)

modele.evaluate(X_test, y_test)
predictions = modele.predict(X_nouvelles_donnees)
```

```text
   compile()   → définit optimiseur, fonction de perte, métriques à suivre
   fit()       → boucle d'entraînement complète (forward, backward, mise à jour) — gérée en interne
   evaluate()  → mesure la performance sur un jeu de données (sans mise à jour des poids)
   predict()   → inférence pure
```

Cette API de haut niveau (`compile`/`fit`) est ce qui distingue le plus l'expérience Keras de PyTorch : moins de code explicite, au prix de moins de contrôle fin sur chaque étape (contrôle qu'on retrouve en utilisant `tf.GradientTape`, l'équivalent TensorFlow de l'autograd PyTorch, pour des boucles d'entraînement personnalisées).

## Callbacks : agir pendant l'entraînement

```python
callbacks = [
    keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
    keras.callbacks.ModelCheckpoint("meilleur_modele.keras", save_best_only=True),
    keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=2),
]

modele.fit(X_entrainement, y_entrainement, epochs=50, callbacks=callbacks,
           validation_data=(X_validation, y_validation))
```

- **EarlyStopping** : arrête l'entraînement si la performance ne s'améliore plus (évite le sur-apprentissage et le temps de calcul inutile).
- **ModelCheckpoint** : sauvegarde automatiquement le meilleur modèle rencontré.
- **ReduceLROnPlateau** : réduit le taux d'apprentissage quand la progression stagne.

## Couches convolutionnelles (vision par ordinateur)

```python
modele_cnn = keras.Sequential([
    layers.Conv2D(32, (3, 3), activation="relu", input_shape=(28, 28, 1)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation="relu"),
    layers.MaxPooling2D((2, 2)),
    layers.Flatten(),
    layers.Dense(10, activation="softmax"),
])
```

## Sauvegarder et charger un modèle

```python
modele.save("mon_modele.keras")
modele_charge = keras.models.load_model("mon_modele.keras")
```

Contrairement à PyTorch (qui sauvegarde généralement seulement les poids via `state_dict`), Keras peut sauvegarder **architecture + poids + configuration de compilation** dans un seul fichier.

## Ce qu'il faut retenir

- **Keras** est l'API de haut niveau (couches, `compile`/`fit`/`evaluate`/`predict`) ; **TensorFlow** est le moteur de calcul en dessous — en pratique, on écrit surtout du Keras.
- `Sequential` pour un modèle en pile simple, l'**API fonctionnelle** dès qu'il faut plusieurs entrées/sorties ou des branches.
- `compile()` puis `fit()` condensent ce que PyTorch écrit explicitement dans une boucle manuelle — moins de code, moins de contrôle fin par défaut.
- Les **callbacks** (`EarlyStopping`, `ModelCheckpoint`, `ReduceLROnPlateau`) sont le mécanisme standard pour agir pendant l'entraînement sans réécrire la boucle.
