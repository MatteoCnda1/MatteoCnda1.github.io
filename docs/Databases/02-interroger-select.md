---
id: 02-interroger-select
title: Interroger les données (SELECT)
sidebar_position: 3
---

# Interroger les données (SELECT)

`SELECT` est la commande la plus importante de SQL : elle sert à **lire** les données. C'est celle que tu utiliseras 90 % du temps. Ce cours la construit pièce par pièce, du plus simple au plus riche. On travaille sur la base `boutique` du cours précédent (tables `utilisateurs` et `commandes`).

## La forme de base

```sql
SELECT colonnes
FROM table;
```

```sql
-- Toutes les colonnes de tous les utilisateurs
SELECT * FROM utilisateurs;

-- Seulement certaines colonnes (recommandé)
SELECT nom, email FROM utilisateurs;
```

Le `*` signifie « toutes les colonnes ». Pratique pour explorer, mais **en vrai code, précise les colonnes dont tu as besoin** : c'est plus rapide (on ne transfère pas de données inutiles), plus lisible, et plus robuste si la table évolue. Un `SELECT *` dans du code applicatif est généralement une mauvaise pratique.

## Filtrer avec WHERE

`WHERE` sélectionne les lignes qui remplissent une condition — c'est le filtre :

```sql
SELECT nom, ville FROM utilisateurs
WHERE ville = 'Marseille';

SELECT * FROM commandes
WHERE montant > 50;
```

Les opérateurs de comparaison : `=`, `<>` (ou `!=` pour différent), `<`, `>`, `<=`, `>=`.

On combine les conditions avec `AND`, `OR`, `NOT` :

```sql
SELECT * FROM commandes
WHERE montant > 20 AND statut = 'payee';

SELECT * FROM utilisateurs
WHERE ville = 'Marseille' OR ville = 'Aix';
```

Attention à la priorité : `AND` est prioritaire sur `OR`. En cas de doute, **mets des parenthèses** pour être explicite :

```sql
SELECT * FROM commandes
WHERE (statut = 'payee' OR statut = 'expediee') AND montant > 50;
```

## Les opérateurs spéciaux de WHERE

SQL a des opérateurs très pratiques au-delà des comparaisons simples :

```sql
-- IN : dans une liste de valeurs
SELECT * FROM utilisateurs WHERE ville IN ('Marseille', 'Aix', 'Nice');
-- équivaut à ville = 'Marseille' OR ville = 'Aix' OR ville = 'Nice'

-- BETWEEN : dans un intervalle (bornes incluses)
SELECT * FROM commandes WHERE montant BETWEEN 20 AND 100;

-- LIKE : recherche par motif (avec % et _)
SELECT * FROM utilisateurs WHERE email LIKE '%@mail.fr';   -- se termine par @mail.fr
SELECT * FROM utilisateurs WHERE nom LIKE 'M%';            -- commence par M
SELECT * FROM utilisateurs WHERE nom LIKE '_artin';        -- _ = un seul caractère

-- Recherche de valeurs NULL (attention : syntaxe spéciale)
SELECT * FROM utilisateurs WHERE ville IS NULL;
SELECT * FROM utilisateurs WHERE ville IS NOT NULL;
```

Deux points importants :

**Les jokers de `LIKE`** : `%` remplace n'importe quelle suite de caractères (y compris vide), `_` remplace exactement un caractère. C'est la recherche textuelle de base en SQL.

