---
id: 07-cles-publiques-privees-et-certificats
title: Clés publiques/privées, PKI et certificats
sidebar_position: 9
tags: [cryptographie, web]
---

# Clés publiques/privées, PKI et certificats

Ce cours rassemble et met en pratique tout ce qui précède (RSA, ECC, hachage, signatures) pour répondre à une question concrète : **quand ton navigateur affiche le cadenas HTTPS, que se passe-t-il exactement, et à qui fais-tu confiance ?** C'est le cœur de la sécurité du web, des VPN, du SSH, de la signature de code — et un domaine où tu croiseras des certificats en permanence en tant que réseau/cyber.

## Rappel : le couple de clés

En crypto asymétrique (RSA, ECC), on a toujours **deux clés liées mathématiquement** :

- La **clé privée** : gardée secrète, jamais partagée. Elle sert à **déchiffrer** ce qui t'est destiné et à **signer** (prouver que ça vient de toi).
- La **clé publique** : diffusée librement. Elle sert à **chiffrer** un message pour toi et à **vérifier** tes signatures.

Deux directions d'usage, à ne pas confondre :

**Pour la confidentialité** — On chiffre avec la clé **publique** du destinataire ; lui seul, avec sa clé **privée**, peut déchiffrer.

**Pour l'authenticité (signature)** — On signe avec sa **propre clé privée** ; tout le monde vérifie avec sa clé **publique**. Comme seul le détenteur de la clé privée a pu produire la signature, ça prouve l'origine et l'intégrité.

Signer, en pratique : on calcule le **hash** du document (cours 6), puis on le transforme avec la clé privée. C'est rapide et de taille fixe quel que soit le document.

```python
# Signature RSA-PSS : on signe, on vérifie
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

document = b"Contrat important v3"

# Alice signe avec SA clé privée
signature = private_key.sign(
    document,
    padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
    hashes.SHA256(),
)

# N'importe qui vérifie avec la clé PUBLIQUE d'Alice
public_key.verify(
    signature, document,
    padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
    hashes.SHA256(),
)  # exception si invalide
print("Signature vérifiée")
```

## Le problème que les certificats résolvent

La crypto asymétrique a un trou béant qu'on a déjà vu avec Diffie-Hellman : **rien ne relie une clé publique à une identité**.

Quand tu te connectes à `banque.fr` et que le serveur t'envoie sa clé publique, comment sais-tu que c'est **vraiment** la clé de ta banque, et pas celle d'un attaquant en Man-in-the-Middle qui a intercepté la connexion (te souviens-tu du MitM sur DH et sur ton cours WiFi/Ettercap ?) ? Une clé publique brute, c'est juste un gros nombre. N'importe qui peut en générer une et prétendre être ta banque.

Il faut donc un moyen de **certifier** qu'une clé publique donnée appartient bien à une identité donnée. C'est exactement le rôle d'un **certificat**.

## Le certificat X.509

Un certificat est essentiellement une **carte d'identité numérique** : il lie une identité (un nom de domaine, une organisation) à une clé publique, et le tout est **signé par une autorité de confiance**. Le format standard est **X.509**.

Un certificat X.509 contient notamment :

