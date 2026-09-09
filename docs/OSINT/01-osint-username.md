---
id: 01-osint-username
title: OSINT sur un pseudo (username)
sidebar_position: 2
tags: [osint]
---

# OSINT sur un pseudo (username)

Retrouver les comptes associés à un **pseudonyme** est l'une des techniques OSINT les plus courantes et les plus efficaces. Cette fiche explique le principe, les outils, et comment exploiter les résultats — dans le cadre éthique posé en introduction.

## Le principe : la réutilisation des pseudos

L'idée de départ est simple mais puissante : **les gens réutilisent le même pseudo** sur de nombreuses plateformes. Quelqu'un qui s'appelle `jdupont_42` sur un forum a de bonnes chances d'utiliser le même identifiant sur GitHub, Reddit, Instagram, Steam, etc. Un pseudo est donc un **point de pivot** majeur : à partir d'un seul identifiant, on peut découvrir tout un réseau de comptes appartenant potentiellement à la même personne.

L'objectif de l'investigation sur username est de **recenser toutes les plateformes** où un pseudo est utilisé, puis d'analyser ces comptes pour recouper des informations (photos, centres d'intérêt, autres pseudos, email, localisation...). Chaque compte trouvé est un nouveau point de pivot.

**Avertissement méthodologique** : un même pseudo sur deux plateformes ne prouve **pas** qu'il s'agit de la même personne. Les pseudos courants sont partagés par des gens différents. C'est un indice à **corroborer**, jamais une preuve en soi — le faux positif est ici très fréquent.

## Les outils de recherche de pseudo

Ces outils testent automatiquement la présence d'un pseudo sur des centaines, voire des milliers de plateformes.

**Sherlock** — L'outil de référence, open source et en ligne de commande. Il recherche un pseudo sur plus de 480 sites et renvoie les URL des comptes trouvés. Rapide et fiable, c'est le standard pour débuter.

```bash
# Installation (Python)
pipx install sherlock-project
# Recherche d'un pseudo
sherlock nom_utilisateur
```

**Maigret** — Un dérivé de Sherlock, bien plus large (plus de 2500 sites) et qui va jusqu'à extraire des informations des profils trouvés. Plus complet, mais plus lent et avec davantage de faux positifs — à réserver quand on veut ratisser large.

```bash
pipx install maigret
maigret nom_utilisateur
```

**WhatsMyName** — Une approche par le web (interface en ligne) couvrant plusieurs centaines de plateformes, sans installation. Pratique quand on ne veut pas installer d'outil. C'est aussi un projet dont la liste de sites alimente d'autres outils.

**Les agrégateurs** — Des outils comme les CLI unifiées récentes (type `omniscan`) ou des interfaces web (comme celles présentées par les chaînes OSINT) combinent plusieurs de ces moteurs (Sherlock, Maigret...) en une seule requête. Pratiques, mais comprendre les outils sous-jacents reste préférable.

## Exploiter les résultats

Trouver les comptes n'est que le début. L'analyse consiste à **extraire et recouper** ce que chaque compte révèle :

- **Photos de profil** — souvent réutilisées elles aussi ; une recherche d'image inversée (voir la fiche géolocalisation) sur une photo de profil peut relier des comptes qui ont des pseudos différents.
- **Informations de profil** — bio, ville, langue, liens vers d'autres comptes ou un site personnel.
- **Autres pseudos et emails** — un profil mentionne parfois un autre identifiant ou un email, nouveaux points de pivot (voir la fiche email).
- **Activité** — centres d'intérêt, fuseau horaire (déduit des heures de publication), langue, contacts récurrents.

L'idée est de **construire un profil** en croisant ces éléments, chaque nouvelle donnée ouvrant de nouvelles pistes. C'est l'enchaînement des pivots qui fait la richesse d'une enquête.

## Cas d'usage

- **Défensif / personnel** : rechercher son **propre** pseudo pour découvrir tout ce qui est associé à son identité en ligne, et réduire son empreinte (supprimer de vieux comptes oubliés, uniformiser sa confidentialité). Excellent exercice de prise de conscience.
- **Cybersécurité** : lors d'une reconnaissance autorisée, cartographier l'empreinte numérique d'une cible (employés d'une entreprise, par exemple) pour évaluer la surface d'ingénierie sociale.
- **Investigation** : relier des comptes dans le cadre d'une enquête légitime (journalisme, forces de l'ordre).

Rappel du cadre : ces techniques ne s'emploient que sur soi-même, sur des cibles de consentement, ou dans un contexte autorisé. La recherche de pseudo est un outil puissant d'atteinte à la vie privée si détournée.

## Bonnes pratiques

- **Tester des variantes** du pseudo (avec/sans chiffres, underscores, points) : les gens déclinent souvent leur identifiant.
- **Vérifier chaque résultat manuellement** : les outils produisent des faux positifs (compte inexistant signalé comme trouvé, ou homonyme). Toujours ouvrir et confirmer.
- **Corroborer avant de conclure** : ne jamais affirmer que deux comptes sont la même personne sur la seule base d'un pseudo identique.
- **Documenter** les comptes trouvés avec leur URL et la date.

## Ce qu'il faut retenir

- Les gens **réutilisent leurs pseudos** : un username est un **point de pivot** majeur pour découvrir un réseau de comptes.
- Outils clés : **Sherlock** (référence, 480+ sites, CLI open source), **Maigret** (2500+ sites, plus complet mais plus de faux positifs), **WhatsMyName** (web, sans installation), et les agrégateurs qui les combinent.
- Trouver les comptes n'est qu'un début : **exploiter** photos de profil (recherche inversée), bios, autres pseudos/emails, activité — chaque élément est un nouveau pivot.
- **Un pseudo identique n'est pas une preuve** d'identité commune : corroborer systématiquement, vérifier chaque résultat, tester des variantes.
- Cas d'usage phare et sain : rechercher **son propre** pseudo pour maîtriser son empreinte numérique.
