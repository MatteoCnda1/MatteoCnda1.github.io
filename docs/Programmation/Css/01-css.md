---
id: 01-css
title: CSS - Mise en forme du web
sidebar_position: 1
---

# CSS — La mise en forme du web

## Le rôle du CSS

CSS (Cascading Style Sheets) est le langage qui **habille** le HTML : couleurs, polices, tailles, positions, animations. Comme HTML, ce n'est pas un langage de programmation classique — c'est un langage déclaratif de **présentation**. Tu décris à quoi les choses doivent ressembler, le navigateur s'occupe du rendu.

Dans le trio web, CSS a le rôle de la présentation, strictement séparé de la structure (HTML) et du comportement (JS). Cette séparation permet de changer tout l'aspect d'un site sans toucher au HTML.

Pour ton profil : CSS est moins central en sécurité que HTML/JS/PHP, mais il n'est pas neutre — il existe des attaques par CSS (exfiltration de données, keylogging via sélecteurs d'attributs, UI redressing/clickjacking qui utilise le CSS pour superposer des éléments invisibles). Et maîtriser CSS reste indispensable pour construire des interfaces (ton portfolio, tes projets web, tes dashboards).

## La syntaxe : sélecteur + déclarations

```css
/* sélecteur { propriété: valeur; } */
p {
    color: #333;
    font-size: 16px;
    line-height: 1.5;
}
```

On **sélectionne** des éléments HTML, puis on leur applique des **déclarations** (paires propriété/valeur). Trois façons d'appliquer du CSS :

```html
<!-- 1. Feuille externe (LA bonne pratique) -->
<link rel="stylesheet" href="style.css">

<!-- 2. Balise style dans le head (à éviter en général) -->
<style> p { color: red; } </style>

<!-- 3. Style inline (à proscrire — mélange structure et présentation) -->
<p style="color: red;">Texte</p>
```

Le CSS externe est la règle : un seul fichier pilote tout le site, mis en cache par le navigateur. Le style inline casse la séparation des responsabilités et complique la maintenance (il est aussi bloqué par certaines Content Security Policy, une protection anti-XSS).

## Les sélecteurs

C'est le cœur de CSS : cibler précisément les bons éléments.

```css
/* Par balise */
p { }

/* Par classe (réutilisable, le plus courant) */
.bouton { }

/* Par id (unique) */
#header { }

/* Descendant : les <a> à l'intérieur d'un <nav> */
nav a { }

/* Enfant direct */
ul > li { }

/* Par attribut */
input[type="password"] { }
a[href^="https"] { }         /* liens commençant par https */

/* Pseudo-classes (état) */
a:hover { }                  /* au survol */
input:focus { }              /* champ actif */
li:first-child { }           /* premier enfant */
tr:nth-child(even) { }       /* lignes paires */

/* Pseudo-éléments */
p::first-line { }
.tooltip::before { content: "→ "; }
```

