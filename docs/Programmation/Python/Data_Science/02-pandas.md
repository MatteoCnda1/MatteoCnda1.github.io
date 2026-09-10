---
id: 02-pandas
title: Pandas
sidebar_position: 2
tags: [programmation, ia]
---

# Pandas

> **Pandas** (2008) construit par-dessus [NumPy](./01-numpy.md) deux structures pensées pour manipuler des données **tabulaires et hétérogènes** (comme un tableur ou une table SQL) : la **Series** (une colonne) et le **DataFrame** (un tableau 2D avec des colonnes typées indépendamment, et des index nommés).

## DataFrame vs ndarray NumPy

```text
   ndarray NumPy                          DataFrame Pandas

   ┌────┬────┬────┐                       ┌──────┬────────┬──────┐
   │ 1  │ 2  │ 3  │   type UNIQUE          │ nom  │  age   │ ville│  chaque colonne
   │ 4  │ 5  │ 6  │   pour tout le          ├──────┼────────┼──────┤  a son PROPRE type
   └────┴────┴────┘   tableau              │Alice │  30    │Paris │  (str, int, ...)
   indices 0,1,2...                         │Bob   │  25    │Lyon  │
                                            └──────┴────────┴──────┘
                                            index nommé, colonnes nommées
```

## Créer et charger des données

```python
import pandas as pd

df = pd.DataFrame({
    "nom": ["Alice", "Bob", "Charlie"],
    "age": [30, 25, 35],
    "ville": ["Paris", "Lyon", "Marseille"],
})

df = pd.read_csv("donnees.csv")
df = pd.read_excel("donnees.xlsx")
df = pd.read_sql("SELECT * FROM utilisateurs", connexion)
df = pd.read_json("donnees.json")
```

## Explorer un DataFrame

```python
df.head()            # 5 premières lignes
df.info()            # types de colonnes, valeurs manquantes, mémoire utilisée
df.describe()        # statistiques descriptives des colonnes numériques
df.shape              # (nb_lignes, nb_colonnes)
df.columns            # noms des colonnes
df.dtypes             # type de chaque colonne
```

## Sélectionner des données

```python
df["age"]                        # une colonne → Series
df[["nom", "age"]]               # plusieurs colonnes → DataFrame

df.loc[0]                        # ligne par label/index
df.loc[0, "nom"]                 # cellule précise par label
df.iloc[0]                       # ligne par position numérique
df.iloc[0:3, 1:3]                # sous-tableau par positions

df[df["age"] > 28]               # filtrage par condition (comme l'indexation booléenne NumPy)
df[(df["age"] > 25) & (df["ville"] == "Paris")]   # conditions combinées (& / | , pas and/or)
```

> `.loc` sélectionne par **label** (nom de ligne/colonne), `.iloc` par **position entière** — une confusion fréquente, surtout quand l'index n'est pas une simple séquence 0,1,2....

## Transformer des données

```python
df["age_dans_5_ans"] = df["age"] + 5              # nouvelle colonne calculée
df["ville"] = df["ville"].str.upper()               # méthodes de string vectorisées

df["categorie_age"] = df["age"].apply(
    lambda age: "senior" if age >= 30 else "junior"
)

df = df.rename(columns={"nom": "prenom"})
df = df.drop(columns=["ville"])
df = df.sort_values("age", ascending=False)
```

## Valeurs manquantes

```python
df.isna().sum()                     # nombre de valeurs manquantes par colonne
df.dropna()                          # supprimer les lignes avec au moins un NaN
df.fillna(0)                         # remplacer les NaN par une valeur
df["age"] = df["age"].fillna(df["age"].mean())   # remplacer par la moyenne de la colonne
```

## GroupBy : agréger par groupe

Le pattern **split-apply-combine** : diviser les données en groupes, appliquer une agrégation à chacun, recombiner le résultat.

```text
   df.groupby("ville")["age"].mean()

   Split (par ville)         Apply (moyenne)        Combine
   ┌─────────────┐           ┌─────────┐            ┌──────────────┐
   │ Paris: [30,32]│  ──▶     │ 31       │   ──▶      │ Paris:    31  │
   │ Lyon:  [25]   │          │ 25       │            │ Lyon:     25  │
   └─────────────┘           └─────────┘            └──────────────┘
```

```python
df.groupby("ville")["age"].mean()
df.groupby("ville").agg({"age": "mean", "nom": "count"})
df.groupby(["ville", "categorie_age"]).size()          # comptage par combinaison de groupes
```

## Fusionner des DataFrames

```python
# merge : équivalent d'une jointure SQL
pd.merge(clients, commandes, on="client_id", how="left")
# how : "inner" (défaut), "left", "right", "outer" — même sémantique qu'en SQL

pd.concat([df1, df2])                # empiler verticalement (mêmes colonnes)
pd.concat([df1, df2], axis=1)         # coller côte à côte (mêmes lignes)
```

## Séries temporelles

Un point fort historique de Pandas, hérité de ses origines en finance quantitative :

```python
df["date"] = pd.to_datetime(df["date"])
df = df.set_index("date")

df.resample("M").mean()               # rééchantillonner par mois
df.rolling(window=7).mean()            # moyenne mobile sur 7 périodes
```

## Exporter

```python
df.to_csv("resultat.csv", index=False)
df.to_excel("resultat.xlsx", index=False)
df.to_sql("table_resultat", connexion, if_exists="replace")
```

## Ce qu'il faut retenir

- **Series** (une colonne) et **DataFrame** (tableau 2D à colonnes typées indépendamment) sont les deux structures centrales, construites sur les ndarrays NumPy.
- `.loc` (par label) et `.iloc` (par position) répondent à des besoins différents — ne pas les confondre.
- Le pattern **groupby** (split-apply-combine) est l'outil d'agrégation central, l'équivalent du `GROUP BY` SQL.
- `merge` (jointures façon SQL) et `concat` (empilement) couvrent la quasi-totalité des besoins de combinaison de tableaux.
