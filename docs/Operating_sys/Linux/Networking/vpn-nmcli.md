---
id: vpn-nmcli
title: VPN avec nmcli (IPsec / strongSwan)
sidebar_position: 5
tags: [linux, reseau, cryptographie]
---

# VPN avec `nmcli` (IPsec / strongSwan)

Cette fiche couvre la gestion d'un VPN en ligne de commande avec `nmcli`, l'outil de **NetworkManager**. Elle se concentre sur les VPN **IPsec / strongSwan authentifiés par certificats**, avec les concepts nécessaires pour comprendre ce qu'on fait, la configuration complète, la vérification des certificats, et une procédure de dépannage.

:::note Sur les exemples
Les valeurs sensibles (IP de passerelle, identités, noms de fichiers) sont remplacées par des marqueurs entre chevrons, par exemple `<VPN_GATEWAY_IP>`. Remplace-les par tes propres valeurs. Ne publie jamais tes IP, UUID, clés ou certificats réels.
:::

## Les concepts avant les commandes

Avant d'enchaîner les commandes, quelques notions pour comprendre ce que tu configures.

**Un VPN** (Virtual Private Network) crée un **tunnel chiffré** entre ta machine et un réseau distant, à travers un réseau non fiable (internet). Une fois le tunnel monté, tu accèdes aux ressources internes du réseau distant comme si tu y étais physiquement, et ton trafic est protégé de l'écoute. Cas d'usage typique : accéder au réseau interne de ton IUT ou d'une entreprise depuis chez toi.

**IPsec** est la suite de protocoles qui sécurise les communications au niveau IP. C'est le standard des VPN « site à site » et « client à site » en entreprise. Il assure le chiffrement, l'intégrité et l'authentification des paquets. **strongSwan** est l'implémentation open source d'IPsec utilisée ici.

**IPsec repose sur deux mécanismes** qu'on retrouve dans la configuration :
- **IKE** (Internet Key Exchange) — la phase de **négociation** : les deux extrémités s'authentifient mutuellement et se mettent d'accord sur les clés et algorithmes. C'est le paramètre `ike = ...` de la config.
- **ESP** (Encapsulating Security Payload) — la phase de **transport des données** : le chiffrement effectif du trafic une fois le tunnel établi. C'est le paramètre `esp = ...`.

**L'authentification par certificat.** Plutôt qu'un simple mot de passe, ce VPN utilise des **certificats X.509** (rappel du cours crypto/TLS). Trois éléments entrent en jeu :
- Le **certificat de la CA** (autorité de certification) : sert à **vérifier** que le serveur VPN est authentique.
- Le **certificat client** (le tien) : prouve **ton** identité au serveur.
- La **clé privée** associée à ton certificat : le secret qui prouve que ce certificat est bien le tien. Elle ne doit jamais sortir de ta machine.

C'est une authentification **mutuelle** : le serveur vérifie ton certificat, et tu vérifies le sien via la CA. Personne ne se fait passer pour l'autre.

**NetworkManager et nmcli.** NetworkManager est le service qui gère les connexions réseau sur la plupart des distributions. `nmcli` en est l'interface en ligne de commande. Une « connexion » NetworkManager est un profil de configuration réutilisable (ici, notre profil VPN) qu'on peut monter, démonter, modifier.

## Vérifier NetworkManager

Avant de créer un VPN, s'assurer que NetworkManager fonctionne.

```bash
nmcli --version                       # version de nmcli
nmcli general status                  # état général du réseau
systemctl status NetworkManager       # état du service
```

Si besoin de le redémarrer :

```bash
sudo systemctl restart NetworkManager
```

:::warning
Redémarrer NetworkManager peut couper temporairement toutes les connexions réseau en cours. À éviter à distance sans précaution.
:::

## Explorer l'état du réseau et des connexions

**Voir les interfaces réseau** (périphériques gérés) :

```bash
nmcli device status
ip addr                               # vue bas niveau des adresses
```

**Lister les connexions** configurées :

