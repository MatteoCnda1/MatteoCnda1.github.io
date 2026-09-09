---
id: 03-jointures
title: Les jointures
sidebar_position: 4
tags: [sql]
---

# Les jointures (JOIN)

Les jointures sont **le** concept qui donne toute sa puissance au modèle relationnel. Souviens-toi : on a séparé les données en tables liées par des clés (normalisation). Les commandes ne contiennent qu'un `utilisateur_id`, pas le nom du client. Comment, alors, obtenir « la liste des commandes avec le nom du client » ? En **joignant** les tables. C'est exactement ce pour quoi le modèle relationnel a été conçu, et c'est le point que tu dois vraiment comprendre.

## Le problème concret

Rappel de nos données. Table `utilisateurs` :

| id | nom      | ville     |
|----|----------|-----------|
| 1  | Martin   | Marseille |
| 2  | Dupont   | Aix       |
| 3  | Bernard  | Nice      |
| 4  | Lefevre  | Marseille |

Table `commandes` :

| id | utilisateur_id | montant | statut     |
|----|----------------|---------|------------|
| 1  | 1              | 49.90   | payee      |
| 2  | 1              | 12.00   | payee      |
| 3  | 2              | 99.00   | en_attente |
| 4  | 2              | 25.50   | payee      |
| 5  | 4              | 150.00  | payee      |

Si je regarde la commande n°3, je vois `utilisateur_id = 2`, mais pas le nom. Pour savoir que c'est Dupont, il faut aller chercher dans `utilisateurs` la ligne où `id = 2`. Une jointure fait ça automatiquement, pour toutes les lignes d'un coup.

## L'idée d'une jointure

Une jointure **combine les lignes de deux tables** en fonction d'une condition de correspondance — presque toujours : « la clé étrangère d'une table = la clé primaire de l'autre ». Elle construit une table virtuelle plus large, où chaque commande est accompagnée des infos de son utilisateur.

Visualise-le comme rapprocher deux feuilles de tableur : pour chaque ligne de `commandes`, on va chercher la ligne correspondante dans `utilisateurs` (celle où les id matchent) et on colle les colonnes ensemble.

## INNER JOIN : la jointure de base

La jointure la plus courante est l'`INNER JOIN` (ou simplement `JOIN`) :

```sql
SELECT commandes.id, utilisateurs.nom, commandes.montant
FROM commandes
INNER JOIN utilisateurs ON commandes.utilisateur_id = utilisateurs.id;
```

Décomposons :
- `FROM commandes` — on part de la table des commandes.
- `INNER JOIN utilisateurs` — on veut y joindre la table des utilisateurs.
- `ON commandes.utilisateur_id = utilisateurs.id` — **la condition de jointure** : on associe chaque commande à l'utilisateur dont l'`id` correspond à son `utilisateur_id`.

Le résultat :

| id | nom     | montant |
|----|---------|---------|
| 1  | Martin  | 49.90   |
| 2  | Martin  | 12.00   |
| 3  | Dupont  | 99.00   |
| 4  | Dupont  | 25.50   |
| 5  | Lefevre | 150.00  |

Chaque commande est maintenant accompagnée du nom de son client. Note que Martin et Dupont apparaissent plusieurs fois (une par commande) — c'est normal, la jointure produit une ligne par correspondance.

Le mot **`INNER`** est essentiel : l'inner join ne garde **que les lignes qui ont une correspondance des deux côtés**. Observe : Bernard (id 3) n'apparaît **pas** dans le résultat, car il n'a aucune commande. Ses lignes sont exclues parce qu'il n'y a rien à joindre. Retiens ça, c'est la clé pour comprendre les autres types de jointures.

## Les alias de table (indispensables)

Écrire `commandes.` et `utilisateurs.` partout est verbeux. On utilise des alias :

```sql
SELECT c.id, u.nom, c.montant
FROM commandes AS c
INNER JOIN utilisateurs AS u ON c.utilisateur_id = u.id;
```

`c` et `u` sont des raccourcis pour les tables. C'est la façon standard d'écrire les jointures — plus court, plus lisible. On préfixe les colonnes par l'alias de leur table (`c.montant`, `u.nom`), surtout quand deux tables ont des colonnes de même nom (comme `id`, présent dans les deux) : sans préfixe, la base ne saurait pas de quel `id` tu parles (erreur « ambiguous column »).

## LEFT JOIN : garder toutes les lignes de gauche

Et si je veux **tous** les utilisateurs, y compris ceux sans commande ? C'est le rôle du `LEFT JOIN` (LEFT OUTER JOIN) :

```sql
SELECT u.nom, c.id AS commande_id, c.montant
FROM utilisateurs AS u
LEFT JOIN commandes AS c ON u.id = c.utilisateur_id;
```

