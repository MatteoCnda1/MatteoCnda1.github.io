---
id: 01-c-basics
title: C - Les bases
sidebar_position: 1
---

# C — Les bases

## Pourquoi le C reste incontournable

Le C, créé par Dennis Ritchie en 1972 pour écrire Unix, est le langage le plus influent de l'histoire. Il est partout où ça compte pour toi : le **noyau Linux**, les pilotes, les systèmes embarqués (ton STM32/STeaMi tourne fondamentalement sur du C), les protocoles réseau bas niveau, et la plupart des outils système. Comprendre le C, c'est comprendre comment la machine fonctionne réellement.

Le modèle mental à intégrer : le C est un **langage « proche du métal »** (low-level). Il ne te cache presque rien de la machine — tu manipules directement la mémoire, les adresses, les octets. C'est sa force (contrôle total, performance maximale) et son danger (rien ne te protège de tes erreurs). En sécurité, c'est fondamental : **la majorité des vulnérabilités critiques historiques viennent d'erreurs mémoire en C** (Heartbleed, la plupart des CVE du noyau, des serveurs...). Apprendre le C, c'est apprendre où naissent ces failles.

## Compilation : du texte au binaire

Contrairement à Python ou Bash (interprétés), le C est **compilé** : un programme (le compilateur, GCC ou Clang) traduit ton code source en instructions machine natives. Le processus a plusieurs étapes :

```bash
# Compilation simple
gcc programme.c -o programme
./programme

# Options utiles à toujours activer
gcc -Wall -Wextra -g programme.c -o programme
#   -Wall -Wextra : tous les warnings (écoute-les, ils attrapent des bugs)
#   -g            : symboles de debug (pour gdb)
```

Les quatre étapes réelles derrière un `gcc` :
1. **Préprocesseur** — traite les `#include`, `#define` (substitution de texte).
2. **Compilation** — traduit le C en assembleur.
3. **Assemblage** — assembleur → code objet (`.o`).
4. **Linking** — assemble les `.o` et les bibliothèques en un exécutable.

Comprendre ces étapes aide à déchiffrer les erreurs : une erreur de « undefined reference » vient du linker, pas du compilateur.

## La structure d'un programme

```c
#include <stdio.h>      // bibliothèque standard d'entrée/sortie

// Une fonction
int addition(int a, int b) {
    return a + b;
}

// Le point d'entrée : tout programme C commence par main()
int main(void) {
    int resultat = addition(3, 4);
    printf("Résultat : %d\n", resultat);
    return 0;          // 0 = succès (comme les codes de retour Bash)
}
```

Le `#include <stdio.h>` importe les déclarations de la bibliothèque standard (ici pour `printf`). Le `main()` est le point d'entrée obligatoire. Le `return 0` communique le succès au système (récupérable avec `echo $?` en Bash — la boucle est bouclée avec ton cours scripting).

## Les types : la taille compte

En C, tu dois connaître la taille de tes données, car tu manipules la mémoire directement :

```c
char    c = 'A';        // 1 octet  — caractère ou petit entier
int     i = 42;         // 4 octets (généralement) — entier
long    l = 100000L;    // 8 octets (souvent) — grand entier
float   f = 3.14f;      // 4 octets — flottant simple précision
double  d = 3.14159;    // 8 octets — flottant double précision
unsigned int u = 4000000000U;  // entier non signé (pas de négatif, double la plage positive)

// Pour des tailles GARANTIES (essentiel en embarqué et réseau)
#include <stdint.h>
uint8_t  octet = 255;       // exactement 8 bits non signés
uint16_t port = 443;        // exactement 16 bits
int32_t  valeur = -1000;    // exactement 32 bits signés

printf("Taille d'un int : %zu octets\n", sizeof(int));
```

En embarqué (STM32) et en réseau (parser des paquets), utilise **toujours** les types de taille fixe de `<stdint.h>` (`uint8_t`, `uint16_t`, `uint32_t`) : la taille d'un `int` peut varier selon l'architecture, mais un `uint16_t` fait toujours pile 16 bits. C'est capital quand tu manipules des registres matériels ou des en-têtes de protocole où chaque bit a une position précise.

`sizeof` donne la taille d'un type ou d'une variable en octets — tu l'utiliseras constamment.

## Le débordement d'entier (integer overflow)

Un piège de sécurité classique dès les bases : les entiers ont une taille finie, donc une valeur maximale. Les dépasser provoque un **wraparound** (retour à zéro ou au négatif) :

```c
uint8_t x = 255;
x = x + 1;             // x vaut 0 ! (débordement, retour à zéro)

int grand = 2147483647;   // INT_MAX
grand = grand + 1;         // devient négatif (-2147483648) — comportement dangereux
```

Ces débordements sont une source de vulnérabilités : un calcul de taille de buffer qui déborde peut mener à allouer trop peu de mémoire, puis à un buffer overflow. En CTF et en audit, c'est un vecteur classique.

## Le contrôle de flux

Syntaxe qui a inspiré presque tous les langages modernes (C++, Java, JavaScript, PHP...) :

