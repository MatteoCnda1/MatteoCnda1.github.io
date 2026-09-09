---
id: 00-introduction-osint
title: Introduction à l'OSINT
sidebar_position: 1
tags: [osint, methodologie]
---

# Introduction à l'OSINT

Cette série de fiches présente l'**OSINT** (Open Source Intelligence) à travers des techniques et outils concrets, organisés par type d'investigation. Cette première fiche pose les fondations indispensables : ce qu'est l'OSINT, la méthodologie, le cadre légal et éthique, et l'OPSEC de l'enquêteur. À lire avant les autres, car ces principes s'appliquent à toutes les techniques qui suivent.

## Qu'est-ce que l'OSINT

L'**OSINT** (renseignement de sources ouvertes) consiste à **collecter et analyser des informations publiquement accessibles** pour en tirer du renseignement exploitable. Le mot clé est **sources ouvertes** : on n'exploite que ce qui est légalement et publiquement disponible — pas d'intrusion, pas de mot de passe cassé, pas d'accès non autorisé. C'est ce qui distingue fondamentalement l'OSINT du hacking : aucun système n'est compromis.

Les sources ouvertes sont innombrables : moteurs de recherche, réseaux sociaux, enregistrements DNS et WHOIS, registres publics d'entreprises, bases de fuites de données publiées, journaux de transparence de certificats, images publiées, cartes, archives web, dépôts de code, etc.

