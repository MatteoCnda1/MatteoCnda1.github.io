---
id: 05-securite-injection-sql
title: Sécurité et injection SQL
sidebar_position: 6
---

# Sécurité et injection SQL

Ce cours relie SQL à ton domaine : la sécurité. L'**injection SQL** (SQLi) est l'une des vulnérabilités web les plus anciennes, les plus répandues et les plus dévastatrices — régulièrement dans le top de l'OWASP. Elle a été abordée côté PHP dans ta section web ; ici on l'approfondit côté SQL, en comprenant le mécanisme, les techniques d'exploitation et les défenses. Objectif : savoir la reconnaître, l'exploiter en pentest autorisé (CTF, tests), et surtout la prévenir.

## Le mécanisme fondamental

L'injection SQL naît d'une **confusion entre code et données**. Quand une application construit une requête SQL en y collant directement une entrée utilisateur, l'attaquant peut faire passer son entrée pour du **code SQL** au lieu d'une simple **donnée**.

Reprenons l'exemple d'authentification vu en PHP :

```
requête = "SELECT * FROM users WHERE username = '" + saisie_user + "' 
           AND password = '" + saisie_pass + "'"
```

En usage normal, l'utilisateur tape `martin` / `secret`, et la requête devient :

```sql
SELECT * FROM users WHERE username = 'martin' AND password = 'secret'
```

Tout va bien. Mais l'attaquant contrôle entièrement ce qu'il tape. S'il saisit comme username :

```
admin' --
```

La requête devient :

```sql
SELECT * FROM users WHERE username = 'admin' -- ' AND password = '...'
```

Le `--` démarre un **commentaire SQL** : tout ce qui suit est ignoré, y compris la vérification du mot de passe. La requête se réduit à « sélectionne l'utilisateur admin », sans contrôle du mot de passe. **L'attaquant est connecté comme admin sans connaître son mot de passe.** C'est un contournement d'authentification (auth bypass), un grand classique de CTF web.

Autre payload célèbre, le `' OR '1'='1` :

```sql
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '...'
```

`'1'='1'` est toujours vrai, donc la condition retourne des lignes — souvent le premier utilisateur (fréquemment un admin). Le principe est toujours le même : **injecter de la syntaxe SQL qui modifie la logique de la requête**.

## Pourquoi c'est si grave

Une injection SQL réussie ne se limite pas à contourner un login. Selon les cas, elle permet de :