```bash
nmcli connection show                 # toutes les connexions (abrégé : nmcli con show)
nmcli connection show --active        # seulement les connexions actives
nmcli connection show | grep vpn      # filtrer les VPN
```

**Afficher les détails d'une connexion** :

```bash
nmcli connection show "<CON_NAME>"                        # tous les détails
nmcli -f connection,vpn connection show "<CON_NAME>"      # champs choisis
nmcli connection show "<CON_NAME>" | grep uuid            # récupérer l'UUID
```

L'**UUID** est l'identifiant unique et stable de la connexion : utile quand le nom change ou pour cibler précisément une connexion dans les logs.

## Créer la connexion VPN

La commande de création rassemble tous les paramètres IPsec/strongSwan dans le champ `vpn.data`.

```bash
sudo nmcli connection add \
    type vpn \
    con-name "<CON_NAME>" \
    ifname "*" \
    vpn-type strongswan \
    vpn.data "address = <VPN_GATEWAY_IP>, \
remote-identity = <VPN_GATEWAY_IDENTITY>, \
certificate = /etc/ipsec.d/cacerts/<CA_CERT>.pem, \
usercert = /etc/ipsec.d/certs/<CLIENT_CERT>.pem, \
userkey = /etc/ipsec.d/private/<CLIENT_KEY>.key, \
method = cert, \
virtual = yes, \
encap = no, \
ipcomp = no, \
proposal = yes, \
ike = aes256-sha256-modp2048, \
esp = aes256-sha256-modp2048"
```

### Signification des paramètres

| Paramètre | Signification |
|---|---|
| `type vpn` | Crée une connexion de type VPN |
| `con-name` | Nom donné à la connexion |
| `ifname "*"` | Interface virtuelle choisie automatiquement |
| `vpn-type strongswan` | Backend VPN utilisé (IPsec strongSwan) |
| `address` | Adresse (IP ou nom) du serveur VPN |
| `remote-identity` | Identité attendue du serveur distant (vérifiée contre son certificat) |
| `certificate` | Certificat de la **CA**, pour vérifier le serveur |
| `usercert` | Ton certificat **client** |
| `userkey` | Ta **clé privée** client |
| `method = cert` | Authentification par certificat |
| `virtual = yes` | Demande une IP virtuelle au serveur |
| `encap = no` | Pas d'encapsulation UDP supplémentaire (NAT-T) |
| `ipcomp = no` | Désactive la compression IPComp |
| `proposal = yes` | Impose les propositions d'algorithmes ci-dessous |
| `ike` | Algorithmes de la phase de négociation (chiffrement-intégrité-groupe DH) |
| `esp` | Algorithmes de chiffrement des données |

Sur la valeur `aes256-sha256-modp2048` : elle se lit **chiffrement AES-256**, **intégrité SHA-256**, **groupe Diffie-Hellman modp2048**. Ces valeurs doivent **correspondre à ce qu'attend le serveur**, sinon la négociation IKE échoue.

## Monter et démonter le VPN

**Activer** le VPN :

```bash
sudo nmcli connection up "<CON_NAME>"
```

Si la clé privée est protégée par un mot de passe (ou si un secret est requis), utiliser `--ask` pour que `nmcli` le demande interactivement :

```bash
sudo nmcli --ask connection up "<CON_NAME>"
```

**Désactiver** le VPN :

```bash
sudo nmcli connection down "<CON_NAME>"
```

**Vérifier** l'état :

```bash
nmcli connection show --active        # le VPN doit y apparaître quand il est monté
```

## Modifier, renommer, supprimer

**Modifier** une propriété (puis remonter la connexion pour appliquer) :

```bash
sudo nmcli connection modify "<CON_NAME>" <propriété> <valeur>
sudo nmcli connection down "<CON_NAME>"
sudo nmcli --ask connection up "<CON_NAME>"
```

**Renommer** une connexion (la propriété est `connection.id`) :

```bash
sudo nmcli connection modify "<CON_NAME>" connection.id "<NOUVEAU_NOM>"
```

**Supprimer** une connexion :

```bash
sudo nmcli connection delete "<CON_NAME>"       # par nom
sudo nmcli connection delete uuid <UUID>        # par UUID
```

