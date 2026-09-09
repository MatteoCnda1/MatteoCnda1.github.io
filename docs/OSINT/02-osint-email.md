---
id: 02-osint-email
title: OSINT sur une adresse email
sidebar_position: 3
tags: [osint]
---

# OSINT sur une adresse email

Une **adresse email** est un identifiant central de l'identité numérique : elle sert à créer la plupart des comptes en ligne. C'est donc un point de pivot très riche en OSINT. Cette fiche présente ce qu'un email peut révéler et comment, dans le cadre éthique posé en introduction.

## Ce qu'un email révèle

Une adresse email peut ouvrir plusieurs pistes :

- **Les comptes associés** : sur quels services cet email a été utilisé pour s'inscrire.
- **La présence dans des fuites de données** : cet email a-t-il été exposé dans une brèche connue (et quelles données ont fuité avec) ?
- **Des informations liées au compte** (selon le fournisseur) : nom associé, photo, activité publique.
- **La structure elle-même** : le format d'un email professionnel (ex. `prenom.nom@entreprise.fr`) révèle la convention de nommage d'une organisation, ce qui permet de déduire d'autres adresses.

L'email est aussi un **pont entre pseudo et identité réelle** : il relie souvent des comptes que rien d'autre ne connecte.

## Vérifier la présence dans les fuites de données

C'est l'un des usages les plus utiles, y compris pour se protéger.

**Have I Been Pwned (HIBP)** — Le service de référence (haveibeenpwned.com). On entre un email, et il indique dans quelles **fuites de données publiques** connues il apparaît, avec la nature des données exposées (mots de passe, adresses, numéros...). C'est gratuit et respectueux : il ne révèle pas les mots de passe, juste l'exposition.

Cas d'usage défensif majeur : vérifier **ses propres** emails sur HIBP pour savoir si on a été touché par une fuite, et donc quels mots de passe changer d'urgence. C'est une hygiène numérique de base. On peut aussi s'y abonner pour être alerté des futures fuites.

L'existence même de ces bases explique pourquoi il ne faut **jamais réutiliser un mot de passe** : un email + mot de passe fuité d'un service est aussitôt testé par les attaquants sur tous les autres services (attaque par « credential stuffing »).

## Découvrir les comptes associés à un email

**Holehe** — Outil open source qui teste un email sur plus de 120 sites en utilisant leurs fonctions de récupération de compte / inscription, pour déterminer si l'email y est enregistré — sans alerter la cible. Utile pour cartographier les services utilisés.

```bash
pipx install holehe
holehe adresse@exemple.com
```

**GHunt** — Spécialisé dans les comptes **Google**. À partir d'une adresse Gmail, il peut révéler des informations du compte Google associé (selon la configuration de confidentialité de la cible). Puissant sur cet écosystème précis.

**Les agrégateurs** (type `omniscan`) combinent Holehe, GHunt et d'autres pour croiser email et pseudo en une requête.

## Trouver et déduire des emails

Le sens inverse : à partir d'un nom ou d'un domaine, trouver des emails.

**theHarvester** — Outil open source de reconnaissance qui collecte des emails, sous-domaines et noms associés à un domaine, à partir de sources publiques (moteurs de recherche, etc.). Très utilisé en phase de reconnaissance cyber.

```bash
theHarvester -d entreprise.fr -b all
```

**Hunter.io** — Service web qui trouve les adresses email associées à un domaine d'entreprise et **déduit le format** utilisé (`prenom.nom@`, `pnom@`...). À partir de ce format, on peut inférer l'email de n'importe quel employé dont on connaît le nom. Version gratuite limitée.

Cas d'usage cyber : lors d'une reconnaissance autorisée, déduire les emails d'une organisation permet d'évaluer sa surface d'exposition au phishing. C'est aussi ainsi que les attaquants préparent leurs campagnes — d'où l'intérêt de comprendre la technique pour s'en défendre.

## Analyser les en-têtes d'un email reçu

Un email **reçu** contient des **en-têtes** (headers) techniques riches en informations : le chemin suivi par le message (serveurs traversés), l'IP d'origine parfois, les résultats des vérifications anti-usurpation (SPF, DKIM, DMARC). Analyser ces en-têtes permet de détecter un email falsifié ou de remonter à sa source.

Cas d'usage : déterminer si un email suspect (phishing) est authentique ou usurpé, en vérifiant si le domaine expéditeur a bien passé les contrôles SPF/DKIM/DMARC et d'où le message provient réellement. Les clients mail permettent d'afficher les en-têtes bruts (« afficher l'original »).

## Cas d'usage et éthique

- **Défensif** : vérifier ses emails sur HIBP, découvrir ses propres comptes exposés, comprendre son empreinte.
- **Cybersécurité** : reconnaissance autorisée d'une organisation (surface email, exposition aux fuites).
- **Détection de phishing** : analyser les en-têtes d'un message douteux.

Rappel : investiguer l'email d'un tiers sans motif légitime relève potentiellement du traitement illicite de données personnelles (RGPD). Ces techniques s'emploient sur soi, en contexte autorisé, ou à des fins défensives.

## Ce qu'il faut retenir

- L'**email** est un identifiant central : point de pivot vers les **comptes associés**, les **fuites de données**, et un **pont pseudo ↔ identité réelle**.
- **Have I Been Pwned** : vérifier si un email apparaît dans des fuites connues — usage défensif essentiel (savoir quoi changer, ne jamais réutiliser un mot de passe pour éviter le credential stuffing).
- **Holehe** (comptes associés, 120+ sites), **GHunt** (comptes Google), **theHarvester** (emails/sous-domaines d'un domaine), **Hunter.io** (déduire le format d'email d'une entreprise).
- Les **en-têtes** d'un email reçu révèlent son cheminement et les vérifications SPF/DKIM/DMARC — clé pour détecter le **phishing**.
- Cadre : usage sur soi, défensif ou autorisé ; investiguer l'email d'un tiers sans base légale relève du RGPD.
