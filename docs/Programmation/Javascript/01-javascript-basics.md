---
id: 01-javascript-basics
title: JavaScript - Les bases
sidebar_position: 1
tags: [programmation]
---

# JavaScript — Les bases

## Le langage du web (et bien plus)

JavaScript (JS) est le **langage de programmation du web côté client** : c'est lui qui rend les pages interactives, réagit aux clics, modifie le contenu sans recharger, communique avec des serveurs. C'est le troisième pilier du trio (HTML structure, CSS présentation, **JS comportement**).

Mais JS a largement débordé du navigateur. Avec **Node.js**, il tourne côté serveur, en ligne de commande, dans des outils. C'est aujourd'hui l'un des langages les plus utilisés au monde, présent du front-end au back-end.

Attention à un piège de nommage : **JavaScript n'a rien à voir avec Java**. Le nom était un coup marketing des années 90. Ce sont deux langages totalement différents.

Pour ton profil cyber : JS est central en sécurité web. Côté attaque, c'est le vecteur du **XSS** (injection de JS chez la victime). Côté défense/analyse, tu liras et déobfusqueras du JS malveillant, tu inspecteras le comportement des pages. Comprendre JS est indispensable pour le pentest web.

## Une histoire de standardisation

JS a une histoire chaotique qui explique ses bizarreries. Créé en 10 jours en 1995, il a longtemps eu des défauts de conception. La norme **ECMAScript** le standardise ; la version **ES6 (2015)** a été une refonte majeure qui a modernisé le langage. Le « JS moderne » qu'on écrit aujourd'hui (ES6+) est très différent du vieux JS. Ce cours vise le JS moderne.

## Variables : let, const (et pas var)

```javascript
const nom = "Matteo";     // constante : ne peut pas être réassignée (le défaut)
let compteur = 0;         // variable : peut changer
compteur = 1;             // OK

var ancien = "à éviter";  // ancienne façon — NE PLUS UTILISER
```

Règle du JS moderne : **`const` par défaut, `let` si la valeur doit changer, jamais `var`**. Le vieux `var` a un comportement de portée (scope) déroutant et source de bugs (le « hoisting », la portée fonction au lieu de bloc). `let` et `const` (ES6) ont une portée de bloc saine, comme dans les autres langages.

## Le typage dynamique et ses pièges

JS est **typé dynamiquement** (comme Python) mais **faiblement typé** (contrairement à Python) — c'est là que naissent ses comportements célèbrement bizarres :

```javascript
let x = 42;          // number
x = "texte";         // maintenant string — autorisé (dynamique)

// Le typage FAIBLE fait des conversions implicites hasardeuses :
console.log(1 + "2");        // "12"  (number converti en string)
console.log("5" - 2);        // 3     (string convertie en number !)
console.log(true + 1);       // 2
console.log([] + []);        // ""    (bizarreries...)
console.log(0 == "");        // true  (== fait des conversions)
console.log(0 === "");       // false (=== compare sans conversion)
```

La leçon pratique la plus importante : **utilise toujours `===` et `!==`** (égalité stricte, sans conversion), jamais `==` et `!=` (égalité lâche, avec conversions imprévisibles). Le `==` est une source infinie de bugs. C'est LE réflexe à prendre.

Les types primitifs : `number` (pas de distinction int/float), `string`, `boolean`, `null`, `undefined`, `symbol`, `bigint`. Plus les objets et tableaux.

## Les types "faux" (falsy) et vrais (truthy)

En condition, JS convertit toute valeur en booléen. Les valeurs **falsy** (considérées comme fausses) sont : `false`, `0`, `""` (chaîne vide), `null`, `undefined`, `NaN`. **Tout le reste est truthy.**

```javascript
if (variable) { }           // vrai si variable est truthy
const nom = saisie || "anonyme";   // "anonyme" si saisie est falsy (valeur par défaut)
const valeur = donnee ?? "défaut"; // ?? : défaut seulement si null/undefined (plus précis)
```

Le `||` pour les valeurs par défaut et le `??` (nullish coalescing, plus récent et plus précis) sont des idiomes courants.

## Les fonctions

JS a plusieurs syntaxes de fonction :

```javascript
// Déclaration classique
function saluer(nom) {
    return `Bonjour ${nom}`;      // template literal avec backticks
}

// Fonction fléchée (arrow function, ES6) — syntaxe moderne concise
const saluer2 = (nom) => `Bonjour ${nom}`;
const additionner = (a, b) => a + b;
const carre = x => x * x;         // parenthèses optionnelles si un seul argument

// Paramètres par défaut
const scanner = (host, port = 80) => `${host}:${port}`;

// Les fonctions sont des valeurs (first-class) : on les passe en argument
const nombres = [1, 2, 3];
const doubles = nombres.map(n => n * 2);      // [2, 4, 6]
```