Les **classes** (`.nom`) sont l'outil principal : réutilisables, elles permettent d'appliquer un style à plusieurs éléments. Les **id** (`#nom`) sont uniques et à réserver aux ancrages. Les sélecteurs d'attribut (`input[type="password"]`) sont puissants — et, fait notable en sécurité, exploitables pour de l'exfiltration (un sélecteur peut déclencher une requête réseau selon la valeur d'un attribut).

## La cascade et la spécificité

Le « C » de CSS = **Cascading**. Quand plusieurs règles ciblent le même élément, laquelle gagne ? C'est déterminé par la **spécificité** :

1. Style inline (le plus fort) — spécificité maximale.
2. `#id` — fort.
3. `.classe`, `[attribut]`, `:pseudo-classe` — moyen.
4. Balise, `::pseudo-élément` — faible.

```css
p { color: blue; }                /* faible */
.important { color: green; }      /* plus fort */
#special { color: red; }          /* encore plus fort */
/* Un <p id="special" class="important"> sera ROUGE */
```

En cas d'égalité de spécificité, **la dernière règle déclarée gagne**. Le `!important` force une règle à outrepasser tout — mais c'est un anti-pattern : si tu as besoin de `!important`, ta spécificité est mal pensée. Comprendre la cascade évite les heures perdues à se demander « pourquoi mon style ne s'applique pas ».

## Le modèle de boîte (box model)

Concept fondamental : **chaque élément HTML est une boîte** composée de quatre couches concentriques :

```
┌─────────────────────────────┐
│  margin (marge externe)      │
│  ┌───────────────────────┐   │
│  │  border (bordure)     │   │
│  │  ┌─────────────────┐  │   │
│  │  │ padding (interne)│  │   │
│  │  │  ┌───────────┐  │  │   │
│  │  │  │ content   │  │  │   │
│  │  │  └───────────┘  │  │   │
│  │  └─────────────────┘  │   │
│  └───────────────────────┘   │
└─────────────────────────────┘
```

```css
.boite {
    width: 300px;
    padding: 20px;      /* espace intérieur (entre contenu et bordure) */
    border: 2px solid black;
    margin: 10px;       /* espace extérieur (entre la boîte et les voisines) */

    box-sizing: border-box;   /* À METTRE PARTOUT */
}
```

Le piège classique : par défaut, `width: 300px` définit la largeur **du contenu seul**, et padding/border s'ajoutent par-dessus (boîte totale = 300 + 40 + 4 = 344px). C'est contre-intuitif. La solution universelle :

```css
* {
    box-sizing: border-box;   /* width inclut désormais padding et border */
}
```

Mets cette règle en haut de tout projet : `width: 300px` signifiera alors « 300px au total », ce qui est bien plus prévisible.

## Le positionnement et la mise en page moderne

CSS moderne a deux systèmes de mise en page puissants qui ont remplacé les vieux hacks (floats, tables) :

**Flexbox** — pour aligner des éléments sur **une dimension** (une ligne ou une colonne). Idéal pour les barres de navigation, les cartes alignées, le centrage.

```css
.conteneur {
    display: flex;
    justify-content: space-between;   /* répartition horizontale */
    align-items: center;              /* alignement vertical */
    gap: 20px;                        /* espace entre éléments */
}

/* Le centrage parfait, enfin trivial */
.centre {
    display: flex;
    justify-content: center;
    align-items: center;
}
```

**Grid** — pour les mises en page en **deux dimensions** (lignes ET colonnes). Idéal pour les layouts de page complets, les galeries.

```css
.grille {
    display: grid;
    grid-template-columns: repeat(3, 1fr);   /* 3 colonnes égales */
    gap: 16px;
}
```

Flexbox et Grid ont rendu obsolètes les techniques anciennes (float, positionnement absolu pour tout). Règle pratique : **Flexbox pour une dimension, Grid pour deux**. Le positionnement `position: absolute/relative/fixed/sticky` reste utile pour des cas précis (éléments superposés, barre qui suit le scroll).

## Le responsive design

Un site doit s'adapter à toutes les tailles d'écran (mobile, tablette, desktop). Les **media queries** appliquent des styles selon les conditions :

```css
/* Style de base (mobile-first : on écrit d'abord pour mobile) */
.conteneur { flex-direction: column; }

/* Au-delà de 768px (tablette et plus) */
@media (min-width: 768px) {
    .conteneur { flex-direction: row; }
}

/* Unités relatives pour le responsive */
/* rem = relatif à la taille de police racine ; % ; vw/vh = viewport */
.titre { font-size: 2rem; width: 90%; height: 100vh; }
```

L'approche **mobile-first** (écrire d'abord pour petit écran, puis élargir avec `min-width`) est la norme moderne. Les unités relatives (`rem`, `%`, `vw`/`vh`) plutôt que des pixels fixes rendent le design flexible.

## Les variables CSS et l'organisation

CSS moderne a de vraies variables (custom properties) :

```css
:root {
    --couleur-principale: #2563eb;
    --espacement: 16px;
    --rayon: 8px;
}

.bouton {
    background: var(--couleur-principale);
    padding: var(--espacement);
    border-radius: var(--rayon);
}
```

Les variables centralisent les valeurs répétées (couleurs de la charte, espacements) : changer `--couleur-principale` met à jour tout le site. Elles sont aussi manipulables en JavaScript, utiles pour un thème sombre/clair.

## Aspects sécurité (pour ta culture cyber)

CSS n'est pas qu'esthétique côté sécurité :

- **CSS exfiltration** — des sélecteurs d'attribut combinés à `background: url(...)` peuvent envoyer des données (valeurs de champs, tokens) à un serveur distant, sans JavaScript. Une injection CSS peut donc voler des informations.
- **Clickjacking / UI redressing** — CSS permet de superposer des éléments transparents (`opacity: 0`, `z-index`) pour piéger l'utilisateur en lui faisant cliquer sur autre chose que ce qu'il croit. Parade : l'en-tête HTTP `X-Frame-Options` / `frame-ancestors`.
- **Content Security Policy (CSP)** — une bonne CSP bloque les styles inline, ce qui limite certaines injections. C'est pourquoi le CSS externe est aussi une meilleure pratique de sécurité.

## Ce qu'il faut retenir

- CSS est un langage **déclaratif de présentation** ; garde-le séparé du HTML (structure) et du JS (comportement) via des **feuilles externes**.
- Les **sélecteurs** ciblent les éléments : classes `.nom` (réutilisables, principal outil), id `#nom` (uniques), attributs, pseudo-classes (`:hover`).
- La **cascade** et la **spécificité** déterminent quelle règle gagne (inline > id > classe > balise) ; évite `!important`.
- Le **box model** : content + padding + border + margin. Mets `box-sizing: border-box` partout pour des largeurs prévisibles.
- Mise en page moderne : **Flexbox** (1 dimension) et **Grid** (2 dimensions) ont remplacé les floats.
- **Responsive** : approche mobile-first, media queries, unités relatives (`rem`, `%`, `vw`).
- Les **variables CSS** (`--nom`, `var()`) centralisent la charte graphique.
- Côté sécurité : CSS peut servir à l'exfiltration de données et au clickjacking ; le CSS externe + une bonne CSP limitent ces risques.
