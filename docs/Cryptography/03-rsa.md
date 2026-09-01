---
id: 03-rsa
title: RSA
sidebar_position: 5
---

# RSA

## Le problème que RSA a résolu

Jusqu'en 1976, toute la crypto était symétrique : pour communiquer secrètement, il fallait d'abord partager une clé secrète, ce qui supposait déjà un canal sûr — le fameux problème de la poule et de l'œuf. La crypto à clé publique a renversé ça : **et si on pouvait chiffrer avec une clé qu'on peut publier au monde entier, et déchiffrer seulement avec une clé qu'on garde secrète ?**

RSA (1977), du nom de ses inventeurs **Rivest, Shamir et Adleman** au MIT, fut la première réalisation pratique de cette idée. Anecdote historique : le concept avait en réalité été découvert quelques années plus tôt par Clifford Cocks au GCHQ britannique, mais classé secret-défense et non publié. RSA reste, près de 50 ans plus tard, l'un des algorithmes les plus déployés au monde.

Tu l'as implémenté toi-même en MicroPython pur sur STeaMi — ce cours remet tes mains dans le cambouis avec le pourquoi.

## L'idée : une fonction à sens unique avec trappe

RSA repose sur une **fonction à sens unique avec trappe** (trapdoor one-way function) : une opération facile à faire dans un sens, très difficile dans l'autre, sauf si on connaît un secret (la trappe).

Le problème difficile utilisé par RSA est la **factorisation des grands nombres** :

- Multiplier deux grands nombres premiers `p` et `q` pour obtenir `n = p × q` : **facile et rapide**, même pour des nombres de centaines de chiffres.
- Retrouver `p` et `q` à partir de `n` seul : **calculatoirement infaisable** si `n` est assez grand (2048 bits ou plus).

Toute la sécurité de RSA tient là : `n` est public, mais personne ne sait le factoriser en temps raisonnable.

## Comment ça marche

Sans rentrer dans les démonstrations, voici les étapes. Elles sont exactement celles que tu as codées.

### Génération des clés

1. Choisir deux grands nombres premiers `p` et `q` (aléatoires, secrets).
2. Calculer `n = p × q`. Ce `n` est le **module**, il fait partie des deux clés.
3. Calculer `φ(n) = (p-1)(q-1)` (l'indicatrice d'Euler — le nombre d'entiers premiers avec `n`).
4. Choisir un exposant public `e` premier avec `φ(n)`. En pratique on prend presque toujours **`e = 65537`** (un nombre premier qui rend le chiffrement rapide).
5. Calculer l'exposant privé `d`, l'inverse modulaire de `e` modulo `φ(n)` — c'est-à-dire le `d` tel que `e × d ≡ 1 (mod φ(n))`.

Résultat :
- **Clé publique** = `(n, e)` → on peut la publier.
- **Clé privée** = `(n, d)` → à garder absolument secrète.

Les nombres `p`, `q` et `φ(n)` doivent être détruits ou gardés aussi secrets que `d` : qui connaît `p` et `q` peut recalculer `d`.

### Chiffrement et déchiffrement

- Chiffrer un message `m` (converti en nombre) : `c = m^e mod n`
- Déchiffrer : `m = c^d mod n`

La magie mathématique (garantie par le théorème d'Euler) fait que `(m^e)^d ≡ m (mod n)`. On chiffre avec l'exposant public, on ne peut déchiffrer qu'avec l'exposant privé.

### Un exemple minimal en Python

```python
from sympy import randprime, mod_inverse

# 1-2. Deux premiers (petits ici pour l'exemple — en vrai : 1024 bits chacun)
p = randprime(2**511, 2**512)
q = randprime(2**511, 2**512)
n = p * q

# 3. Indicatrice d'Euler
phi = (p - 1) * (q - 1)

# 4. Exposant public standard
e = 65537

# 5. Exposant privé = inverse modulaire de e mod phi
d = mod_inverse(e, phi)

# Clés
public_key = (n, e)
private_key = (n, d)

# Chiffrement / déchiffrement d'un entier
m = 42
c = pow(m, e, n)      # pow(base, exp, mod) : exponentiation modulaire rapide
m2 = pow(c, d, n)
print(m2)             # 42
```

Note le `pow(base, exp, mod)` de Python : c'est l'**exponentiation modulaire rapide** (square-and-multiply). Sur STeaMi en MicroPython, c'est l'opération critique — la naïveté (`(m**e) % n`) exploserait la mémoire, alors que `pow` la fait efficacement.

## Le point crucial : RSA seul ne suffit pas

Ce que je viens de décrire s'appelle le « **textbook RSA** » (RSA scolaire). **Il ne faut JAMAIS l'utiliser tel quel.** Il a des failles béantes :

- **Déterministe** : le même message donne toujours le même chiffré → un attaquant peut détecter les messages répétés, voire construire un dictionnaire.
- **Malléable** : `c1 × c2 mod n` déchiffre en `m1 × m2` → on peut manipuler les messages.
- Vulnérable aux **petits messages** : si `m^e < n` (par exemple `m` petit et `e = 3`), on récupère `m` par simple racine cubique, sans casser RSA du tout.

La solution est le **padding** : on ajoute de l'aléa et une structure au message avant de chiffrer. Le standard moderne est **OAEP** (Optimal Asymmetric Encryption Padding). En vrai, on écrit :

```python
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP

key = RSA.generate(2048)
cipher = PKCS1_OAEP.new(key.publickey())
ciphertext = cipher.encrypt(b"message court")

decipher = PKCS1_OAEP.new(key)
plaintext = decipher.decrypt(ciphertext)
```

## RSA sert surtout à deux choses

En pratique, RSA n'est presque jamais utilisé pour chiffrer de gros volumes (c'est lent, et limité à des messages plus petits que `n`). Ses deux vrais usages :

**1. Échange de clé (key transport).** On chiffre une clé de session AES avec la clé publique RSA du destinataire, on l'envoie, puis toute la suite du dialogue se fait en AES (rapide). C'est le schéma hybride historique de TLS. (TLS moderne préfère toutefois Diffie-Hellman éphémère — voir cours 4 et 7 — pour la forward secrecy.)

**2. Signature numérique.** On « chiffre » un hash du message avec sa clé **privée** ; n'importe qui peut le « déchiffrer » avec la clé **publique** pour vérifier. Comme seul le détenteur de la clé privée a pu produire la signature, ça garantit authenticité et intégrité. C'est le fondement des certificats (cours 7).

## Les attaques sur RSA

Voici l'angle qui t'intéresse : comment on casse RSA (ou plutôt, comment on casse les mauvaises implémentations, car RSA lui-même tient toujours).

### Factoriser n (l'attaque théorique)

Si on pouvait factoriser `n`, tout tomberait. Contre un `n` de 2048 bits correctement généré, c'est hors de portée. Mais :

- **Clés trop courtes** : RSA-512 et RSA-768 ont été factorisés publiquement. RSA-1024 est déconseillé aujourd'hui. **Minimum recommandé : 2048 bits**, idéalement 3072 ou 4096.
- **Ordinateur quantique** : l'**algorithme de Shor** factoriserait `n` en temps polynomial. C'est la menace existentielle sur RSA (et sur toute la crypto asymétrique classique). D'où la course à la crypto post-quantique. Les machines quantiques ne sont pas encore assez puissantes, mais le risque « harvest now, decrypt later » (capturer le trafic chiffré aujourd'hui pour le déchiffrer dans 15 ans) est pris au sérieux.

