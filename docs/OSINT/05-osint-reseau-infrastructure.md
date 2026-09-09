---
id: 05-osint-reseau-infrastructure
title: OSINT réseau et infrastructure
sidebar_position: 6
tags: [osint, reseau]
---

# OSINT réseau et infrastructure

Cette fiche couvre l'OSINT appliqué aux **réseaux, domaines et infrastructures** : cartographier la présence en ligne d'une organisation à partir de sources publiques. C'est l'angle le plus proche de ton profil R&T, et la phase de **reconnaissance** classique en cybersécurité. Tout ce qui suit est de la reconnaissance **passive** (sur sources publiques), à distinguer du scan actif qui exige une autorisation.

## L'objectif : cartographier une empreinte numérique

Une organisation expose en ligne bien plus qu'elle ne le pense : un domaine, des sous-domaines, des serveurs, des adresses IP, des services, des technologies. L'OSINT d'infrastructure consiste à **reconstituer cette carte** à partir d'informations publiques, sans jamais toucher directement aux systèmes cibles. C'est ce que fait un attaquant avant d'attaquer — et donc ce qu'un défenseur doit savoir faire pour connaître sa propre surface d'exposition.

Les briques d'information : le **domaine** et son propriétaire (WHOIS), les **enregistrements DNS**, les **sous-domaines**, les **certificats**, les **IP et services exposés** (Shodan), les **technologies** utilisées.

## WHOIS : les informations d'enregistrement d'un domaine

Le **WHOIS** est la base de données publique des enregistrements de noms de domaine. Interroger le WHOIS d'un domaine révèle : la date de création et d'expiration, le **registrar** (bureau d'enregistrement), les serveurs DNS, et parfois des informations sur le propriétaire (souvent masquées aujourd'hui par des services de protection de la vie privée et le RGPD).

```bash
whois exemple.fr
```

Cas d'usage : dater un domaine (un domaine très récent est suspect pour du phishing), identifier le registrar, ou repérer des domaines liés enregistrés par la même entité. Note : depuis le RGPD, les données personnelles des propriétaires sont largement masquées dans le WHOIS des domaines européens — mais les informations techniques restent visibles.

## DNS : interroger les enregistrements

Le **DNS** (vu dans le cours réseau) traduit les noms en adresses et structure la présence d'un domaine. Interroger les enregistrements DNS d'un domaine révèle son infrastructure : serveurs web, serveurs mail, services.

```bash
dig exemple.fr A          # adresse(s) IPv4
dig exemple.fr MX         # serveurs de messagerie
dig exemple.fr NS         # serveurs de noms
dig exemple.fr TXT        # enregistrements texte (SPF, vérifications, parfois infos révélatrices)
```

Les enregistrements **MX** révèlent le fournisseur de messagerie (Google Workspace, Microsoft 365, serveur interne...), les **TXT** contiennent souvent des indices sur les services tiers utilisés, les **A** donnent les IP à explorer ensuite. C'est un point de départ riche pour cartographier une organisation.

## L'énumération de sous-domaines

Une organisation a rarement un seul site : elle a des **sous-domaines** (`mail.exemple.fr`, `vpn.exemple.fr`, `admin.exemple.fr`, `dev.exemple.fr`...). Les énumérer révèle des services souvent moins protégés ou oubliés — c'est l'une des étapes les plus productives de la reconnaissance.

**Les journaux de transparence des certificats (Certificate Transparency)** — Une source excellente et purement passive. Chaque certificat TLS émis est enregistré dans des journaux publics. En les consultant, on découvre les sous-domaines pour lesquels des certificats ont été émis. Le site **crt.sh** permet cette recherche sans compte :

```
https://crt.sh/?q=%25.exemple.fr
```

**Les outils d'énumération** — Ils combinent plusieurs sources (dont Certificate Transparency, DNS, moteurs) :
- **Amass** — l'outil de référence, open source, très complet pour cartographier la surface d'attaque d'un domaine.
- **theHarvester** — (vu dans la fiche email) collecte aussi sous-domaines et hôtes.

```bash
amass enum -passive -d exemple.fr    # énumération passive des sous-domaines
```

Le mode **passif** (`-passive`) n'interroge que des sources tierces publiques, sans envoyer de requêtes à la cible — c'est le mode sûr juridiquement.

## Shodan : le moteur de recherche des objets connectés

**Shodan** (shodan.io) est surnommé « le moteur de recherche des hackers ». Au lieu d'indexer des pages web comme Google, il **scanne en permanence internet et indexe les appareils et services connectés** : serveurs, caméras, routeurs, systèmes industriels, bases de données exposées, etc. Pour chaque IP, il révèle les **ports ouverts**, les **services** et leurs **versions**, les bannières, parfois des vulnérabilités connues.

