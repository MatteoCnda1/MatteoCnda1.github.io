---
id: 06-securite-reseaux-anssi-nis
title: La sécurité des réseaux (ANSSI, NIS2, LPM, OIV)
sidebar_position: 7
---

# La sécurité des réseaux : le cadre juridique (ANSSI, NIS2, LPM, OIV)

La cybersécurité n'est pas qu'une affaire technique : c'est un domaine de plus en plus **encadré par la loi**. L'État impose des obligations de sécurité à certaines organisations, sous peine de sanctions. Pour un technicien R&T ou un futur professionnel de la cybersécu, connaître ce cadre — les acteurs, les textes, les obligations — est essentiel : c'est lui qui dicte une partie de ton travail. Ce cours fait le tour du paysage réglementaire français et européen de la sécurité des systèmes d'information.

## L'ANSSI : l'autorité nationale

L'**ANSSI** (Agence Nationale de la Sécurité des Systèmes d'Information), créée en 2009, est l'**autorité nationale en matière de cybersécurité** en France. Rattachée au Premier ministre (via le SGDSN), elle a un rôle central et plusieurs missions :

- **Défendre** les systèmes d'information de l'État et des acteurs critiques (elle intervient en cas d'attaque majeure, comme un rançongiciel sur un hôpital).
- **Réglementer** : elle définit des règles, des référentiels et des recommandations de sécurité.
- **Contrôler** le respect des obligations de sécurité des acteurs régulés.
- **Sensibiliser et accompagner** : elle publie des guides (très utiles et gratuits), des recommandations, et qualifie des produits et prestataires de sécurité.
- **Qualifier** : elle délivre des visas de sécurité (produits qualifiés, prestataires PASSI pour l'audit, etc.).

C'est un acteur incontournable que tu croiseras constamment en cybersécu : ses guides sont des références, et si tu travailles pour un acteur régulé, c'est elle qui fixe les règles et contrôle. À noter : l'ANSSI a un rôle **défensif** (protection), distinct des services de renseignement offensifs.

## Les OIV et la Loi de Programmation Militaire

La France a été **pionnière** dans la régulation de la cybersécurité des infrastructures critiques, avant même l'Europe. Le texte fondateur est la **Loi de Programmation Militaire** (LPM) de 2013, qui a introduit la notion d'**OIV**.

Un **OIV** (Opérateur d'Importance Vitale) est une organisation — publique ou privée — dont l'activité est **essentielle au fonctionnement de la nation** et dont l'arrêt mettrait gravement en danger le pays. Il y en a environ 200-300 (la liste précise est classifiée), répartis dans des secteurs d'activité d'importance vitale : énergie, eau, transports, santé, télécommunications, banque, alimentation, etc.

La LPM impose aux OIV des obligations fortes, sous le contrôle de l'ANSSI :

- Mettre en œuvre des **mesures de sécurité** définies par l'État sur leurs systèmes d'information les plus critiques (les SIIV, Systèmes d'Information d'Importance Vitale).
- **Déclarer les incidents** de sécurité à l'ANSSI.
- Se soumettre à des **contrôles** et audits.
- En cas de crise majeure, l'ANSSI peut imposer des mesures.

Cette approche — l'État qui impose la sécurité aux acteurs critiques — était novatrice et a inspiré le cadre européen qui a suivi. Le non-respect des obligations OIV est sanctionné.

## La directive NIS (2016) et les OSE

L'Europe a ensuite emboîté le pas avec la **directive NIS** (Network and Information Security) de 2016, première législation européenne sur la cybersécurité. Étant une **directive**, elle a dû être transposée dans chaque pays (en France, par une loi de 2018).

NIS a étendu la logique française au-delà des seuls OIV, en créant la notion d'**OSE** (Opérateur de Services Essentiels) : des acteurs importants dans des secteurs clés (énergie, transports, santé, banque, eau, infrastructures numériques...), soumis à des obligations de sécurité et de déclaration d'incidents, mais moins critiques que les OIV. NIS a aussi visé les **FSN** (Fournisseurs de Services Numériques) comme les places de marché, moteurs de recherche, clouds.

NIS « 1 » concernait un nombre relativement limité d'acteurs en France (quelques centaines). Elle a posé les bases, mais s'est révélée trop étroite face à l'explosion des cybermenaces — d'où sa refonte.

## NIS2 : le grand élargissement

La **directive NIS2** (règlement... non, directive UE 2022/2555, adoptée fin 2022) remplace NIS1 et **élargit massivement** le champ de la régulation cyber en Europe. C'est le texte majeur du moment, à connaître absolument.

Ce que NIS2 change :

**Un périmètre énorme** — Là où NIS1 concernait environ 500 entités en France, NIS2 en vise **autour de 15 000**, réparties sur **18 secteurs** (contre 7 avant). Cela inclut désormais des acteurs qui ne s'étaient jamais sentis concernés : PME, ETI, collectivités territoriales, sous-traitants... Le champ couvre énergie, transport, santé, banque, infrastructures numériques, administration publique, gestion des déchets, agroalimentaire, fabrication de produits critiques, recherche, et plus.

**Deux catégories** — NIS2 abandonne les anciennes notions (OSE/FSN) pour distinguer :
- Les **entités essentielles (EE)** — les plus critiques, généralement les grandes entreprises de secteurs hautement critiques (seuils indicatifs : plus de 250 salariés ou plus de 50 M€ de CA).
- Les **entités importantes (EI)** — de taille intermédiaire ou dans des secteurs critiques (seuils indicatifs : plus de 50 salariés ou plus de 10 M€ de CA).

Certaines entités sont concernées **quelle que soit leur taille** (fournisseurs DNS, registres de noms de domaine, opérateurs télécoms, prestataires de services de confiance).

**Des obligations renforcées** — Gestion des risques cyber structurée, mesures de sécurité, notification des incidents significatifs (avec des délais courts, de l'ordre de 24-72h selon l'étape), enregistrement auprès de l'autorité (l'ANSSI en France).

**La responsabilité des dirigeants** — Innovation majeure : les **dirigeants** doivent approuver et superviser les mesures de cybersécurité, suivre des formations, et engagent leur **responsabilité personnelle** en cas de manquement. La cybersécurité devient une affaire de conseil d'administration, plus seulement de DSI.

**Des sanctions lourdes** — Jusqu'à **10 millions d'euros ou 2 % du chiffre d'affaires mondial** pour les entités essentielles (montants inspirés du RGPD).

**Point de situation (2026)** : NIS2 est une directive européenne en vigueur, mais elle nécessite une **transposition** par une loi nationale pour être pleinement applicable en France. Cette transposition se fait via le projet de **loi relative à la résilience des infrastructures critiques et au renforcement de la cybersécurité** (dite « loi Résilience »), qui transpose d'un coup trois directives (NIS2, REC sur la résilience des entités critiques, et le volet DORA pour la finance). Ce texte a connu un parcours parlementaire long (adopté au Sénat en mars 2025, examiné à l'Assemblée en 2026) ; au moment d'écrire ces lignes, sa promulgation définitive et ses décrets d'application étaient encore attendus. Les obligations deviendront pleinement opposables une fois la loi promulguée et les référentiels ANSSI publiés, avec une période de mise en conformité annoncée d'environ 3 ans. **Vérifie l'état exact de la transposition au moment où tu lis ceci**, car ce dossier évolue. L'ANSSI a mis en place des outils d'accompagnement (plateforme MonEspaceNIS2, référentiel ReCyF) pour préparer les entités.

Pour toi, l'important est de comprendre la **logique** : l'Europe généralise l'obligation de cybersécurité à des dizaines de milliers d'organisations, avec responsabilisation des dirigeants et sanctions. Beaucoup d'entreprises où tu travailleras seront concernées, et la mise en conformité NIS2 sera un chantier majeur des années à venir — une opportunité professionnelle pour les profils cyber.

## Les autres textes et notions à connaître

Le paysage réglementaire cyber comporte d'autres pièces utiles à situer :

**Le RGPD** — La protection des données personnelles (cours suivant), qui recoupe la cybersécurité sur le volet « sécurité des données ». RGPD et NIS2 se cumulent souvent.

**DORA** (Digital Operational Resilience Act) — Un règlement européen spécifique au **secteur financier**, sur la résilience opérationnelle numérique (banques, assurances). Il impose des exigences cyber renforcées à la finance.

**La directive REC** (Résilience des Entités Critiques) — Le pendant « physique » de NIS2 : elle vise la résilience des infrastructures critiques face à tous types de menaces (pas seulement cyber). Transposée dans la même loi Résilience.

**Le règlement Cyber Resilience Act (CRA)** — Un texte européen imposant des exigences de cybersécurité aux **produits comportant des éléments numériques** (objets connectés, logiciels). Pertinent pour l'embarqué et l'IoT.

**Les certifications et qualifications** — Au-delà des obligations légales, il existe des référentiels (ISO 27001 pour le management de la sécurité, la qualification ANSSI des prestataires PASSI/PRIS...) qui structurent la profession.

## Ce que ça implique pour ton métier

Concrètement, ce cadre juridique se traduit par des tâches et responsabilités pour un technicien/administrateur R&T :

- **Mettre en œuvre les mesures de sécurité** exigées (durcissement, segmentation, journalisation, gestion des accès, chiffrement...) — le lien direct avec tes cours techniques.
- **Détecter et déclarer les incidents** dans les délais légaux — la réponse à incident devient une obligation, pas une option.
- **Documenter** la conformité (l'accountability, comme en RGPD) : pouvoir prouver que les mesures sont en place.
- **Dialoguer avec l'ANSSI** et les autorités si l'organisation est régulée.
- **Participer aux audits** et à la préparation des certifications.

Autrement dit, la réglementation transforme la cybersécurité d'une bonne pratique optionnelle en une **obligation légale traçable**, ce qui crée une demande forte de professionnels compétents. C'est un contexte porteur pour ton orientation.

## Ce qu'il faut retenir

- L'**ANSSI** est l'autorité nationale de cybersécurité (défense, réglementation, contrôle, guides, qualifications) — un acteur incontournable, à rôle défensif.
- La France a été **pionnière** avec la **LPM (2013)** et les **OIV** (opérateurs d'importance vitale, ~200-300, secteurs vitaux) soumis à des obligations fortes sous contrôle ANSSI.
- La **directive NIS (2016)** a étendu la logique à l'échelle européenne avec les **OSE** ; **NIS2 (2022)** élargit massivement (de ~500 à ~15 000 entités en France, 18 secteurs), avec deux catégories (**entités essentielles / importantes**), la **responsabilité personnelle des dirigeants**, et des sanctions jusqu'à **10 M€ ou 2 % du CA**.
- NIS2 est transposée en France par la **loi Résilience** (avec REC et DORA) ; sa promulgation et ses décrets étaient attendus en 2026 — **vérifie l'état actuel**.
- Textes voisins : **RGPD** (données, se cumule), **DORA** (finance), **REC** (résilience physique), **CRA** (produits numériques/IoT).
- Pour ton métier : ce cadre transforme la sécurité en **obligation légale traçable** (mesures, déclaration d'incidents, documentation, audits) — forte demande de profils cyber.
