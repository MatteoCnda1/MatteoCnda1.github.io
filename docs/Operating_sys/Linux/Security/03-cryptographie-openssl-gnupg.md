---
id: 03-cryptographie-openssl-gnupg
title: Cryptographie — OpenSSL et GnuPG
sidebar_position: 3
tags: [linux, cryptographie]
---

# Cryptographie — OpenSSL et GnuPG

Ce cours couvre les deux outils cryptographiques essentiels sous Linux : **OpenSSL** (la boîte à outils crypto polyvalente, orientée TLS/certificats) et **GnuPG** (le chiffrement et la signature de fichiers/messages, orienté échange entre personnes). Il suppose acquis les concepts crypto de base (chiffrement symétrique/asymétrique, hachage, signature) que tu as vus par ailleurs ; ici on les met en pratique en ligne de commande.

## Rappels : les trois usages de la crypto

Pour situer les commandes, trois usages fondamentaux :
- **Le hachage** — produire une empreinte de taille fixe d'une donnée, à sens unique (impossible de remonter à l'original). Sert à vérifier l'**intégrité** (le fichier n'a pas été modifié) et à stocker les mots de passe.
- **Le chiffrement** — rendre une donnée illisible sans la clé. Symétrique (une seule clé partagée, rapide) ou asymétrique (paire clé publique/privée, pour échanger sans partager de secret).
- **La signature** — prouver l'origine et l'intégrité d'une donnée avec sa clé privée, vérifiable avec la clé publique. Sert à l'**authenticité**.

OpenSSL et GnuPG savent tout faire, mais avec des orientations différentes : OpenSSL est le couteau suisse bas niveau (et le moteur de TLS) ; GnuPG est pensé pour le chiffrement et la signature entre personnes (emails, fichiers, paquets logiciels).

## OpenSSL

**OpenSSL** est une bibliothèque et un outil en ligne de commande omniprésents. Il sert au chiffrement, au hachage, à la génération de clés, et surtout à tout ce qui touche aux **certificats TLS**.

### Hachage et empreintes

```bash
sha256sum fichier.iso                    # empreinte SHA-256 (outil dédié, le plus courant)
openssl dgst -sha256 fichier.iso         # équivalent avec openssl
```

Cas d'usage : vérifier qu'un fichier téléchargé n'a pas été altéré, en comparant son empreinte à celle publiée par l'éditeur. Si les empreintes diffèrent, le fichier est corrompu ou falsifié.

### Générer des clés et de l'aléa

```bash
openssl rand -hex 32                      # générer 32 octets aléatoires (ex. une clé, un secret)
openssl rand -base64 24                   # aléa en base64 (ex. un mot de passe fort)
openssl genrsa -out cle.pem 4096          # générer une clé privée RSA de 4096 bits
openssl ecparam -genkey -name prime256v1 -out cle_ec.pem   # clé privée à courbe elliptique
```

Cas d'usage : générer un secret cryptographique solide, une clé privée pour un serveur, un mot de passe aléatoire robuste.

### Chiffrement symétrique d'un fichier

```bash
openssl enc -aes-256-cbc -salt -in secret.txt -out secret.enc     # chiffrer
openssl enc -d -aes-256-cbc -in secret.enc -out secret.txt        # déchiffrer
```

Cas d'usage : chiffrer rapidement un fichier avec un mot de passe (AES-256). Pratique pour protéger un fichier isolé, mais pour des échanges entre personnes, GnuPG est mieux adapté.

### Certificats TLS

C'est l'usage phare d'OpenSSL. On peut inspecter, générer et convertir des certificats.

```bash
# Inspecter le certificat d'un site distant
openssl s_client -connect exemple.fr:443 -servername exemple.fr

# Lire un fichier de certificat local
openssl x509 -in certificat.crt -noout -text        # tout le contenu
openssl x509 -in certificat.crt -noout -dates       # dates de validité
openssl x509 -in certificat.crt -noout -subject     # à qui il est délivré

# Générer un certificat auto-signé (pour du test/interne)
openssl req -x509 -newkey rsa:4096 -keyout cle.pem -out cert.pem -days 365 -nodes
```

Cas d'usage : diagnostiquer une erreur HTTPS (certificat expiré ? mauvais domaine ?), créer un certificat auto-signé pour un service interne ou du développement, générer une demande de certificat (CSR) à envoyer à une autorité. Un **certificat auto-signé** n'est pas reconnu par les navigateurs (pas de chaîne de confiance vers une CA), il convient pour l'interne/test mais pas pour un site public.

