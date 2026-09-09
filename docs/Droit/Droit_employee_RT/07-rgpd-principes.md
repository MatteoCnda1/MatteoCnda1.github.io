---
id: 07-rgpd-principes
title: Le RGPD - Principes et concepts
sidebar_position: 8
tags: [droit]
---

# Le RGPD — Principes et concepts

Le **RGPD** (Règlement Général sur la Protection des Données) est probablement le texte juridique que tu croiseras le plus dans ta carrière R&T. Dès que tu manipules des données personnelles — et un technicien réseau/système en manipule en permanence (comptes utilisateurs, logs, bases de données) — le RGPD s'applique. Ce cours pose les concepts fondamentaux ; le suivant traite de la mise en œuvre pratique dans ton métier.

## Origine et portée

Le RGPD est un **règlement européen** entré en application le **25 mai 2018**. Rappelle-toi la distinction du premier cours : un règlement s'applique **directement** dans tous les États membres, sans transposition (contrairement à une directive comme NIS2). Le RGPD s'impose donc uniformément dans toute l'Union européenne.

En France, il complète et modernise la **loi Informatique et Libertés** de 1978 — car la France protégeait déjà les données personnelles depuis les années 70, bien avant l'Europe (là aussi, pionnière). L'autorité de contrôle française, la **CNIL** (Commission Nationale de l'Informatique et des Libertés), existe depuis 1978 et veille au respect du RGPD en France.

Point crucial sur la **portée extraterritoriale** : le RGPD s'applique non seulement aux organisations établies dans l'UE, mais aussi à celles situées **hors de l'UE** qui traitent des données de personnes se trouvant dans l'UE (par exemple une entreprise américaine qui cible des clients européens). C'est ce qui lui donne une influence mondiale et explique pourquoi des géants américains ont été sanctionnés.

## Qu'est-ce qu'une donnée personnelle ?

C'est la notion centrale, et elle est **très large**. Une **donnée à caractère personnel** est toute information se rapportant à une **personne physique identifiée ou identifiable**. « Identifiable » signifie qu'on peut la reconnaître, directement ou indirectement.

Cela inclut évidemment le nom, le prénom, l'email, mais aussi énormément de données techniques que tu manipules au quotidien :

- Une **adresse IP** (jugée donnée personnelle par la justice européenne, car elle peut mener à identifier quelqu'un).
- Un **identifiant de connexion**, un login.
- Un **cookie** ou un identifiant publicitaire.
- Une **adresse MAC**, un numéro de série d'appareil dans certains contextes.
- Des **logs** contenant des IP, des horodatages liés à des personnes.
- Des **données de géolocalisation**.

C'est fondamental pour toi : les **logs**, les **bases d'utilisateurs**, les **traces réseau** que tu gères sont très souvent des données personnelles au sens du RGPD. Tu es donc en première ligne. Une donnée vraiment **anonyme** (impossible de remonter à une personne, de façon irréversible) sort du RGPD ; mais attention, la **pseudonymisation** (remplacer un nom par un identifiant réversible) ne suffit pas — c'est toujours une donnée personnelle.

## Les catégories particulières (données sensibles)

Certaines données bénéficient d'une protection renforcée car leur usage abusif est particulièrement dangereux. Ce sont les **catégories particulières** (« données sensibles »), dont le traitement est **interdit par principe** (sauf exceptions strictes) :

- Origine raciale ou ethnique.
- Opinions politiques, convictions religieuses ou philosophiques.
- Appartenance syndicale.
- Données de santé.
- Données biométriques et génétiques (empreintes, reconnaissance faciale...).
- Données concernant la vie sexuelle ou l'orientation sexuelle.

Manipuler ces données (par exemple des données de santé dans un système hospitalier, ou de la biométrie pour du contrôle d'accès) impose des précautions maximales et souvent des autorisations spécifiques. C'est un point de vigilance fort si tes systèmes touchent à ces catégories.

## Les acteurs : responsable de traitement, sous-traitant, personne concernée

Le RGPD définit des rôles précis, qu'il faut savoir distinguer car ils portent des responsabilités différentes :

**La personne concernée** — L'individu dont les données sont traitées (le client, le salarié, l'utilisateur). C'est elle que le RGPD protège, et à qui il donne des droits.

**Le responsable de traitement** — L'entité qui **décide** des finalités et des moyens du traitement (le « pourquoi » et le « comment »). C'est généralement l'entreprise ou l'organisation. C'est le principal responsable au sens juridique.

**Le sous-traitant** — L'entité qui traite les données **pour le compte** du responsable de traitement, selon ses instructions (par exemple un hébergeur cloud, un prestataire IT, une ESN qui gère un système). Point important : depuis le RGPD, le sous-traitant a ses **propres obligations** et peut être tenu responsable, alors qu'avant seul le responsable l'était. Un contrat spécifique (le contrat de sous-traitance, article 28) doit encadrer la relation.

Pour toi : si tu travailles dans une ESN qui gère les systèmes d'un client, ton employeur est probablement **sous-traitant** au sens RGPD, avec des obligations propres. Si tu travailles en interne pour ton entreprise, celle-ci est **responsable de traitement**. Savoir dans quel rôle on se trouve détermine les obligations.

## La notion de traitement

Un **traitement** de données, c'est **toute opération** portant sur des données personnelles : collecter, enregistrer, organiser, conserver, consulter, utiliser, modifier, communiquer, effacer... Presque tout ce qu'on fait avec des données est un traitement. Même consulter ou stocker des logs est un traitement. Cette définition très large fait que le RGPD s'applique à quasiment toutes les manipulations de données personnelles.

## Les grands principes du RGPD

Le RGPD repose sur des **principes fondamentaux** (article 5) que tout traitement doit respecter. Les comprendre, c'est comprendre l'esprit du texte :

**Licéité, loyauté, transparence** — Le traitement doit avoir une **base légale** (voir ci-dessous), être loyal, et les personnes doivent être informées clairement de ce qu'on fait de leurs données.

**Limitation des finalités** — Les données sont collectées pour des **finalités déterminées, explicites et légitimes**, et ne peuvent pas être réutilisées pour autre chose d'incompatible. On ne collecte pas « au cas où » : il faut savoir pourquoi.

**Minimisation des données** — On ne collecte que les données **strictement nécessaires** à la finalité. Pas de collecte excessive. (Exemple : un formulaire d'inscription à une newsletter n'a pas besoin de la date de naissance ni de l'adresse postale.)

**Exactitude** — Les données doivent être exactes et tenues à jour ; les données inexactes doivent être corrigées ou effacées.

**Limitation de la conservation** — Les données ne sont conservées que le **temps nécessaire** à la finalité. Passé ce délai, elles doivent être supprimées ou archivées/anonymisées. On ne garde pas les données indéfiniment. (Pertinent pour tes logs : ils ont une durée de conservation à définir.)

**Intégrité et confidentialité (sécurité)** — Les données doivent être protégées par des **mesures de sécurité appropriées** contre l'accès non autorisé, la perte, la fuite. **C'est ici que ton métier de technicien est directement mobilisé** : chiffrement, contrôle d'accès, sauvegardes, protection réseau. Le RGPD fait de la sécurité une obligation légale.

**Responsabilité (accountability)** — Le responsable doit non seulement respecter ces principes, mais aussi pouvoir **démontrer** qu'il les respecte (documentation, registre, preuves). C'est un renversement : ce n'est plus à l'autorité de prouver la faute, c'est à l'organisation de prouver sa conformité.

## Les bases légales

Un traitement n'est licite que s'il repose sur au moins une **base légale** (parmi six prévues par l'article 6). On ne peut pas traiter des données personnelles sans l'une d'elles :

1. **Le consentement** — La personne a donné son accord libre, spécifique, éclairé et univoque (par exemple, cocher une case non pré-cochée pour une newsletter). Il doit pouvoir être retiré aussi facilement que donné.
2. **L'exécution d'un contrat** — Le traitement est nécessaire à un contrat avec la personne (traiter l'adresse pour livrer une commande).
3. **L'obligation légale** — Une loi impose le traitement (conserver des factures, déclarer des données sociales).
4. **La sauvegarde des intérêts vitaux** — Protéger la vie de quelqu'un (rare).
5. **La mission d'intérêt public** — Pour les organismes publics notamment.
6. **L'intérêt légitime** — Un intérêt légitime du responsable, à condition qu'il ne porte pas atteinte de façon disproportionnée aux droits des personnes (par exemple, la sécurité du réseau peut relever de l'intérêt légitime).

Le choix de la bonne base légale est un exercice concret : pour chaque traitement, il faut identifier sur quelle base il repose. Le consentement n'est pas toujours la bonne réponse (traiter le salaire d'un employé repose sur le contrat et l'obligation légale, pas sur son consentement).

## Les droits des personnes

Le RGPD donne aux personnes concernées des **droits** puissants sur leurs données, que les organisations doivent respecter (souvent avec un délai de réponse d'un mois) :

- **Droit d'information** — être informé de la collecte et de son usage.
- **Droit d'accès** — obtenir une copie de ses données et savoir comment elles sont traitées.
- **Droit de rectification** — faire corriger des données inexactes.
- **Droit à l'effacement** (« droit à l'oubli ») — faire supprimer ses données dans certains cas.
- **Droit à la limitation** — geler temporairement un traitement.
- **Droit à la portabilité** — récupérer ses données dans un format réutilisable pour les transférer ailleurs.
- **Droit d'opposition** — s'opposer à un traitement (par exemple au démarchage).
- **Droits sur les décisions automatisées** — ne pas faire l'objet d'une décision purement automatique ayant des effets importants (profilage).

Pour un technicien, ces droits ont des implications concrètes : ton système doit **techniquement permettre** de retrouver toutes les données d'une personne (droit d'accès), de les supprimer (droit à l'effacement), de les exporter (portabilité). Concevoir une base de données sans penser à ces droits, c'est se condamner à ne pas pouvoir les honorer. C'est le lien direct avec le cours suivant.

## Ce qu'il faut retenir

- Le **RGPD** est un **règlement européen** (application directe depuis 2018), complété en France par la loi Informatique et Libertés ; la **CNIL** est l'autorité de contrôle. Il a une **portée extraterritoriale**.
- Une **donnée personnelle** = toute info sur une personne identifiable, notion **très large** : IP, login, cookie, MAC, logs, bases utilisateurs en font partie. La pseudonymisation ne suffit pas ; seule l'anonymisation irréversible sort du RGPD.
- Les **données sensibles** (santé, biométrie, opinions, orientation...) sont interdites par principe, avec exceptions strictes.
- Rôles : **personne concernée** (protégée), **responsable de traitement** (décide), **sous-traitant** (traite pour le compte du responsable, avec ses propres obligations — souvent le cas d'une ESN).
- Principes clés : licéité, **limitation des finalités**, **minimisation**, exactitude, **limitation de la conservation**, **sécurité**, **accountability** (pouvoir prouver sa conformité).
- Tout traitement exige une **base légale** (consentement, contrat, obligation légale, intérêt légitime...) — le consentement n'est pas toujours la bonne.
- Les personnes ont des **droits** (accès, rectification, effacement, portabilité, opposition...) que tes systèmes doivent **techniquement permettre** d'honorer.
