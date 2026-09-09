---
id: 01-cpp-basics
title: C++ - Les bases
sidebar_position: 1
tags: [programmation]
---

# C++ — Les bases

## C++ n'est pas « du C amélioré »

C'est le premier malentendu à dissiper. C++, créé par Bjarne Stroustrup à partir de 1979, contient le C mais est un langage **fondamentalement différent** dans sa philosophie. Là où le C te donne un contrôle brut du métal, C++ ajoute des couches d'abstraction puissantes (objets, généricité, gestion automatique des ressources) tout en gardant la performance et l'accès bas niveau. On dit qu'il permet une programmation « **zero-cost abstraction** » : des abstractions de haut niveau qui ne coûtent rien en performance à l'exécution.

Pour ton profil : tu as déjà utilisé C++ sur STeaMi (ta trilatération BLE en C++ atteignait ~5 cm de précision contre ~20 cm en MicroPython — justement grâce à la performance du natif). C++ est le langage des systèmes où l'on veut **à la fois** performance maximale **et** abstractions modernes : moteurs de jeux, navigateurs, systèmes de trading haute fréquence, une grande partie des outils de sécurité performants.

Note importante : « C++ moderne » (depuis C++11, puis 14/17/20/23) est très différent du vieux C++ des années 2000. Ce cours vise le C++ moderne, qui est plus sûr et plus agréable. Compile avec un standard récent :

```bash
g++ -std=c++17 -Wall -Wextra programme.cpp -o programme
```

## Ce que C++ garde du C, ce qu'il change

Tu retrouves les types, les pointeurs, les structs, le contrôle de flux du C. Mais dès le départ, des différences de confort :

```cpp
#include <iostream>     // entrées/sorties C++ (remplace stdio.h)
#include <string>       // vraies chaînes (remplace les char*)
#include <vector>       // tableaux dynamiques (remplace malloc)

int main() {
    std::string nom = "Matteo";           // une VRAIE chaîne, pas un char[]
    std::cout << "Bonjour " << nom << "\n";  // sortie avec <<

    std::cout << "Ton âge ? ";
    int age;
    std::cin >> age;                       // entrée avec >>
    std::cout << "Dans 10 ans : " << age + 10 << "\n";
    return 0;
}
```

Trois gains immédiats sur le C :
- `std::string` gère les chaînes sans les pièges des `char*` (plus de buffer overflow sur les chaînes, redimensionnement automatique).
- `std::cout << ` / `std::cin >>` sont typés (pas de `%d`/`%s` à faire correspondre comme en `printf`, source de bugs).
- `std::vector` remplace l'allocation manuelle avec `malloc`/`free`.

Le `std::` est le **namespace** de la bibliothèque standard (voir plus bas).

## Les conteneurs de la STL : ne plus jamais gérer la mémoire à la main

La **STL** (Standard Template Library) fournit des structures de données prêtes à l'emploi qui gèrent leur mémoire automatiquement. C'est un des plus grands atouts de C++ sur le C.

```cpp
#include <vector>
#include <map>
#include <set>
#include <string>

// vector : tableau dynamique (l'équivalent de la list Python)
std::vector<int> ports = {22, 80, 443};
ports.push_back(8080);              // ajoute (redimensionne tout seul)
std::cout << ports.size() << "\n";  // 4
std::cout << ports[0] << "\n";      // 22

// map : dictionnaire trié (clé → valeur)
std::map<std::string, int> services;
services["ssh"] = 22;
services["http"] = 80;
std::cout << services["ssh"] << "\n";   // 22

// set : ensemble sans doublons
std::set<std::string> ips_vues;
ips_vues.insert("10.0.0.1");
ips_vues.insert("10.0.0.1");         // ignoré (doublon)
std::cout << ips_vues.size() << "\n"; // 1
```

Fini le `malloc`/`free` manuel du C pour ces cas courants : `std::vector` alloue et libère automatiquement. C'est plus sûr (pas de fuite, pas de buffer overflow) et aussi rapide.

Il existe aussi `std::unordered_map` et `std::unordered_set` (versions à base de table de hachage, plus rapides en accès mais non triées).

## Parcourir les conteneurs

```cpp
std::vector<int> ports = {22, 80, 443};

// Boucle "range-based for" (moderne, lisible) — comme le for de Python
for (int port : ports) {
    std::cout << port << "\n";
}

// Avec référence pour modifier, et auto pour le type
for (auto& port : ports) {
    port *= 2;                        // modifie les éléments
}

// Sur une map
std::map<std::string, int> services = {{"ssh", 22}, {"http", 80}};
for (const auto& [nom, port] : services) {   // structured bindings (C++17)
    std::cout << nom << " -> " << port << "\n";
}
```

Le `auto` laisse le compilateur déduire le type — pratique et lisible. Le `for (const auto& [cle, valeur] : map)` (structured bindings) est l'équivalent élégant du `for cle, valeur in dict.items()` de Python.

## Les classes : la POO en C++

C++ ajoute au C une programmation orientée objet complète :