**Recharger** les connexions depuis les fichiers (après édition manuelle) :

```bash
sudo nmcli connection reload
```

**Exporter** une connexion (sauvegarde ou transfert) :

```bash
nmcli connection export "<CON_NAME>" /chemin/<CON_NAME>.nmconnection
```

:::warning
Un fichier exporté peut contenir des **secrets**. Vérifie son contenu avant de le partager, et ne le publie jamais tel quel.
:::

## Vérifier les certificats et les clés

C'est souvent ici que se trouvent les problèmes. On inspecte les certificats et clés avec OpenSSL.

**Localiser les fichiers** (emplacements standard strongSwan) :

```bash
ls -l /etc/ipsec.d/cacerts/            # certificats des CA
ls -l /etc/ipsec.d/certs/              # certificats clients
ls -l /etc/ipsec.d/private/            # clés privées
```

**Inspecter un certificat** :

```bash
# Résumé (identité, émetteur, validité)
sudo openssl x509 -in /etc/ipsec.d/certs/<CLIENT_CERT>.pem -noout -subject -issuer -dates

# Contenu complet
sudo openssl x509 -in /etc/ipsec.d/certs/<CLIENT_CERT>.pem -text -noout
```

- `subject` : l'identité du certificat (à qui il appartient).
- `issuer` : l'autorité qui l'a signé.
- `dates` : `notBefore` / `notAfter`, la période de validité — vérifie qu'il n'est pas expiré.

**Identifier si une clé privée est chiffrée** (regarder son en-tête) :

```bash
sudo head -n 1 /etc/ipsec.d/private/<CLIENT_KEY>.key
```

- `-----BEGIN ENCRYPTED PRIVATE KEY-----` → clé **protégée par mot de passe** (il faudra `--ask`).
- `-----BEGIN PRIVATE KEY-----` ou `-----BEGIN RSA PRIVATE KEY-----` → clé **non chiffrée**.

**Tester la validité d'une clé** (OpenSSL demandera le mot de passe si elle est chiffrée) :

```bash
sudo openssl pkey -in /etc/ipsec.d/private/<CLIENT_KEY>.key -check -noout
```

**Vérifier que le certificat et la clé correspondent** — un cas de panne classique. On compare leurs clés publiques : si elles sont identiques, la paire est cohérente.

```bash
# Clé publique extraite du certificat
sudo openssl x509 -in /etc/ipsec.d/certs/<CLIENT_CERT>.pem -pubkey -noout > /tmp/cert-public.pem

# Clé publique dérivée de la clé privée
sudo openssl pkey -in /etc/ipsec.d/private/<CLIENT_KEY>.key -pubout > /tmp/key-public.pem

# Comparaison : aucune sortie = elles correspondent
diff /tmp/cert-public.pem /tmp/key-public.pem

# Nettoyage
rm -f /tmp/cert-public.pem /tmp/key-public.pem
```

**Vérifier la chaîne de confiance** (le certificat client est-il bien signé par la CA ?) :

```bash
openssl verify -CAfile /etc/ipsec.d/cacerts/<CA_CERT>.pem /etc/ipsec.d/certs/<CLIENT_CERT>.pem
# Sortie attendue : "<CLIENT_CERT>.pem: OK"
```

**Protéger les clés privées** — elles doivent être lisibles par leur seul propriétaire :

```bash
sudo chmod 600 /etc/ipsec.d/private/<CLIENT_KEY>.key
ls -l /etc/ipsec.d/private/<CLIENT_KEY>.key
```

:::danger
Ne **jamais** mettre une clé privée en `chmod 777` ou `666`. Une clé lisible par tous est une clé compromise.
:::

## Tester la connexion une fois le VPN monté

Une fois le tunnel actif, vérifier qu'il fonctionne réellement.

**Vérifier l'adresse et les interfaces** (une interface virtuelle VPN doit apparaître) :

```bash
ip addr
ip -4 addr                             # IPv4 seulement
nmcli device status
```

**Vérifier les routes** — savoir quel trafic passe par le tunnel :