**`NULL` est spécial.** `NULL` signifie « absence de valeur » (pas zéro, pas chaîne vide — l'inconnu). On ne peut **pas** le tester avec `=` : `WHERE ville = NULL` ne marche **jamais** (renvoie toujours faux). Il faut `IS NULL` / `IS NOT NULL`. C'est une source de bugs classique. La logique : `NULL = NULL` vaut `NULL` (inconnu), pas vrai, car « une valeur inconnue est-elle égale à une autre valeur inconnue ? » n'a pas de réponse.

## Trier avec ORDER BY

```sql
SELECT nom, ville FROM utilisateurs
ORDER BY nom;                    -- ordre croissant (par défaut)

SELECT * FROM commandes
ORDER BY montant DESC;           -- décroissant (DESC)

-- Trier sur plusieurs colonnes
SELECT * FROM commandes
ORDER BY statut ASC, montant DESC;   -- d'abord par statut, puis par montant décroissant
```

`ASC` (ascending, croissant) est le défaut, `DESC` (descending) pour l'inverse. Le tri multi-colonnes applique les critères dans l'ordre : d'abord le premier, puis le second départage les égalités.

## Limiter le nombre de résultats

```sql
-- Les 5 commandes les plus chères
SELECT * FROM commandes
ORDER BY montant DESC
LIMIT 5;

-- Pagination : sauter les 10 premiers, prendre les 10 suivants
SELECT * FROM commandes
ORDER BY date_commande DESC
LIMIT 10 OFFSET 10;
```

`LIMIT` restreint le nombre de lignes retournées. Combiné à `ORDER BY`, c'est le pattern « top N ». Avec `OFFSET`, c'est la base de la **pagination** (afficher les résultats page par page dans une application web). Note : la syntaxe de `LIMIT` varie selon le SGBD (SQL Server utilise `TOP`, Oracle `FETCH`).

## Éliminer les doublons avec DISTINCT

```sql
-- Les villes distinctes où habitent des utilisateurs (sans répétition)
SELECT DISTINCT ville FROM utilisateurs;
```

Sans `DISTINCT`, si trois utilisateurs habitent Marseille, « Marseille » apparaît trois fois. `DISTINCT` ne garde que les valeurs uniques.

## Renommer avec des alias (AS)

```sql
SELECT nom AS nom_client, email AS courriel
FROM utilisateurs;

-- L'alias est très utile pour les colonnes calculées
SELECT nom, montant * 1.20 AS montant_ttc
FROM commandes;
```

`AS` donne un nom temporaire à une colonne (ou une table) dans le résultat. Indispensable pour nommer les colonnes calculées et pour raccourcir les noms de tables dans les jointures (cours suivant). Le `AS` est souvent optionnel (`nom nom_client` marche aussi), mais l'écrire est plus clair.

## Les colonnes calculées

`SELECT` ne se limite pas à lire des colonnes : il peut calculer :

```sql
SELECT
    nom,
    montant,
    montant * 0.20 AS tva,
    montant * 1.20 AS total_ttc
FROM commandes;

-- Concaténer du texte (syntaxe standard avec ||, ou CONCAT en MySQL)
SELECT CONCAT(nom, ' (', ville, ')') AS description FROM utilisateurs;
```

On peut faire des opérations arithmétiques, concaténer des chaînes, appliquer des fonctions. C'est utile pour transformer les données à la lecture sans modifier la base.

## Les fonctions courantes

SQL a de nombreuses fonctions intégrées. Quelques-unes fréquentes :

```sql
-- Fonctions sur les chaînes
SELECT UPPER(nom), LOWER(email), LENGTH(nom) FROM utilisateurs;

-- Fonctions sur les dates
SELECT nom, YEAR(inscrit), MONTH(inscrit) FROM utilisateurs;
SELECT * FROM commandes WHERE date_commande >= '2024-01-01';

-- Gérer les NULL : COALESCE renvoie la première valeur non NULL
SELECT nom, COALESCE(ville, 'Non renseignée') AS ville FROM utilisateurs;
```

`COALESCE` est particulièrement utile : il remplace les `NULL` par une valeur de secours (ici « Non renseignée » pour les utilisateurs sans ville). Les noms exacts des fonctions varient selon le SGBD, mais les concepts sont communs.

## L'ordre logique d'une requête

Point conceptuel important pour bien comprendre `SELECT`. On **écrit** les clauses dans cet ordre :

```sql
SELECT colonnes
FROM table
WHERE condition
ORDER BY colonne
LIMIT n;
```

Mais la base les **exécute** dans un ordre différent, qui explique certains comportements :

1. `FROM` — on part de la table.
2. `WHERE` — on filtre les lignes.
3. `SELECT` — on choisit/calcule les colonnes.
4. `ORDER BY` — on trie.
5. `LIMIT` — on coupe.

Cet ordre d'exécution explique par exemple pourquoi on ne peut pas toujours utiliser un alias défini dans `SELECT` à l'intérieur du `WHERE` : au moment où `WHERE` s'exécute, le `SELECT` (et donc l'alias) n'existe pas encore. Comprendre cet ordre logique t'évite bien des confusions. Il devient encore plus important avec `GROUP BY` (cours SQL avancé).

## Ce qu'il faut retenir

- `SELECT colonnes FROM table` lit les données ; **précise les colonnes** plutôt que `SELECT *` en vrai code.
- `WHERE` filtre les lignes avec `=`, `<>`, `<`, `>`, combinés par `AND`/`OR` (parenthèses en cas de doute).
- Opérateurs spéciaux : `IN` (liste), `BETWEEN` (intervalle), `LIKE` (`%` = toute suite, `_` = un caractère).
- **`NULL` est l'inconnu** : se teste avec `IS NULL` / `IS NOT NULL`, jamais avec `=`.
- `ORDER BY` trie (`ASC`/`DESC`), `LIMIT`/`OFFSET` restreint et pagine, `DISTINCT` élimine les doublons.
- `AS` crée des **alias** ; `SELECT` peut faire des **colonnes calculées** et appliquer des **fonctions** (`UPPER`, `COALESCE`...).
- L'**ordre d'exécution** (FROM → WHERE → SELECT → ORDER BY → LIMIT) diffère de l'ordre d'écriture et explique des comportements clés.