- Le **sujet** (Subject) : à qui appartient le certificat (`CN=banque.fr`, l'organisation, etc.).
- La **clé publique** du sujet.
- L'**émetteur** (Issuer) : qui a signé ce certificat (l'autorité de certification).
- La **période de validité** (dates de début et d'expiration).
- Les **usages autorisés** (signature, chiffrement, authentification serveur...).
- Les **SAN** (Subject Alternative Names) : la liste des domaines couverts (aujourd'hui c'est le champ qui compte pour valider un domaine, le vieux CN seul ne suffit plus).
- La **signature de l'émetteur** : le hash du certificat, signé avec la clé privée de l'autorité.

C'est cette dernière signature qui fait tout : **elle prouve que l'autorité a vérifié et validé le lien identité ↔ clé publique**. Modifier quoi que ce soit dans le certificat invalide la signature.

Tu peux inspecter un certificat en ligne de commande :

```bash
# Voir le certificat d'un site
openssl s_client -connect banque.fr:443 -servername banque.fr </dev/null 2>/dev/null \
  | openssl x509 -noout -text

# Voir juste le sujet, l'émetteur et les dates
echo | openssl s_client -connect example.com:443 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

## La PKI et la chaîne de confiance

Un certificat est signé par une **autorité de certification** (CA, Certificate Authority). Mais alors, à qui fait-on confiance pour la CA elle-même ? C'est là qu'intervient la **PKI** (Public Key Infrastructure) et son principe de **chaîne de confiance**.

L'architecture est hiérarchique :

**Root CA** (autorité racine) — Au sommet. Son certificat est **auto-signé** (elle se signe elle-même). Ces certificats racines sont pré-installés dans ton système d'exploitation et ton navigateur : c'est le **trust store** (magasin de confiance). Firefox, Chrome, Windows, macOS embarquent une liste de quelques centaines de CA racines qu'ils considèrent dignes de confiance par défaut. **C'est le point d'ancrage de toute la confiance.**

**Intermediate CA** (autorités intermédiaires) — Les root CA sont si précieuses qu'on garde leurs clés privées hors ligne, dans des coffres. Au quotidien, elles délèguent la signature à des CA intermédiaires. Une intermédiaire est signée par la racine.

**Certificat final** (leaf / end-entity) — Le certificat de `banque.fr`, signé par une intermédiaire.

La **chaîne** ressemble donc à :

```
Root CA (auto-signée, dans ton trust store)
   └── signe → Intermediate CA
          └── signe → Certificat de banque.fr
```

Quand ton navigateur vérifie `banque.fr`, il remonte la chaîne : le certificat de banque.fr est-il signé par une intermédiaire valide, elle-même signée par une racine **présente dans mon trust store** ? Si oui, et si tout est valide (dates, domaine, non-révoqué), la confiance est établie. Sinon → l'avertissement rouge « connexion non sécurisée ».

## Ce que le navigateur vérifie vraiment

Quand tu vois le cadenas, ton navigateur a validé, en une fraction de seconde :

1. **La chaîne de signatures** remonte jusqu'à une CA racine de confiance.
2. Le **domaine** demandé correspond bien aux SAN du certificat (`banque.fr` est bien listé).
3. Les **dates de validité** sont respectées (pas expiré, pas encore trop tôt).
4. Le certificat n'a pas été **révoqué** (voir plus bas).
5. Les **usages** du certificat autorisent l'authentification serveur.
6. Les algorithmes sont acceptables (pas de SHA-1, pas de clé RSA-1024...).

Si un seul échoue, la connexion est signalée comme non fiable.

## La révocation : le maillon fragile

Que se passe-t-il si une clé privée est compromise **avant** l'expiration du certificat ? Il faut pouvoir le **révoquer**. Deux mécanismes historiques :

- **CRL** (Certificate Revocation List) — Une liste de certificats révoqués, publiée par la CA. Problème : ces listes deviennent énormes et sont mises à jour lentement.
- **OCSP** (Online Certificate Status Protocol) — Le navigateur demande à la CA « ce certificat est-il valide ? » en temps réel. Problèmes : lenteur, et surtout **fuite de vie privée** (la CA apprend quels sites tu visites). D'où l'**OCSP stapling**, où le serveur joint lui-même une preuve OCSP récente.

En pratique, la révocation reste un point faible connu du système : beaucoup de navigateurs échouent « en douceur » (soft-fail) si la vérification de révocation n'aboutit pas, ce qu'un attaquant peut exploiter. Une tendance moderne est de raccourcir drastiquement la durée de vie des certificats (90 jours avec Let's Encrypt, et l'écosystème pousse vers 47 jours), rendant la révocation moins critique puisqu'un certificat compromis expire vite de toute façon.

## TLS : tout assemblé

Le **handshake TLS** est l'endroit où tous les cours de cette section se rejoignent. Voici ce qui se passe, en version TLS 1.3 simplifiée, quand tu ouvres `https://...` :

1. **ClientHello** — Ton navigateur annonce les versions et algorithmes qu'il supporte, et envoie déjà sa part d'échange de clé **ECDHE** (cours 4 et 5).
2. **ServerHello** — Le serveur choisit les paramètres, envoie sa part ECDHE, **son certificat** (cours 7), et une **signature** de l'échange avec sa clé privée (cours 3/5).
3. **Vérification** — Ton navigateur valide le certificat (chaîne de confiance jusqu'au trust store) **et** vérifie que la signature de l'échange correspond bien à la clé publique du certificat. Ces deux vérifications ensemble prouvent que tu parles au vrai serveur, pas à un MitM : un attaquant pourrait rejouer le certificat public de la banque, mais ne pourrait pas signer l'échange sans la clé privée.
4. **Secret commun** — Les deux côtés dérivent le même secret via ECDHE, puis une **KDF** (cours 6) en tire les clés de session.
5. **Trafic chiffré** — Tout le reste passe en symétrique **AES-GCM** ou **ChaCha20-Poly1305** (cours 2), rapide et authentifié.

Le génie de l'assemblage : l'**asymétrique** (lent) sert juste à s'authentifier et établir un secret ; le **symétrique** (rapide) chiffre tout le volume. Et l'ECDHE éphémère apporte la **forward secrecy** : même si la clé privée du serveur fuite un jour, le trafic passé enregistré reste indéchiffrable.

## Les attaques et faiblesses de l'écosystème

L'angle qui t'intéresse. La crypto de TLS est solide ; les attaques visent l'écosystème de confiance et les erreurs de config.

**CA compromise ou malveillante.** Tout le modèle repose sur la fiabilité des CA. Une CA compromise peut émettre des certificats frauduleux pour n'importe quel domaine. Cas réel : **DigiNotar** (2011), une CA néerlandaise piratée, a émis de faux certificats pour Google utilisés pour espionner des Iraniens ; la CA a fait faillite après avoir été retirée de tous les trust stores. Le modèle a un maillon aussi fort que la plus faible des centaines de CA de confiance.

**Certificate Transparency (CT).** La parade déployée depuis : toutes les CA doivent publier chaque certificat émis dans des **logs publics et auditables**. Ainsi, `google.com` peut surveiller si une CA émet un certificat pour son domaine sans autorisation. Tu peux fouiller ces logs toi-même sur **crt.sh** — très utile en reconnaissance/OSINT pour énumérer les sous-domaines d'une cible (les certificats révèlent des noms de sous-domaines).

**MitM avec certificat injecté.** En entreprise (ou en attaque), on peut déchiffrer le TLS en installant une CA racine maison dans le trust store des postes : le proxy génère à la volée des certificats signés par cette CA, et les navigateurs les acceptent. C'est ainsi que fonctionnent les proxys d'inspection SSL d'entreprise — et **Burp Suite** en pentest web : tu installes le certificat CA de Burp pour intercepter et lire le trafic HTTPS de la cible. Légitime en test autorisé, c'est aussi une technique de surveillance.

**Certificate pinning et son contournement.** Pour se protéger des CA compromises, une app peut « épingler » (pin) le certificat ou la clé attendue en dur, et refuser tout autre, même signé par une CA valide. Ça bloque les proxys d'interception — d'où, côté pentest mobile, les techniques de **SSL unpinning** (Frida, Objection) pour contourner le pinning et pouvoir analyser le trafic d'une app.

**Downgrade et vieux protocoles.** SSLv3, TLS 1.0/1.1 ont des failles (POODLE, BEAST — souvent liées aux modes CBC du cours 2). Un attaquant peut tenter de forcer un downgrade vers une version faible. Parade : désactiver les vieilles versions côté serveur (TLS 1.2 minimum, idéalement 1.3). C'est un check classique en audit avec des outils comme **testssl.sh** ou **sslscan**.

**Mauvaise validation côté client.** Une faille applicative fréquente (surtout mobile/IoT — pertinent pour l'embarqué) : du code qui **ne vérifie pas** le certificat (accepte tout), ou désactive la validation « pour que ça marche en dev » et l'oublie en prod. Résultat : MitM trivial. À chercher systématiquement en audit d'app.

## En pratique : générer et utiliser des certificats

Quelques commandes que tu utiliseras concrètement :

```bash
# Générer une clé privée ECDSA (P-256) + une CSR (demande de certificat)
openssl ecparam -genkey -name prime256v1 -out cle_privee.pem
openssl req -new -key cle_privee.pem -out demande.csr -subj "/CN=monsite.fr"

# Certificat auto-signé (pour du test / interne — pas pour la prod publique)
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem \
  -days 365 -nodes -subj "/CN=localhost"

# Vérifier une chaîne de certificats
openssl verify -CAfile chaine_ca.pem certificat.pem

# Inspecter les protocoles/ciphers acceptés par un serveur (audit)
nmap --script ssl-enum-ciphers -p 443 example.com
```

Pour de la production réelle, tu ne génères plus de certificats à la main : **Let's Encrypt** (via `certbot` ou `acme.sh`) automatise l'émission et le renouvellement gratuitement, en validant que tu contrôles bien le domaine (challenge ACME). C'est ce qui a démocratisé HTTPS partout.

## Ce qu'il faut retenir

- Clé **privée** = déchiffrer + signer (secrète) ; clé **publique** = chiffrer + vérifier (diffusée). Ne pas confondre les deux directions.
- Une clé publique brute ne prouve aucune identité → le **certificat X.509** lie une identité à une clé publique, via la **signature d'une autorité de confiance (CA)**.
- La **PKI** organise la confiance en **chaîne** : Root CA (dans ton trust store) → Intermediate → certificat du site. Le navigateur remonte la chaîne et vérifie domaine, dates, révocation.
- **TLS** assemble tout : ECDHE pour établir un secret (avec forward secrecy), certificat + signature pour authentifier, AES-GCM/ChaCha20 pour chiffrer le trafic.
- Les attaques visent l'**écosystème**, pas la crypto : **CA compromises** (DigiNotar → parade : Certificate Transparency, crt.sh), **MitM par CA injectée** (Burp, proxys SSL), **pinning et son contournement**, **downgrade** vers vieux protocoles, **validation client absente** (fréquent en IoT/mobile).
- Outils : `openssl`, `testssl.sh`, `sslscan`, `nmap --script ssl-enum-ciphers`, **crt.sh** pour l'OSINT ; **Let's Encrypt/certbot** pour émettre en prod.
