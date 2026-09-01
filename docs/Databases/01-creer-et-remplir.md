---
id: 01-creer-et-remplir
title: Créer et remplir des tables
sidebar_position: 2
---

# Créer et remplir des tables (DDL + écriture)

Avant d'interroger des données, il faut une structure et des données dedans. Ce cours couvre la création de tables (DDL) et les opérations d'écriture (INSERT, UPDATE, DELETE). On construira une petite base d'exemple qui servira dans tous les cours suivants.

## Créer une base et une table

```sql
-- Créer une base de données
CREATE DATABASE boutique;
USE boutique;                    -- se placer dedans (MySQL)

-- Créer une table
CREATE TABLE utilisateurs (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    nom      VARCHAR(100) NOT NULL,
    email    VARCHAR(255) NOT NULL UNIQUE,
    ville    VARCHAR(100),
    inscrit  DATE DEFAULT (CURRENT_DATE)
);
```

Décortiquons cette définition, car chaque mot compte :

- `id INT AUTO_INCREMENT PRIMARY KEY` — une colonne entière, auto-incrémentée (1, 2, 3... automatiquement), qui est la clé primaire (unique, jamais vide).
- `nom VARCHAR(100) NOT NULL` — texte jusqu'à 100 caractères, **obligatoire** (`NOT NULL` interdit une valeur vide).
- `email ... UNIQUE` — la contrainte `UNIQUE` interdit deux fois le même email dans la table.
- `ville VARCHAR(100)` — optionnel (pas de `NOT NULL`), donc peut être `NULL`.
- `inscrit DATE DEFAULT (CURRENT_DATE)` — une date avec une valeur par défaut (la date du jour si non précisée).

Les **contraintes** (`NOT NULL`, `UNIQUE`, `PRIMARY KEY`, `DEFAULT`) sont des garde-fous que la base fait respecter automatiquement. Elles garantissent l'intégrité des données : impossible d'insérer un utilisateur sans nom, ou avec un email déjà pris. C'est un point de sécurité et de fiabilité majeur — la base protège ses propres données.

## Créer une table liée (clé étrangère)

Créons maintenant la table `commandes`, liée aux utilisateurs :

```sql
CREATE TABLE commandes (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id  INT NOT NULL,
    montant         DECIMAL(10,2) NOT NULL,
    date_commande   DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut          VARCHAR(20) DEFAULT 'en_attente',

    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
);
```

La ligne clé est `FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)` : elle déclare que `utilisateur_id` doit correspondre à un `id` existant dans `utilisateurs`. La base **refusera** d'insérer une commande pour un utilisateur inexistant, et (selon la config) empêchera de supprimer un utilisateur qui a des commandes. C'est l'**intégrité référentielle** : les liens entre tables restent toujours cohérents, pas de commande orpheline.

Note `DECIMAL(10,2)` pour le montant : 10 chiffres au total dont 2 après la virgule. **Toujours `DECIMAL` pour l'argent**, jamais `FLOAT` (qui introduit des erreurs d'arrondi — `0.1 + 0.2 ≠ 0.3` en flottant).

## Modifier une structure existante (ALTER)

On peut faire évoluer une table après sa création :

```sql
-- Ajouter une colonne
ALTER TABLE utilisateurs ADD COLUMN telephone VARCHAR(20);

-- Modifier le type d'une colonne
ALTER TABLE utilisateurs MODIFY COLUMN ville VARCHAR(150);

-- Supprimer une colonne
ALTER TABLE utilisateurs DROP COLUMN telephone;

-- Renommer une table
ALTER TABLE utilisateurs RENAME TO clients;
```

`ALTER` sert à faire évoluer le schéma quand les besoins changent. À manier avec précaution en production (modifier une grosse table peut être long et bloquant).

## Supprimer (DROP)

```sql
DROP TABLE commandes;          -- supprime la table ET toutes ses données
DROP DATABASE boutique;        -- supprime toute la base
```

`DROP` est **irréversible** et destructeur : il efface la structure et les données. À ne jamais confondre avec `DELETE` (qui supprime des lignes mais garde la table). Une commande `DROP TABLE` malencontreuse — ou injectée par un attaquant — peut détruire une base entière. C'est d'ailleurs le sujet du célèbre « Little Bobby Tables » (une injection SQL qui exécute un `DROP TABLE`), qu'on verra dans le cours sécurité.

## Insérer des données (INSERT)

```sql
-- Insertion d'une ligne (en précisant les colonnes — recommandé)
INSERT INTO utilisateurs (nom, email, ville)
VALUES ('Martin', 'martin@mail.fr', 'Marseille');

-- Insertion de plusieurs lignes d'un coup (plus efficace)
INSERT INTO utilisateurs (nom, email, ville) VALUES
    ('Dupont', 'dupont@mail.fr', 'Aix'),
    ('Bernard', 'bernard@mail.fr', 'Toulon'),
    ('Lefevre', 'lefevre@mail.fr', 'Marseille');
```

