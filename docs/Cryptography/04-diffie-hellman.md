---
id: 04-diffie-hellman
title: Diffie-Hellman (échange de clés)
sidebar_position: 6
---

# Diffie-Hellman — l'échange de clés

## Le miracle de 1976

Reprenons le problème central du chiffrement symétrique : Alice et Bob veulent une clé secrète commune, mais tout ce qu'ils s'échangent passe par un canal public qu'un attaquant (appelons-le Eve, pour *eavesdropper*) peut écouter entièrement. Comment se mettre d'accord sur un secret **sous les yeux d'un espion** ?

En 1976, Whitfield **Diffie** et Martin **Hellman** (avec des idées de Ralph Merkle) ont publié la solution, et c'est l'une des idées les plus élégantes de toute l'informatique. Leur article « New Directions in Cryptography » a littéralement fondé la crypto moderne à clé publique — un an avant RSA. Ils ont reçu le prix Turing pour ça en 2015.

Le point clé, et ce qui le distingue de RSA : Diffie-Hellman n'est **pas un algorithme de chiffrement**. On ne chiffre rien avec. C'est un protocole d'**échange de clé** : à la fin, les deux parties partagent un secret commun, qu'elles utiliseront ensuite comme clé pour du chiffrement symétrique (AES).

Ton protocole d'échange de clé bilatéral sur STeaMi, c'est exactement cette famille d'idées.

## L'analogie des pots de peinture

C'est la meilleure façon de comprendre l'intuition avant les maths.

Imagine que mélanger deux peintures est facile, mais que **séparer** un mélange en ses composantes est pratiquement impossible. C'est la fonction à sens unique.

1. Alice et Bob se mettent d'accord publiquement sur une **couleur de base** commune, disons du jaune. Eve la voit, peu importe.
2. Chacun choisit une **couleur secrète** qu'il ne révèle à personne. Alice : rouge. Bob : bleu.
3. Chacun mélange sa couleur secrète avec le jaune public, et **s'envoie le mélange** :
   - Alice envoie jaune + rouge = orange.
   - Bob envoie jaune + bleu = vert.
   - Eve voit passer l'orange et le vert, mais ne peut pas en extraire le rouge ni le bleu.
4. Chacun ajoute sa **propre couleur secrète** au mélange reçu :
   - Alice fait : vert (reçu) + rouge (son secret) = jaune+bleu+rouge.
   - Bob fait : orange (reçu) + bleu (son secret) = jaune+rouge+bleu.
5. **Les deux obtiennent exactement le même mélange final** (jaune+rouge+bleu), qui est leur secret commun. Eve, elle, aurait besoin d'une des couleurs secrètes pour y arriver, et elle ne les a pas.

Toute la beauté est là : le secret commun n'a jamais transité sur le canal. Il a été **reconstruit indépendamment** de chaque côté.

## Comment ça marche (version mathématique légère)

Dans la vraie version, les « couleurs » sont des nombres et le « mélange à sens unique » est l'**exponentiation modulaire** : facile à calculer, mais très difficile à inverser (c'est le **problème du logarithme discret**).

Les paramètres publics :
- Un grand nombre premier `p`.
- Un générateur `g` (une base).

L'échange :

1. Alice choisit un secret `a`, calcule `A = g^a mod p`, envoie `A`.
2. Bob choisit un secret `b`, calcule `B = g^b mod p`, envoie `B`.
3. Alice calcule `s = B^a mod p`.
4. Bob calcule `s = A^b mod p`.

Les deux obtiennent le même `s`, car :

```
B^a = (g^b)^a = g^(ab) = (g^a)^b = A^b   (mod p)
```

Eve voit passer `p`, `g`, `A` et `B`. Pour retrouver `s`, il lui faudrait déduire `a` de `A = g^a mod p` — c'est le **problème du logarithme discret**, réputé infaisable pour des `p` assez grands.

```python
# Diffie-Hellman minimal (paramètres jouets pour l'exemple)
p = 0xFFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1  # grand premier (tronqué ici)
g = 2

# Secrets locaux (jamais transmis)
import secrets
a = secrets.randbelow(p)   # secret d'Alice
b = secrets.randbelow(p)   # secret de Bob

# Valeurs publiques échangées
A = pow(g, a, p)
B = pow(g, b, p)

# Secret commun, calculé indépendamment de chaque côté
s_alice = pow(B, a, p)
s_bob   = pow(A, b, p)

assert s_alice == s_bob   # même secret partagé !
```

