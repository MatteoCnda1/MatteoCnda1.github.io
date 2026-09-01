---
id: 02-chiffrement-symetrique
title: Chiffrement symétrique (AES et modes)
sidebar_position: 4
---

# Chiffrement symétrique (AES et modes opératoires)

## Le principe et son problème

Le chiffrement symétrique, c'est le plus intuitif : **une seule clé** sert à chiffrer et à déchiffrer, partagée entre les deux parties. C'est rapide, efficace, et c'est ce qui chiffre le gros du trafic mondial (HTTPS, VPN, disques chiffrés, WPA2...).

Son défaut fondamental est le **problème de distribution des clés** : comment Alice et Bob se mettent-ils d'accord sur une clé secrète sans qu'un attaquant qui écoute le canal ne l'intercepte ? On ne peut pas envoyer la clé en clair. Ce problème n'a été résolu qu'en 1976 avec Diffie-Hellman (cours 4) et la crypto asymétrique (cours 3). En pratique aujourd'hui : on utilise l'asymétrique pour échanger une clé symétrique, puis la symétrique pour tout le reste.

## Un peu d'histoire : de DES à AES

**DES** (Data Encryption Standard, 1977) fut le premier standard, développé par IBM et la NSA. Son talon d'Achille : une clé de seulement **56 bits**. Dès les années 90, c'était trop court. En 1998, l'EFF a construit « Deep Crack », une machine à 250 000 $ qui cassait une clé DES par brute force en quelques jours. DES était mort.

La rustine **3DES** (triple DES) a prolongé sa vie en appliquant DES trois fois, mais c'était lent et bancal.

Le NIST a alors lancé un concours public (encore le principe de Kerckhoffs : tout au grand jour) pour trouver un successeur. En 2001, l'algorithme belge **Rijndael**, conçu par Joan Daemen et Vincent Rijmen, a gagné et est devenu **AES** (Advanced Encryption Standard). Plus de 20 ans après, AES n'a jamais été cassé et reste le standard mondial.

## Block cipher vs stream cipher

Deux grandes familles de chiffrement symétrique :

**Block ciphers** — Chiffrent des blocs de taille fixe (128 bits = 16 octets pour AES). Si le message n'est pas un multiple de la taille de bloc, il faut le compléter (padding). AES est un block cipher.

**Stream ciphers** — Génèrent un keystream (flot de clé) pseudo-aléatoire qu'on XOR avec les données, octet par octet (rappel du cours précédent : c'est un OTP dont la clé est générée algorithmiquement au lieu d'être vraiment aléatoire). Exemple moderne : **ChaCha20**, très utilisé sur mobile et dans TLS car rapide sans accélération matérielle.

Point important : avec les bons **modes opératoires**, un block cipher comme AES peut se comporter comme un stream cipher (modes CTR, GCM). C'est le sujet central de ce cours.

## AES en deux mots (sans les maths)

Tu n'as pas besoin de connaître les maths internes d'AES pour l'utiliser correctement — et honnêtement, personne ne réimplémente AES à la main en production. L'idée générale : AES transforme un bloc de 128 bits par une série de **rounds** (10, 12 ou 14 selon la taille de clé), chaque round appliquant des étapes de substitution (SubBytes, via une table appelée S-box), de permutation (ShiftRows, MixColumns) et de mélange avec la clé (AddRoundKey).

Le résultat : une transformation qui « brasse » complètement les bits de façon à respecter deux propriétés énoncées par Shannon :

- **Confusion** : la relation entre la clé et le ciphertext est aussi complexe que possible.
- **Diffusion** : changer un seul bit du plaintext change environ la moitié des bits du ciphertext (effet avalanche).

Les tailles de clé : **AES-128**, **AES-192**, **AES-256**. AES-128 est déjà largement suffisant contre le brute force. AES-256 offre une marge de sécurité supplémentaire, notamment vis-à-vis d'un futur ordinateur quantique (l'algorithme de Grover diviserait par deux la sécurité effective, ramenant AES-256 à ~128 bits de sécurité — encore confortable).

## Les modes opératoires : là où tout se joue

Voici le point crucial. AES chiffre un bloc de 16 octets. Mais tes données font rarement pile 16 octets. Le **mode opératoire** définit comment enchaîner le chiffrement de plusieurs blocs. Et c'est **dans le choix du mode que se trouvent la plupart des failles réelles** — pas dans AES lui-même.

### ECB (Electronic Codebook) — à ne JAMAIS utiliser

Le mode le plus naïf : on découpe le message en blocs de 16 octets et on chiffre chaque bloc indépendamment avec la même clé.

Le problème est fatal : **deux blocs de plaintext identiques donnent deux blocs de ciphertext identiques**. La structure du message transparaît dans le chiffré.

L'illustration classique est le « pingouin ECB » (Tux) : quand on chiffre une image bitmap en AES-ECB, on reconnaît encore parfaitement le pingouin dans l'image chiffrée, parce que les zones de couleur uniforme produisent des motifs répétés identiques. Le chiffrement n'a rien caché de la structure.

```python
# NE JAMAIS FAIRE ÇA en vrai — illustration de la faiblesse ECB
from Crypto.Cipher import AES  # pip install pycryptodome

key = b"0123456789abcdef"  # 16 octets = AES-128
cipher = AES.new(key, AES.MODE_ECB)

# Deux blocs identiques dans le plaintext...
plaintext = b"AAAAAAAAAAAAAAAA" + b"AAAAAAAAAAAAAAAA"
ct = cipher.encrypt(plaintext)

# ...donnent deux blocs chiffrés identiques (fuite d'information)
print(ct[:16] == ct[16:32])  # True → catastrophe
```

