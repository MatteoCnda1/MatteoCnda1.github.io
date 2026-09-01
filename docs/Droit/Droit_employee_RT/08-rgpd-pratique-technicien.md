---
id: 08-rgpd-pratique-technicien
title: Le RGPD en pratique pour le technicien R&T
sidebar_position: 9
---

# Le RGPD en pratique pour le technicien R&T

Le cours précédent a posé les principes. Celui-ci répond à la question qui te concerne directement : **concrètement, qu'est-ce que le RGPD change dans mon travail de technicien réseau/système ?** Car le RGPD n'est pas qu'une affaire de juristes : il impose des obligations **techniques** que c'est précisément ton rôle de mettre en œuvre. C'est le point de rencontre le plus direct entre le droit et ton métier.

## Le technicien, acteur clé de la conformité

Beaucoup pensent que le RGPD concerne les juristes et le DPO (délégué à la protection des données). En réalité, une grande partie des exigences RGPD sont **techniques**, et reposent donc sur les épaules des équipes R&T/DSI. Quand le RGPD parle de « mesures de sécurité appropriées », de « minimisation », de « droit à l'effacement », ce sont des personnes comme toi qui les traduisent en configurations, en code, en architecture. Tu es un maillon essentiel de la conformité, même sans être juriste.

## Le Privacy by Design et by Default

Deux principes du RGPD (article 25) s'adressent directement à la conception technique :

**Privacy by Design (protection dès la conception)** — La protection des données doit être intégrée **dès la conception** d'un système, pas ajoutée après coup. Quand tu conçois une base de données, une application, une architecture réseau, la protection de la vie privée doit être un critère de départ, au même titre que la performance ou la sécurité. Ajouter la conformité à la fin coûte plus cher et marche moins bien.

**Privacy by Default (protection par défaut)** — Les réglages par défaut doivent être les plus protecteurs. Par exemple, un service ne doit pas collecter par défaut plus de données que nécessaire, ni rendre un profil public par défaut. L'utilisateur ne devrait pas avoir à configurer pour être protégé ; il devrait l'être d'emblée.

Concrètement, pour toi : quand tu montes un système, pose-toi dès le début les questions « quelles données je collecte vraiment ? », « qui doit y accéder ? », « combien de temps je les garde ? », « comment je les protège ? ». C'est ça, le Privacy by Design.

## La sécurité des données : ton cœur de métier

Le RGPD exige des « mesures techniques et organisationnelles appropriées » pour sécuriser les données (article 32). C'est le volet le plus directement technique, et il recoupe tout ce que tu apprends en cybersécu. Les mesures attendues incluent :

- **Le contrôle d'accès** — n'autoriser l'accès aux données qu'aux personnes qui en ont besoin (principe du moindre privilège, gestion des droits, authentification forte). Un technicien qui donne des accès trop larges crée un risque RGPD.
- **Le chiffrement** — des données sensibles au repos (bases, disques) et en transit (TLS). Le RGPD encourage explicitement le chiffrement (lien direct avec ta section crypto).
- **La pseudonymisation** — remplacer les identifiants directs par des pseudonymes pour limiter les risques.
- **Les sauvegardes** — pour garantir la disponibilité et la résilience (pouvoir restaurer après un incident).
- **La journalisation** (logs) — tracer les accès pour détecter les anomalies... tout en veillant à ce que ces logs eux-mêmes respectent le RGPD (durée de conservation, accès limité).
- **La sécurité réseau** — segmentation, pare-feu, détection d'intrusion, protection contre les fuites.
- **Les tests et audits** — vérifier régulièrement l'efficacité des mesures.

Le niveau de sécurité doit être **proportionné au risque** : plus les données sont sensibles et nombreuses, plus les mesures doivent être fortes. Le RGPD ne donne pas une liste figée : il demande des mesures « appropriées » au regard des risques, ce qui laisse une marge d'appréciation (et une responsabilité) au technicien.

## La conception d'une base de données conforme

Ton programme mentionne explicitement la conception de bases de données. Voici comment le RGPD s'y traduit, en lien avec ta section SQL :

**Minimisation** — Ne crée que les colonnes nécessaires. Une table utilisateurs n'a pas besoin de stocker des données dont le service ne se sert pas. Chaque champ collecté doit avoir une justification (une finalité).