```c
// Conditions
if (age >= 18) {
    printf("Majeur\n");
} else if (age >= 13) {
    printf("Adolescent\n");
} else {
    printf("Enfant\n");
}

// Switch
switch (code) {
    case 200: printf("OK\n"); break;
    case 404: printf("Not Found\n"); break;
    default:  printf("Autre\n");
}

// Boucles
for (int i = 0; i < 10; i++) {
    printf("%d ", i);
}

int i = 0;
while (i < 10) { i++; }

do { i--; } while (i > 0);   // exécute au moins une fois
```

Attention au `break` dans les `switch` : sans lui, l'exécution « tombe » (fall-through) sur le cas suivant — bug classique.

## Les pointeurs : LE concept central

Voici le cœur du C, ce qui le rend puissant et dangereux. Un **pointeur** est une variable qui contient une **adresse mémoire** — l'emplacement d'une autre donnée.

```c
int x = 42;
int *p = &x;        // p contient l'ADRESSE de x (& = "adresse de")

printf("%d\n", x);   // 42 — la valeur
printf("%p\n", (void*)p);  // 0x7ffe... — l'adresse
printf("%d\n", *p);  // 42 — la valeur pointée (* = "déréférencer")

*p = 100;            // modifie x À TRAVERS le pointeur
printf("%d\n", x);   // 100 — x a changé !
```

Deux opérateurs à ne pas confondre :
- `&x` = « l'adresse de x » (référencement).
- `*p` = « la valeur à l'adresse contenue dans p » (déréférencement).

Pourquoi c'est central ? Parce que le C passe les arguments **par copie** (par valeur). Pour qu'une fonction modifie une variable de l'appelant, il faut lui passer son adresse :

```c
void doubler(int *n) {     // reçoit un pointeur
    *n = *n * 2;           // modifie la valeur originale
}

int val = 21;
doubler(&val);             // on passe l'adresse
printf("%d\n", val);       // 42
```

Le danger : un pointeur qui pointe vers une adresse invalide (pointeur nul, mémoire libérée, hors limites) provoque un **segmentation fault** (crash) au mieux, une faille exploitable au pire. On approfondit dans l'avancé.

## Les tableaux et les chaînes

En C, un tableau est une zone mémoire contiguë, et son nom est essentiellement un pointeur vers son premier élément :

```c
int nombres[5] = {10, 20, 30, 40, 50};
printf("%d\n", nombres[2]);    // 30
printf("%d\n", *(nombres + 2)); // 30 aussi ! (arithmétique de pointeur)

// Les chaînes sont des tableaux de char terminés par '\0'
char nom[] = "Matteo";    // en réalité {'M','a','t','t','e','o','\0'}
printf("Longueur : %zu\n", strlen(nom));  // 6 (sans le \0)
```

Point crucial de sécurité : **le C ne vérifie JAMAIS les limites d'un tableau**. Écrire `nombres[10]` ou `nombres[-1]` compile sans broncher et corrompt la mémoire adjacente. C'est la base du **buffer overflow** :

```c
char buffer[8];
strcpy(buffer, "une chaîne beaucoup trop longue");  // DÉBORDE — corruption mémoire
```

`strcpy` copie sans vérifier la taille de destination. Si l'entrée dépasse le buffer, elle écrase ce qui suit en mémoire — potentiellement l'adresse de retour de la fonction, ce qui permet de détourner l'exécution. C'est la vulnérabilité la plus célèbre de l'histoire de l'informatique. La parade (fonctions bornées comme `strncpy`, `snprintf`) est détaillée dans l'avancé.

## Structures : regrouper des données

```c
struct Paquet {
    uint32_t ip_source;
    uint32_t ip_dest;
    uint16_t port_source;
    uint16_t port_dest;
    uint8_t  protocole;
};

struct Paquet p;
p.port_dest = 443;

// Avec un pointeur, on utilise -> au lieu de .
struct Paquet *ptr = &p;
ptr->port_dest = 80;       // équivaut à (*ptr).port_dest = 80
```

Les `struct` sont partout en programmation système et réseau : elles modélisent les en-têtes de protocoles, les registres matériels, les structures du noyau. La flèche `->` pour accéder aux membres via un pointeur est omniprésente dans le code système.

## Ce qu'il faut retenir

- Le C est **proche du métal** : contrôle total de la mémoire, performance maximale, aucune protection contre tes erreurs. C'est là que naissent la plupart des failles de sécurité.
- Il est **compilé** ; active toujours `-Wall -Wextra` et écoute les warnings.
- Utilise les types de **taille fixe** (`uint8_t`, `uint16_t`... de `<stdint.h>`) en embarqué et en réseau.
- Les **débordements d'entier** (wraparound) sont un piège de sécurité dès les bases.
- Les **pointeurs** sont le concept central : `&` (adresse de), `*` (valeur pointée) ; ils permettent aux fonctions de modifier l'original (passage par référence).
- **Le C ne vérifie jamais les limites des tableaux** → source des **buffer overflows** (`strcpy` sans borne). C'est LA classe de vulnérabilité à comprendre.
- Les `struct` (avec `.` ou `->`) modélisent les en-têtes réseau, les registres, les structures système.
