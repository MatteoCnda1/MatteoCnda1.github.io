---
id: 00-introduction-entreprise
title: L'entreprise et son organisation
sidebar_position: 1
---

# L'entreprise et son organisation

## Pourquoi le droit concerne un technicien R&T

On pourrait croire que le droit est loin des préoccupations d'un technicien réseaux et télécoms. C'est faux, et de plus en plus faux. Un technicien R&T se trouve à un carrefour juridique particulier pour deux raisons.

D'abord, comme **salarié** (ou indépendant), il évolue dans un cadre — contrat de travail, convention collective, droits et obligations — qu'il vaut mieux comprendre pour ne pas le subir. Savoir lire son contrat, sa fiche de paie, connaître ses droits en cas de conflit, c'est s'insérer sereinement dans le monde professionnel.

Ensuite, et c'est plus spécifique, le métier lui-même **manipule des objets juridiquement sensibles** : des données personnelles (RGPD), des systèmes d'information dont la sécurité est encadrée par la loi (ANSSI, NIS2, LPM), des communications électroniques soumises à des règles de confidentialité et de conservation. Concevoir une base de données, gérer des comptes utilisateurs, superviser un réseau, répondre à une réquisition judiciaire : chacune de ces tâches banales du quotidien a une dimension légale. Un technicien qui l'ignore expose son employeur — et parfois lui-même — à des sanctions lourdes.

Cette section couvre donc les deux volets : le **droit du travail** (ton environnement de salarié) et le **droit du numérique** (l'environnement juridique propre aux R&T : responsabilité des acteurs, sécurité des réseaux, RGPD). L'objectif n'est pas de faire de toi un juriste, mais de te donner les repères pour reconnaître les enjeux, dialoguer avec les experts (juristes, DPO, avocats), et agir en connaissance de cause.

## Se situer dans l'entreprise

Avant le droit, un peu de compréhension de l'organisation où tu vas travailler. Une entreprise n'est pas une masse indistincte : elle est structurée en **fonctions** qui remplissent chacune un rôle. Comprendre cette carte t'aide à savoir à qui parler, où se situe ton poste, et comment ta mission technique s'articule avec le reste.

Les grandes fonctions qu'on retrouve dans la plupart des entreprises :

**La fonction technique / production** — Elle crée le produit ou le service. Pour un technicien R&T, c'est souvent ton camp : la DSI (Direction des Systèmes d'Information), l'exploitation, le support, l'infrastructure réseau. C'est là que se conçoivent, se déploient et se maintiennent les systèmes.

**La fonction commerciale / marketing** — Elle vend, prospecte, fidélise, étudie le marché. Même en tant que technicien, tu interagis avec elle : un commercial vend une prestation que tu devras réaliser, il faut donc que le technique et le commercial se parlent (une promesse commerciale intenable techniquement est un problème classique).

**La fonction administrative et financière** — Comptabilité, gestion, finance, contrôle de gestion. Elle gère l'argent, les budgets, la paie. C'est elle qui valide (ou non) l'achat du matériel que tu demandes.

**La fonction ressources humaines (RH)** — Recrutement, contrats, paie, formation, relations sociales, gestion des conflits. C'est ton interlocuteur pour tout ce qui touche à ton statut de salarié (le sujet des cours suivants).

