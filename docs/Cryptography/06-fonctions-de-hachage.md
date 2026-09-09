---
id: 06-fonctions-de-hachage
title: Fonctions de hachage
sidebar_position: 8
tags: [cryptographie]
---

# Fonctions de hachage

## Un objet différent des chiffrements

Jusqu'ici on a parlé de chiffrement : transformer un message pour le rendre secret, puis le récupérer. Les fonctions de hachage sont d'une autre nature : **elles ne sont pas réversibles, et il n'y a pas de clé**. Une fonction de hachage prend une entrée de taille quelconque et produit une empreinte de taille fixe (le **hash**, ou **digest**), de façon déterministe.

```
hash("bonjour")            → 2cf24dba5fb0a30e26e83b2ac5b9e29e... (SHA-256, 256 bits)
hash("Le Petit Prince.pdf") → une empreinte de 256 bits, quelle que soit la taille du fichier
```

Le point clé : c'est une opération à **sens unique**. On ne peut pas remonter du hash vers l'entrée. Le hash sert à représenter, vérifier, comparer — jamais à cacher pour révéler ensuite.

## Les propriétés d'une bonne fonction de hachage cryptographique

Toutes les fonctions de hachage ne sont pas cryptographiques (le hash d'une table de hachage Python, non). Une fonction de hachage **cryptographique** doit garantir :

**Déterminisme** — La même entrée donne toujours le même hash. Sinon on ne pourrait rien vérifier.

**Rapidité** — Calculer le hash doit être rapide (nuance : pour le hachage de mots de passe, on veut au contraire que ce soit lent — voir plus bas).

**Effet avalanche** — Changer un seul bit de l'entrée doit changer environ la moitié des bits du hash. Deux entrées quasi identiques donnent des hashs totalement différents et sans relation visible.

**Résistance à la préimage** (one-way) — À partir d'un hash `h`, il doit être infaisable de trouver une entrée `m` telle que `hash(m) = h`. C'est le « sens unique ».

**Résistance à la seconde préimage** — À partir d'un message `m1`, il doit être infaisable de trouver un `m2 ≠ m1` avec le même hash.

**Résistance aux collisions** — Il doit être infaisable de trouver **deux** messages quelconques `m1 ≠ m2` ayant le même hash. C'est la propriété la plus dure à garantir, et c'est souvent par là que les fonctions de hachage tombent.

## Le paradoxe des anniversaires (pourquoi les collisions arrivent plus vite qu'on croit)

Un point contre-intuitif essentiel. On pourrait croire qu'avec un hash de `n` bits, il faut essayer 2ⁿ possibilités pour trouver une collision. Faux : à cause du **paradoxe des anniversaires**, il n'en faut qu'environ **2^(n/2)**.

L'analogie : dans une salle de 23 personnes, il y a plus de 50 % de chances que deux partagent le même anniversaire — bien moins que les 365 qu'on imaginerait naïvement. Parce qu'on ne cherche pas une date précise, mais **n'importe quelle** coïncidence entre paires.

Conséquence concrète : un hash de 128 bits n'offre que **64 bits de résistance aux collisions**, ce qui est aujourd'hui à portée d'attaque. C'est pour ça qu'on veut des hashs d'au moins **256 bits** (SHA-256) pour avoir 128 bits de sécurité effective contre les collisions.

## Petite histoire des algorithmes (le cimetière)

L'histoire du hachage est une suite de morts annoncées :

**MD5** (1991) — Longtemps ubiquitaire. **Cassé** : les collisions sont aujourd'hui triviales à générer (quelques secondes sur un laptop). En 2008, des chercheurs ont créé un **faux certificat CA** valide en exploitant une collision MD5 ; en 2012, le malware **Flame** a utilisé une collision MD5 pour se faire passer pour une mise à jour Microsoft légitime. **MD5 est mort pour tout usage de sécurité.** On le croise encore comme checksum non sécurisé (vérifier qu'un téléchargement n'est pas corrompu accidentellement), mais jamais contre un adversaire.

**SHA-1** (1995) — Le successeur, standard pendant 20 ans. **Cassé aussi** : en 2017, Google a produit la première collision SHA-1 concrète (attaque **SHAttered**, deux PDF différents avec le même hash SHA-1). En 2020, l'attaque **SHA-1 is a Shambles** a rendu les collisions à préfixe choisi abordables. **SHA-1 est déprécié partout.** Tu l'as croisé en CTF Root-Me (le SCRAM-SHA-1) — c'est instructif justement parce que c'est un algo obsolète.

**SHA-2** (2001) — La famille actuelle (**SHA-256**, SHA-384, SHA-512). **Toujours sûre**, aucun cassage connu. C'est le standard de fait aujourd'hui. Structure interne dite « Merkle-Damgård » (comme MD5 et SHA-1, mais sans leurs faiblesses).

**SHA-3** (2015) — Pas un remplaçant d'urgence de SHA-2 (qui va très bien), mais une **alternative de conception radicalement différente** (structure « éponge », algorithme Keccak), choisie par concours public. L'idée : avoir une seconde famille prête, au cas où une faiblesse structurelle serait un jour trouvée dans la lignée Merkle-Damgård. Immunisée nativement contre l'attaque par extension de longueur (voir plus bas).

## Les usages (très variés)

Les fonctions de hachage sont partout, avec des rôles distincts :

**Vérification d'intégrité** — Le checksum d'un fichier téléchargé, le hash d'une image disque. Si le hash correspond, le fichier n'a pas été altéré. C'est ce que tu vois avec les `sha256sum` des ISO Linux.

**Signatures numériques** — On ne signe jamais un gros document directement (RSA/ECDSA sont lents et limités en taille) : on signe **son hash**. D'où l'importance capitale de la résistance aux collisions — si on peut trouver deux documents avec le même hash, une signature valide pour l'un vaut pour l'autre (c'est exactement l'attaque des faux certificats MD5).

**Structures de données et blockchain** — Les arbres de Merkle, Git (chaque commit est identifié par un hash SHA-1... en migration vers SHA-256), Bitcoin (SHA-256 pour le minage et le chaînage des blocs).

**Stockage de mots de passe** — Le sujet le plus sensible, traité juste après.

## Stockage des mots de passe : le cas particulier

C'est LE cas où le hachage est mal fait le plus souvent, et un finding récurrent en pentest.

**La base : ne jamais stocker un mot de passe en clair.** On stocke son hash. À la connexion, on hache ce que tape l'utilisateur et on compare aux hashs stockés. Si la base fuite, l'attaquant n'a que des hashs.

Mais un hash simple ne suffit pas, pour trois raisons :

**Problème 1 — les rainbow tables.** Un attaquant peut précalculer les hashs de milliards de mots de passe courants et les stocker dans une table. Face à `hash("password123")`, un simple lookup révèle le mot de passe instantanément. La parade est le **salt**.

**Le salt** est une valeur aléatoire, unique par utilisateur, ajoutée au mot de passe avant hachage : `hash(password + salt)`. Le salt est stocké en clair à côté du hash. Effet : deux utilisateurs avec le même mot de passe ont des hashs différents, et les rainbow tables précalculées deviennent inutiles (il faudrait une table par salt).

**Problème 2 — la vitesse.** SHA-256 est conçu pour être **rapide** — c'est un défaut ici. Un GPU moderne calcule des **milliards** de SHA-256 par seconde, donc peut brute-forcer des mots de passe faibles très vite, même salés. La parade : des fonctions **lentes et coûteuses** conçues exprès pour le hachage de mots de passe :

- **bcrypt** — éprouvé, avec un facteur de coût ajustable.
- **scrypt** — coûteux aussi en mémoire (résiste mieux aux attaques GPU/ASIC).
- **Argon2** — le lauréat du Password Hashing Competition (2015), recommandé aujourd'hui ; coût en temps **et** en mémoire paramétrable.

**Le pepper** (optionnel) — un secret global, non stocké dans la base (dans le code ou un HSM), ajouté au hachage. Si seule la base fuite, les hashs restent inattaquables sans le pepper.

```python
# Bon hachage de mot de passe avec bcrypt
import bcrypt

password = b"MonMotDePasse!"

# À l'inscription : bcrypt génère et intègre le salt automatiquement
hashed = bcrypt.hashpw(password, bcrypt.gensalt(rounds=12))
# `hashed` contient déjà le salt et le coût, à stocker tel quel

# À la connexion : comparaison en temps constant
if bcrypt.checkpw(password, hashed):
    print("Mot de passe correct")
```

En pentest, quand tu récupères une base de hashs : des SHA-256/MD5 nus se cassent en masse avec hashcat et une wordlist (comme le WPA du cours WiFi, mêmes outils) ; des bcrypt/Argon2 bien paramétrés résistent, sauf mots de passe faibles.

## HMAC : hacher avec une clé pour l'authenticité

Un hash seul garantit l'intégrité **accidentelle**, pas l'authenticité. Un attaquant qui modifie un message peut recalculer le hash lui-même — rien ne l'en empêche, puisqu'il n'y a pas de secret.

Le **HMAC** (Hash-based Message Authentication Code) résout ça en combinant le hash avec une **clé secrète** partagée : `HMAC(clé, message)`. Seul quelqu'un connaissant la clé peut produire ou vérifier le MAC. Ça garantit à la fois **intégrité et authenticité**.

Pourquoi HMAC et pas juste `hash(clé + message)` ? Parce que ce dernier est vulnérable à l'**attaque par extension de longueur** : avec les fonctions Merkle-Damgård (MD5, SHA-1, SHA-2), connaître `hash(clé + message)` permet de calculer `hash(clé + message + extension)` sans connaître la clé. HMAC utilise une construction à deux passes (`hash(clé_ext ‖ hash(clé_int ‖ message))`) qui neutralise cette attaque. C'est le genre de subtilité qui fait qu'on n'invente jamais sa construction crypto.

```python
import hmac, hashlib

key = b"cle_secrete_partagee"
message = b"virement:1000EUR"

mac = hmac.new(key, message, hashlib.sha256).hexdigest()

# Vérification — TOUJOURS en temps constant pour éviter les timing attacks
recu = mac  # celui reçu avec le message
valide = hmac.compare_digest(mac, recu)  # PAS `mac == recu`
```

Note le `hmac.compare_digest` : comparer des MAC avec `==` classique fuite de l'information par timing (la comparaison s'arrête au premier octet différent). On compare toujours en temps constant. C'est le genre de détail qui distingue le CTF de la vraie sécurité.

HMAC est partout : TLS (intégrité des enregistrements), JWT (signature des tokens HS256), API (signature des requêtes), et... le **SCRAM-SHA-1** que tu as croisé en CTF, qui est un mécanisme d'authentification basé sur HMAC.

## Ce qu'il faut retenir

- Une fonction de hachage cryptographique est **à sens unique, sans clé, déterministe**, avec effet avalanche et surtout **résistance aux collisions**.
- Le **paradoxe des anniversaires** fait qu'un hash de `n` bits n'offre que `n/2` bits de résistance aux collisions → utiliser au moins **SHA-256**.
- **MD5 et SHA-1 sont morts** (collisions réelles : faux certificats, Flame, SHAttered). Standards actuels : **SHA-2 (SHA-256)** et **SHA-3**.
- **Mots de passe** : jamais en clair, jamais un hash rapide nu. Utiliser **salt + fonction lente (bcrypt, scrypt, Argon2)**, éventuellement un pepper.
- **HMAC** ajoute une clé secrète au hash pour garantir **intégrité + authenticité**, et évite l'attaque par extension de longueur. Toujours comparer les MAC **en temps constant**.
