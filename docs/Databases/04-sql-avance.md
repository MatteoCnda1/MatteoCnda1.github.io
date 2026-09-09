---
id: 04-sql-avance
title: SQL avancé (agrégation, sous-requêtes, vues)
sidebar_position: 5
tags: [sql]
---

# SQL avancé

Avec `SELECT`, `WHERE` et les jointures, tu peux déjà répondre à beaucoup de questions. Ce cours ajoute les outils qui font passer SQL du « lire des lignes » au « analyser des données » : l'agrégation, les sous-requêtes, les vues, et quelques notions de performance. On reste sur la base `boutique`.

## L'agrégation : résumer les données

Jusqu'ici, `SELECT` retournait des lignes individuelles. L'**agrégation** calcule une valeur **résumée** à partir de plusieurs lignes : un total, une moyenne, un décompte. Les fonctions d'agrégation :

```sql
SELECT COUNT(*) FROM commandes;              -- nombre de commandes
SELECT SUM(montant) FROM commandes;          -- somme des montants
SELECT AVG(montant) FROM commandes;          -- moyenne
SELECT MIN(montant), MAX(montant) FROM commandes;   -- min et max

-- Combiner plusieurs agrégats
SELECT
    COUNT(*) AS nb_commandes,
    SUM(montant) AS total,
    AVG(montant) AS panier_moyen
FROM commandes
WHERE statut = 'payee';
```

Ces fonctions réduisent un ensemble de lignes à une seule valeur. `COUNT(*)` compte les lignes ; `COUNT(colonne)` compte les valeurs non-NULL de cette colonne (nuance utile). Elles s'utilisent souvent avec `WHERE` pour agréger un sous-ensemble.

## GROUP BY : agréger par catégorie

L'agrégation devient vraiment puissante avec `GROUP BY`, qui applique le calcul **par groupe** au lieu de sur toute la table. C'est le concept central de l'analyse de données en SQL.

La question « combien de commandes par utilisateur ? » :

```sql
SELECT utilisateur_id, COUNT(*) AS nb_commandes, SUM(montant) AS total
FROM commandes
GROUP BY utilisateur_id;
```

Résultat :

| utilisateur_id | nb_commandes | total  |
|----------------|--------------|--------|
| 1              | 2            | 61.90  |
| 2              | 2            | 124.50 |
| 4              | 1            | 150.00 |

`GROUP BY utilisateur_id` regroupe les lignes ayant le même `utilisateur_id`, puis applique `COUNT` et `SUM` à chaque groupe séparément. Au lieu d'un total global, on obtient un total par client.

Le modèle mental : `GROUP BY` découpe la table en paquets (un par valeur distincte de la colonne groupée), et chaque fonction d'agrégation calcule sa valeur sur chaque paquet.

On combine souvent avec une jointure pour avoir des noms lisibles :

```sql
SELECT u.nom, COUNT(c.id) AS nb_commandes, SUM(c.montant) AS total
FROM utilisateurs AS u
LEFT JOIN commandes AS c ON u.id = c.utilisateur_id
GROUP BY u.id, u.nom
ORDER BY total DESC;
```

Règle importante : dans un `SELECT` avec `GROUP BY`, les colonnes du `SELECT` doivent soit être **dans le `GROUP BY`**, soit être **dans une fonction d'agrégation**. On ne peut pas sélectionner une colonne « libre » qui varierait à l'intérieur d'un groupe (quelle valeur choisirait la base ?). C'est une erreur fréquente au début.

## HAVING : filtrer les groupes

`WHERE` filtre les lignes **avant** l'agrégation. Pour filtrer **après** agrégation (sur le résultat des `COUNT`, `SUM`...), on utilise `HAVING` :

```sql
-- Les utilisateurs ayant dépensé plus de 100 au total
SELECT utilisateur_id, SUM(montant) AS total
FROM commandes
GROUP BY utilisateur_id
HAVING SUM(montant) > 100;
```

La distinction `WHERE` vs `HAVING` est un point conceptuel clé :

- **`WHERE`** filtre les **lignes individuelles**, avant le regroupement. (« Ne considère que les commandes payées. »)
- **`HAVING`** filtre les **groupes**, après agrégation. (« Ne garde que les clients dont le total dépasse 100. »)

On peut utiliser les deux ensemble :

```sql
SELECT utilisateur_id, SUM(montant) AS total
FROM commandes
WHERE statut = 'payee'          -- d'abord : ne garder que les commandes payées
GROUP BY utilisateur_id
HAVING SUM(montant) > 50        -- ensuite : ne garder que les groupes > 50
ORDER BY total DESC;
```

Ceci rejoint l'**ordre d'exécution** vu au cours SELECT, maintenant complet : FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. Comprendre cet ordre explique pourquoi `WHERE` ne peut pas utiliser une fonction d'agrégation (elle n'existe pas encore à ce stade) alors que `HAVING` le peut.

## Les sous-requêtes

Une **sous-requête** (subquery) est une requête imbriquée dans une autre. Elle permet de répondre à des questions en deux temps.

Dans un `WHERE` :

```sql
-- Les commandes dont le montant dépasse la moyenne
SELECT * FROM commandes
WHERE montant > (SELECT AVG(montant) FROM commandes);
```