- **Extraire toute la base** — voler tous les comptes, emails, mots de passe hachés, données personnelles, informations bancaires.
- **Modifier ou supprimer des données** — altérer des enregistrements, effacer des tables.
- **Contourner l'authentification** — se connecter sans identifiants.
- **Dans les pires cas, exécuter des commandes système** — certaines configurations permettent de passer de l'injection SQL à l'exécution de code sur le serveur (via des fonctions comme `xp_cmdshell` sur SQL Server, ou l'écriture de fichiers).

Des fuites de données massives et médiatisées ont eu pour origine une injection SQL. C'est pourquoi elle reste une priorité en sécurité applicative.

## Les grandes techniques d'exploitation

Pour ta culture offensive (et pour reconnaître les traces en défense), les principales familles :

**In-band / UNION-based** — La plus directe. On utilise l'opérateur `UNION` (qui combine les résultats de deux `SELECT`) pour ajouter les données volées au résultat affiché par l'application :

```sql
' UNION SELECT username, password FROM users --
```

Si l'application affiche normalement, disons, des noms de produits, l'injection y fait apparaître les identifiants volés. Il faut que le nombre et le type des colonnes correspondent, d'où une phase de reconnaissance (`ORDER BY`, `UNION SELECT NULL,NULL...`).

**Error-based** — On provoque volontairement des erreurs SQL dont les **messages** révèlent des informations (noms de tables, de colonnes, valeurs). Une application qui affiche les erreurs SQL brutes est un cadeau pour l'attaquant. Leçon défensive : ne **jamais** afficher les erreurs SQL détaillées à l'utilisateur en production.

**Blind (aveugle)** — Quand l'application n'affiche ni données ni erreurs, mais réagit différemment selon que la requête injectée est vraie ou fausse. Deux sous-types :
- **Boolean-based** — la page change (contenu présent/absent) selon la véracité d'une condition injectée. On extrait l'information bit par bit en posant des questions vrai/faux (`AND SUBSTRING(password,1,1)='a'`).
- **Time-based** — la page ne change pas visiblement, mais on injecte un délai conditionnel (`AND IF(condition, SLEEP(5), 0)`). Si la page met 5 secondes, la condition est vraie. Lent mais efficace même quand rien n'est visible.

L'injection aveugle est fastidieuse à la main, d'où l'existence d'outils automatisés.

**Outils** — **sqlmap** est l'outil de référence (open source) : il détecte et exploite automatiquement la plupart des injections, identifie le SGBD, extrait les bases. Indispensable à connaître en pentest — pour l'utiliser en test autorisé, et pour comprendre ce que font les attaquants. En CTF web, c'est souvent l'outil qui débloque les challenges d'injection.

## Identifier le SGBD

Les techniques d'injection varient selon le SGBD (MySQL, PostgreSQL, SQL Server, Oracle), car la syntaxe diffère (commentaires, concaténation, fonctions). Un attaquant commence souvent par identifier le SGBD via des fonctions spécifiques (`version()`, `@@version`, différences de comportement). C'est pourquoi connaître les dialectes (cours d'intro) a une vraie valeur offensive et défensive.

## La défense n°1 : les requêtes préparées

La protection fondamentale, déjà vue en PHP, mérite d'être comprise en profondeur car c'est **la** solution. Les **requêtes préparées** (prepared statements / paramétrées) séparent radicalement le **code SQL** (la structure, fixe) des **données** (les valeurs, variables). Les données sont envoyées à la base **séparément** de la requête, et ne sont **jamais** interprétées comme du SQL.

```
-- Concept (indépendant du langage)
requête préparée : SELECT * FROM users WHERE username = ? AND password = ?
paramètres      : [saisie_user, saisie_pass]
```

Avec ce mécanisme, si l'attaquant saisit `admin' --`, cette chaîne est traitée comme une **valeur littérale** de username : la base cherche un utilisateur dont le nom est exactement `admin' --` (qui n'existe pas), et ne l'interprète jamais comme de la syntaxe. **L'injection devient structurellement impossible**, car code et données ne se mélangent plus.

C'est pour ça que les requêtes préparées ne sont pas « une bonne pratique parmi d'autres » mais **la** défense : elles éliminent la cause racine (la confusion code/données), au lieu de tenter de filtrer les entrées malveillantes (approche fragile, contournable). Toutes les interfaces modernes les supportent : PDO en PHP (ton cours web), les ORM, les bibliothèques de chaque langage.

## Les défenses complémentaires

Les requêtes préparées sont la base, mais une défense en profondeur ajoute :

**Validation des entrées (allowlist)** — Vérifier que les entrées correspondent au format attendu (un âge est un entier, un email a une forme d'email). Ça réduit la surface d'attaque, mais **ne remplace pas** les requêtes préparées (le filtrage seul est contournable). Utile surtout quand une partie de la requête ne peut pas être paramétrée (un nom de colonne dans `ORDER BY`, par exemple) — là, on valide contre une liste blanche stricte.

**Moindre privilège** — Le compte de base de données utilisé par l'application ne doit avoir **que** les droits nécessaires. Une application qui ne fait que lire n'a pas besoin des droits `DELETE`, `DROP` ou administrateur. Ainsi, même si une injection passe, les dégâts sont limités : impossible de supprimer des tables si le compte n'en a pas le droit. C'est le principe DCL (`GRANT`/`REVOKE`) du cours d'intro appliqué à la sécurité.

**Ne pas exposer les erreurs** — En production, afficher un message générique à l'utilisateur et logger les détails côté serveur. Les messages d'erreur SQL détaillés aident l'attaquant (error-based injection).

**WAF (Web Application Firewall)** — Un pare-feu applicatif peut détecter et bloquer des patterns d'injection connus. C'est une couche supplémentaire, pas une solution (contournable par obfuscation), mais utile en défense en profondeur.

**Chiffrer/hacher les données sensibles** — Même en cas de fuite, des mots de passe correctement hachés (bcrypt/Argon2, cf. ton cours crypto) et des données sensibles chiffrées limitent l'impact.

## Little Bobby Tables

Impossible de parler d'injection SQL sans le célèbre comic xkcd « Little Bobby Tables ». Une école appelle une mère car sa base d'élèves a été effacée. Le nom de son fils : `Robert'); DROP TABLE students; --`. En insérant cet « élève » dans une requête non protégée, l'école a exécuté sans le vouloir un `DROP TABLE students`. La chute : « J'espère que vous avez appris à assainir vos entrées de base de données. » C'est devenu la référence culturelle qui résume tout : ne jamais faire confiance aux entrées, toujours utiliser des requêtes paramétrées.

## Ce qu'il faut retenir

- L'**injection SQL** vient d'une **confusion entre code et données** : une entrée utilisateur collée dans une requête est interprétée comme du SQL. Payloads classiques : `admin' --` (auth bypass), `' OR '1'='1`, `UNION SELECT`.
- Impact : contournement d'authentification, **extraction/modification/suppression de toute la base**, parfois exécution de commandes système.
- Techniques : **UNION-based** (données ajoutées au résultat), **error-based** (fuites via messages d'erreur), **blind** boolean/time-based (extraction vrai/faux). Outil de référence : **sqlmap**.
- **La défense fondamentale = les requêtes préparées** : elles séparent code et données, rendant l'injection **structurellement impossible** (elles traitent l'entrée comme une valeur littérale). C'est la cause racine éliminée, pas un filtre fragile.
- Défense en profondeur : validation en allowlist, **moindre privilège** du compte BDD (`GRANT`/`REVOKE`), ne pas exposer les erreurs, WAF, hachage/chiffrement des données sensibles.
- Principe universel : **ne jamais faire confiance à une entrée utilisateur** — le fil rouge qui relie ce cours à tes cours HTML, JS et PHP.

---

*Sujet sensible : les techniques offensives décrites ici sont à des fins d'apprentissage et de tests autorisés uniquement (CTF, environnements dont tu as la permission explicite). Tester une injection SQL sur un système sans autorisation est illégal.*