Qui pratique l'OSINT et pourquoi : les **journalistes d'investigation** (Bellingcat en est l'exemple emblématique), les **enquêteurs** et forces de l'ordre, les **analystes en cybersécurité** (reconnaissance avant un test d'intrusion, threat intelligence), les recruteurs, les juristes. Pour ton profil cyber/réseau, l'OSINT est la **phase de reconnaissance** de toute démarche de sécurité : avant de défendre ou de tester un système, on cartographie ce qui est visible de l'extérieur.

## La méthodologie : collecter n'est pas le plus dur

Le piège du débutant est de croire que l'OSINT se résume à lancer des outils. En réalité, **collecter est facile ; décider de ce qui est vrai est difficile**. Une méthodologie rigoureuse fait toute la différence. Les grandes étapes :

**1. Définir l'objectif.** Que cherche-t-on exactement ? Une question précise (« cette photo a-t-elle été prise à tel endroit ? », « ce pseudo est-il lié à cette personne ? ») guide toute l'enquête et évite de se noyer.

**2. Collecter** à partir de multiples sources, sans se limiter à un seul outil.

**3. Recouper (corroborer).** C'est l'étape cruciale. Une information isolée ne vaut rien : il faut la **confirmer par plusieurs sources indépendantes**. Un seul indice peut être un faux positif, une coïncidence, ou une fausse piste délibérée.

**4. Pivoter.** Chaque information trouvée devient un **point de pivot** vers de nouvelles recherches : un pseudo mène à un email, qui mène à d'autres comptes, qui mènent à une photo, etc. L'art de l'OSINT est d'enchaîner ces pivots.

**5. Analyser et documenter.** Tirer des conclusions prudentes, et **tout noter** au fur et à mesure (voir plus bas).

Un principe d'or, hérité de la géolocalisation mais valable partout : **partir du général pour aller vers le précis**. Et un réflexe de rigueur : savoir **reconnaître un faux positif** et faire marche arrière. Se tromper fait partie du métier ; s'entêter sur une mauvaise piste est l'erreur.

## Le cadre légal et éthique

Point non négociable, à intégrer avant toute pratique. L'OSINT manipule souvent des **données personnelles**, ce qui l'expose au **RGPD** (que tu as étudié en droit). Quelques repères :

- **Collecter des informations publiquement accessibles est légal** dans la plupart des cas. Cela devient **illégal** dès qu'on accède à un système sans autorisation, qu'on contourne un contrôle d'accès, ou qu'on **traite des données personnelles sans base légale** au sens du RGPD.
- La **finalité** compte : la même donnée collectée pour une enquête légitime ou pour du harcèlement ne relève pas du même traitement juridique. Le **harcèlement, la traque (stalking), l'usurpation d'identité** sont des délits, quelle que soit la source des informations.
- Toute action qui **touche directement un système cible** (scanner, se connecter, tester) exige une **autorisation écrite**. La reconnaissance purement **passive** sur sources publiques est bien plus sûre juridiquement que l'interaction **active** avec la cible.

La règle éthique simple : l'OSINT s'apprend et se pratique dans un cadre **éducatif, défensif et autorisé**. On s'entraîne sur soi-même, sur des cibles de consentement, ou sur des défis conçus pour ça (CTF, challenges de géolocalisation). On n'enquête pas sur des personnes réelles sans motif légitime. Cette série de fiches est à visée éducative : les techniques servent à **comprendre les risques** et à **se protéger** autant qu'à investiguer.

Un corollaire directement utile : comprendre l'OSINT, c'est comprendre **ta propre exposition**. Chaque technique de ces fiches peut être retournée contre toi — d'où l'importance de savoir ce qu'on peut trouver sur soi pour réduire son empreinte numérique.

## L'OPSEC de l'enquêteur

L'**OPSEC** (Operational Security) désigne les précautions pour ne pas se compromettre soi-même pendant une investigation. Car l'OSINT n'est pas toujours à sens unique : consulter une cible peut laisser des traces (une visite de profil, une requête depuis ton IP).

Bonnes pratiques de base :
- **Séparer les identités** : ne jamais enquêter avec ses comptes personnels. On utilise des comptes dédiés (« sock puppets ») et un environnement séparé.
- **Masquer son origine** : un VPN ou un environnement isolé (machine virtuelle dédiée) évite d'exposer son IP réelle à la cible ou aux plateformes.
- **Ne pas interagir** avec la cible : consulter, oui ; liker, suivre, contacter, non — cela alerte la cible et laisse des traces.
- **Tout documenter** : garder des notes horodatées, des captures, l'origine de chaque information. C'est indispensable pour recouper, pour la crédibilité (surtout en contexte journalistique ou judiciaire), et pour retrouver son chemin.

## Comment cette série est organisée

Les fiches suivantes, par type d'investigation :

- **OSINT sur un pseudo (username)** — retrouver les comptes liés à un pseudonyme sur des centaines de plateformes.
- **OSINT sur un email** — ce qu'un email révèle : comptes associés, fuites, présence sur des services.
- **OSINT sur un numéro de téléphone** — informations tirées d'un numéro.
- **Géolocalisation d'image** — déterminer où une photo a été prise (EXIF, recherche inversée, indices visuels).
- **OSINT réseau et infrastructure** — DNS, WHOIS, sous-domaines, Shodan : cartographier la présence en ligne d'une organisation.

Chaque fiche présente les concepts, les outils (en privilégiant le gratuit et l'open source), des exemples et des cas d'usage — toujours dans le cadre éthique posé ici.

:::note Ressource
Cette série s'inspire notamment des contenus de la chaîne **Parlons Cyber** (OSINT en français) et de références comme **Bellingcat** et l'**OSINT Framework**. Ces sources sont d'excellents points d'approfondissement.
:::

## Ce qu'il faut retenir

- L'**OSINT** = collecter et analyser des informations **publiquement accessibles** ; aucune intrusion, ce qui le distingue du hacking. C'est la phase de **reconnaissance** en cybersécurité.
- Méthodologie : **objectif → collecte → recoupement → pivot → analyse/documentation**. Le difficile n'est pas de collecter mais de **décider de ce qui est vrai** ; toujours **corroborer** par plusieurs sources et savoir **reconnaître un faux positif**. Aller **du général au précis**.
- **Cadre légal** (RGPD) : le public est généralement légal ; l'intrusion, le contournement d'accès et le traitement de données personnelles sans base légale ne le sont pas. Le **harcèlement/stalking** est un délit quelle que soit la source. Toute action **active** sur une cible exige une **autorisation**.
- **Éthique** : pratique éducative, défensive et autorisée uniquement ; comprendre l'OSINT sert aussi à **réduire sa propre empreinte**.
- **OPSEC** de l'enquêteur : identités séparées, origine masquée (VPN/VM), ne pas interagir avec la cible, tout documenter.
