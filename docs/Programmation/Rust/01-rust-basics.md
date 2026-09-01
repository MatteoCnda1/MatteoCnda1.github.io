---
id: 01-rust-basics
title: Rust - Les bases
sidebar_position: 1
---

# Rust — Les bases

## Le problème que Rust résout

On a vu dans les cours C et C++ que la quasi-totalité des vulnérabilités critiques viennent d'erreurs mémoire : buffer overflows, use-after-free, dangling pointers, data races. Microsoft et Google ont tous deux publié des chiffres convergents : **environ 70 % de leurs vulnérabilités de sécurité sont des erreurs de gestion mémoire**. C'est colossal.

Rust, développé par Mozilla et stabilisé en 2015, a été conçu pour une idée précise et ambitieuse : offrir **la performance du C/C++** (pas de garbage collector, contrôle bas niveau) tout en rendant **les erreurs mémoire impossibles à la compilation**. Pas détectées à l'exécution — *impossibles*. Si ton code Rust compile, il est garanti sans use-after-free, sans dangling pointer, sans data race, sans accès hors limites non vérifié.

C'est une révolution qui te concerne directement : Rust entre dans le **noyau Linux** (depuis 2022, aux côtés du C), dans les systèmes embarqués, dans les outils réseau et sécurité modernes. Des pans entiers d'infrastructure sont réécrits en Rust pour éliminer les failles mémoire. Pour quelqu'un en réseau/système/cybersécu, c'est une compétence d'avenir.

Le prix à payer : Rust a une **courbe d'apprentissage raide**, à cause du concept central qu'on va voir — l'ownership. Le compilateur est strict, parfois frustrant au début. Mais cette rigueur est exactement ce qui garantit la sûreté.

## Installation et outils

Rust est livré avec un écosystème d'outils remarquable, centré sur **Cargo** (le gestionnaire de projet et de paquets) :

```bash
# Installation via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Créer un projet
cargo new mon_projet
cd mon_projet
cargo run          # compile et exécute
cargo build --release   # compilation optimisée
cargo test         # lance les tests
cargo clippy       # linter (excellents conseils)
```

Cargo gère la compilation, les dépendances (appelées « crates », depuis crates.io), les tests, la documentation. C'est bien plus intégré que le C/C++ (où tu jongles avec gcc, make, cmake, un gestionnaire de paquets externe). Cette qualité d'outillage est un des grands plaisirs de Rust.

## Les bases de la syntaxe

```rust
fn main() {
    // Variables IMMUABLES par défaut
    let x = 42;
    // x = 43;          // ERREUR de compilation ! x est immuable

    // Pour rendre mutable, il faut le déclarer explicitement
    let mut y = 10;
    y = 20;             // OK

    // Types inférés, mais on peut les annoter
    let age: u32 = 25;          // entier non signé 32 bits
    let pi: f64 = 3.14159;      // flottant
    let actif: bool = true;
    let lettre: char = 'A';

    // Affichage avec des placeholders
    println!("x = {}, y = {}", x, y);
    println!("age = {age}");     // interpolation directe (récent)
}
```

Une différence philosophique majeure dès la première ligne : **les variables sont immuables par défaut**. Pour en modifier une, tu dois écrire `let mut`. Ça force à réfléchir à ce qui doit vraiment changer, et élimine toute une classe de bugs. C'est l'inverse du C/C++ où tout est mutable sauf mention `const`.

Les types entiers sont explicites sur leur taille et leur signe : `u8`, `u16`, `u32`, `u64` (non signés), `i8`...`i64` (signés), comme les `uint8_t` du C — précieux en embarqué et réseau.

## L'ownership : LE concept de Rust

Voici le cœur de Rust, ce qui le rend unique. Le système d'**ownership** (propriété) est un ensemble de règles vérifiées **à la compilation** qui gèrent la mémoire sans garbage collector et sans `free` manuel.

Trois règles fondamentales :

1. Chaque valeur a un **propriétaire** (owner) unique.
2. Il ne peut y avoir qu'**un seul propriétaire à la fois**.
3. Quand le propriétaire sort de sa portée, la valeur est **automatiquement libérée** (drop).

```rust
fn main() {
    let s1 = String::from("bonjour");   // s1 possède la chaîne
    let s2 = s1;                         // la propriété est TRANSFÉRÉE à s2 (move)
    // println!("{}", s1);               // ERREUR ! s1 n'est plus valide (move)
    println!("{}", s2);                  // OK
}   // ici s2 sort de portée → la mémoire est libérée automatiquement
```

Ce qui se passe : quand tu assignes `s1` à `s2`, Rust ne copie pas la chaîne (coûteux) — il **transfère la propriété** (move, comme le `std::move` de C++, mais imposé). Après ça, `s1` est invalidé : le compilateur **refuse** de l'utiliser. Résultat : impossible d'avoir deux pointeurs vers la même mémoire qui pourraient causer un double-free ou un use-after-free. Le compilateur l'empêche.

C'est déroutant au début (« pourquoi je ne peux plus utiliser s1 ?! »), mais c'est exactement ce qui rend Rust sûr. Le compilateur suit la propriété de chaque valeur et garantit qu'il n'y a jamais d'accès invalide.

## Le borrowing : emprunter sans posséder

Transférer la propriété à chaque fois serait pénible. Le **borrowing** (emprunt) permet d'accéder à une valeur sans en prendre la propriété, via des **références** (`&`) :

```rust
fn longueur(s: &String) -> usize {    // emprunte s (ne le possède pas)
    s.len()
}                                      // s sort de portée mais NE libère PAS (emprunt)

fn main() {
    let texte = String::from("réseau");
    let len = longueur(&texte);        // on prête texte
    println!("{} fait {} caractères", texte, len);  // texte toujours valide !
}
```

