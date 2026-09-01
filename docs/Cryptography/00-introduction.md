---
id: 00-introduction
title: Introduction à la cryptographie
sidebar_position: 2
---

# Introduction à la cryptographie

## De quoi parle cette section

Cette section couvre les grands algorithmes de cryptographie sous l'angle qui compte vraiment quand on fait de la cybersécurité : **d'où ils viennent, à quoi ils servent, et surtout comment on les casse**. Les maths sont présentes quand elles éclairent un concept ou une attaque, mais l'objectif n'est pas de faire un cours de théorie des nombres — c'est de comprendre pourquoi tel algo est sûr, pourquoi tel autre est mort, et ce qu'un attaquant regarde en premier.

## Un peu de vocabulaire

Avant tout, quelques termes qu'on va utiliser partout :

- **Plaintext** (clair) : le message original, lisible.
- **Ciphertext** (chiffré) : le message après chiffrement, illisible sans la clé.
- **Cipher** : l'algorithme de chiffrement lui-même (AES, RSA...).
- **Key** : le secret qui paramètre le chiffrement/déchiffrement.
- **Encryption / Decryption** : chiffrement / déchiffrement.
- **Cryptanalysis** : l'art de casser les systèmes cryptographiques.

Attention à un abus de langage courant : « **encoder** » (Base64, hex, URL-encoding) n'est **pas** « chiffrer ». Un encodage est réversible sans secret — c'est juste un changement de représentation. En CTF, confondre les deux fait perdre du temps ; si tu vois du Base64, ce n'est pas de la crypto, c'est de l'encodage.

## Le principe de Kerckhoffs (1883)

C'est le principe fondateur, et il tient toujours 140 ans plus tard :

> Un système cryptographique doit rester sûr même si tout, sauf la clé, est public.

Autrement dit : **la sécurité repose sur la clé, jamais sur le secret de l'algorithme**. Un algo dont la sécurité dépend du fait que personne ne connaît son fonctionnement fait de la « security through obscurity » — et ça finit toujours mal. C'est pour ça que les bons algos (AES, RSA, SHA) sont entièrement publics, documentés, et analysés par des milliers de chercheurs. Leur robustesse vient précisément de là : ils ont survécu à des décennies d'attaques publiques.

Corollaire pour toi en pentest : quand un produit propriétaire annonce un « algorithme de chiffrement secret et révolutionnaire », c'est un red flag. Le vrai chiffrement fort est toujours du standard bien implémenté.

## Les trois propriétés à protéger (CIA)

La crypto sert à garantir trois choses, le fameux triptyque **CIA** :

- **Confidentiality** (confidentialité) : seuls les destinataires autorisés peuvent lire → assurée par le **chiffrement**.
- **Integrity** (intégrité) : le message n'a pas été modifié → assurée par les **fonctions de hachage** et les **MAC**.
- **Authenticity** (authenticité) : le message vient bien de qui il prétend → assurée par les **signatures** et les **MAC**.

Une erreur classique de débutant (et de vieux protocoles) : croire que chiffrer suffit. **Chiffrer protège la confidentialité, pas l'intégrité.** Un attaquant peut modifier un ciphertext sans le déchiffrer et provoquer des dégâts (cf. les attaques sur CBC sans MAC). D'où les modes modernes comme AES-GCM qui font chiffrement **et** authentification en même temps (AEAD).

## Les grandes familles de primitives

On peut ranger toute la crypto en quelques familles :

**Symmetric encryption** — Une seule clé, partagée, sert à chiffrer et déchiffrer. Rapide, utilisé pour le gros du trafic. Exemples : AES, ChaCha20. Problème central : comment partager la clé de façon sûre ?

**Asymmetric encryption** (à clé publique) — Deux clés liées mathématiquement : une publique, une privée. Résout le problème du partage de clé, mais c'est lent. Exemples : RSA, ECC.

**Key exchange** — Des protocoles pour se mettre d'accord sur une clé secrète commune à travers un canal non sécurisé. Exemple : Diffie-Hellman.

**Hash functions** — Transforment n'importe quelle donnée en une empreinte de taille fixe, irréversible. Servent à l'intégrité, au stockage de mots de passe, aux signatures. Exemples : SHA-2, SHA-3.

**MAC / Signatures** — Garantissent intégrité + authenticité. MAC avec clé symétrique (HMAC), signatures avec clé asymétrique (RSA, ECDSA).

En pratique, un protocole réel comme **TLS** combine tout ça : asymétrique pour échanger une clé, symétrique pour chiffrer le trafic, hash pour l'intégrité, certificats pour l'authenticité. C'est l'objet du dernier cours de la section.

## Comment on « casse » de la crypto

Puisque c'est l'angle qui nous intéresse, voici les grandes catégories d'attaques qu'on retrouvera tout au long de la section :

**Brute force** — Essayer toutes les clés. Contré par une taille de clé suffisante : une clé de 128 bits représente environ 3,4 × 10³⁸ possibilités, hors de portée même de toutes les machines de la planète réunies. C'est pourquoi la taille de clé compte tant.

**Cryptanalyse mathématique** — Exploiter une faiblesse dans l'algo lui-même (structure, biais statistique). C'est ce qui a tué DES, MD5, SHA-1.

**Attaques par implémentation (side-channel)** — Ne pas attaquer les maths mais la *fuite* physique : temps d'exécution, consommation électrique, émissions. Très pertinent pour toi en embarqué : un RSA mal codé sur microcontrôleur peut fuiter sa clé par le temps de calcul. On en reparle dans le cours RSA.

**Attaques sur le protocole / l'usage** — Souvent le maillon faible n'est pas l'algo mais la façon dont on l'utilise : réutilisation d'un nonce, IV prévisible, padding oracle, mauvaise génération d'aléa. La plupart des vraies failles crypto sont là, pas dans les maths.

**Facteur humain / clés faibles** — Mots de passe faibles, clés générées avec un mauvais RNG, secrets hardcodés. En CTF comme en vrai, c'est souvent le point d'entrée.

## Plan de la section

1. **XOR et One-Time Pad** — La brique de base, le seul chiffrement mathématiquement incassable, et pourquoi on ne peut quasiment pas l'utiliser.
2. **Chiffrement symétrique** — AES et les modes opératoires (le piège ECB, l'importance de l'IV, l'AEAD).
3. **RSA** — Le premier algo à clé publique, comment il marche et comment on l'attaque.
4. **Diffie-Hellman** — Comment créer un secret commun à distance.
5. **Courbes elliptiques (ECC)** — La crypto asymétrique moderne, pourquoi elle remplace RSA.
6. **Fonctions de hachage** — Empreintes, intégrité, stockage de mots de passe, HMAC.
7. **Clés publiques/privées et certificats** — Le cours dédié : PKI, X.509, TLS, chaîne de confiance.

## Références pour aller plus loin

- *Serious Cryptography*, Jean-Philippe Aumasson — la référence moderne et accessible.
- *Cryptopals Challenges* (cryptopals.com) — des exercices pratiques pour casser de la crypto en codant, parfait pour ton profil.
- *Handbook of Applied Cryptography* — gratuit en ligne, très complet (plus théorique).
