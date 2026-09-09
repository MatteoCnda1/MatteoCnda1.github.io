---
id: 09-cas-pratiques-international
title: Cas pratiques et dimension internationale
sidebar_position: 10
tags: [droit]
---

# Cas pratiques et dimension internationale

Ce dernier cours met en perspective tout ce qui précède à travers des situations concrètes du métier, et aborde une difficulté propre aux réseaux : ils sont **internationaux**, alors que le droit est **national**. Comment appliquer des règles nationales à des échanges qui traversent les frontières ? C'est un enjeu majeur pour un technicien R&T.

## Le problème : réseaux mondiaux, droits nationaux

Internet ne connaît pas les frontières : une donnée peut transiter par plusieurs pays en une fraction de seconde, un serveur peut être en Irlande, l'entreprise aux États-Unis, l'utilisateur en France. Or le **droit reste largement national** (ou régional, comme le droit européen). Cela crée des tensions et des questions permanentes :

- **Quelle loi s'applique** à un échange international de données ?
- **Quel tribunal est compétent** en cas de litige transfrontalier ?
- Comment faire respecter une décision française à un acteur étranger ?
- Que se passe-t-il quand deux droits nationaux se contredisent (par exemple, une loi étrangère exige la communication de données que le RGPD interdit de transférer) ?

Ces questions relèvent du **droit international privé** et sont d'une grande complexité. Pour un technicien, l'important est d'avoir conscience de ces enjeux et de savoir qu'ils existent, pour alerter et travailler avec les juristes quand une situation internationale se présente.

## Les transferts de données hors de l'Union européenne

C'est l'application la plus concrète pour toi, et un vrai casse-tête du quotidien. Le RGPD **protège les données des personnes de l'UE**, y compris quand elles sortent de l'Union. Il **encadre strictement les transferts de données personnelles vers des pays tiers** (hors UE), pour éviter que la protection ne s'évapore une fois les données parties à l'étranger.

Le principe : on ne peut transférer des données hors UE que si le pays de destination offre un **niveau de protection adéquat**. Plusieurs mécanismes le permettent :