```bash
ip route                               # table de routage complète
ip route get <IP_INTERNE>              # par quelle route passe-t-on pour joindre cette IP ?
```

La commande `ip route get` est précieuse : elle te dit si le trafic vers une ressource interne emprunte bien l'interface VPN.

**Tester l'accès aux ressources internes** :

```bash
ping -c 4 <IP_INTERNE>                 # joignabilité
nslookup <nom_de_domaine_interne>      # résolution DNS interne
dig <nom_de_domaine_interne>           # équivalent, plus détaillé
nc -vz <IP_INTERNE> <PORT>             # test d'un port TCP précis (ex. 443)
```

## Consulter les logs

Les logs de NetworkManager sont la clé du diagnostic.

```bash
sudo journalctl -u NetworkManager               # tout
sudo journalctl -u NetworkManager -n 100        # 100 dernières lignes
sudo journalctl -u NetworkManager -f            # suivi en temps réel
sudo journalctl -u NetworkManager | grep -i error   # erreurs
sudo journalctl -u NetworkManager | grep -i vpn     # lignes VPN
```

**Cibler une connexion précise** par son UUID :

```bash
sudo journalctl -xe NM_CONNECTION=<UUID>
```

## Procédure de dépannage

Quand le VPN ne monte pas, suivre cet ordre logique (du plus général au plus précis) :

1. **NetworkManager tourne ?** → `nmcli general status`
2. **Le VPN existe ?** → `nmcli connection show`
3. **Sa config est correcte ?** → `nmcli connection show "<CON_NAME>"`
4. **Les fichiers sont présents ?** → `ls -l /etc/ipsec.d/{cacerts,certs,private}/`
5. **Le certificat est valide (dates, émetteur) ?** → `openssl x509 ... -subject -issuer -dates`
6. **La clé est valide et correspond au certificat ?** → `openssl pkey ... -check` puis comparaison des clés publiques
7. **Monter avec demande de secret** → `sudo nmcli --ask connection up "<CON_NAME>"`
8. **Le VPN est actif ?** → `nmcli connection show --active`
9. **Interfaces et routes ?** → `ip addr` puis `ip route`
10. **Test d'accès interne** → `ping -c 4 <IP_INTERNE>`
11. **En cas d'échec, les logs** → `sudo journalctl -u NetworkManager -n 100`

## Erreurs fréquentes

| Erreur / symptôme | Cause probable | Solution |
|---|---|---|
| `No valid secrets` / `Aucun secret valide` | Secret non fourni | `sudo nmcli --ask connection up "<CON_NAME>"` |
| `Private key decryption password required` | Clé privée protégée par mot de passe | Monter avec `--ask` et saisir le mot de passe |
| La connexion existe déjà | Doublon | `nmcli connection delete "<CON_NAME>"` puis recréer |
| Négociation IKE échoue | `ike`/`esp` ne correspondent pas au serveur | Aligner les propositions sur celles du serveur |
| Certificat refusé | Certificat expiré ou mauvaise CA | `openssl x509 ... -dates` ; `openssl verify -CAfile ...` |
| Clé refusée | Clé invalide ou ne correspondant pas au certificat | `openssl pkey -check` ; comparer les clés publiques |
| VPN actif mais pas d'accès interne | Problème de routage | `ip route` ; `ip route get <IP_INTERNE>` ; `ping` |

## Annexe — Générer certificats et clés (OpenSSL)

Utile pour comprendre la chaîne, monter un environnement de test, ou préparer une demande de certificat. (Voir aussi le cours de cryptographie de la section sécurité.)

**Générer des secrets aléatoires** :

```bash
openssl rand -hex 32                   # 32 octets en hexadécimal
openssl rand -base64 32                # en base64
```

**Générer une clé privée** :

```bash
openssl genpkey -algorithm RSA -out client.key -pkeyopt rsa_keygen_bits:4096   # RSA 4096 (méthode moderne)
openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:prime256v1 -out client.key   # à courbe elliptique
openssl genrsa -aes256 -out client.key 4096                                     # RSA protégée par mot de passe
```

