---
id: 02-rust-avance
title: Rust - Avancé
sidebar_position: 2
tags: [programmation]
---

# Rust — Avancé

Les bases (ownership, borrowing, Option/Result) acquises, on approfondit ce qui fait de Rust un langage complet pour les systèmes, le réseau et la sécurité — et pourquoi il est adopté là où la sûreté compte le plus.

## Les lifetimes : garantir la validité des références

Les **lifetimes** (durées de vie) sont l'extension logique du borrow checker, et le concept le plus abstrait de Rust. Ils garantissent qu'une référence ne survit jamais à la donnée qu'elle pointe — éliminant les **dangling references** (le fléau du C++) à la compilation.

La plupart du temps, le compilateur les infère. Mais parfois il faut les annoter :

```rust
// Cette fonction retourne une référence : le compilateur doit savoir
// combien de temps elle reste valide. 'a est un paramètre de lifetime.
fn plus_long<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

L'annotation `'a` dit : « la référence retournée vit aussi longtemps que les deux entrées ». Ça permet au compilateur de refuser tout code où l'on utiliserait le résultat après que l'une des entrées ait été libérée.

```rust
let resultat;
{
    let temporaire = String::from("court");
    resultat = plus_long(&longue, &temporaire);
}   // temporaire est détruite ici
// println!("{}", resultat);   // ERREUR : resultat pourrait pointer vers temporaire (morte)
```

Les lifetimes sont ce qui rend Rust unique : d'autres langages détectent les dangling references à l'exécution (crash) ou pas du tout (faille). Rust les rend **impossibles à compiler**. C'est déroutant, mais c'est la garantie ultime de sûreté mémoire.

## Structs, enums et pattern matching avancé

```rust
// Struct classique
struct Hote {
    ip: String,
    ports: Vec<u16>,
}

impl Hote {                          // bloc d'implémentation (les méthodes)
    fn new(ip: &str) -> Self {       // constructeur par convention
        Hote { ip: ip.to_string(), ports: Vec::new() }
    }
    fn ajouter_port(&mut self, port: u16) {
        self.ports.push(port);
    }
}

// Les enums de Rust sont bien plus puissants que ceux du C :
// chaque variante peut porter des données
enum Message {
    Connexion { ip: String, port: u16 },   // variante avec champs nommés
    Deconnexion,                             // variante simple
    Donnees(Vec<u8>),                        // variante avec données
}

// Le pattern matching déstructure tout ça
fn traiter(msg: Message) {
    match msg {
        Message::Connexion { ip, port } => println!("Connexion {}:{}", ip, port),
        Message::Deconnexion => println!("Déconnexion"),
        Message::Donnees(octets) => println!("{} octets reçus", octets.len()),
    }
}
```

Les **enums à données** (aussi appelés types sommes, ou tagged unions) sont une des plus belles features de Rust. `Option` et `Result` eux-mêmes sont des enums (`Option` = `Some(T)` | `None`). Ils permettent de modéliser précisément un domaine — par exemple les types de paquets d'un protocole, les états d'une machine à états — et le `match` exhaustif garantit qu'on traite tous les cas. C'est un outil de modélisation extrêmement expressif et sûr.

## Les traits : le polymorphisme de Rust

Les **traits** définissent un comportement partagé — l'équivalent des interfaces d'autres langages, mais plus puissants :

```rust
// Un trait définit des méthodes que les types peuvent implémenter
trait Scannable {
    fn scanner(&self) -> Vec<u16>;
    fn est_vulnerable(&self) -> bool {
        !self.scanner().is_empty()    // implémentation par défaut
    }
}

struct ServeurWeb { ip: String }

impl Scannable for ServeurWeb {
    fn scanner(&self) -> Vec<u16> {
        vec![80, 443]
    }
}

// Fonction générique contrainte par un trait
fn analyser<T: Scannable>(cible: &T) {
    if cible.est_vulnerable() {
        println!("Ports ouverts : {:?}", cible.scanner());
    }
}
```

Les traits sont partout en Rust. Des traits standard comme `Clone` (copie explicite), `Debug` (affichage `{:?}`), `Display`, `Iterator` définissent des comportements universels. On peut les dériver automatiquement :

```rust
#[derive(Debug, Clone, PartialEq)]     // génère automatiquement ces traits
struct Config {
    port: u16,
    timeout: u32,
}
```

Le `#[derive(...)]` est un attribut qui fait générer par le compilateur les implémentations standard — un gain de temps énorme.

## Les iterators : puissance et zéro coût

Rust a un système d'itérateurs paresseux (lazy) extrêmement expressif, combinable en chaînes, et compilé en code aussi rapide qu'une boucle manuelle (zero-cost abstraction) :

```rust
let ports = vec![22, 80, 443, 8080, 3306];

// Chaîne d'opérations (comme les pipes, mais typé et optimisé)
let privilegies: Vec<u16> = ports.iter()
    .filter(|&&p| p < 1024)        // garder les ports < 1024
    .map(|&p| p * 2)               // les doubler
    .collect();                     // matérialiser en Vec

// Somme, comptage, recherche
let total: u16 = ports.iter().sum();
let nb = ports.iter().filter(|&&p| p > 1000).count();
let premier = ports.iter().find(|&&p| p == 443);

// Itérer avec index
for (i, port) in ports.iter().enumerate() {
    println!("{}: {}", i, port);
}
```

Ces chaînes `iter().filter().map().collect()` sont l'équivalent des list comprehensions Python ou des streams, mais **sans coût à l'exécution** : le compilateur les transforme en boucles optimales. C'est un style à la fois lisible et performant, idéal pour traiter des données (logs, résultats de scan).