- **La décision d'adéquation** — La Commission européenne reconnaît que certains pays offrent une protection équivalente (Japon, Royaume-Uni, etc.). Vers ces pays, le transfert est libre.
- **Les clauses contractuelles types (CCT / SCC)** — Des contrats standardisés par lesquels l'importateur des données s'engage à respecter des garanties. C'est le mécanisme le plus courant.
- **Les règles d'entreprise contraignantes (BCR)** — Pour les transferts internes à un groupe multinational.
- **Des dérogations** ponctuelles (consentement explicite, exécution d'un contrat...).

Le cas emblématique est celui des **États-Unis**. À cause de la surveillance de masse américaine, la justice européenne a invalidé successivement les accords de transfert UE-USA (les arrêts « Schrems I » et « Schrems II » ont annulé le Safe Harbor puis le Privacy Shield). Un nouveau cadre (le « Data Privacy Framework ») a été adopté, mais reste juridiquement fragile et contesté. C'est un feuilleton juridique permanent.

**Pourquoi ça te concerne directement** : dès que tu utilises un **service cloud américain** (AWS, Azure, Google Cloud, un SaaS US...) pour stocker ou traiter des données personnelles de personnes européennes, tu réalises un **transfert hors UE** qui doit être encadré. Le choix d'un hébergeur, d'un outil, d'un fournisseur cloud a donc une dimension juridique. C'est un point de vigilance croissant, avec la montée du « cloud souverain » (des offres garantissant que les données restent en Europe, sous droit européen). Concevoir une architecture, c'est aussi choisir où vivront les données — une décision technique **et** juridique.

## Cas pratique 1 : la réquisition judiciaire chez un FAI

Reprenons le cas concret de ton programme : un FAI professionnel est sollicité par la police ou la justice pour transmettre des données clients dans le cadre d'une enquête.

La situation type : les enquêteurs ont une adresse IP (repérée dans une enquête) et veulent connaître l'abonné derrière cette IP à un instant donné. Ils adressent une **réquisition** au FAI.

Ce qui se joue juridiquement :
- Le FAI doit **vérifier la régularité** de la demande (émane-t-elle d'une autorité compétente ? Est-elle fondée ?).
- Il consulte ses **logs de connexion** (qu'il a l'obligation de conserver un certain temps) pour faire le lien IP → abonné.
- Il communique les données demandées, **dans le strict cadre de la réquisition** (pas plus que ce qui est demandé).
- Le tout doit respecter à la fois l'obligation de coopérer avec la justice **et** les règles de protection des données (ne pas divulguer au-delà du légal).

Pour le technicien qui traite ces demandes (souvent une équipe dédiée, en lien avec le juridique), c'est un équilibre délicat entre coopération obligatoire et protection des données. Répondre à une fausse réquisition (ingénierie sociale) ou communiquer trop de données sont des risques réels. D'où des procédures internes strictes.

## Cas pratique 2 : la conception d'un système RGPD-compatible

Situation : ton entreprise te demande de concevoir une nouvelle application qui gère des données clients (un CRM, un portail utilisateur...).

Les réflexes juridiques à avoir, en plus des aspects techniques :
- **Identifier les données personnelles** collectées et leur finalité (Privacy by Design).
- **Minimiser** : ne collecter que le nécessaire.
- **Définir les durées de conservation** et prévoir la purge automatique.
- **Prévoir les droits des personnes** : pouvoir extraire, rectifier, supprimer leurs données.
- **Sécuriser** : chiffrement, contrôle d'accès, protection contre les injections.
- **Documenter** pour le registre des traitements, et évaluer si une **AIPD** est nécessaire.
- **Vérifier les transferts** : où seront hébergées les données ? Un cloud hors UE ?
- **Travailler avec le DPO** dès le début.

Ce cas montre que la conformité n'est pas une contrainte ajoutée à la fin, mais une dimension de la conception technique elle-même.

## Cas pratique 3 : gérer une fuite de données

Situation : tu détectes qu'une base de données a été compromise (accès non autorisé, exfiltration de données clients).

La chaîne de réaction :
- **Détecter et qualifier** : est-ce bien une violation de données personnelles ? Quelle ampleur, quelles données, combien de personnes ?
- **Contenir** : stopper la fuite, isoler les systèmes, préserver les preuves (pour l'enquête technique et judiciaire).
- **Remonter immédiatement** : alerter la hiérarchie, le DPO, le juridique. Le compteur des 72h pour notifier la CNIL tourne.
- **Notifier** la CNIL sous 72h (via le DPO/juridique), et informer les personnes si le risque est élevé.
- **Documenter** toute la gestion de l'incident.
- **Remédier** : corriger la faille, renforcer la sécurité.

Ce scénario cumule cybersécurité (réponse à incident technique) et droit (obligations de notification RGPD, éventuellement NIS2 si l'entité est régulée, dépôt de plainte). Le technicien est au centre du dispositif. Avoir une **procédure préparée à l'avance** (un plan de réponse à incident) fait toute la différence entre une gestion maîtrisée et la panique.

## Le rôle-charnière du technicien R&T

Ce qui ressort de tous ces cas, c'est que le technicien R&T occupe une **position charnière** entre la technique et le droit. Il ne remplace pas le juriste, le DPO ou l'avocat, mais il est celui qui :

- **Traduit** les exigences juridiques en solutions techniques (sécuriser, minimiser, permettre l'exercice des droits).
- **Détecte** les situations à enjeu juridique (une fuite, une réquisition, un transfert hors UE) et **alerte**.
- **Conseille** en interne sur ce qui est techniquement faisable et sur les risques (le devoir de conseil du professionnel).
- **Documente** et prouve la conformité.

Cette double compétence — technique solide et conscience juridique — est de plus en plus recherchée. Un technicien qui comprend le droit de son domaine a une vraie valeur ajoutée : il évite des erreurs coûteuses à son employeur et sait dialoguer avec les experts.

## Se tenir à jour

Un dernier conseil, essentiel dans ce domaine : **le droit du numérique évolue vite**. NIS2 se transpose, le cadre des transferts internationaux change, de nouveaux textes arrivent (IA Act sur l'intelligence artificielle, Cyber Resilience Act sur les produits...). Ce que tu apprends aujourd'hui devra être actualisé. Les bons réflexes :

- Suivre les publications de la **CNIL** et de l'**ANSSI** (leurs sites sont des mines de ressources gratuites, guides et actualités).
- Se référer à des sources juridiques fiables plutôt qu'à des résumés approximatifs.
- Travailler avec les experts (DPO, juristes) plutôt que d'interpréter seul.
- Vérifier l'état du droit au moment où une question se pose (les montants, les seuils, les textes en cours de transposition changent).

## Ce qu'il faut retenir

- Tension fondamentale : **réseaux mondiaux, droits nationaux**. Les échanges internationaux posent des questions de loi applicable et de tribunal compétent (droit international privé, complexe).
- Les **transferts de données hors UE** sont strictement encadrés par le RGPD (décision d'adéquation, clauses contractuelles types, BCR) ; le cas **USA** est un feuilleton (Schrems, Privacy Shield invalidé, cadre actuel fragile). **Utiliser un cloud non-européen = transfert à encadrer** → dimension juridique du choix d'hébergeur (cloud souverain).
- Cas types du métier : la **réquisition judiciaire** (coopérer tout en vérifiant la régularité et sans sur-divulguer), la **conception RGPD-compatible** (Privacy by Design de bout en bout), la **gestion de fuite** (détecter, contenir, notifier sous 72h, documenter).
- Le technicien R&T occupe une **position charnière** : il traduit le droit en technique, détecte et alerte, conseille, documente. Double compétence recherchée.
- Le **droit du numérique évolue vite** : suivre CNIL et ANSSI, vérifier l'état du droit, travailler avec les experts.
