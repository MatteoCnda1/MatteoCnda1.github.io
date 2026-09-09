---
id: 01-php-basics
title: PHP - Les bases
sidebar_position: 1
tags: [programmation]
---

# PHP — Les bases

## PHP, le langage du web côté serveur

PHP (PHP: Hypertext Preprocessor — un acronyme récursif) est un langage **côté serveur** : il s'exécute sur le serveur web, génère du HTML, et envoie le résultat au navigateur. Contrairement à JavaScript qui tourne dans le navigateur (client), PHP tourne avant, sur la machine qui héberge le site.

Malgré sa réputation vieillissante, PHP fait tourner une **part énorme du web** : WordPress (plus de 40 % des sites), Wikipedia, une bonne partie de l'infrastructure historique. Tu le croiseras forcément.

Pour ton profil cyber, PHP est central : c'est **le langage back-end le plus attaqué** de l'histoire du web. Les grandes classes de vulnérabilités web (injection SQL, LFI/RFI, upload de fichiers malveillants, RCE) se sont largement illustrées sur des applications PHP. Beaucoup de challenges de CTF web et de cibles de pentest sont en PHP. Le comprendre, c'est comprendre où et comment ces failles apparaissent.

Note : le « PHP moderne » (PHP 8+) est bien meilleur que le PHP des années 2000 (typage, performances, sécurité). Ce cours vise le PHP moderne, mais signale les pièges historiques que tu rencontreras sur du code ancien.

## Comment PHP fonctionne

Un fichier `.php` mélange du HTML et du code PHP entre balises `<?php ... ?>`. Le serveur exécute le PHP, remplace ces blocs par leur résultat, et envoie du HTML pur au navigateur.

```php
<!DOCTYPE html>
<html>
<body>
    <h1>Bienvenue</h1>
    <?php
        $nom = "Matteo";
        echo "<p>Bonjour $nom</p>";
    ?>
    <p>Nous sommes le <?= date("d/m/Y") ?></p>
</body>
</html>
```

Le navigateur ne voit **jamais** le code PHP — seulement le HTML généré. C'est une différence fondamentale de sécurité avec JS : le code PHP reste secret côté serveur (sauf faille de divulgation de code source). Le `<?= ... ?>` est un raccourci pour `<?php echo ... ?>`.

## Les variables et types

En PHP, les variables commencent par `$` :

```php
<?php
$nom = "Matteo";          // string
$age = 25;                // int
$taille = 1.80;           // float
$actif = true;            // bool
$rien = null;             // null

// Concaténation avec le point (pas +)
$message = "Bonjour " . $nom . ", tu as " . $age . " ans";

// Interpolation dans les guillemets doubles
echo "Bonjour $nom";              // interprété
echo 'Bonjour $nom';              // littéral (simples quotes)
echo "Total : {$prix}€";          // accolades pour délimiter

// Vérifier et manipuler le type
var_dump($age);           // affiche le type et la valeur (debug)
$nombre = (int)"42";      // cast explicite
```

