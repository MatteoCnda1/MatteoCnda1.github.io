---
id: 02-javascript-avance
title: JavaScript - Avancé
sidebar_position: 2
---

# JavaScript — Avancé

Les bases acquises, on aborde les concepts qui font la particularité (et la difficulté) de JavaScript : l'asynchrone, les closures, le `this`, et les enjeux de sécurité côté client comme côté serveur.

## L'asynchrone : le cœur de JavaScript

C'est LE concept qui distingue JS. JavaScript est **mono-thread** (un seul fil d'exécution), mais il gère la concurrence via un modèle **asynchrone non bloquant**. Au lieu d'attendre qu'une opération lente (requête réseau, lecture de fichier) se termine en bloquant tout, JS lance l'opération et continue, puis traite le résultat quand il arrive.

Le mécanisme derrière : l'**event loop** (boucle d'événements). Les opérations asynchrones sont mises de côté, et leurs callbacks sont exécutés quand JS est libre. C'est ce qui permet à une page de rester réactive pendant une requête réseau.

Historiquement, on gérait ça avec des **callbacks**, ce qui menait au « callback hell » (imbrication illisible) :

```javascript
// Callback hell — à éviter
fetch1(function(a) {
    fetch2(a, function(b) {
        fetch3(b, function(c) {
            // ... imbrication infernale
        });
    });
});
```

## Les Promises

Une **Promise** représente une valeur qui sera disponible plus tard (ou une erreur). C'est l'abstraction moderne de l'asynchrone :

```javascript
// Une Promise a trois états : pending, fulfilled (résolue), rejected (échec)
fetch("https://api.exemple.fr/data")
    .then(reponse => reponse.json())     // s'exécute quand la réponse arrive
    .then(donnees => traiter(donnees))   // chaînage
    .catch(erreur => console.error(erreur))   // gestion d'erreur
    .finally(() => console.log("terminé"));

// Combiner plusieurs Promises
Promise.all([fetch(url1), fetch(url2), fetch(url3)])   // attend TOUTES
    .then(resultats => console.log("tout est arrivé"));

Promise.race([fetch(url), timeout(5000)])              // la première qui finit
```

`Promise.all` est très utile pour lancer plusieurs requêtes en parallèle et attendre qu'elles soient toutes terminées — par exemple scanner plusieurs endpoints simultanément.

## async / await : l'asynchrone qui se lit comme du synchrone

La syntaxe moderne (ES2017) qui rend l'asynchrone lisible. `async/await` est du sucre syntaxique sur les Promises :

```javascript
async function recupererDonnees() {
    try {
        const reponse = await fetch("https://api.exemple.fr/data");   // "attend" le résultat
        const donnees = await reponse.json();
        return donnees;
    } catch (erreur) {
        console.error("Échec :", erreur);
    }
}

// Requêtes en séquence vs en parallèle
async function exemple() {
    // Séquentiel (lent : l'un après l'autre)
    const a = await fetch(url1);
    const b = await fetch(url2);

    // Parallèle (rapide : les deux en même temps)
    const [c, d] = await Promise.all([fetch(url1), fetch(url2)]);
}
```

Le mot-clé `await` met en pause la fonction `async` jusqu'à ce que la Promise soit résolue, mais **sans bloquer** le reste du programme. Le code se lit de haut en bas comme du synchrone, tout en restant non bloquant. C'est la façon recommandée d'écrire de l'asynchrone aujourd'hui. Piège à connaître : enchaîner des `await` séquentiels alors qu'on pourrait paralléliser avec `Promise.all` gaspille du temps.

## Les closures

Une **closure** (fermeture) est une fonction qui « capture » les variables de son environnement de définition, même après que celui-ci a disparu. C'est un concept puissant et omniprésent en JS :

```javascript
function creerCompteur() {
    let compte = 0;              // variable "privée"
    return function() {
        compte++;                // la fonction interne accède à compte
        return compte;
    };
}

const compteur = creerCompteur();
console.log(compteur());   // 1
console.log(compteur());   // 2  — compte a persisté !
```

La fonction retournée garde accès à `compte` même après que `creerCompteur` a terminé. Les closures permettent l'**encapsulation** (données privées, impossibles à modifier de l'extérieur), les factories de fonctions, et sont à la base de nombreux patterns. Elles sont partout dans le code JS réel, souvent sans qu'on s'en rende compte.

## Le this et les pièges des fonctions

Le mot-clé `this` en JS est notoirement déroutant : sa valeur dépend de **comment** la fonction est appelée, pas de où elle est définie.

```javascript
const objet = {
    nom: "Matteo",
    saluer: function() {
        console.log(this.nom);       // this = objet → "Matteo"
    }
};
objet.saluer();

// PIÈGE : this perdu dans un callback classique
const bouton = {
    label: "OK",
    attacher: function() {
        setTimeout(function() {
            console.log(this.label);  // undefined ! this a changé
        }, 100);
    }
};

// SOLUTION : arrow function (elle NE crée PAS son propre this)
const bouton2 = {
    label: "OK",
    attacher: function() {
        setTimeout(() => {
            console.log(this.label);  // "OK" — l'arrow garde le this du contexte
        }, 100);
    }
};
```

La différence clé entre fonction classique et arrow function : une **arrow function n'a pas son propre `this`**, elle utilise celui du contexte englobant. C'est pour ça qu'on préfère les arrow functions comme callbacks — elles évitent le piège du `this` perdu. C'est une des raisons principales de leur existence.