En pratique, on ne se sert pas de `s` directement comme clé AES : on le passe dans une **KDF** (Key Derivation Function, souvent basée sur un hash comme HKDF) pour en tirer une clé propre et de la bonne taille.

## La faille majeure : Man-in-the-Middle

Diffie-Hellman a un défaut énorme dans sa forme brute : **il n'authentifie personne**. Rien ne prouve à Alice que le `B` qu'elle reçoit vient bien de Bob.

Un attaquant actif (Mallory, en position de MitM — tu connais ça de tes cours WiFi et Ettercap) peut s'intercaler :

1. Mallory intercepte l'échange. À Alice, il se fait passer pour Bob ; à Bob, pour Alice.
2. Il établit **un secret partagé avec Alice** et **un autre avec Bob**.
3. Résultat : Alice et Bob croient parler ensemble en sécurité, mais Mallory déchiffre, lit (et peut modifier) tout au milieu, en rechiffrant pour l'autre.

DH protège contre l'écoute **passive** (Eve), pas contre l'attaquant **actif** (Mallory). C'est une distinction fondamentale.

La parade : **authentifier** l'échange. On combine DH avec des signatures ou des certificats pour prouver l'identité des parties. C'est précisément ce que fait TLS : le serveur signe ses paramètres DH avec sa clé privée, et le client vérifie cette signature via le certificat (cours 7).

## Ephemeral DH et forward secrecy

Un immense avantage de DH sur le transport de clé RSA : la **Perfect Forward Secrecy** (PFS).

En mode **éphémère** (noté **DHE** ou **ECDHE**), on génère de **nouveaux secrets `a` et `b` à chaque session**, jetés après usage. Conséquence : même si un attaquant enregistre tout le trafic chiffré aujourd'hui, et vole la clé privée du serveur dans 5 ans, **il ne pourra pas déchiffrer les sessions passées** — car les secrets DH éphémères n'existent plus et n'ont jamais été stockés.

Compare avec l'ancien RSA key transport : la clé de session était chiffrée avec la clé publique RSA du serveur. Voler la clé privée RSA plus tard permet de déchiffrer *tout* le trafic passé enregistré. C'est pour ça que **TLS 1.3 a supprimé le RSA key transport** et impose l'échange éphémère (ECDHE). La forward secrecy est devenue non négociable.

## DH classique vs ECDH

Le Diffie-Hellman « classique » (sur les entiers modulo `p`) nécessite des `p` très grands (2048-4096 bits) pour être sûr, ce qui le rend lourd. Sa version moderne, **ECDH** (Elliptic Curve Diffie-Hellman), applique exactement le même protocole mais sur des courbes elliptiques, ce qui offre la même sécurité avec des clés bien plus courtes (256 bits) et des calculs plus rapides. C'est ce qu'on utilise partout aujourd'hui — c'est l'objet du cours suivant. La courbe **X25519** est le standard de fait actuel (TLS 1.3, WireGuard, Signal).

## Où tu croises DH

- **TLS 1.3** : ECDHE pour établir chaque session (obligatoire, pour la forward secrecy).
- **WireGuard** (VPN moderne) : basé sur X25519.
- **Signal / WhatsApp** : le protocole Signal enchaîne des DH pour renouveler les clés en continu (Double Ratchet).
- **SSH** : négociation de clé par DH/ECDH au début de chaque connexion.

## Ce qu'il faut retenir

- Diffie-Hellman résout le problème historique : **créer un secret commun à travers un canal public écouté**, sans jamais transmettre ce secret.
- Ce n'est **pas du chiffrement** : c'est un échange de clé ; le secret obtenu sert ensuite de clé symétrique (après une KDF).
- Sa sécurité repose sur le **problème du logarithme discret**.
- Faille majeure : **pas d'authentification → vulnérable au Man-in-the-Middle actif**. On doit l'associer à des signatures/certificats.
- En mode **éphémère (DHE/ECDHE)**, il offre la **forward secrecy** : le trafic passé reste protégé même si la clé long-terme est volée plus tard. C'est pourquoi TLS 1.3 l'impose.
- La version moderne est **ECDH** (sur courbes elliptiques), plus rapide et plus compacte — cours suivant.