En pentest / audit : voir du **AES-ECB** est un finding en soi. Et un ciphertext où l'on détecte des blocs de 16 octets répétés trahit ECB.

### CBC (Cipher Block Chaining) — historique, mais piégeux

CBC corrige ECB en **chaînant** les blocs : chaque bloc de plaintext est XORé avec le ciphertext du bloc précédent avant d'être chiffré. Résultat : deux blocs identiques donnent des chiffrés différents.

Pour le tout premier bloc, il n'y a pas de « précédent », alors on utilise un **IV** (Initialization Vector), une valeur aléatoire de 16 octets transmise avec le message.

Deux règles absolues sur l'IV :
- Il doit être **imprévisible** (aléatoire) pour chaque message.
- Un IV réutilisé avec la même clé casse la propriété de CBC (les débuts de messages identiques redeviennent visibles).

Les failles de CBC :

**Padding oracle attack.** CBC nécessite du padding (souvent PKCS#7) pour compléter le dernier bloc. Si le système révèle — même indirectement, par un message d'erreur ou un timing différent — que le padding est invalide après déchiffrement, un attaquant peut déchiffrer **tout le message sans connaître la clé**, octet par octet. C'est une attaque dévastatrice et très répandue (elle a touché TLS via POODLE, ASP.NET, etc.). La leçon : chiffrer sans authentifier est dangereux.

**Malleability.** Comme le déchiffrement XOR le bloc précédent, un attaquant qui modifie un octet du ciphertext peut prédire l'effet sur le plaintext déchiffré. Sans MAC, CBC ne protège pas l'intégrité.

### CTR (Counter) — transformer AES en stream cipher

Le mode CTR chiffre un **compteur** (qui s'incrémente à chaque bloc) plutôt que les données, et XOR le résultat avec le plaintext. AES devient un générateur de keystream — c'est un stream cipher.

Avantages : parallélisable (chaque bloc est indépendant), pas de padding nécessaire, chiffrement et déchiffrement sont la même opération. Mais **le nonce/compteur ne doit JAMAIS être réutilisé avec la même clé** — sinon on retombe exactement sur l'attaque du two-time pad du cours précédent (deux keystreams identiques → `C1 ⊕ C2 = P1 ⊕ P2`). Réutiliser un nonce en CTR est une faille classique.

CTR seul ne protège pas non plus l'intégrité. D'où GCM.

### GCM (Galois/Counter Mode) — le standard moderne (AEAD)

C'est le mode qu'il faut utiliser aujourd'hui. GCM = CTR (pour la confidentialité) **+ une authentification intégrée** (un tag qui garantit l'intégrité et l'authenticité). C'est ce qu'on appelle un mode **AEAD** (Authenticated Encryption with Associated Data).

Ce que GCM apporte par rapport aux modes précédents :
- Confidentialité (comme CTR).
- **Intégrité et authenticité** : si le ciphertext est modifié d'un seul bit, le déchiffrement échoue au lieu de retourner des données corrompues. Fini les padding oracles et la malleability.
- Les « associated data » : on peut authentifier des données non chiffrées (en-têtes de paquet, métadonnées) en même temps.

```python
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

key = get_random_bytes(32)      # AES-256
nonce = get_random_bytes(12)    # 96 bits recommandé pour GCM, unique par message

cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
ciphertext, tag = cipher.encrypt_and_digest(b"Message secret")

# Déchiffrement + vérification d'intégrité
decipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
plaintext = decipher.decrypt_and_verify(ciphertext, tag)  # lève une exception si altéré
print(plaintext)
```

Même contrainte que CTR : le **nonce doit être unique** par message pour une clé donnée. La réutilisation de nonce en GCM est particulièrement grave car elle permet en plus de récupérer la clé d'authentification.

## Où tu croises tout ça

- **WPA2** (ton cours WiFi pentest) utilise AES en mode **CCMP** (un autre mode AEAD basé sur CTR + CBC-MAC). Le handshake que tu captures en pentest WiFi sert à dériver les clés de session.
- **TLS 1.3** n'autorise plus que des modes AEAD : AES-GCM et ChaCha20-Poly1305. Les modes CBC ont été retirés à cause des padding oracles.
- **VPN** (IPsec, WireGuard) : AES-GCM ou ChaCha20-Poly1305.
- **Disques chiffrés** (LUKS, BitLocker) : AES en mode XTS (spécialisé pour le stockage).

## Ce qu'il faut retenir

- Le chiffrement symétrique (une clé partagée) est rapide et chiffre le gros du trafic ; son problème historique est la distribution de la clé.
- **AES** est le standard incassable depuis 2001 ; on ne le réimplémente jamais soi-même, on utilise une bibliothèque éprouvée.
- **Le mode opératoire est le vrai enjeu de sécurité** : ECB fuit la structure (à bannir), CBC est piégeux (padding oracle, besoin de MAC), CTR transforme AES en stream cipher (nonce jamais réutilisé), **GCM/AEAD est le bon choix moderne** (chiffrement + authentification).
- Les failles réelles viennent presque toujours de l'usage — nonce/IV réutilisé, absence d'authentification, ECB — pas de l'algorithme lui-même.
