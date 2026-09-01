---
id: 02-c-avance
title: C - Avancé
sidebar_position: 2
---

# C — Avancé

Les bases (pointeurs, tableaux, structs) acquises, on entre dans ce qui fait du C un langage de systèmes — et dans les mécanismes précis des vulnérabilités mémoire, cœur de la sécurité offensive et défensive bas niveau.

## La mémoire d'un processus : stack vs heap

Pour comprendre les vulnérabilités, il faut d'abord visualiser comment un programme organise sa mémoire. Un processus a plusieurs zones :

- **Text** — le code exécutable (en lecture seule).
- **Data / BSS** — les variables globales et statiques.
- **Heap** (le tas) — la mémoire allouée dynamiquement (`malloc`), grandit vers le haut.
- **Stack** (la pile) — les variables locales et les appels de fonctions, grandit vers le bas.

La **stack** fonctionne en LIFO (dernier entré, premier sorti). À chaque appel de fonction, un **stack frame** est empilé : il contient les variables locales, les arguments, et — crucial pour la sécurité — l'**adresse de retour** (où reprendre après la fonction). C'est cette adresse de retour que visent les buffer overflows sur la pile.

La **heap** sert pour les données dont la taille n'est pas connue à la compilation ou qui doivent survivre à la fonction qui les crée.

## L'allocation dynamique

```c
#include <stdlib.h>

// Allouer de la mémoire sur le heap
int *tableau = malloc(10 * sizeof(int));   // 10 entiers
if (tableau == NULL) {                       // TOUJOURS vérifier
    perror("malloc a échoué");
    return 1;
}

tableau[0] = 42;

// Redimensionner
tableau = realloc(tableau, 20 * sizeof(int));

// LIBÉRER (obligatoire — sinon fuite mémoire)
free(tableau);
tableau = NULL;    // bonne pratique : éviter le dangling pointer
```

Règle absolue : **chaque `malloc` doit avoir son `free`**. Le C n'a pas de garbage collector — tu gères la mémoire à la main. Deux catégories de bugs en découlent, qui sont aussi des vulnérabilités :

**Memory leak (fuite mémoire)** — On alloue sans jamais libérer. Le programme consomme de plus en plus de RAM jusqu'à épuisement. Sur un service qui tourne des mois (serveur, embarqué), c'est fatal.

**Use-after-free** — On utilise un pointeur après avoir libéré la mémoire qu'il désigne. La zone peut avoir été réallouée pour autre chose → corruption, ou exploitation. C'est une des classes de vulnérabilités les plus exploitées aujourd'hui (navigateurs, noyaux).

```c
int *p = malloc(sizeof(int));
free(p);
*p = 5;          // USE-AFTER-FREE : comportement indéfini, exploitable
```

Mettre le pointeur à `NULL` après `free` transforme un use-after-free silencieux en crash franc (déréférencer NULL plante immédiatement), ce qui est préférable.

## Les buffer overflows en détail

Voici le mécanisme précis de LA vulnérabilité historique. Reprenons une fonction vulnérable :

```c
void traiter(char *entree) {
    char buffer[64];
    strcpy(buffer, entree);    // pas de vérification de taille
    // ...
}
```

`buffer` fait 64 octets sur la **stack**. Juste « au-dessus » de lui dans le stack frame se trouve l'adresse de retour. Si `entree` fait plus de 64 octets, `strcpy` continue d'écrire au-delà du buffer et finit par **écraser l'adresse de retour**. Un attaquant qui contrôle `entree` peut donc y placer l'adresse de son choix : quand la fonction se termine, l'exécution saute vers cette adresse (par exemple vers du shellcode qu'il a injecté). C'est le **stack smashing**, décrit dans l'article fondateur « Smashing the Stack for Fun and Profit » (1996).

Les protections modernes (que tu croiseras en pentest binaire / CTF pwn) :

- **Stack canaries** — une valeur secrète placée avant l'adresse de retour ; si elle est modifiée (par un overflow), le programme s'arrête. Activé par `-fstack-protector`.
- **ASLR** (Address Space Layout Randomization) — les adresses mémoire sont randomisées à chaque exécution, rendant difficile de prédire où sauter.
- **NX / DEP** (No-eXecute) — la stack est marquée non exécutable, empêchant d'exécuter du shellcode qui y serait injecté.

Et les contournements que ces protections ont fait naître : **ROP** (Return-Oriented Programming), qui réutilise des morceaux de code existant au lieu d'injecter du shellcode, contournant NX. C'est tout un pan de la sécurité offensive (les challenges « pwn » des CTF).

La **prévention** en tant que développeur : utiliser les versions bornées des fonctions.

```c
// DANGEREUX (sans borne)      →  SÛR (avec borne)
strcpy(dst, src);              →  strncpy(dst, src, sizeof(dst) - 1);
strcat(dst, src);             →  strncat(dst, src, ...);
sprintf(buf, "%s", s);        →  snprintf(buf, sizeof(buf), "%s", s);
gets(buf);                    →  fgets(buf, sizeof(buf), stdin);  // gets() est banni
```

`gets()` est si dangereux (aucune borne possible) qu'il a été retiré du standard C. Ne l'utilise jamais.

## Pointeurs de fonction

