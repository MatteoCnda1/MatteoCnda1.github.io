---
id: 01-xor-et-one-time-pad
title: XOR et One-Time Pad
sidebar_position: 3
tags: [cryptographie]
---

# XOR et One-Time Pad

## Pourquoi commencer par là

Le XOR est la brique de base de presque toute la crypto symétrique moderne. AES, ChaCha20, les stream ciphers — tous reposent au fond sur du XOR entre les données et un flot de clé. Et le One-Time Pad (OTP), qui n'est que du XOR avec une clé parfaite, est le **seul** système de chiffrement dont on a prouvé mathématiquement qu'il est incassable. Comprendre pourquoi il est incassable *et* pourquoi on ne peut presque jamais l'utiliser t'apprend l'essentiel de ce qui fait qu'un chiffrement tient ou tombe.

Tu as déjà manipulé le XOR sur STeaMi (chiffrement XOR dans ton kit crypto, décryptage XOR de BMP en CTF) — ce cours formalise ce que tu as fait à la main.

## L'opération XOR

XOR (« ou exclusif », noté ⊕ ou `^` en Python) est une opération bit à bit :

| A | B | A ⊕ B |
|---|---|-------|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

En clair : le résultat vaut 1 si les deux bits sont **différents**, 0 s'ils sont identiques.

La propriété magique pour la crypto est **l'involution** : appliquer deux fois la même clé annule l'opération.

```
C = P ⊕ K       (chiffrement)
P = C ⊕ K       (déchiffrement — exactement la même opération !)
```

Parce que `(P ⊕ K) ⊕ K = P ⊕ (K ⊕ K) = P ⊕ 0 = P`.

C'est ce qui rend le XOR si pratique : **une seule fonction sert à chiffrer et déchiffrer**. Sur microcontrôleur, c'est aussi ultra-rapide et léger, d'où son omniprésence en embarqué.

```python
def xor_cipher(data: bytes, key: bytes) -> bytes:
    # La clé est répétée cycliquement sur toute la longueur des données
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))

message = b"Hello STeaMi"
key = b"secret"

chiffre = xor_cipher(message, key)
dechiffre = xor_cipher(chiffre, key)  # même fonction

print(chiffre.hex())      # illisible
print(dechiffre)          # b"Hello STeaMi"
```

## Le One-Time Pad : le chiffrement parfait

Le One-Time Pad, formalisé par Gilbert Vernam (1917) puis prouvé incassable par Claude Shannon (1949), c'est du XOR avec **trois conditions strictes** sur la clé :

1. La clé est **vraiment aléatoire** (générée par une source physique, pas un PRNG).
2. La clé est **aussi longue que le message** (pas de répétition).
3. La clé n'est **jamais réutilisée** (le « one-time »).

Si ces trois conditions sont réunies, le chiffrement est mathématiquement incassable. C'est ce qu'on appelle la **secrecy parfaite** (perfect secrecy).

### Pourquoi c'est incassable

L'intuition est la suivante : pour un ciphertext donné, **absolument n'importe quel plaintext de même longueur est possible**, et tous sont équiprobables. Le chiffré ne contient donc littéralement aucune information sur le clair.

Prends un ciphertext de 5 lettres. Il existe une clé qui le déchiffre en `HELLO`, une autre qui le déchiffre en `WORLD`, une autre en `ATTACK`... et chacune de ces clés est aussi probable que les autres. Sans information supplémentaire, un attaquant ne peut pas savoir laquelle est la bonne. Même avec une puissance de calcul infinie, il n'y a rien à casser : l'information n'est pas là.

C'est le seul système dont la sécurité ne dépend pas de la puissance de calcul de l'attaquant. Tous les autres (AES, RSA...) sont « seulement » computationnellement sûrs : incassables *en pratique* avec les machines actuelles, mais pas *en théorie*.

## Pourquoi on ne l'utilise (presque) jamais

Si c'est parfait, pourquoi tout le monde utilise AES à la place ? À cause de la clé :

**La clé est aussi longue que le message.** Pour chiffrer 1 Go de données, il faut 1 Go de clé aléatoire. Et comme il faut transmettre cette clé de façon sûre au destinataire... si on avait un canal sûr pour transmettre 1 Go de clé, on l'utiliserait pour transmettre le message directement. C'est le serpent qui se mord la queue.