Les règles du borrowing (vérifiées par le **borrow checker**, le composant le plus célèbre — et redouté — du compilateur) :

- Tu peux avoir **plusieurs références immuables** (`&T`) simultanément (plusieurs lecteurs).
- **OU** une seule référence mutable (`&mut T`) (un seul écrivain).
- **Jamais les deux en même temps.**

```rust
let mut compteur = 0;

let r1 = &compteur;        // emprunt immuable
let r2 = &compteur;        // un autre, OK (plusieurs lecteurs)
println!("{} {}", r1, r2);

let m = &mut compteur;     // emprunt mutable — OK ici car r1/r2 ne sont plus utilisés
*m += 1;
```

Cette règle « plusieurs lecteurs OU un seul écrivain » est ce qui **élimine les data races à la compilation**. Une data race nécessite deux accès simultanés dont au moins un en écriture — précisément ce que le borrow checker interdit. C'est pour ça que Rust garantit la sûreté même en concurrence (« fearless concurrency »).

Le borrow checker est ce contre quoi tout débutant en Rust se bat. Mais chaque fois qu'il refuse ton code, il t'empêche en réalité un bug potentiel. On apprend à « penser en ownership ».

## Les types composés

```rust
// Tuple
let point = (3, 5);
let (x, y) = point;              // déstructuration
println!("{}", point.0);         // accès par index

// Array (taille fixe)
let ports = [22, 80, 443];
println!("{}", ports[0]);

// Vec (tableau dynamique — l'équivalent du vector C++)
let mut services = Vec::new();
services.push("ssh");
services.push("http");
println!("{}", services.len());

// String vs &str
let statique: &str = "littéral";        // chaîne immuable (slice)
let possedee: String = String::from("modifiable");   // chaîne allouée sur le heap
```

La distinction `String` (possédée, sur le heap, modifiable) vs `&str` (une « vue » empruntée, souvent un littéral) déroute au début mais découle logiquement de l'ownership. En gros : `String` quand tu possèdes/modifies, `&str` quand tu ne fais que lire.

## Le contrôle de flux et le pattern matching

```rust
// if est une expression (renvoie une valeur)
let categorie = if age >= 18 { "majeur" } else { "mineur" };

// Boucles
for port in [22, 80, 443] {
    println!("{}", port);
}
for i in 0..255 {                // plage 0 à 254
    // ...
}
let mut n = 0;
while n < 10 { n += 1; }
loop { break; }                  // boucle infinie explicite

// match : le pattern matching, très puissant
let code = 404;
match code {
    200 => println!("OK"),
    404 => println!("Not Found"),
    500..=599 => println!("Erreur serveur"),   // plage
    _ => println!("Autre"),                      // cas par défaut (obligatoire)
}
```

Le `match` est bien plus puissant que le `switch` du C : il doit être **exhaustif** (le compilateur vérifie que tous les cas sont couverts), il gère les plages, la déstructuration, les conditions. C'est un outil central en Rust.

## Option et Result : pas de null, pas d'exceptions cachées

Rust n'a **pas de `null`** (la « erreur à un milliard de dollars » selon son inventeur). À la place, l'absence de valeur est modélisée explicitement par le type `Option` :

```rust
// Option<T> : soit Some(valeur), soit None
fn trouver_port(service: &str) -> Option<u16> {
    match service {
        "ssh" => Some(22),
        "http" => Some(80),
        _ => None,               // pas de valeur
    }
}

match trouver_port("ssh") {
    Some(port) => println!("Port : {}", port),
    None => println!("Service inconnu"),
}
```

Le compilateur **te force** à gérer le cas `None` — impossible d'oublier de vérifier, donc pas de null pointer dereference. De même, les erreurs sont modélisées par `Result<T, E>` (soit `Ok(valeur)`, soit `Err(erreur)`), qu'on doit traiter explicitement. Fini les exceptions qui remontent silencieusement ou les codes d'erreur ignorés.

```rust
// Result<T, E> pour les opérations qui peuvent échouer
use std::fs;

fn lire_config() -> Result<String, std::io::Error> {
    let contenu = fs::read_to_string("config.txt")?;   // ? propage l'erreur
    Ok(contenu)
}
```

L'opérateur `?` propage l'erreur automatiquement (si `Err`, retourne l'erreur ; sinon extrait la valeur) — élégant et explicite. Cette gestion d'erreurs par le système de types est une des grandes forces de Rust : les erreurs ne peuvent pas être ignorées par accident.

## Ce qu'il faut retenir

- Rust vise la **performance du C/C++** avec les **erreurs mémoire impossibles à la compilation** (les ~70 % de failles mémoire du C/C++ disparaissent).
- **Cargo** offre un outillage intégré exceptionnel (build, dépendances, tests, `clippy`).
- Les variables sont **immuables par défaut** (`let mut` pour changer).
- L'**ownership** : un propriétaire unique par valeur, transfert par move, libération automatique en fin de portée — pas de GC, pas de `free`.
- Le **borrowing** (`&` immuable, `&mut` mutable) permet d'emprunter ; règle « plusieurs lecteurs OU un seul écrivain » → **data races éliminées à la compilation**.
- **Pas de null** (→ `Option<T>`), **pas d'exceptions cachées** (→ `Result<T, E>` + opérateur `?`) : le compilateur force à gérer les cas d'absence et d'erreur.
- Le `match` **exhaustif** est central. Le **borrow checker** est strict mais chacun de ses refus est un bug évité.