**La fonction managériale / direction** — Elle pilote, décide de la stratégie, coordonne les autres fonctions. La hiérarchie (ton chef d'équipe, le responsable de service, le directeur) en fait partie.

**La fonction juridique** — Présente dans les grandes entreprises (un service juridique, des juristes), externalisée dans les plus petites (avocats, conseils). Elle gère les contrats, la conformité, les litiges. En R&T, elle est de plus en plus sollicitée sur les questions numériques (RGPD, cybersécurité, réquisitions).

## Les formes juridiques d'entreprise

L'entreprise elle-même a un statut juridique qui détermine ses règles. Quelques repères utiles, notamment si tu envisages d'être indépendant :

**L'entreprise individuelle / micro-entreprise** — Une personne physique exerce en son nom. Simple à créer (le régime de la micro-entreprise, ex-auto-entrepreneur, est très allégé), mais responsabilité personnelle. Beaucoup de techniciens indépendants (prestataires, consultants) commencent ainsi.

**Les sociétés** — Une personne morale distincte de ses associés, ce qui protège leur patrimoine personnel (responsabilité limitée aux apports). Les formes courantes : SARL (société à responsabilité limitée), SAS (société par actions simplifiée, très souple et populaire dans la tech), SA (société anonyme, pour les grandes structures). Une société a sa propre existence juridique : elle contracte, embauche, est responsable en son nom.

Cette distinction **personne physique / personne morale** est fondamentale en droit : une personne morale (une entreprise) a des droits et des obligations propres, peut être poursuivie, condamnée, sanctionnée — c'est pourquoi une entreprise peut recevoir une amende RGPD de plusieurs millions d'euros.

## Salarié ou indépendant : deux statuts, deux logiques

Ton programme mentionne « salarié ou indépendant ». La différence est structurante pour toute la suite.

**Le salarié** travaille sous la **subordination juridique** d'un employeur : il reçoit des ordres, respecte des horaires, utilise les moyens fournis, en échange d'un salaire et de protections (sécurité sociale, chômage, congés, protection contre le licenciement). C'est le cœur du droit du travail, qu'on étudie dans les prochains cours. Le lien de subordination est le critère juridique clé qui définit le salariat.

**L'indépendant** (freelance, prestataire, consultant) travaille pour son propre compte, pour des clients, sans lien de subordination. Il est plus libre (il organise son travail, choisit ses missions) mais moins protégé (pas de chômage classique, il gère lui-même sa protection sociale, ses cotisations, sa prospection). Il est lié à ses clients par des **contrats de prestation** (droit commercial), pas par un contrat de travail.

Un point de vigilance juridique important : le **salariat déguisé**. Si un « indépendant » travaille en réalité comme un salarié (un seul client, des horaires imposés, une subordination de fait), les tribunaux peuvent requalifier la relation en contrat de travail, avec de lourdes conséquences pour le « client »-employeur. C'est un sujet sensible dans la tech et l'économie des plateformes.

## Où trouve-t-on le droit ? La hiérarchie des normes

Pour comprendre la suite, il faut savoir que le droit est organisé en une **hiérarchie des normes** : les règles s'empilent, et une norme inférieure ne peut pas contredire une norme supérieure. Du haut vers le bas :

1. **Le bloc constitutionnel** — la Constitution, au sommet.
2. **Le droit international et européen** — traités, règlements et directives de l'UE. Point crucial pour toi : le **RGPD est un règlement européen** (directement applicable dans tous les États) tandis que **NIS2 est une directive** (qui doit être transposée par une loi nationale). Cette distinction règlement/directive revient tout le temps en droit du numérique.
3. **La loi** — votée par le Parlement (par exemple la loi Informatique et Libertés, la loi de programmation militaire).
4. **Les règlements** — décrets et arrêtés du pouvoir exécutif, qui précisent l'application des lois.
5. **Les conventions collectives et accords** — négociés entre employeurs et syndicats, ils adaptent le droit du travail à chaque secteur (on y revient).
6. **Le contrat de travail et le règlement intérieur** — au niveau de l'entreprise.

Cette pyramide explique beaucoup de choses : pourquoi une convention collective ne peut pas être moins favorable que la loi sur les points essentiels, pourquoi le RGPD s'impose partout en Europe sans transposition, pourquoi la France a dû voter une loi pour appliquer NIS2. Garde cette hiérarchie en tête, elle structure tout le reste de la section.

## Distinction droit public / droit privé

Dernière grande distinction utile. Le droit se divise en deux grands ensembles :

- **Le droit privé** régit les relations entre personnes privées (particuliers, entreprises). Le droit du travail, le droit commercial, le droit civil en font partie. Les litiges relèvent des tribunaux judiciaires (dont le conseil de prud'hommes pour le travail).
- **Le droit public** régit l'État et les relations avec les administrations. Le droit administratif en fait partie. C'est le cas quand la CNIL (autorité administrative) sanctionne, ou quand l'ANSSI impose des obligations : les recours relèvent alors des tribunaux administratifs (Conseil d'État).

Cette distinction explique pourquoi une sanction de la CNIL (droit public/administratif) se conteste devant le Conseil d'État, tandis qu'un litige avec ton employeur (droit privé) se règle aux prud'hommes.

## Ce qu'il faut retenir

- Le technicien R&T est à un **carrefour juridique** : comme salarié (droit du travail) et par la nature de son métier (données, sécurité, communications → droit du numérique).
- L'entreprise s'organise en **fonctions** (technique, commerciale, financière, RH, managériale, juridique) ; savoir s'y situer facilite le travail.
- Distinction fondamentale **personne physique / personne morale** : une entreprise (personne morale) a une existence juridique propre et peut être sanctionnée.
- **Salarié** (lien de subordination, protégé, droit du travail) vs **indépendant** (autonome, contrats de prestation, moins protégé) ; attention au salariat déguisé.
- La **hiérarchie des normes** structure le droit : Constitution > droit européen > loi > règlements > conventions collectives > contrat. Le **RGPD est un règlement** (applicable directement), **NIS2 une directive** (à transposer).
- Distinction **droit privé** (relations privées, prud'hommes) / **droit public** (État et administrations, CNIL, ANSSI, Conseil d'État).