**Le problème de distribution des clés** est donc rédhibitoire. L'OTP n'a été utilisé que dans des contextes très spécifiques où on pouvait pré-partager physiquement d'énormes quantités de clé : le téléphone rouge Washington-Moscou pendant la Guerre froide, les carnets à usage unique des espions (d'où le nom « pad »).

**Générer du vrai aléa en quantité est difficile.** Un PRNG classique ne suffit pas — il faut une source d'entropie physique.

## Les attaques : quand le XOR est mal utilisé

C'est là que ça devient intéressant pour toi. Le XOR mal employé (ce qui arrive tout le temps) est trivial à casser.

### Attaque 1 : réutilisation de clé (key reuse / two-time pad)

C'est **la** faute mortelle. Si on chiffre deux messages avec la même clé :

```
C1 = P1 ⊕ K
C2 = P2 ⊕ K
```

Alors un attaquant qui a C1 et C2 peut calculer :

```
C1 ⊕ C2 = (P1 ⊕ K) ⊕ (P2 ⊕ K) = P1 ⊕ P2
```

**La clé a disparu !** L'attaquant obtient le XOR des deux clairs. À partir de là, avec un peu d'analyse de fréquence ou du « crib dragging » (deviner un bout de l'un des messages, par exemple `" the "` en anglais, et voir ce que ça révèle dans l'autre), on récupère les deux messages en clair.

C'est exactement la faille qui rend un « OTP » réutilisé complètement cassable, et c'est un classique en CTF. Dès que tu vois plusieurs ciphertexts XORés avec la même clé, c'est gagné.

### Attaque 2 : clé courte répétée (Vigenère binaire)

Quand la clé est plus courte que le message et se répète (comme dans mon exemple `xor_cipher` plus haut avec `key="secret"`), ce n'est plus un OTP mais un chiffre de Vigenère en binaire. On le casse en deux temps :

1. **Trouver la longueur de la clé.** On teste chaque longueur candidate et on mesure l'indice de coïncidence, ou on utilise la distance de Hamming entre blocs (méthode des Cryptopals) : la vraie longueur de clé donne la distance normalisée la plus faible.

2. **Casser chaque octet indépendamment.** Une fois la longueur connue, on regroupe tous les octets chiffrés par la même position de clé. Chaque groupe a été XORé par un seul octet (256 possibilités). On teste les 256 valeurs et on garde celle qui donne le texte le plus « naturel » (analyse de fréquence : beaucoup d'espaces, de lettres courantes).

```python
# Casser un seul octet de clé XOR par analyse de fréquence
def score_english(text: bytes) -> float:
    # Plus il y a de caractères courants, meilleur est le score
    freq = b" etaoinshrdluETAOIN"
    return sum(text.count(c) for c in freq)

def break_single_byte_xor(ciphertext: bytes):
    best = (0, None, None)
    for key in range(256):
        candidate = bytes(b ^ key for b in ciphertext)
        s = score_english(candidate)
        if s > best[0]:
            best = (s, key, candidate)
    return best  # (score, clé trouvée, plaintext)
```

C'est le cœur des premiers challenges Cryptopals, et la logique derrière ton décryptage XOR de BMP en CTF : le format BMP a un en-tête connu et prévisible, ce qui donne directement plusieurs octets de clé (attaque à clair connu — *known-plaintext attack*).

### Attaque 3 : clair connu (known-plaintext)

Si tu connais ne serait-ce qu'un bout du plaintext et le ciphertext correspondant, tu récupères directement la clé sur cette portion :

```
K = P ⊕ C
```

Les formats de fichiers (BMP, PNG, PDF, ZIP) ont des en-têtes fixes et connus. C'est pour ça que « chiffrer » un fichier par XOR à clé courte ne protège rien : les premiers octets du format donnent la clé.

## Ce qu'il faut retenir

- Le XOR est la brique de base de la crypto symétrique, involutif donc pratique, mais **nul en soi** comme chiffrement.
- Le One-Time Pad (XOR + clé vraiment aléatoire, aussi longue que le message, jamais réutilisée) est le **seul chiffrement parfait**, mais inutilisable en pratique à cause de la distribution des clés.
- Les trois attaques à connaître : **réutilisation de clé** (deux ciphertexts → la clé s'annule), **clé courte répétée** (Vigenère binaire, cassable par fréquence), **clair connu** (l'en-tête donne la clé).
- Dans la vraie vie, on ne recode jamais du XOR maison : on utilise AES ou ChaCha20, qui génèrent un keystream cryptographiquement sûr qu'on XOR avec les données. C'est l'objet du cours suivant.