### Mauvaise génération d'aléa (l'attaque réelle)

C'est la faille pratique la plus fréquente. Si les premiers `p` et `q` sont mal générés :

- **Premiers partagés entre clés** : une étude célèbre (« Mining Your Ps and Qs », 2012) a scanné des millions de clés RSA sur Internet et découvert que beaucoup partageaient un facteur `p` commun (à cause de mauvais RNG sur des systèmes embarqués/routeurs au démarrage). Or si deux modules `n1` et `n2` partagent un facteur, un simple **PGCD (`gcd(n1, n2)`)** le révèle instantanément — et casse les deux clés. Très pertinent pour l'embarqué que tu manipules : un microcontrôleur qui génère ses clés sans assez d'entropie au boot est vulnérable.
- **Premiers trop proches** : si `p` et `q` sont proches, la **factorisation de Fermat** retrouve `n` rapidement.

### Attaques par side-channel (spécial embarqué)

Là aussi, très pertinent pour STeaMi/STM32. Le déchiffrement `c^d mod n` manipule la clé privée `d`. Si l'implémentation n'est pas « constante en temps » :

- **Timing attack** : le temps de calcul dépend des bits de `d` → en mesurant précisément les temps de réponse, on reconstruit `d` bit par bit. Kocher l'a démontré dès 1996.
- **Power analysis (SPA/DPA)** : sur un microcontrôleur, la consommation électrique pendant l'exponentiation trahit les bits de la clé. Une simple sonde et un oscilloscope peuvent suffire.

La parade : des implémentations à temps constant et le **blinding** (on masque le message avec un aléa avant l'exponentiation). Les bibliothèques sérieuses le font ; un RSA maison en MicroPython, non — c'est excellent pour apprendre, mais à ne jamais mettre en production.

### Petits exposants et messages

- **Petit `e` + petit `m` sans padding** : racine `e`-ième directe (mentionné plus haut).
- **Attaque de Håstad** : le même message chiffré vers plusieurs destinataires avec `e = 3` permet de le récupérer par le théorème des restes chinois. C'est un classique de CTF crypto.

## Ce qu'il faut retenir

- RSA est le premier système à clé publique pratique ; sa sécurité repose sur la **difficulté de factoriser `n = p × q`**.
- La clé publique `(n, e)` chiffre/vérifie ; la clé privée `(n, d)` déchiffre/signe. `e = 65537` est le standard.
- **Ne jamais utiliser le textbook RSA** : toujours avec un padding (OAEP pour le chiffrement, PSS pour la signature).
- RSA sert surtout à **transporter une clé symétrique** et à **signer**, pas à chiffrer de gros volumes.
- Les attaques réelles ne cassent pas les maths mais l'usage : **clés trop courtes, mauvais aléa (premiers partagés, `gcd`), side-channels sur embarqué, absence de padding**. Menace future : l'algorithme de Shor sur ordinateur quantique.