**Durée de conservation** — Prévois un mécanisme de **suppression ou d'anonymisation automatique** des données périmées. Une base qui accumule les données indéfiniment viole le principe de limitation de conservation. Techniquement : des tâches planifiées de purge, des politiques de rétention.

**Droit à l'effacement** — Ta base doit permettre de **supprimer toutes les données d'une personne** sur demande. Attention aux clés étrangères et aux données éparpillées : si les données d'un utilisateur sont dispersées dans dix tables, il faut pouvoir toutes les traiter. C'est un enjeu de conception (pense-y au moment de faire ton schéma).

**Droit d'accès et portabilité** — Tu dois pouvoir **extraire** toutes les données d'une personne, dans un format lisible. Une requête bien pensée doit permettre de rassembler ce qui la concerne.

**Sécurité** — Chiffrement des données sensibles, contrôle d'accès à la base (comptes applicatifs à privilèges limités — rappelle-toi le principe de moindre privilège du cours injection SQL), protection contre les injections SQL (une faille SQLi est aussi une violation potentielle du RGPD, puisqu'elle expose les données).

**Traçabilité** — Journaliser qui accède à quoi, pour pouvoir détecter et prouver.

Tu vois le lien : bien concevoir une base au sens technique (normalisation, sécurité, intégrité) et la concevoir au sens RGPD se rejoignent largement.

## Le registre des traitements

Une obligation phare du RGPD : tenir un **registre des activités de traitement**. C'est un document (souvent un tableau) qui recense **tous les traitements** de données personnelles de l'organisation : quelles données, pour quelle finalité, quelle base légale, qui y accède, combien de temps on les garde, quelles mesures de sécurité, y a-t-il des transferts hors UE...

Le registre est l'outil concret de l'**accountability** : il matérialise la cartographie des données et prouve que l'organisation sait ce qu'elle fait. Le technicien contribue souvent à le remplir pour la partie technique (les systèmes concernés, les mesures de sécurité, les durées). Le tenir à jour est obligatoire (sauf exceptions pour les très petites structures sans traitements à risque).

## L'analyse d'impact (AIPD / DPIA)

Pour les traitements **susceptibles d'engendrer un risque élevé** pour les personnes (surveillance à grande échelle, données sensibles, profilage, nouvelles technologies...), le RGPD impose une **analyse d'impact relative à la protection des données** (AIPD, ou DPIA en anglais). C'est une étude qui identifie les risques du traitement pour les personnes et les mesures pour les réduire, **avant** de le déployer.

Le technicien participe à l'AIPD sur le volet technique : décrire le traitement, identifier les risques de sécurité, proposer les mesures. C'est un exercice de Privacy by Design formalisé. Ne pas réaliser une AIPD obligatoire est un manquement sanctionnable.

## La violation de données et sa notification

Point très concret et stressant du quotidien : que faire en cas de **fuite de données** (data breach) ? Le RGPD impose une procédure stricte :

- En cas de **violation de données personnelles** (fuite, accès non autorisé, perte, destruction — que ce soit une cyberattaque, une erreur, un vol de matériel...), le responsable de traitement doit **notifier la CNIL dans les 72 heures** après en avoir pris connaissance (article 33).
- Si la violation présente un **risque élevé** pour les personnes, celles-ci doivent aussi être **informées** (article 34).
- Toutes les violations doivent être **documentées** en interne, même celles qui ne sont pas notifiées.

Le délai de 72 heures est court, ce qui suppose d'avoir **préparé une procédure de réponse à incident** à l'avance. Le technicien est en première ligne : c'est souvent lui qui **détecte** la violation (via la supervision, les logs, une alerte) et qui doit **remonter l'information** rapidement. Savoir reconnaître une violation, la qualifier, et déclencher la procédure fait partie de tes responsabilités. Ce point recoupe directement la notification d'incidents de NIS2 (les deux peuvent se cumuler).

## Le DPO (délégué à la protection des données)

Le **DPO** (Data Protection Officer, ou délégué à la protection des données) est la personne chargée de piloter la conformité RGPD dans l'organisation. Il est **obligatoire** dans certains cas (organismes publics, traitement à grande échelle de données sensibles, surveillance systématique). Ses missions : conseiller, contrôler la conformité, être le point de contact avec la CNIL et les personnes concernées, sensibiliser.