```cpp
class Hote {
private:                              // accessible seulement dans la classe
    std::string ip;
    std::vector<int> ports_ouverts;

public:                               // accessible de l'extérieur
    // Constructeur
    Hote(const std::string& adresse) : ip(adresse) {}

    void ajouter_port(int port) {
        ports_ouverts.push_back(port);
    }

    int nombre_ports() const {        // const = ne modifie pas l'objet
        return ports_ouverts.size();
    }

    std::string get_ip() const {
        return ip;
    }
};

int main() {
    Hote h("192.168.1.1");
    h.ajouter_port(22);
    h.ajouter_port(80);
    std::cout << h.get_ip() << " : " << h.nombre_ports() << " ports\n";
}
```

Deux notions clés dès les bases :

**L'encapsulation** (`private` / `public`) — on cache les données internes (`private`) et on expose une interface contrôlée (`public`). Ça protège l'état de l'objet contre les modifications incohérentes.

**Le mot-clé `const`** — sur une méthode, il garantit qu'elle ne modifie pas l'objet. C'est une forme de sécurité à la compilation : le compilateur refuse toute modification accidentelle. Utilise `const` partout où c'est possible, c'est une marque de code C++ de qualité.

## RAII : le concept qui change tout

Voici LE concept fondamental de C++, celui qui le distingue vraiment. **RAII** = Resource Acquisition Is Initialization. L'idée : **une ressource (mémoire, fichier, connexion réseau, mutex) est liée à la durée de vie d'un objet**. Quand l'objet est créé, il acquiert la ressource ; quand il est détruit (automatiquement, en sortant de sa portée), il la libère.

```cpp
#include <fstream>

void traiter() {
    std::ifstream fichier("data.txt");   // ouvre le fichier (acquisition)
    // ... utilise le fichier ...
}   // <- ici, le fichier est fermé AUTOMATIQUEMENT (destruction)
    //    même si une exception est levée
```

Compare avec le C, où tu dois te souvenir de `fclose()` à chaque chemin de sortie (et où oublier = fuite). En C++, le **destructeur** de l'objet s'exécute automatiquement quand il sort de sa portée, garantissant la libération. C'est ce qui permet à C++ d'être sûr **sans** garbage collector : la libération est déterministe et automatique.

RAII s'applique à tout : `std::vector` libère sa mémoire, `std::lock_guard` libère un mutex, `std::unique_ptr` libère un pointeur. On approfondit dans l'avancé, mais retiens dès maintenant : **en C++ moderne, on ne fait quasiment plus de `new`/`delete` manuels** — RAII s'en charge.

## Les namespaces

Pour éviter les collisions de noms dans les gros projets, C++ organise le code en **namespaces** :

```cpp
namespace reseau {
    int port_defaut = 8080;
    void connecter() { /* ... */ }
}

reseau::connecter();               // appel qualifié
std::cout << reseau::port_defaut;

// using pour éviter de répéter le préfixe
using namespace std;               // à ÉVITER en global (pollue l'espace de noms)
```

Le `std::` que tu vois partout est le namespace de la bibliothèque standard. Beaucoup de débutants mettent `using namespace std;` pour s'épargner les `std::`, mais c'est déconseillé dans du vrai code (risque de collisions) : garde les `std::` explicites.

## Références : des pointeurs sans les dangers

C++ introduit les **références**, un alias vers une variable existante, plus sûr que les pointeurs du C :

```cpp
int x = 42;
int& ref = x;         // ref est un autre nom pour x
ref = 100;
std::cout << x;        // 100

// Passage par référence à une fonction (modifie l'original, sans pointeur)
void doubler(int& n) {
    n *= 2;
}
int val = 21;
doubler(val);          // pas besoin de &val comme en C
std::cout << val;       // 42

// Référence const : passer un gros objet sans le copier, sans risque de modif
void afficher(const std::string& texte) {   // pas de copie, lecture seule
    std::cout << texte;
}
```

Une référence ne peut pas être nulle et ne peut pas être réassignée — donc pas de risque de pointeur nul ou de dangling comme avec les pointeurs C. Le pattern `const std::string&` en paramètre (passer par référence constante) est idiomatique : il évite de copier de gros objets tout en garantissant qu'ils ne seront pas modifiés.

## Ce qu'il faut retenir

- C++ n'est **pas du C amélioré** : c'est un langage à part, qui ajoute des abstractions puissantes **sans sacrifier la performance** (zero-cost abstraction). Vise le **C++ moderne** (C++17+).
- La **STL** (`std::vector`, `std::map`, `std::set`, `std::string`) remplace la gestion mémoire manuelle du C — plus sûr, aussi rapide.
- Parcours avec le **range-based for** (`for (auto& x : conteneur)`) et les **structured bindings** (`for (auto& [k,v] : map)`).
- Les **classes** apportent l'encapsulation (`private`/`public`) ; utilise `const` partout où c'est possible.
- **RAII** est LE concept clé : les ressources sont liées à la durée de vie des objets et libérées automatiquement à la destruction — sécurité mémoire **sans** garbage collector.
- Les **namespaces** (`std::`, les tiens) évitent les collisions ; garde les `std::` explicites.
- Les **références** (`int&`, `const std::string&`) sont des pointeurs sûrs, idéales pour passer des objets sans copie.