Un pointeur peut désigner une fonction, ce qui permet de passer du comportement en paramètre — l'équivalent C des callbacks :

```c
// Un pointeur vers une fonction prenant deux int et retournant un int
int (*operation)(int, int);

int add(int a, int b) { return a + b; }
int mul(int a, int b) { return a * b; }

operation = add;
printf("%d\n", operation(3, 4));   // 7
operation = mul;
printf("%d\n", operation(3, 4));   // 12

// Usage réel : table de dispatch (comme les handlers d'un serveur)
int (*handlers[])(int, int) = {add, mul};
printf("%d\n", handlers[0](5, 5));  // 10
```

Les pointeurs de fonction sont partout en programmation système : les callbacks, les tables de gestionnaires (handlers), les structures du noyau (les file operations d'un pilote). Ils sont aussi une cible d'attaque : écraser un pointeur de fonction (via un overflow heap) permet de détourner l'exécution.

## Le préprocesseur et la compilation modulaire

```c
// Macros
#define MAX_CLIENTS 100
#define CARRE(x) ((x) * (x))       // les parenthèses évitent les bugs de priorité
#define MIN(a, b) ((a) < (b) ? (a) : (b))

// Compilation conditionnelle (utile pour le debug ou le portage)
#ifdef DEBUG
    printf("Valeur : %d\n", x);
#endif

// Garde d'inclusion (dans un .h, évite les inclusions multiples)
#ifndef MON_HEADER_H
#define MON_HEADER_H
// déclarations...
#endif
```

Le C sépare **déclaration** (`.h`, les en-têtes) et **définition** (`.c`, l'implémentation). Un projet réel a plusieurs fichiers compilés séparément puis liés :

```bash
gcc -c module1.c -o module1.o     # compile sans lier
gcc -c module2.c -o module2.o
gcc module1.o module2.o -o programme   # linking final
```

En pratique, on automatise avec un **Makefile** (ou CMake). C'est ce qui gère la compilation de gros projets comme le noyau Linux.

## Manipulation de bits

Essentielle en embarqué (registres matériels) et en réseau (flags de protocole) :

```c
uint8_t flags = 0;

flags |= (1 << 3);       // met le bit 3 à 1 (SET)
flags &= ~(1 << 3);      // met le bit 3 à 0 (CLEAR)
flags ^= (1 << 3);       // inverse le bit 3 (TOGGLE)
if (flags & (1 << 3)) {  // teste le bit 3
    // le bit est à 1
}

// Cas réel : décoder les flags TCP d'un paquet
#define TCP_SYN 0x02
#define TCP_ACK 0x10
if (tcp_flags & TCP_SYN) printf("SYN présent\n");
if ((tcp_flags & (TCP_SYN | TCP_ACK)) == (TCP_SYN | TCP_ACK)) printf("SYN-ACK\n");
```

Ces opérations bit à bit sont ton pain quotidien quand tu programmes un microcontrôleur (configurer un registre GPIO, un timer) ou quand tu parses/forges des paquets réseau. Le décodage des flags TCP ci-dessus est exactement ce que fait un outil comme Scapy ou Wireshark en interne.

## Outils indispensables pour le C sûr

Écrire du C correct sans outils est presque impossible. Ceux à connaître :

**Valgrind** — détecte les fuites mémoire, les use-after-free, les accès invalides à l'exécution :

```bash
valgrind --leak-check=full ./programme
```

**AddressSanitizer (ASan)** — instrumentation à la compilation qui attrape les erreurs mémoire, souvent plus vite que Valgrind :

```bash
gcc -fsanitize=address -g programme.c -o programme
./programme    # crashe avec un rapport détaillé au premier bug mémoire
```

**gdb** — le débogueur : inspecter la mémoire, poser des breakpoints, analyser un crash. Indispensable aussi en analyse de binaires / reverse (avec des extensions comme GEF ou pwndbg pour le pwn).

Réflexe pro : compile avec `-Wall -Wextra -fsanitize=address` pendant le développement. Ces outils t'apprennent tes propres erreurs mémoire mieux que n'importe quel cours.

## Ce qu'il faut retenir

- La mémoire d'un processus se divise en **stack** (variables locales, adresses de retour) et **heap** (allocation dynamique). Comprendre cette organisation est le prérequis pour comprendre les vulnérabilités.
- **Chaque `malloc` a son `free`** : sinon fuite mémoire ; réutiliser après `free` = **use-after-free** (exploitable). Mettre le pointeur à `NULL` après `free`.
- Le **buffer overflow** écrase l'adresse de retour sur la stack → détournement d'exécution. Protections : canaries, ASLR, NX ; contournement : ROP. Prévention : fonctions **bornées** (`snprintf`, `fgets`), jamais `gets`/`strcpy`.
- Les **pointeurs de fonction** permettent callbacks et tables de dispatch — puissants et ciblés par les attaques.
- Le préprocesseur (`#define`, `#ifdef`, gardes d'inclusion) et la séparation `.h`/`.c` structurent les gros projets (Makefile).
- La **manipulation de bits** (`|`, `&`, `~`, `<<`) est essentielle en embarqué (registres) et en réseau (flags TCP).
- Utilise **Valgrind, AddressSanitizer et gdb** — indispensables pour écrire du C sûr et pour analyser des binaires.