Piège classique venant du C/JS : en PHP, la **concaténation** de chaînes se fait avec le point `.`, pas avec `+` (le `+` est réservé à l'addition arithmétique). Comme JS, PHP est typé dynamiquement et faiblement — avec les mêmes pièges de comparaison qu'on verra.

## Les tableaux : la structure à tout faire

Le tableau PHP est extrêmement polyvalent : il sert à la fois de liste et de dictionnaire.

```php
<?php
// Tableau indexé (liste)
$ports = [22, 80, 443];
$ports[] = 8080;                  // ajouter
echo $ports[0];                   // 22
echo count($ports);               // 4

// Tableau associatif (dictionnaire)
$service = [
    "nom" => "ssh",
    "port" => 22,
    "actif" => true
];
echo $service["port"];            // 22
$service["timeout"] = 30;         // ajouter

// Parcourir
foreach ($ports as $port) {
    echo $port . "\n";
}
foreach ($service as $cle => $valeur) {
    echo "$cle : $valeur\n";
}

// Fonctions de tableau utiles
sort($ports);                     // trier
in_array(443, $ports);            // recherche
array_map(fn($p) => $p * 2, $ports);       // transformer
array_filter($ports, fn($p) => $p < 1024); // filtrer
```

Le `foreach` est la façon idiomatique de parcourir un tableau en PHP, avec la syntaxe `$cle => $valeur` pour les tableaux associatifs. Les fonctions `array_map`, `array_filter` apportent un style fonctionnel.

## Le contrôle de flux

Syntaxe familière (héritée du C, comme JS) :

```php
<?php
if ($age >= 18) {
    echo "majeur";
} elseif ($age >= 13) {
    echo "ado";
} else {
    echo "enfant";
}

$categorie = $age >= 18 ? "majeur" : "mineur";   // ternaire

// Boucles
for ($i = 0; $i < 10; $i++) { }
while ($condition) { }
foreach ($tableau as $element) { }

switch ($code) {
    case 200: echo "OK"; break;
    case 404: echo "Not Found"; break;
    default: echo "Autre";
}

// match (PHP 8 — plus strict et concis que switch)
$texte = match($code) {
    200 => "OK",
    404 => "Not Found",
    default => "Autre",
};
```

Le `match` de PHP 8 est une amélioration moderne du `switch` : il utilise la comparaison stricte et retourne une valeur.

## Le piège des comparaisons

Comme JavaScript, PHP a une comparaison lâche (`==`) qui fait des conversions dangereuses, et une comparaison stricte (`===`) :

```php
<?php
var_dump(0 == "abc");        // en PHP 8 : false (corrigé). En PHP 7 : true (!) — piège historique
var_dump("1" == 1);          // true (conversion)
var_dump("1" === 1);         // false (types différents)
var_dump(null == false);     // true
var_dump("0" == false);      // true
```

La règle est la même qu'en JS : **utilise `===` et `!==`** (stricts) sauf raison précise. Les comparaisons lâches de PHP ont causé de vraies failles d'authentification (le fameux cas où `"0e123" == "0e456"` était vrai car interprété comme notation scientifique `0` — un contournement de comparaison de hash appelé « magic hashes »). C'est un classique de CTF PHP.

## Les fonctions

```php
<?php
function scanner($host, $port = 80) {    // valeur par défaut
    return "$host:$port";
}

echo scanner("10.0.0.1");           // 10.0.0.1:80
echo scanner("10.0.0.1", 443);      // 10.0.0.1:443

// PHP moderne : typage des arguments et du retour (recommandé)
function additionner(int $a, int $b): int {
    return $a + $b;
}

// Fonction fléchée (PHP 7.4+)
$doubler = fn($x) => $x * 2;
```

Le **typage** des paramètres et du retour (`int $a`, `: int`) est une bonne pratique du PHP moderne : il attrape des erreurs et documente le code. Le vieux PHP sans types est plus permissif mais plus buggé.

## Les données du web : $_GET, $_POST et le danger

Voici le point le plus important côté sécurité. PHP reçoit les données envoyées par le navigateur dans des **superglobales** :

```php
<?php
// Données d'un formulaire GET (dans l'URL : ?nom=matteo)
$nom = $_GET["nom"];

// Données d'un formulaire POST (dans le corps de la requête)
$user = $_POST["username"];
$pass = $_POST["password"];

// Autres superglobales
$_REQUEST;    // GET + POST + COOKIE (à éviter, ambigu)
$_COOKIE;     // les cookies
$_SESSION;    // les données de session
$_SERVER;     // infos serveur (IP client, user-agent...)
$_FILES;      // fichiers uploadés
```

**Règle d'or absolue de la sécurité web : toute donnée venant de `$_GET`, `$_POST`, `$_COOKIE`, `$_REQUEST` est HOSTILE jusqu'à preuve du contraire.** L'utilisateur contrôle entièrement ces valeurs (il peut envoyer n'importe quoi avec curl ou Burp, sans passer par ton formulaire). C'est le point d'entrée de la quasi-totalité des vulnérabilités web.

Deux exemples de ce qu'il ne faut JAMAIS faire :

```php
<?php
// CATASTROPHE 1 : XSS — afficher une donnée sans échapper
echo "Bonjour " . $_GET["nom"];
// Si nom = <script>...</script>, le script s'exécute chez la victime

// CATASTROPHE 2 : injection SQL — construire une requête par concaténation
$sql = "SELECT * FROM users WHERE nom = '" . $_GET["nom"] . "'";
// Si nom = ' OR '1'='1, l'attaquant contourne l'authentification
```

Les parades (échappement, requêtes préparées) sont le sujet central du cours avancé. Retiens dès maintenant : **ne jamais utiliser une entrée utilisateur brute**, ni dans du HTML (→ XSS), ni dans une requête SQL (→ injection), ni dans une commande système (→ RCE), ni dans un chemin de fichier (→ LFI/path traversal).

## Ce qu'il faut retenir

- PHP s'exécute **côté serveur** et génère du HTML ; le navigateur ne voit jamais le code PHP. Vise le **PHP moderne (8+)**.
- Variables en `$`, **concaténation avec `.`** (pas `+`), interpolation dans les guillemets doubles.
- Le **tableau** PHP sert de liste ET de dictionnaire ; `foreach ($t as $cle => $val)` pour parcourir.
- Comme JS, **utilise `===` (strict)**, pas `==` (les comparaisons lâches ont causé de vraies failles d'auth — « magic hashes »).
- Type tes fonctions (`int $a`, `: int`) en PHP moderne.
- **LE point de sécurité** : `$_GET`, `$_POST`, `$_COOKIE`, `$_REQUEST` sont **totalement contrôlés par l'utilisateur = hostiles**. Ne jamais les utiliser bruts dans du HTML, du SQL, une commande ou un chemin. C'est l'origine de la majorité des failles web.