## Les objets, prototypes et classes

JS a un modèle objet **basé sur les prototypes** (chaque objet hérite d'un autre objet), différent des classes classiques. ES6 a ajouté une syntaxe `class` qui masque cette mécanique :

```javascript
class Hote {
    constructor(ip) {
        this.ip = ip;
        this.ports = [];
    }

    ajouterPort(port) {
        this.ports.push(port);
    }

    get nombrePorts() {          // getter
        return this.ports.length;
    }

    static comparer(a, b) {      // méthode statique
        return a.ip === b.ip;
    }
}

class Serveur extends Hote {     // héritage
    constructor(ip, service) {
        super(ip);               // appelle le constructeur parent
        this.service = service;
    }
}

const s = new Serveur("192.168.1.1", "web");
s.ajouterPort(443);
```

La syntaxe `class` est du sucre au-dessus des prototypes, mais elle rend la POO lisible. Sous le capot, l'héritage passe par la **chaîne de prototypes** — un concept à connaître car il explique des comportements JS et est parfois exploité en sécurité (voir prototype pollution ci-dessous).

## JSON : le format d'échange

JSON (JavaScript Object Notation) dérive de la syntaxe des objets JS et est devenu le format d'échange universel du web :

```javascript
const objet = { nom: "Matteo", ports: [22, 80], actif: true };

const texte = JSON.stringify(objet);        // objet → chaîne JSON
const retour = JSON.parse(texte);           // chaîne JSON → objet

// Piège de sécurité : JSON.parse sur des données non fiables est OK,
// mais NE JAMAIS utiliser eval() pour parser du JSON (exécution de code !)
```

`JSON.parse` / `JSON.stringify` sont tes outils pour manipuler les données d'API. **Ne jamais utiliser `eval()`** pour interpréter des données : `eval` exécute n'importe quel code, c'est une faille béante si les données viennent de l'extérieur.

## Node.js côté serveur

Avec Node.js, JS sort du navigateur : serveurs web, outils, scripts. L'écosystème `npm` (le gestionnaire de paquets) est le plus grand du monde :

```javascript
// Serveur HTTP minimal en Node
const http = require("http");
http.createServer((req, res) => {
    res.end("Bonjour");
}).listen(3000);

// Accès système (Node a accès aux fichiers, au réseau, aux processus)
const fs = require("fs");
const contenu = fs.readFileSync("fichier.txt", "utf-8");
```

Node donne à JS un accès système complet (fichiers, réseau, exécution de commandes) — d'où des enjeux de sécurité côté serveur similaires aux autres langages back-end (injection de commandes, path traversal). L'écosystème npm, immense, pose aussi un problème de **supply chain** : des paquets malveillants ou compromis peuvent introduire du code hostile (attaques sur la chaîne d'approvisionnement, un sujet chaud en cybersécu).

## Sécurité JavaScript

Récapitulatif des enjeux sécurité, central pour ton domaine :

**XSS (Cross-Site Scripting)** — l'injection de JS malveillant, la vulnérabilité web n°1. Trois types :
- **Reflected** — le payload est dans la requête (une URL piégée) et renvoyé dans la page.
- **Stored** — le payload est stocké côté serveur (un commentaire) et frappe tous les visiteurs.
- **DOM-based** — le JS de la page lui-même insère des données non assainies dans le DOM (via `innerHTML`, etc.).

La parade : **assainir/échapper toute donnée utilisateur** avant de l'insérer dans le DOM, préférer `textContent` à `innerHTML`, utiliser une bibliothèque comme DOMPurify si on doit insérer du HTML, et déployer une **Content Security Policy (CSP)** qui restreint les scripts autorisés.

**Prototype pollution** — une attaque spécifique à JS où l'on modifie le prototype de base des objets (`Object.prototype`) via des entrées malveillantes, affectant tous les objets. Une classe de vulnérabilité propre à JS/Node.

**eval() et Function()** — exécutent des chaînes comme du code. À bannir sur toute donnée non fiable (exécution de code arbitraire).

**Ne jamais faire confiance au client** — tout le JS côté client est visible, modifiable et contournable par l'utilisateur. Les contrôles de sécurité (authentification, autorisation, validation) doivent **toujours** être appliqués côté serveur. Le JS client est du confort, pas une barrière — exactement le même principe que la validation de formulaire vue en HTML.

## Ce qu'il faut retenir

- JS est **mono-thread et asynchrone** via l'**event loop** ; l'asynchrone se gère avec les **Promises** puis **`async/await`** (lisible comme du synchrone, non bloquant). Paralléliser avec `Promise.all`.
- Les **closures** capturent leur environnement → encapsulation et données privées.
- Le **`this`** dépend de l'appel ; les **arrow functions** n'ont pas leur propre `this` (d'où leur usage en callbacks).
- Le modèle objet est **prototypal** ; la syntaxe `class` (avec `extends`, `super`) le rend lisible.
- **JSON** (`parse`/`stringify`) est le format d'échange ; **jamais `eval()`** sur des données externes.
- **Node.js** étend JS au serveur (accès système, npm) → enjeux back-end et supply chain.
- Sécurité : **XSS** (reflected/stored/DOM, parade = échappement + `textContent` + CSP), **prototype pollution**, bannir `eval` ; **ne jamais faire confiance au client** — la sécurité se fait côté serveur.