## La concurrence sans peur (fearless concurrency)

C'est un des arguments massues de Rust. Grâce à l'ownership et au borrow checker, **les data races sont impossibles à la compilation**. Tu peux paralléliser agressivement sans la peur qui accompagne le C/C++ concurrent.

```rust
use std::thread;
use std::sync::{Arc, Mutex};

// Arc = compteur de référence atomique (shared_ptr thread-safe)
// Mutex = exclusion mutuelle
let compteur = Arc::new(Mutex::new(0));

let mut handles = vec![];
for _ in 0..10 {
    let compteur = Arc::clone(&compteur);
    let handle = thread::spawn(move || {       // move : transfère la propriété au thread
        let mut n = compteur.lock().unwrap();  // verrouille (RAII : relâché en fin de portée)
        *n += 1;
    });
    handles.push(handle);
}
for handle in handles {
    handle.join().unwrap();
}
println!("Compteur : {}", *compteur.lock().unwrap());
```

Le point remarquable : si tu essaies de partager des données entre threads sans les protéger correctement (sans `Arc<Mutex<>>`), **le code ne compile pas**. Le système de types (via les traits `Send` et `Sync`) t'oblige à la sûreté. Là où le C++ te laisse écrire une data race qui plantera aléatoirement en production, Rust refuse de compiler. C'est ce qu'on appelle « fearless concurrency ».

## unsafe : la porte de sortie contrôlée

Rust reconnaît que parfois, il faut faire des choses que le borrow checker ne peut pas valider : parler au matériel (embarqué), appeler du C, manipuler des pointeurs bruts. Le bloc `unsafe` débloque ces capacités :

```rust
unsafe {
    let ptr = 0x1000 as *mut u32;    // pointeur brut vers une adresse (registre matériel)
    *ptr = 42;                        // écriture directe
}
```

Le point crucial de philosophie : `unsafe` ne désactive **pas** tout le vérificateur — il autorise seulement cinq opérations précises (déréférencer un pointeur brut, appeler une fonction unsafe, etc.). Et surtout, il **circonscrit** le risque : dans un projet Rust, les bugs mémoire ne peuvent venir que des blocs `unsafe`, qui sont rares, marqués et audités. Au lieu de chercher une faille mémoire dans 500 000 lignes de C, tu l'audites dans les quelques blocs `unsafe`. C'est un modèle de sécurité radicalement meilleur.

En embarqué (Rust est de plus en plus utilisé sur microcontrôleurs, y compris des STM32 comme ton écosystème), `unsafe` sert à accéder aux registres, mais les bibliothèques comme les HAL l'encapsulent dans des interfaces sûres.

## L'écosystème pour le réseau et la sécurité

Rust a un écosystème mûr et particulièrement fort pour ton domaine :

- **tokio** — runtime asynchrone pour le réseau haute performance (serveurs, clients).
- **reqwest / hyper** — client/serveur HTTP.
- **pnet / etherparse** — manipulation de paquets réseau bas niveau (l'équivalent de Scapy).
- **rustls** — implémentation TLS en Rust pur (alternative sûre à OpenSSL).
- **serde** — sérialisation/désérialisation (JSON, etc.) ultra-efficace.

Des outils de sécurité et d'infrastructure entiers sont écrits en Rust : le firewall/proxy de Cloudflare, des composants de Firefox, l'outil `ripgrep`, et de plus en plus d'outils offensifs et défensifs. La raison est toujours la même : la sûreté mémoire sans sacrifier la performance.

## Rust vs C vs C++ : quand utiliser quoi

Pour situer les trois langages de cette vague :

- **C** — quand tu as besoin d'un contrôle absolu et minimal : noyau, firmware sur microcontrôleur très contraint, code qui doit être portable partout, interfaçage. Reste dominant en embarqué bas niveau.
- **C++** — quand tu veux performance + abstractions riches sur des systèmes complexes existants : moteurs de jeux, logiciels massifs, calcul haute performance. Immense base de code legacy.
- **Rust** — quand la **sûreté mémoire** est critique et que tu pars sur du neuf : nouveaux outils système/réseau/sécurité, services réseau, composants critiques. Le choix moderne quand on peut choisir.

Aucun ne remplace totalement les autres, mais la tendance de fond est claire : pour le nouveau code système où la sécurité compte, Rust gagne du terrain rapidement — y compris dans le noyau Linux et chez les grands éditeurs.

## Ce qu'il faut retenir

- Les **lifetimes** (`'a`) garantissent qu'une référence ne survit jamais à sa donnée → **dangling references impossibles** à la compilation.
- Les **enums à données** + `match` exhaustif modélisent précisément un domaine (types de paquets, états) ; `Option`/`Result` en sont des cas.
- Les **traits** sont le polymorphisme de Rust (interfaces + implémentations par défaut) ; `#[derive(...)]` génère les comportements standard.
- Les **iterators** (`iter().filter().map().collect()`) offrent un style expressif à **coût nul**.
- **Fearless concurrency** : les data races sont **impossibles à compiler** (`Arc<Mutex<>>`, traits `Send`/`Sync`) — avantage majeur sur C/C++.
- `unsafe` **circonscrit** le risque à des blocs rares et audités, au lieu de le disperser partout — modèle de sécurité supérieur.
- Écosystème fort pour ton domaine (tokio, pnet, rustls, serde) ; Rust est le choix moderne pour le nouveau code système où la sûreté compte.