Les **template literals** (backticks `` ` ``) avec `${expression}` sont l'équivalent des f-strings Python — utilise-les pour construire des chaînes. Les **arrow functions** (`=>`) sont la syntaxe moderne, particulièrement pratiques comme callbacks. (Elles ont une subtilité sur le `this` qu'on verra dans l'avancé.)

## Les structures de données

```javascript
// Tableau (array)
const ports = [22, 80, 443];
ports.push(8080);              // ajouter
ports.length;                  // 4
ports[0];                      // 22
ports.includes(443);           // true

// Méthodes fonctionnelles (essentielles, à maîtriser)
ports.map(p => p * 2);                    // transformer chaque élément
ports.filter(p => p < 1024);              // garder ceux qui matchent
ports.forEach(p => console.log(p));       // itérer
ports.find(p => p === 443);               // trouver le premier
ports.reduce((acc, p) => acc + p, 0);     // réduire à une valeur (somme)

// Objet (l'équivalent du dict Python, mais central en JS)
const service = {
    nom: "ssh",
    port: 22,
    actif: true
};
service.port;                  // 22 (accès par point)
service["port"];               // 22 (accès par crochet)
service.timeout = 30;          // ajouter une propriété

// Déstructuration (ES6)
const { nom, port } = service;            // extrait nom et port
const [premier, deuxieme] = ports;        // extrait les 2 premiers éléments
```

Les méthodes `map`, `filter`, `reduce`, `forEach` sont fondamentales — c'est le style fonctionnel de JS, à privilégier sur les boucles manuelles. L'**objet** JS (`{clé: valeur}`) est omniprésent : c'est la structure de base pour représenter des données, et le format JSON en découle directement.

## Le contrôle de flux

```javascript
// Conditions
if (age >= 18) {
    console.log("majeur");
} else {
    console.log("mineur");
}

const categorie = age >= 18 ? "majeur" : "mineur";   // ternaire

// Boucles
for (let i = 0; i < 10; i++) { }

for (const port of ports) {           // for...of : sur les valeurs (comme Python)
    console.log(port);
}

for (const cle in service) {          // for...in : sur les clés d'un objet
    console.log(cle, service[cle]);
}

while (condition) { }
```

Utilise `for...of` pour parcourir des tableaux (les valeurs) et `for...in` pour les clés d'un objet. Attention à ne pas les confondre.

## Le DOM : manipuler la page

C'est l'usage historique et central de JS dans le navigateur : modifier le HTML dynamiquement. Le DOM (l'arbre de la page, vu dans le cours HTML) s'accède via l'objet `document` :

```javascript
// Sélectionner des éléments
const titre = document.querySelector("h1");           // le premier h1
const boutons = document.querySelectorAll(".btn");    // tous les .btn
const zone = document.getElementById("resultat");

// Modifier le contenu
titre.textContent = "Nouveau titre";       // texte (SÛR)
zone.innerHTML = "<b>gras</b>";            // HTML (DANGEREUX — voir ci-dessous)

// Modifier le style et les attributs
titre.style.color = "red";
titre.classList.add("actif");
zone.setAttribute("data-id", "42");

// Réagir aux événements
const bouton = document.querySelector("#envoyer");
bouton.addEventListener("click", () => {
    console.log("cliqué !");
});
```

**Point de sécurité crucial** : `element.textContent = donnee` insère la donnée comme **texte inerte** (sûr). `element.innerHTML = donnee` l'interprète comme du **HTML** — si `donnee` vient de l'utilisateur, c'est une porte ouverte au **XSS DOM-based**. Règle : `textContent` par défaut, `innerHTML` seulement avec du contenu de confiance ou après assainissement. C'est une des vulnérabilités JS les plus courantes.

## Les requêtes réseau (fetch)

JS communique avec des serveurs, ce qui rend les applications dynamiques :

```javascript
// fetch : requête HTTP moderne (retourne une Promise)
fetch("https://api.exemple.fr/donnees")
    .then(reponse => reponse.json())
    .then(donnees => console.log(donnees))
    .catch(erreur => console.error(erreur));

// Requête POST avec données
fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: "matteo", pass: "..." })
});
```

`fetch` est l'outil moderne pour les requêtes (l'ancien `XMLHttpRequest`/AJAX est dépassé). Il retourne une **Promise** (une valeur future) — la gestion de l'asynchrone est un gros sujet traité dans le cours avancé (Promises, async/await), car c'est un concept central et déroutant de JS.

## Ce qu'il faut retenir

- JS est le langage du **comportement** côté web (et côté serveur avec Node.js) ; il n'a **rien à voir avec Java**. Vise le JS **moderne (ES6+)**.
- Variables : **`const` par défaut, `let` si ça change, jamais `var`**.
- JS est **faiblement typé** → conversions implicites piégeuses. **Toujours `===`, jamais `==`**.
- Maîtrise les méthodes de tableau **`map`, `filter`, `reduce`, `forEach`** (style fonctionnel) et les **objets** `{}` (base de JSON).
- Utilise les **template literals** (`` `${x}` ``), les **arrow functions** (`=>`), la **déstructuration**.
- Manipule la page via le **DOM** (`document.querySelector`, `addEventListener`) ; **`textContent` (sûr) vs `innerHTML` (risque XSS)**.
- **`fetch`** pour les requêtes réseau ; il retourne une Promise (asynchrone → cours avancé).