La sous-requête `(SELECT AVG(montant) FROM commandes)` calcule d'abord la moyenne, puis la requête externe compare chaque commande à cette valeur. La base exécute l'intérieur d'abord.

Avec `IN`, pour une liste de valeurs :

```sql
-- Les utilisateurs qui ont au moins une commande payée
SELECT nom FROM utilisateurs
WHERE id IN (SELECT utilisateur_id FROM commandes WHERE statut = 'payee');
```

La sous-requête produit la liste des `utilisateur_id` ayant une commande payée, et la requête externe garde les utilisateurs dont l'`id` est dans cette liste.

Il existe aussi `EXISTS` (teste l'existence d'au moins une ligne), et les sous-requêtes **corrélées** (qui référencent la requête externe, exécutées pour chaque ligne). Beaucoup de sous-requêtes peuvent se réécrire en jointures — souvent plus performantes ; le choix dépend de la lisibilité et de l'optimiseur.

## Les CTE (Common Table Expressions)

Pour les requêtes complexes, les sous-requêtes imbriquées deviennent illisibles. Les **CTE** (avec le mot-clé `WITH`) permettent de nommer une requête intermédiaire et de l'utiliser ensuite — comme une variable temporaire :

```sql
WITH totaux_clients AS (
    SELECT utilisateur_id, SUM(montant) AS total
    FROM commandes
    WHERE statut = 'payee'
    GROUP BY utilisateur_id
)
SELECT u.nom, t.total
FROM totaux_clients AS t
INNER JOIN utilisateurs AS u ON u.id = t.utilisateur_id
WHERE t.total > 50
ORDER BY t.total DESC;
```

La CTE `totaux_clients` calcule les totaux par client, puis la requête principale l'utilise comme une table. C'est bien plus lisible qu'une sous-requête imbriquée, et ça permet de découper une requête complexe en étapes logiques. Les CTE sont un outil moderne très apprécié pour la clarté.

## Les vues

Une **vue** (view) est une requête sauvegardée sous un nom, qu'on peut interroger comme une table :

```sql
CREATE VIEW commandes_detaillees AS
SELECT c.id, u.nom, u.email, c.montant, c.statut
FROM commandes AS c
INNER JOIN utilisateurs AS u ON c.utilisateur_id = u.id;

-- Ensuite, on l'interroge comme une table normale
SELECT * FROM commandes_detaillees WHERE statut = 'payee';
```

La vue ne stocke pas de données : c'est une requête pré-écrite qui s'exécute quand on l'interroge. Elle sert à simplifier les requêtes récurrentes, à masquer la complexité d'une jointure, et aussi comme **couche de sécurité** : on peut donner à un utilisateur accès à une vue (qui n'expose que certaines colonnes, par exemple sans les mots de passe) sans lui donner accès aux tables sous-jacentes. Ce lien vue/sécurité est pertinent pour ton profil.

## Les index : la performance

Concept essentiel pour comprendre pourquoi une base est rapide (ou lente). Un **index** est une structure de données (souvent un arbre B-tree) qui accélère la recherche sur une colonne, exactement comme l'index d'un livre évite de lire toutes les pages pour trouver un mot.

```sql
-- Créer un index sur une colonne souvent recherchée
CREATE INDEX idx_email ON utilisateurs(email);
CREATE INDEX idx_utilisateur ON commandes(utilisateur_id);
```

Sans index, une recherche `WHERE email = '...'` oblige la base à parcourir **toutes** les lignes (full table scan) — lent sur des millions de lignes. Avec un index sur `email`, elle trouve directement la bonne ligne.

Points à comprendre :
- Les clés primaires sont **automatiquement indexées**.
- On indexe les colonnes fréquemment utilisées dans les `WHERE`, les `JOIN`, les `ORDER BY`.
- Un index accélère les **lectures** mais ralentit légèrement les **écritures** (il faut le maintenir à jour) et prend de l'espace disque. On n'indexe donc pas tout, mais les colonnes qui comptent.
- L'outil `EXPLAIN` (devant une requête) montre comment la base compte l'exécuter et si elle utilise les index — indispensable pour diagnostiquer une requête lente.

## Ce qu'il faut retenir

- Les **fonctions d'agrégation** (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) résument plusieurs lignes en une valeur.
- **`GROUP BY`** applique l'agrégation **par groupe** (par catégorie) — le cœur de l'analyse en SQL. Les colonnes du SELECT doivent être groupées ou agrégées.
- **`WHERE` filtre les lignes avant** l'agrégation ; **`HAVING` filtre les groupes après**. Ordre complet : FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.
- Les **sous-requêtes** imbriquent une requête dans une autre (dans `WHERE`, avec `IN`/`EXISTS`) ; les **CTE** (`WITH`) les rendent lisibles en nommant des étapes.
- Les **vues** (`CREATE VIEW`) sauvegardent une requête réutilisable et servent aussi de couche de sécurité (exposer certaines colonnes seulement).
- Les **index** accélèrent les recherches (comme l'index d'un livre) au prix d'écritures un peu plus lentes ; `EXPLAIN` aide à diagnostiquer les performances.