Cas d'usage : à partir d'une IP ou d'un domaine (trouvés aux étapes précédentes), Shodan montre ce qui est **exposé publiquement** sans avoir à scanner soi-même (donc passivement, puisque c'est Shodan qui a scanné). On peut chercher par IP, par organisation, par technologie, par pays.

```
# Exemples de requêtes Shodan (interface web)
org:"Nom Organisation"
hostname:exemple.fr
```

L'intérêt défensif est majeur : **voir sa propre organisation dans Shodan**, c'est découvrir ce qu'un attaquant voit — un service oublié, une caméra accessible, une base de données exposée, un logiciel obsolète. C'est un audit d'exposition sans rien scanner soi-même. Des alternatives existent : **Censys**, **FOFA**.

## Identifier les technologies et cartographier les relations

**Reconnaître les technologies d'un site** — Des outils comme **Wappalyzer** (extension navigateur) ou **BuiltWith** identifient les technologies d'un site web (CMS, frameworks, serveurs, outils analytics). Utile pour comprendre la stack d'une cible et repérer des composants obsolètes.

**Maltego** — L'outil emblématique de **cartographie de relations** en OSINT. Il représente sous forme de **graphe** les liens entre entités (domaines, IP, emails, personnes, sous-domaines...) et automatise la collecte via des « transforms ». Sa version gratuite (Basic, ex-Community Edition) est limitée mais permet de découvrir la puissance de l'analyse par graphe. Idéal pour visualiser une infrastructure complexe et ses interconnexions.

**SpiderFoot** — Un framework d'automatisation open source qui orchestre des centaines de modules OSINT (DNS, WHOIS, fuites, sous-domaines, Shodan...) et agrège les résultats. Pratique pour une reconnaissance large et automatisée.

## Le workflow type

Une reconnaissance d'infrastructure enchaîne logiquement ces outils, chaque résultat alimentant le suivant :

1. **WHOIS** sur le domaine → registrar, dates, DNS.
2. **DNS** (`dig`) → IP, serveurs mail, services.
3. **Énumération de sous-domaines** (crt.sh, Amass) → surface élargie.
4. **Shodan** sur les IP/domaines trouvés → services et ports exposés, versions.
5. **Identification des technologies** (Wappalyzer) → stack et composants.
6. **Cartographie** (Maltego, SpiderFoot) → visualiser l'ensemble et les relations.

À la fin, on a une carte de l'empreinte numérique de l'organisation, entièrement construite à partir de sources publiques.

## Cas d'usage et éthique

- **Défensif (le plus important pour toi)** : cartographier **sa propre** organisation pour découvrir sa surface d'exposition et corriger ce qui traîne (services oubliés, versions vulnérables, sous-domaines de test exposés). C'est de la gestion d'attack surface.
- **Cybersécurité offensive autorisée** : la phase de reconnaissance d'un test d'intrusion, dans le cadre d'un mandat écrit.
- **Threat intelligence** : analyser l'infrastructure d'un attaquant (domaines de phishing, serveurs de commande).

Frontière cruciale à respecter : tout ce qui précède est **passif** (sources publiques, aucun paquet envoyé à la cible), donc généralement licite. Dès qu'on **scanne activement** une cible (nmap sur ses ports, tentatives de connexion), on entre dans l'action **active** qui exige une **autorisation écrite** — sans quoi c'est illégal. La limite entre reconnaissance passive et scan actif est la ligne à ne jamais franchir sans mandat.

## Ce qu'il faut retenir

- L'OSINT d'infrastructure **cartographie l'empreinte en ligne** d'une organisation par sources publiques, sans toucher aux systèmes (reconnaissance **passive**).
- **WHOIS** (`whois`) : registrar, dates, DNS d'un domaine (propriétaire souvent masqué par le RGPD). **DNS** (`dig` A/MX/NS/TXT) : IP, messagerie, services.
- **Énumération de sous-domaines** : **crt.sh** (Certificate Transparency, passif et gratuit) et **Amass** (`-passive`) — étape très productive (services oubliés).
- **Shodan** : moteur des appareils/services connectés ; révèle ports, services et versions exposés d'une IP **sans scanner soi-même**. Voir sa propre org dans Shodan = voir ce que voit un attaquant. Alternatives : Censys, FOFA.
- **Technologies** : Wappalyzer/BuiltWith (stack d'un site). **Cartographie** : Maltego (graphe de relations, version gratuite Basic), SpiderFoot (automatisation).
- **Workflow** : WHOIS → DNS → sous-domaines → Shodan → technologies → cartographie.
- **Limite légale absolue** : le passif (sources publiques) est licite ; le **scan actif** d'une cible exige une **autorisation écrite**.
