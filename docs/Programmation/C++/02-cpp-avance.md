---
id: 02-cpp-avance
title: C++ - Avancé
sidebar_position: 2
tags: [programmation]
---

# C++ — Avancé

Les bases (STL, classes, RAII, références) acquises, on aborde ce qui fait la puissance et la complexité de C++ : gestion moderne de la mémoire, généricité, et les concepts qui distinguent le code C++ professionnel. Toujours avec un œil sur la performance et la sécurité.

## Les smart pointers : RAII appliqué à la mémoire

En C++ moderne, on ne fait **presque plus jamais** de `new`/`delete` manuels. À la place, les **smart pointers** appliquent RAII à la gestion mémoire : ils libèrent automatiquement ce qu'ils possèdent. C'est la réponse de C++ aux fuites mémoire et use-after-free du C, sans le coût d'un garbage collector.

```cpp
#include <memory>

// unique_ptr : propriété EXCLUSIVE (un seul propriétaire)
std::unique_ptr<Hote> h = std::make_unique<Hote>("192.168.1.1");
h->ajouter_port(22);
// libéré automatiquement quand h sort de sa portée — pas de delete

// shared_ptr : propriété PARTAGÉE (comptage de références)
std::shared_ptr<Hote> a = std::make_shared<Hote>("10.0.0.1");
std::shared_ptr<Hote> b = a;    // a et b partagent le même objet
// l'objet est libéré quand le DERNIER shared_ptr disparaît (compteur = 0)

// weak_ptr : référence NON propriétaire (casse les cycles de shared_ptr)
std::weak_ptr<Hote> observateur = a;
```

