---
id: 05-courbes-elliptiques
title: Cryptographie sur courbes elliptiques (ECC)
sidebar_position: 7
tags: [cryptographie, mathematiques]
---

# Cryptographie sur courbes elliptiques (ECC)

## Pourquoi ECC existe

RSA et Diffie-Hellman classique fonctionnent, mais ils ont un défaut : pour rester sûrs, leurs clés doivent être **énormes** (2048 à 4096 bits). C'est lourd à calculer, coûteux en bande passante, et pénible sur des appareils contraints — smartphones, cartes à puce, objets connectés, et bien sûr les microcontrôleurs que tu manipules.

La cryptographie sur courbes elliptiques (**ECC**, Elliptic Curve Cryptography), proposée indépendamment par Neal Koblitz et Victor Miller en 1985, offre **le même niveau de sécurité avec des clés beaucoup plus courtes**. L'ordre de grandeur est frappant :

| Sécurité symétrique équivalente | Clé RSA / DH | Clé ECC |
| ------------------------------- | ------------ | ------- |
| 80 bits | 1024 bits | 160 bits |
| 128 bits | 3072 bits | 256 bits |
| 256 bits | 15360 bits | 512 bits |

Une clé ECC de 256 bits offre à peu près la sécurité d'une clé RSA de 3072 bits. Douze fois plus compacte, et les opérations sont plus rapides. Pour l'embarqué et le mobile, c'est décisif — c'est pourquoi ECC a largement supplanté RSA dans les protocoles modernes.

## L'idée, sans les maths lourdes

Une courbe elliptique est définie par une équation de la forme `y² = x³ + ax + b`. Visuellement, sur les réels, c'est une courbe symétrique par rapport à l'axe horizontal. En crypto, on travaille non pas sur les réels mais sur un corps fini (modulo un grand premier `p`), donc l'ensemble des points est un nuage discret — mais l'algèbre reste la même.

Ce qui compte, c'est qu'on peut définir une **« addition » de points** sur la courbe : à partir de deux points P et Q, une construction géométrique (tracer une droite, trouver le troisième point d'intersection, le refléter) donne un troisième point R = P + Q, qui est toujours sur la courbe.

À partir de là, on définit la **multiplication scalaire** : additionner un point `G` à lui-même `k` fois donne un point `k·G`. C'est l'opération centrale d'ECC.

## Le problème difficile : le log discret elliptique

La sécurité d'ECC repose sur une fonction à sens unique, exactement comme DH mais en version elliptique :

- Calculer `Q = k·G` (multiplier un point par un scalaire) : **facile**.
- Retrouver `k` à partir de `Q` et `G` : **infaisable**.

C'est le **problème du logarithme discret sur courbe elliptique** (ECDLP). Et le point crucial : ce problème est **beaucoup plus dur** que le log discret classique ou la factorisation. Aucun algorithme « sous-exponentiel » ne le résout, contrairement à RSA (qu'on peut attaquer avec le crible algébrique). C'est **cette dureté supérieure** qui permet des clés plus petites à sécurité égale.

Le scalaire secret `k` est ta **clé privée** ; le point `Q = k·G` est ta **clé publique**. Publier `Q` ne révèle pas `k`.

## Les deux usages : ECDH et ECDSA

ECC n'est pas un algorithme unique mais une base sur laquelle on rejoue les protocoles qu'on connaît déjà.

### ECDH — échange de clé

C'est Diffie-Hellman (cours 4) transposé sur courbe elliptique. Le protocole est identique dans l'esprit :

1. Paramètres publics : une courbe et un point générateur `G`.
2. Alice a un secret `a`, publie `a·G`. Bob a un secret `b`, publie `b·G`.
3. Alice calcule `a·(b·G)`, Bob calcule `b·(a·G)` → **même point** `ab·G` = secret commun.

Mêmes propriétés que DH : sensible au MitM sans authentification, et utilisé en mode **éphémère (ECDHE)** pour la forward secrecy. La courbe **X25519** (de Daniel J. Bernstein) est aujourd'hui le standard de fait pour ECDH.

### ECDSA — signature numérique

C'est l'équivalent de la signature RSA, sur courbe elliptique. On signe le hash d'un message avec sa clé privée `k`, et n'importe qui vérifie avec la clé publique `k·G`. C'est ce qui signe la grande majorité des certificats TLS modernes, les transactions **Bitcoin/Ethereum**, les mises à jour de firmware signées, etc.

```python
# Signature ECDSA avec la bibliothèque `cryptography`
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes

# Génération d'une paire de clés sur la courbe P-256
private_key = ec.generate_private_key(ec.SECP256R1())
public_key = private_key.public_key()

message = b"Firmware v1.2.3 pour STeaMi"

# Signature avec la clé privée
signature = private_key.sign(message, ec.ECDSA(hashes.SHA256()))

# Vérification avec la clé publique (lève une exception si invalide)
public_key.verify(signature, message, ec.ECDSA(hashes.SHA256()))
print("Signature valide")
```