## GnuPG (GPG)

**GnuPG** (GNU Privacy Guard, commande `gpg`) est l'implémentation libre du standard OpenPGP. Il est orienté **chiffrement et signature entre personnes** : emails, fichiers, et vérification de l'authenticité des logiciels. C'est un pilier de l'écosystème libre (les paquets des distributions sont signés avec GPG).

### Gérer ses clés

```bash
gpg --full-generate-key          # générer sa paire de clés (interactif)
gpg --list-keys                  # lister les clés publiques du trousseau
gpg --list-secret-keys           # lister ses clés privées
gpg --export -a "Ton Nom" > ma_cle_publique.asc     # exporter sa clé publique (à partager)
gpg --import cle_ami.asc         # importer la clé publique de quelqu'un
```

Le modèle GPG repose sur un **trousseau** (keyring) où tu stockes ta paire de clés et les clés publiques de tes correspondants. Pour échanger de façon chiffrée avec quelqu'un, il faut d'abord avoir sa clé publique.

### Chiffrer et déchiffrer

```bash
# Chiffrer un fichier pour un destinataire (avec SA clé publique)
gpg --encrypt --recipient "ami@exemple.fr" document.pdf

# Déchiffrer un fichier qui t'est destiné (avec TA clé privée)
gpg --decrypt document.pdf.gpg > document.pdf

# Chiffrement symétrique simple (par mot de passe, sans clés)
gpg --symmetric document.pdf
```

Le principe asymétrique en action : tu chiffres avec la clé **publique** du destinataire, lui seul peut déchiffrer avec sa clé **privée**. Personne d'autre, pas même toi, ne peut relire le message. C'est la confidentialité de bout en bout.

### Signer et vérifier

```bash
gpg --sign document.pdf                      # signer (prouve que ça vient de toi)
gpg --verify document.pdf.sig document.pdf   # vérifier une signature
gpg --detach-sign fichier.iso                # signature détachée (fichier .sig séparé)
```

Cas d'usage majeur : **vérifier l'authenticité d'un logiciel**. Quand tu télécharges une image ISO ou un paquet, l'éditeur fournit souvent une signature GPG. En la vérifiant avec sa clé publique, tu t'assures que le fichier vient bien de lui et n'a pas été altéré (protection contre les téléchargements piégés). C'est ainsi que les distributions Linux garantissent l'intégrité de leurs paquets.

## OpenSSL ou GnuPG : lequel pour quoi

Pour ne pas confondre leurs rôles :
- **OpenSSL** : tout ce qui touche à **TLS/certificats** (serveurs web, HTTPS), génération de clés et d'aléa, opérations crypto bas niveau, chiffrement ponctuel d'un fichier. C'est le moteur du chiffrement des communications.
- **GnuPG** : chiffrement et signature **entre personnes** (fichiers, emails), vérification d'authenticité des logiciels, gestion d'un trousseau de clés publiques. C'est l'outil du chiffrement des échanges et de la confiance.

Les deux reposent sur les mêmes fondations mathématiques (celles de ta crypto), mais servent des scénarios différents.

## Ce qu'il faut retenir

- Trois usages crypto : **hachage** (intégrité, sens unique), **chiffrement** (confidentialité, symétrique ou asymétrique), **signature** (authenticité).
- **OpenSSL** = boîte à outils polyvalente, orientée **TLS/certificats** : `sha256sum`/`openssl dgst` (empreintes), `openssl rand` (aléa/secrets), `openssl genrsa` (clés), `openssl enc` (chiffrer un fichier), `openssl x509`/`s_client` (inspecter/générer des certificats).
- **GnuPG** (`gpg`) = chiffrement et signature **entre personnes**, basé sur un **trousseau** de clés : chiffrer avec la clé **publique** du destinataire, déchiffrer avec sa clé **privée** ; signer/vérifier pour l'**authenticité** (dont la vérification des logiciels/paquets).
- **Répartition des rôles** : OpenSSL pour TLS et le bas niveau ; GnuPG pour les échanges entre personnes et la confiance dans les fichiers/logiciels.
- Réflexe sécurité : toujours **vérifier les empreintes/signatures** des fichiers téléchargés avant de les utiliser.