On ne précise pas `id` (auto-incrémenté) ni `inscrit` (valeur par défaut) — la base les remplit. **Toujours lister explicitement les colonnes** (`INSERT INTO utilisateurs (nom, email, ville)`) plutôt que de compter sur l'ordre : c'est plus lisible et robuste si la structure change.

Remplissons aussi les commandes :

```sql
INSERT INTO commandes (utilisateur_id, montant, statut) VALUES
    (1, 49.90, 'payee'),
    (1, 12.00, 'payee'),
    (2, 99.00, 'en_attente'),
    (2, 25.50, 'payee'),
    (4, 150.00, 'payee');
```

Note qu'aucune commande n'a `utilisateur_id = 3` (Bernard n'a rien commandé) — ce détail sera important pour comprendre les jointures.

## Modifier des données (UPDATE)

```sql
-- Modifier une ligne précise
UPDATE utilisateurs
SET ville = 'Nice'
WHERE id = 3;

-- Modifier plusieurs colonnes
UPDATE commandes
SET statut = 'payee', montant = 100.00
WHERE id = 3;
```

**⚠️ LE piège le plus dangereux de SQL : le `WHERE` oublié.** Sans clause `WHERE`, l'`UPDATE` s'applique à **TOUTES les lignes** :

```sql
UPDATE utilisateurs SET ville = 'Nice';   -- CATASTROPHE : tout le monde habite Nice
```

Réflexe de survie : **toujours écrire le `WHERE` en premier**, ou tester avec un `SELECT` avant. Beaucoup de développeurs font d'abord `SELECT * FROM utilisateurs WHERE id = 3` pour vérifier que ça cible les bonnes lignes, puis remplacent `SELECT *` par `UPDATE ... SET`. En production, un `UPDATE` sans `WHERE` a détruit d'innombrables bases.

## Supprimer des données (DELETE)

```sql
DELETE FROM commandes WHERE id = 5;              -- supprime une ligne
DELETE FROM commandes WHERE statut = 'annulee';  -- supprime plusieurs lignes
```

Même avertissement absolu : **`DELETE` sans `WHERE` vide toute la table**.

```sql
DELETE FROM commandes;    -- supprime TOUTES les commandes (table vidée)
```

Différence à connaître : `DELETE FROM table` supprime les lignes une par une (et peut être annulé dans une transaction), tandis que `TRUNCATE TABLE table` vide la table d'un coup, plus vite mais sans possibilité de retour arrière et en réinitialisant l'auto-increment.

## Les transactions : tout ou rien

Concept crucial pour la fiabilité. Une **transaction** regroupe plusieurs opérations qui doivent réussir **ensemble ou pas du tout**. L'exemple classique : un virement bancaire.

```sql
START TRANSACTION;

UPDATE comptes SET solde = solde - 100 WHERE id = 1;   -- débit
UPDATE comptes SET solde = solde + 100 WHERE id = 2;   -- crédit

COMMIT;    -- valide les deux opérations ensemble
-- ou
ROLLBACK;  -- annule TOUT (si un problème survient)
```

Si le débit réussit mais que le crédit échoue (panne, erreur), on ne veut surtout pas que l'argent disparaisse. La transaction garantit l'**atomicité** : soit les deux `UPDATE` sont validés (`COMMIT`), soit aucun ne l'est (`ROLLBACK`). C'est un des piliers de la fiabilité des bases relationnelles, résumé par l'acronyme **ACID** :

- **Atomicity** — tout ou rien (la transaction).
- **Consistency** — la base reste dans un état valide (les contraintes sont respectées).
- **Isolation** — les transactions concurrentes ne se perturbent pas.
- **Durability** — une fois validé (`COMMIT`), c'est gravé, même en cas de panne.

Ces garanties ACID sont ce qui distingue une vraie BDD relationnelle d'un simple stockage de fichiers, et pourquoi on les utilise pour les données critiques (finance, transactions).

## Ce qu'il faut retenir

- `CREATE TABLE` définit une table avec ses colonnes, leurs **types** et leurs **contraintes** (`NOT NULL`, `UNIQUE`, `PRIMARY KEY`, `DEFAULT`) — la base fait respecter l'intégrité automatiquement.
- La **`FOREIGN KEY`** relie les tables et garantit l'**intégrité référentielle** (pas de ligne orpheline). Utilise `DECIMAL` pour l'argent, jamais `FLOAT`.
- `ALTER` fait évoluer une structure ; `DROP` la **détruit** (irréversible) — à ne pas confondre avec `DELETE`.
- Écriture : `INSERT` (ajouter, en listant les colonnes), `UPDATE` (modifier), `DELETE` (supprimer).
- **⚠️ Toujours un `WHERE` sur `UPDATE` et `DELETE`** — sans lui, l'opération frappe toutes les lignes. Réflexe : tester avec `SELECT` d'abord.
- Les **transactions** (`START TRANSACTION` / `COMMIT` / `ROLLBACK`) garantissent le « tout ou rien » ; les propriétés **ACID** font la fiabilité des BDD relationnelles.