`genpkey` est la méthode recommandée aujourd'hui ; `genrsa` reste courant. L'option `-aes256` chiffre la clé par mot de passe.

**Générer une demande de certificat (CSR)** — une CSR est ce qu'on envoie à une CA pour obtenir un certificat signé :

```bash
openssl req -new -key client.key -out client.csr -subj "/CN=<CLIENT_IDENTITY>"
openssl req -in client.csr -text -noout        # inspecter la CSR
```

**Créer une CA de test** puis **signer un certificat client avec elle** :

```bash
# CA de test
openssl genrsa -aes256 -out ca.key 4096
openssl req -x509 -new -key ca.key -sha256 -days 3650 -out ca.crt

# Signer la CSR du client avec la CA
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
    -out client.crt -days 365 -sha256
```

:::note
Un **certificat auto-signé** convient pour des tests, mais en production on utilise une **CA de confiance** (comme la CA du réseau que tu rejoins). C'est la CA qui établit la chaîne de confiance vérifiée par `openssl verify`.
:::

## Mémo rapide

| Action | Commande |
|---|---|
| Version nmcli | `nmcli --version` |
| État réseau | `nmcli general status` |
| Interfaces | `nmcli device status` |
| Connexions | `nmcli connection show` |
| Connexions actives | `nmcli connection show --active` |
| Détails VPN | `nmcli connection show "<CON_NAME>"` |
| Créer VPN | `sudo nmcli connection add ...` |
| Monter VPN | `sudo nmcli connection up "<CON_NAME>"` |
| Monter (avec secrets) | `sudo nmcli --ask connection up "<CON_NAME>"` |
| Démonter VPN | `sudo nmcli connection down "<CON_NAME>"` |
| Supprimer VPN | `sudo nmcli connection delete "<CON_NAME>"` |
| Recharger | `sudo nmcli connection reload` |
| Adresse IP | `ip addr` |
| Routes | `ip route` |
| Route vers une IP | `ip route get <IP>` |
| Logs | `sudo journalctl -u NetworkManager` |
| Logs temps réel | `sudo journalctl -u NetworkManager -f` |
| Infos certificat | `openssl x509 -in cert.pem -text -noout` |
| Vérifier certificat | `openssl verify -CAfile ca.pem cert.pem` |
| Vérifier clé | `openssl pkey -in key.pem -check -noout` |
| Secret aléatoire | `openssl rand -hex 32` |

## Sécurité — à retenir

Ne **jamais** partager ni publier : une clé privée (`.key`, `.pem`), une PSK, un mot de passe, un token, ou tout fichier contenant des secrets VPN (y compris un export `.nmconnection`).

Pour demander de l'aide sur un problème, on peut généralement partager **sans risque** :
- la configuration de la connexion : `nmcli connection show "<CON_NAME>"` ;
- les logs : `sudo journalctl -u NetworkManager -n 100` ;
- les **informations publiques** d'un certificat : `openssl x509 -in cert.pem -noout -subject -issuer -dates`.

Mais **jamais le contenu complet d'une clé privée**.

## Ce qu'il faut retenir

- Un **VPN IPsec/strongSwan** monte un **tunnel chiffré** vers un réseau distant ; **IKE** négocie/authentifie, **ESP** chiffre les données.
- L'**authentification par certificat** est mutuelle : la **CA** vérifie le serveur, ton **certificat client** + ta **clé privée** prouvent ton identité.
- `nmcli` (NetworkManager) gère la connexion : `add` (créer), `up`/`down` (monter/démonter), `modify`, `delete`, `show`. `--ask` fait saisir les secrets (clé privée protégée).
- La plupart des pannes viennent des **certificats/clés** : vérifier validité (`openssl x509 -dates`), correspondance cert/clé (comparer les clés publiques), chaîne de confiance (`openssl verify`), et permissions (`chmod 600`).
- Diagnostiquer dans l'ordre (NetworkManager → connexion → certs → montage → routes → logs) ; les **logs** `journalctl -u NetworkManager` sont la clé.
- **Sécurité** : une clé privée ne sort jamais de la machine et ne se partage jamais.