Le choix entre les trois :
- **`unique_ptr`** — le défaut. Un seul propriétaire, coût nul (aussi rapide qu'un pointeur brut). Utilise-le partout où une seule entité possède la ressource.
- **`shared_ptr`** — quand plusieurs entités doivent partager la propriété. Coût : un compteur de références atomique. À utiliser seulement quand le partage est réel.
- **`weak_ptr`** — pour observer sans posséder, notamment pour briser les **cycles de références** (deux `shared_ptr` qui se pointent mutuellement ne seraient jamais libérés — une fuite).

La règle du C++ moderne : **si tu écris `new` ou `delete` dans du code applicatif, tu fais probablement une erreur**. Les smart pointers et les conteneurs STL couvrent presque tous les cas.

## La sémantique de déplacement (move semantics)

Concept introduit en C++11, essentiel pour la performance. L'idée : au lieu de **copier** un gros objet (coûteux), on peut **transférer** ses ressources (rapide).

```cpp
std::vector<int> creer_gros_vecteur() {
    std::vector<int> v(1'000'000);
    return v;                        // "déplacé" et non copié (le compilateur optimise)
}

std::vector<int> a = {1, 2, 3};
std::vector<int> b = std::move(a);   // transfère le contenu de a vers b
// a est maintenant vide (son contenu a été "volé"), b a les données
```

L'analogie : copier, c'est photocopier un document ; déplacer, c'est passer l'original à quelqu'un d'autre (bien plus rapide, mais tu ne l'as plus). `std::move` marque un objet comme « déplaçable » — on transfère la propriété de ses ressources internes au lieu de tout dupliquer.

Cette sémantique est ce qui rend les conteneurs STL efficaces : retourner un `std::vector` d'une fonction ne le copie pas. Comprendre copie vs déplacement est clé pour écrire du C++ performant — pertinent pour ton code embarqué où chaque cycle compte.

## Les templates : la généricité

Les **templates** permettent d'écrire du code qui fonctionne pour n'importe quel type, résolu à la compilation (donc sans coût à l'exécution — encore la zero-cost abstraction).

```cpp
// Une fonction générique
template <typename T>
T maximum(T a, T b) {
    return (a > b) ? a : b;
}

maximum(3, 7);           // fonctionne avec des int
maximum(3.5, 2.1);       // avec des double
maximum('a', 'z');       // avec des char

// Une classe générique
template <typename T>
class Pile {
private:
    std::vector<T> elements;
public:
    void empiler(const T& e) { elements.push_back(e); }
    T depiler() {
        T e = elements.back();
        elements.pop_back();
        return e;
    }
    bool vide() const { return elements.empty(); }
};

Pile<int> pile_entiers;
Pile<std::string> pile_chaines;
```

Toute la STL est bâtie sur les templates (`std::vector<T>`, `std::map<K,V>`). Le compilateur génère une version spécialisée du code pour chaque type utilisé — d'où la performance native, contrairement à la généricité par « boxing » d'autres langages.

Le revers : les erreurs de templates produisent des messages de compilation notoirement illisibles. C++20 a introduit les **concepts** pour contraindre les templates et clarifier ces erreurs.

## La gestion d'exceptions

C++ gère les erreurs par exceptions (contrairement au C qui utilise les codes de retour) :

```cpp
#include <stdexcept>

int diviser(int a, int b) {
    if (b == 0) {
        throw std::runtime_error("Division par zéro");
    }
    return a / b;
}

try {
    int r = diviser(10, 0);
} catch (const std::runtime_error& e) {
    std::cerr << "Erreur : " << e.what() << "\n";
} catch (const std::exception& e) {   // classe de base de toutes les exceptions std
    std::cerr << "Exception : " << e.what() << "\n";
}
```

Le lien fort avec RAII : quand une exception est levée, tous les objets locaux entre le `throw` et le `catch` sont **détruits proprement** (leurs destructeurs s'exécutent). C'est ce qu'on appelle le **stack unwinding**. Résultat : même en cas d'erreur, les fichiers sont fermés, la mémoire libérée, les mutex relâchés — automatiquement. C'est pour ça que RAII et exceptions vont de pair, et pourquoi C++ peut gérer les erreurs sans fuiter des ressources.

Note : en embarqué (STM32), les exceptions sont parfois désactivées pour des raisons de déterminisme et de taille de code — on revient alors à des codes de retour ou `std::optional`.

## Les lambdas et la programmation fonctionnelle

Les **lambdas** (fonctions anonymes, C++11) permettent d'écrire du code inline, très utile avec les algorithmes STL :

```cpp
#include <algorithm>

std::vector<int> ports = {443, 22, 8080, 80, 3306};

// Trier
std::sort(ports.begin(), ports.end());

// Trier avec un critère personnalisé (lambda)
std::sort(ports.begin(), ports.end(), [](int a, int b) {
    return a > b;                    // ordre décroissant
});

// Filtrer / compter avec une lambda
int privilegies = std::count_if(ports.begin(), ports.end(), [](int p) {
    return p < 1024;                 // ports privilégiés
});

// Capturer des variables du contexte
int seuil = 1000;
auto au_dessus = std::count_if(ports.begin(), ports.end(),
    [seuil](int p) { return p > seuil; });   // [seuil] = capture par valeur
```

La syntaxe `[capture](params) { corps }` : les crochets déclarent ce qu'on « capture » du contexte (`[x]` par valeur, `[&x]` par référence, `[&]` tout par référence). Les lambdas combinées aux **algorithmes STL** (`std::sort`, `std::find_if`, `std::transform`, `std::count_if`) donnent un style expressif et performant — l'équivalent C++ des list comprehensions Python, en plus rapide.

## La concurrence

C++ moderne a un support natif du multithreading :

```cpp
#include <thread>
#include <mutex>

std::mutex mtx;
int compteur = 0;

void incrementer() {
    for (int i = 0; i < 1000; i++) {
        std::lock_guard<std::mutex> verrou(mtx);   // RAII : verrou pris ici...
        compteur++;
    }                                               // ...relâché automatiquement ici
}

std::thread t1(incrementer);
std::thread t2(incrementer);
t1.join();                        // attend la fin du thread
t2.join();
```

Contrairement à Python (bridé par le GIL), C++ a un **vrai parallélisme** : les threads s'exécutent réellement en simultané sur plusieurs cœurs. C'est un atout majeur pour les tâches CPU-intensives (cracking, traitement de données massif).

Le `std::lock_guard` illustre encore RAII : il prend le mutex à sa création et le relâche à sa destruction (fin de portée), garantissant qu'on ne laisse jamais un verrou bloqué même en cas d'exception. La programmation concurrente est difficile (data races, deadlocks) — les mutex, `std::atomic` et les primitives de synchronisation sont là pour la maîtriser.

## Là où C++ reste dangereux

Malgré RAII et les smart pointers, C++ **hérite de toute la dangerosité du C** si on retombe dans les vieilles pratiques :

- Les pointeurs bruts, `new`/`delete` manuels, les tableaux C-style restent possibles → buffer overflows, use-after-free identiques au C.
- Les **dangling references** : renvoyer une référence vers une variable locale (détruite au retour) est un bug vicieux.
- L'accès hors limites d'un `std::vector` avec `[]` n'est **pas** vérifié (utilise `.at()` pour une vérification, au prix d'un léger coût).
- La complexité du langage elle-même est une source d'erreurs.

C'est précisément ce constat — « C++ est puissant mais on peut toujours se tirer une balle dans le pied » — qui a motivé la création de **Rust** (cours suivant), conçu pour offrir les mêmes performances et abstractions **en rendant les erreurs mémoire impossibles à la compilation**.

## Ce qu'il faut retenir

- Les **smart pointers** appliquent RAII à la mémoire : `unique_ptr` (propriété exclusive, le défaut), `shared_ptr` (partagée, comptée), `weak_ptr` (observation, casse les cycles). En C++ moderne, **plus de `new`/`delete` manuels**.
- La **move semantics** (`std::move`) transfère les ressources au lieu de les copier — clé de la performance.
- Les **templates** offrent une généricité résolue à la compilation (zero-cost) ; toute la STL en est faite.
- Les **exceptions** + RAII = **stack unwinding** : les ressources sont libérées proprement même en cas d'erreur.
- Les **lambdas** + **algorithmes STL** (`std::sort`, `std::count_if`) donnent un style expressif et rapide.
- C++ a un **vrai parallélisme** (pas de GIL) ; `std::lock_guard` gère les mutex en RAII.
- **C++ reste dangereux** si on retombe dans les pratiques C (pointeurs bruts, hors limites) — ce qui a motivé la création de Rust.