## Le talon d'Achille d'ECDSA : le nonce

Voici l'angle attaque, et c'est une histoire spectaculaire. ECDSA a besoin, à **chaque signature**, d'un nombre aléatoire secret unique appelé **nonce** (souvent noté `k` — à ne pas confondre avec la clé privée). Ce nonce doit respecter deux règles absolues :

1. Être **imprévisible** (vraiment aléatoire).
2. Ne **jamais** être réutilisé pour deux signatures différentes.

Si le nonce est réutilisé, ou prévisible, **la clé privée peut être calculée directement** à partir de deux signatures. Ce n'est pas une faiblesse théorique : c'est de l'algèbre simple une fois qu'on a deux signatures partageant le même nonce.

Deux cas réels célèbres :

- **PlayStation 3 (2010)** : Sony utilisait un nonce ECDSA **constant** (au lieu d'aléatoire) pour signer le code autorisé à s'exécuter sur la console. Le groupe fail0verflow a récupéré la clé privée de signature de Sony à partir de deux signatures. Conséquence : n'importe qui pouvait signer du code comme s'il venait de Sony. Game over pour la sécurité de la PS3.
- **Portefeuilles Bitcoin** : plusieurs vols ont eu lieu parce que des implémentations Android généraient de mauvais nonces (RNG défaillant), permettant de reconstituer les clés privées et de vider les portefeuilles.

La parade moderne est le **nonce déterministe** (RFC 6979) : au lieu de tirer le nonce d'un RNG (risqué, surtout sur embarqué où l'entropie est rare au boot — un problème que tu connais), on le dérive de façon déterministe du message et de la clé privée. Plus de dépendance à un RNG faible. Alternative encore plus robuste : **EdDSA / Ed25519**, une variante de signature sur courbe (Edwards) qui rend le nonce déterministe par construction et évite plusieurs pièges d'ECDSA.

## La question des courbes : lesquelles utiliser

Toutes les courbes ne se valent pas. Certaines ont des propriétés qui les rendent faibles, ou soupçonnées d'avoir des faiblesses cachées.

- **P-256 / secp256r1** (NIST) : très répandue, dans énormément de certificats. Mais ses paramètres ont été choisis par le NIST/NSA de façon non totalement transparente, ce qui a nourri des soupçons (jamais prouvés) de backdoor — soupçons renforcés par l'affaire **Dual_EC_DRBG** (un générateur d'aléa poussé par la NSA et qui, lui, contenait bel et bien une backdoor, révélé par les fuites Snowden en 2013).
- **Curve25519 / X25519 / Ed25519** (Bernstein) : conçues de façon transparente (« nothing up my sleeve »), rapides, résistantes par construction à plusieurs classes d'erreurs d'implémentation. C'est le choix recommandé aujourd'hui quand on a le choix : TLS 1.3, SSH moderne, WireGuard, Signal l'utilisent.

Leçon générale : en ECC, **ne jamais inventer sa courbe** ni bricoler les paramètres. On utilise des courbes standard éprouvées, via des bibliothèques éprouvées.

## Et le quantique ?

Mauvaise nouvelle qu'ECC partage avec RSA et DH : l'**algorithme de Shor** casse aussi le log discret elliptique. Un ordinateur quantique suffisamment puissant briserait ECC comme RSA. Les clés plus courtes d'ECC ne sont même pas un avantage ici — elles tomberaient tout aussi vite. C'est pourquoi la transition vers la **crypto post-quantique** (à base de réseaux euclidiens, comme Kyber pour l'échange de clé et Dilithium pour la signature, standardisés par le NIST en 2024) concerne toute la crypto asymétrique actuelle.

## Ce qu'il faut retenir

- ECC offre **la même sécurité que RSA/DH avec des clés beaucoup plus courtes** (256 bits ECC ≈ 3072 bits RSA), donc plus rapide et plus léger — idéal pour l'embarqué et le mobile.
- Sa sécurité repose sur le **log discret elliptique (ECDLP)**, plus dur à casser que la factorisation.
- Deux usages : **ECDH** (échange de clé, comme DH) et **ECDSA/EdDSA** (signature).
- Faille critique d'ECDSA : le **nonce**. Réutilisé ou prévisible → **clé privée récupérable** (cas PS3, portefeuilles Bitcoin). Parades : nonce déterministe (RFC 6979) ou **Ed25519**.
- Préférer les courbes transparentes (**Curve25519/Ed25519**) aux courbes NIST quand on a le choix ; ne jamais inventer sa courbe.
- Comme RSA et DH, ECC est **cassable par un ordinateur quantique** (Shor) → transition post-quantique en cours.

## Voir aussi

- [Diffie-Hellman](./04-diffie-hellman.md) — le cours précédent.
- [Fonctions de hachage](./06-fonctions-de-hachage.md) — le cours suivant.