Le `LEFT JOIN` garde **toutes les lignes de la table de gauche** (celle du `FROM`, ici `utilisateurs`), même si elles n'ont pas de correspondance à droite. Quand il n'y a pas de correspondance, les colonnes de droite sont remplies avec `NULL`.

Résultat :

| nom     | commande_id | montant |
|---------|-------------|---------|
| Martin  | 1           | 49.90   |
| Martin  | 2           | 12.00   |
| Dupont  | 3           | 99.00   |
| Dupont  | 4           | 25.50   |
| Bernard | NULL        | NULL    |
| Lefevre | 5           | 150.00  |

Cette fois, **Bernard apparaît**, avec des `NULL` pour la commande (puisqu'il n'en a pas). C'est toute la différence avec l'inner join : le left join ne perd aucune ligne de gauche.

Application typique : trouver les utilisateurs **sans** commande.

```sql
SELECT u.nom
FROM utilisateurs AS u
LEFT JOIN commandes AS c ON u.id = c.utilisateur_id
WHERE c.id IS NULL;          -- garde ceux qui n'ont AUCUNE correspondance
```

Le `WHERE c.id IS NULL` isole les lignes où la jointure n'a rien trouvé à droite — donc les utilisateurs sans commande (ici, Bernard). C'est un pattern très fréquent : « les X qui n'ont pas de Y ».

## RIGHT JOIN et FULL JOIN

Le `RIGHT JOIN` est le miroir du `LEFT JOIN` : il garde toutes les lignes de la table de **droite**. En pratique on l'utilise peu, car on peut toujours réécrire un `RIGHT JOIN` en `LEFT JOIN` en inversant les tables (ce qui est plus lisible).

Le `FULL OUTER JOIN` garde **toutes les lignes des deux tables**, avec des `NULL` là où il n'y a pas de correspondance de part et d'autre. (Note : MySQL ne le supporte pas nativement, PostgreSQL oui.)

Pour visualiser les quatre types avec des ensembles (diagrammes de Venn) :

- **INNER JOIN** — l'intersection : seulement ce qui correspond des deux côtés.
- **LEFT JOIN** — tout le côté gauche + les correspondances.
- **RIGHT JOIN** — tout le côté droit + les correspondances.
- **FULL JOIN** — tout, des deux côtés.

Le choix dépend de ta question : « les commandes avec leur client » → INNER (on ne veut que les commandes qui ont un client) ; « tous les clients et leurs éventuelles commandes » → LEFT.

## Joindre plusieurs tables

On enchaîne les jointures pour relier trois tables ou plus. Imaginons une table `produits` et une table `lignes_commande` :

```sql
SELECT u.nom, c.id AS commande, p.libelle, lc.quantite
FROM commandes AS c
INNER JOIN utilisateurs AS u ON c.utilisateur_id = u.id
INNER JOIN lignes_commande AS lc ON lc.commande_id = c.id
INNER JOIN produits AS p ON lc.produit_id = p.id;
```

Chaque `JOIN` ajoute une table en précisant sa condition de liaison. On peut ainsi reconstituer une information éclatée sur de nombreuses tables (le principe de la normalisation) en une seule requête. C'est là que le modèle relationnel révèle toute sa puissance : les données sont stockées proprement, séparées, et on les recombine à la demande.

## La jointure sur soi-même (self join)

Cas particulier utile : joindre une table avec elle-même. Exemple classique, une table `employes` où chaque employé a un `manager_id` qui pointe vers un autre employé de la même table :

```sql
SELECT e.nom AS employe, m.nom AS manager
FROM employes AS e
LEFT JOIN employes AS m ON e.manager_id = m.id;
```

On utilise deux alias (`e` et `m`) sur la même table pour la traiter comme deux tables distinctes. Ça sert pour les hiérarchies, les relations entre lignes d'une même table.

## Ce qu'il faut retenir

- Une **jointure** combine les lignes de deux tables selon une condition, presque toujours « clé étrangère = clé primaire » (`ON c.utilisateur_id = u.id`). C'est ce qui recompose les données séparées par la normalisation.
- **`INNER JOIN`** ne garde que les lignes ayant une correspondance **des deux côtés** (les autres sont exclues).
- **`LEFT JOIN`** garde **toutes les lignes de gauche**, avec des `NULL` à droite quand il n'y a pas de correspondance. Pattern clé : `LEFT JOIN ... WHERE ...IS NULL` pour trouver « les X sans Y ».
- `RIGHT JOIN` (miroir du left, peu utilisé) et `FULL JOIN` (tout des deux côtés) complètent le tableau.
- Les **alias de table** (`FROM commandes AS c`) sont indispensables : plus lisible et obligatoire pour lever l'ambiguïté sur les colonnes de même nom.
- On **enchaîne les jointures** pour relier plusieurs tables ; un **self join** joint une table avec elle-même (hiérarchies).