Le DPO n'est pas forcément un juriste ni un informaticien : c'est un profil transverse. Mais il **travaille étroitement avec les équipes techniques**, car la conformité passe par la technique. Pour toi, le DPO est un interlocuteur clé : il te dira quelles exigences appliquer, et tu lui diras ce qui est techniquement faisable. C'est un binôme fréquent.

## La surveillance des salariés et l'usage des outils

Sujet à double face qui te concerne comme technicien **et** comme salarié : l'employeur peut-il surveiller l'usage que ses salariés font des outils informatiques ? Le RGPD et le droit du travail encadrent cela :

- L'employeur peut mettre en place des **dispositifs de surveillance** (journalisation, filtrage web, contrôle des accès) pour des motifs légitimes (sécurité, bon fonctionnement), mais de façon **proportionnée** et **transparente** : les salariés doivent être **informés** (via la charte informatique, le règlement intérieur), et le CSE consulté.
- Une surveillance **cachée, généralisée ou disproportionnée** est illégale. Par exemple, un keylogger secret ou la lecture des emails personnels des salariés sans cadre sont sanctionnés.
- Les fichiers ou emails identifiés comme **personnels** par le salarié bénéficient d'une protection (l'employeur ne peut y accéder librement).

Comme technicien qui **met en place** ces dispositifs de surveillance/journalisation, tu dois savoir que ce que tu déploies a des limites juridiques : on ne journalise pas tout, n'importe comment, sans information ni base légale. C'est un domaine où ton action technique doit rester dans le cadre légal — d'où l'importance de travailler avec le DPO et le juridique.

## Les sanctions et enjeux

Le RGPD a des sanctions dissuasives, ce qui explique qu'on le prenne au sérieux. La CNIL peut prononcer :

- Des **amendes administratives** allant jusqu'à **20 millions d'euros ou 4 % du chiffre d'affaires annuel mondial** (le montant le plus élevé) pour les manquements les plus graves (violation des principes, des droits des personnes) ; et jusqu'à **10 millions d'euros ou 2 %** pour les manquements aux obligations techniques et organisationnelles.
- Des **mesures correctrices** : injonctions de mise en conformité (sous astreinte), limitation ou interdiction de traitement, rappels à l'ordre.
- La **publication** des sanctions (l'atteinte à la réputation est parfois plus redoutée que l'amende).

Les amendes réelles ont atteint des sommes considérables pour les grands groupes (plusieurs centaines de millions d'euros), et la CNIL sanctionne aussi les PME via une procédure simplifiée. Au-delà de l'amende, une fuite de données mal gérée abîme durablement la confiance des clients. C'est pourquoi la conformité RGPD est devenue une priorité — et une compétence recherchée chez les techniciens.

## Ce qu'il faut retenir

- Une **grande partie du RGPD est technique** : le technicien R&T/DSI en est un acteur clé, pas un simple spectateur.
- **Privacy by Design & by Default** : intégrer la protection des données **dès la conception** et par des réglages protecteurs par défaut.
- La **sécurité** (contrôle d'accès, chiffrement, pseudonymisation, sauvegardes, journalisation, sécurité réseau) est une obligation RGPD proportionnée au risque — ton cœur de métier.
- Concevoir une **base de données conforme** = minimisation, durées de conservation (purge), effacement possible, extraction possible, sécurité (dont anti-injection SQL), traçabilité — le technique et le RGPD se rejoignent.
- Outils de conformité : **registre des traitements** (accountability), **AIPD/DPIA** pour les traitements à risque élevé.
- **Violation de données** : notification à la CNIL sous **72h**, information des personnes si risque élevé — le technicien détecte et remonte ; préparer une procédure à l'avance (recoupe NIS2).
- Le **DPO** pilote la conformité et travaille en binôme avec la technique.
- La **surveillance des salariés** doit être proportionnée, transparente et déclarée — ce que tu déploies a des limites juridiques.
- Sanctions : jusqu'à **20 M€ ou 4 % du CA mondial** — d'où l'importance stratégique de la conformité.
