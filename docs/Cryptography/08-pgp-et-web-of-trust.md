---
id: 08-pgp-et-web-of-trust
title: PGP — clés, trousseau et Web of Trust
sidebar_position: 10
tags: [cryptographie, pgp]
---

# PGP — clés, trousseau et Web of Trust

Ce cours détaille le fonctionnement de **PGP/OpenPGP**, le standard de chiffrement et de signature « entre personnes ». Il s'appuie sur les cours précédents (asymétrique, hachage, signature — cours 3 et 6) et sur le [cours PKI/certificats](./07-cles-publiques-privees-et-certificats.md), dont PGP partage les fondations mais dont il diverge radicalement sur un point : **il n'y a pas d'autorité centrale**.

## Index

1. [PGP, OpenPGP, GnuPG : de quoi parle-t-on](#1-pgp-openpgp-gnupg--de-quoi-parle-t-on)
2. [Anatomie d'une paire de clés PGP](#2-anatomie-dune-paire-de-clés-pgp)
3. [Le trousseau et l'empreinte](#3-le-trousseau-et-lempreinte)
4. [Chiffrer, déchiffrer, signer, vérifier](#4-chiffrer-déchiffrer-signer-vérifier)
5. [Le Web of Trust](#5-le-web-of-trust)
6. [Web of Trust vs PKI : deux modèles de confiance](#6-web-of-trust-vs-pki--deux-modèles-de-confiance)
7. [Serveurs de clés et leurs problèmes](#7-serveurs-de-clés-et-leurs-problèmes)
8. [Révocation](#8-révocation)
9. [Usages concrets](#9-usages-concrets)
10. [Faiblesses connues](#10-faiblesses-connues)
11. [Ce qu'il faut retenir](#11-ce-quil-faut-retenir)

---

## 1. PGP, OpenPGP, GnuPG : de quoi parle-t-on

- **PGP** (*Pretty Good Privacy*) — le logiciel original créé par Phil Zimmermann en 1991.
- **OpenPGP** ([RFC 9580](https://www.rfc-editor.org/rfc/rfc9580)) — le standard ouvert issu de PGP, qui décrit le format des clés, des messages et des signatures.
- **GnuPG** (`gpg`) — l'implémentation libre la plus utilisée du standard OpenPGP, déjà abordée côté pratique dans le [cours Linux OpenSSL/GnuPG](../Operating_sys/Linux/Security/03-cryptographie-openssl-gnupg.md). Ce cours-ci se concentre sur les concepts (structure des clés, modèle de confiance) plutôt que sur la commande `gpg` elle-même.

## 2. Anatomie d'une paire de clés PGP

Une identité PGP n'est **pas une seule paire de clés**, mais une structure :

- **Clé maîtresse (*primary key* / *master key*)** — sert exclusivement à **certifier** (signer d'autres clés) et, en théorie, à signer. C'est l'identité racine : sa perte ou sa compromission invalide tout ce qui en dépend.
- **Sous-clés (*subkeys*)** — dérivées de la clé maîtresse, dédiées à des usages spécifiques : une sous-clé de **chiffrement**, une sous-clé de **signature**, parfois une sous-clé d'**authentification** (utilisable pour SSH).
- **UID (*User ID*)** — une identité au format `Nom <email>`, signée par la clé maîtresse. Une même paire de clés peut porter plusieurs UID (plusieurs emails, par exemple).

**Pourquoi séparer maîtresse et sous-clés ?** C'est la bonne pratique de gestion de clé : on garde la **clé maîtresse hors ligne** (sur une clé USB déconnectée, une YubiKey, un support froid) et on n'utilise **au quotidien que les sous-clés**, stockées sur la machine de travail. Si la machine de travail est compromise, seules les sous-clés fuient — on les révoque et on en génère de nouvelles **sans changer d'identité** (la clé maîtresse, et donc les signatures de confiance déjà reçues, restent valides).

## 3. Le trousseau et l'empreinte

Le **trousseau** (*keyring*) est l'ensemble des clés publiques que tu as importées, plus ta ou tes paires de clés privées. Chaque clé est identifiée par son **fingerprint** (empreinte), un hash de 40 caractères hexadécimaux (SHA-1 historiquement, migration en cours vers SHA-256 avec le format v6/RFC 9580) qui identifie la clé de façon unique.

```
9F5A 0B1C 3D4E 5F60 7182  93A4 B5C6 D7E8 F901 2345
```

C'est **l'empreinte**, pas l'email ni le nom, qu'il faut comparer pour vérifier qu'une clé appartient bien à qui elle prétend — idéalement en la faisant confirmer à la personne par un canal indépendant (en personne, par téléphone).

## 4. Chiffrer, déchiffrer, signer, vérifier

Les mêmes principes asymétriques que dans le [cours PKI](./07-cles-publiques-privees-et-certificats.md#rappel--le-couple-de-clés), appliqués via le trousseau :

- **Chiffrer** un message pour quelqu'un → utiliser **sa clé publique de chiffrement**. Lui seul peut déchiffrer avec sa clé privée correspondante.
- **Signer** un message → utiliser **sa propre clé privée de signature**. N'importe qui peut vérifier avec ta clé publique.

Un message PGP combine souvent les deux : **signé puis chiffré**, pour garantir à la fois confidentialité (seul le destinataire lit) et authenticité (le destinataire sait que ça vient bien de toi). Les commandes `gpg --encrypt`, `--sign`, `--decrypt`, `--verify` sont détaillées dans le [cours pratique GnuPG](../Operating_sys/Linux/Security/03-cryptographie-openssl-gnupg.md#gnupg-gpg).

## 5. Le Web of Trust

C'est **la** spécificité de PGP par rapport à une PKI classique : il n'existe **aucune autorité centrale** qui certifie qu'une clé publique appartient bien à telle personne. À la place, PGP propose un modèle **décentralisé** : le **Web of Trust** (toile de confiance).

Le principe :

1. Quand tu es convaincu qu'une clé publique appartient réellement à une personne (vérification d'empreinte en personne, par exemple), tu **signes sa clé** avec ta propre clé privée. C'est une **attestation** publique : « je certifie que cette clé appartient à cette personne ».
2. Chacun accumule ainsi des signatures d'autres personnes sur sa clé.
3. Si tu fais confiance à quelqu'un qui a lui-même signé la clé d'un tiers que tu ne connais pas, tu peux **transitivement** accorder un certain niveau de confiance à ce tiers — c'est l'effet réseau/toile.

Concrètement, GnuPG distingue deux notions à ne pas confondre :

- **Validité** d'une clé (*validity*) — est-ce que je crois que cette clé appartient bien à l'identité annoncée ? Calculée automatiquement à partir des signatures présentes et du niveau de confiance accordé aux signataires.
- **Confiance** (*trust*) — accordée manuellement par toi à une clé, pour indiquer si tu penses que **son propriétaire vérifie sérieusement** les identités avant de signer (niveaux : inconnue, jamais, marginale, complète, ultime — cette dernière étant réservée à tes propres clés).

Historiquement, ce mécanisme s'incarnait dans les **key signing parties** : des rencontres où les participants vérifiaient mutuellement leurs pièces d'identité et leurs empreintes de clé, puis signaient les clés les uns des autres après coup — répandu dans les communautés du logiciel libre (Debian en particulier).

## 6. Web of Trust vs PKI : deux modèles de confiance

| | PKI (X.509/TLS) | Web of Trust (PGP) |
|---|---|---|
| Racine de confiance | **Autorités de certification** centralisées (Root CA) | **Décentralisée** : chaque utilisateur décide en qui il a confiance |
| Qui peut certifier | Seulement les CA | N'importe qui, pour n'importe qui |
| Modèle | Hiérarchique (arbre) | Toile (graphe quelconque) |
| Adapté à | Authentifier des **serveurs** à grande échelle (HTTPS) | Authentifier des **personnes**, à échelle humaine |
| Point faible | Une CA compromise = confiance rompue pour tout son périmètre (cas DigiNotar) | Fonctionne mal si peu de gens signent activement les clés (toile clairsemée) |

Les deux résolvent le même problème — lier une clé publique à une identité — avec des philosophies opposées : centralisation efficace à grande échelle contre décentralisation résiliente mais qui dépend de l'effort humain de vérification.

## 7. Serveurs de clés et leurs problèmes

Les clés publiques peuvent être publiées sur des **keyservers** (SKS historiquement, aujourd'hui plutôt [keys.openpgp.org](https://keys.openpgp.org)) pour être découvertes par email ou identifiant.

Problèmes historiques majeurs :

- **Le réseau SKS ne permet pas de supprimer une clé** une fois publiée (append-only par design) — une clé compromise ou un ancien email reste indéfiniment indexé.
- **Certificate/Key flooding (2019)** — n'importe qui pouvant signer n'importe quelle clé sur un serveur SKS classique, des attaquants ont pollué les clés de contributeurs GnuPG connus avec des dizaines de milliers de signatures bidons, rendant leur clé injouable à télécharger/traiter par certains clients.
- **keys.openpgp.org**, plus récent, corrige ces problèmes : il ne distribue que la clé et les UID **vérifiés par email** (opt-in), sans les signatures tierces — un compromis qui sacrifie une partie du Web of Trust pour la robustesse opérationnelle.

## 8. Révocation

Si une clé privée est compromise, perdue, ou qu'une identité change, il faut pouvoir invalider la clé publiquement — d'où le **certificat de révocation**, à générer **dès la création de la clé** (pas après coup, puisqu'il faut la clé privée pour le produire) et à conserver en lieu sûr séparé de la clé elle-même :

```bash
gpg --gen-revoke "Ton Nom" > revocation.asc
```

Publier ce certificat (sur un keyserver, ou simplement le diffuser) marque la clé comme révoquée : les correspondants sauront ne plus lui faire confiance, même si le fichier de clé publique brut circule encore.

## 9. Usages concrets

- **Chiffrement d'email** — usage historique (souvent via des plugins comme Enigmail/Thunderbird), en net recul face à des protocoles plus modernes (Signal) mais toujours utilisé dans certains milieux (journalisme, sécurité, libre).
- **Signature de commits Git** — `git commit -S`, `git tag -s` ; GitHub/GitLab affichent un badge "Verified" quand la clé publique du signataire est enregistrée sur le compte.
- **Signature de paquets logiciels** — les distributions Linux (Debian, Arch...) signent leurs paquets et dépôts avec GPG ; le gestionnaire de paquets vérifie la signature avant installation.
- **Vérification d'intégrité de téléchargements** — un éditeur publie un fichier `.asc` à côté de son binaire ; `gpg --verify` confirme que le fichier n'a pas été altéré et vient bien du détenteur de la clé.
- **SSH via sous-clé d'authentification** — une sous-clé PGP dédiée peut servir de clé SSH (via `gpg-agent` en mode agent SSH), centralisant l'authentification sur le même trousseau.

## 10. Faiblesses connues

- **Efail (2018)** — classe de vulnérabilités exploitant la façon dont certains clients mail affichaient le contenu HTML déchiffré, permettant d'exfiltrer le texte en clair via des requêtes réseau déclenchées par le rendu HTML. Corrigé côté clients (désactivation du HTML actif dans le contenu déchiffré), pas une faille du chiffrement PGP lui-même.
- **SEIP vs MDC** — les anciens messages PGP utilisaient un simple MDC (Modification Detection Code, un hash non authentifié) pour l'intégrité, vulnérable à des attaques de manipulation de texte chiffré. Le format moderne **SEIP** (chiffrement symétrique authentifié) corrige ce point.
- **Toile de confiance clairsemée** — en dehors de communautés très actives (Debian, kernel Linux), peu d'utilisateurs signent activement les clés d'autrui : le Web of Trust fonctionne mal à grande échelle pour le grand public, contrairement à la PKI du Web.
- **Forward secrecy absente** — contrairement à TLS 1.3 (ECDHE), une clé PGP compromise permet de déchiffrer **tous les messages passés** chiffrés pour elle : il n'y a pas de renouvellement de clé de session par échange.
- **Complexité d'usage** — gestion des sous-clés, de la révocation, du trousseau... une charge cognitive qui explique en grande partie l'adoption limitée de PGP hors cercles techniques, au profit de solutions plus simples et à forward secrecy native (Signal Protocol).

## 11. Ce qu'il faut retenir

- Une identité PGP = une **clé maîtresse** (certification, gardée hors ligne) + des **sous-clés** (chiffrement/signature, utilisées au quotidien) + un ou plusieurs **UID**.
- Le **trousseau** stocke tes clés et celles de tes correspondants ; l'**empreinte** (fingerprint) est ce qu'on vérifie réellement pour authentifier une clé, jamais le nom ou l'email seuls.
- Le **Web of Trust** remplace l'autorité centrale d'une PKI par des **signatures croisées entre utilisateurs**, avec deux notions distinctes : la **validité** (calculée) et la **confiance** (accordée manuellement).
- Générer le **certificat de révocation dès la création** de la clé — c'est le seul moyen de invalider une clé compromise dont on n'a plus accès à la partie privée.
- Usages modernes dominants : signature de **commits Git**, de **paquets logiciels**, et vérification d'**intégrité de téléchargements** — plus que le chiffrement d'email, largement supplanté par Signal.
- PGP n'a **pas de forward secrecy** : une clé compromise expose tout l'historique chiffré pour elle, contrairement à TLS moderne.

## Voir aussi

- [Clés publiques/privées, PKI et certificats](./07-cles-publiques-privees-et-certificats.md) — le modèle centralisé auquel comparer le Web of Trust
- [Cryptographie — OpenSSL et GnuPG](../Operating_sys/Linux/Security/03-cryptographie-openssl-gnupg.md) — la pratique en ligne de commande (`gpg --encrypt`, `--sign`, gestion du trousseau)
- [Fonctions de hachage](./06-fonctions-de-hachage.md) — les empreintes de clé (fingerprints) en sont une application directe
