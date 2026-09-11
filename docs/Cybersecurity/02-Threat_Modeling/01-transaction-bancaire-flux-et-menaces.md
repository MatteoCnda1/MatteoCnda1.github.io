---
id: 01-transaction-bancaire-flux-et-menaces
title: Déroulement d'une transaction bancaire — flux et menaces
sidebar_position: 1
tags: [cybersecurite, threat-modeling, finance]
---

# Déroulement d'une transaction bancaire — flux et menaces

Une transaction par carte bancaire fait intervenir plusieurs acteurs et traverse plusieurs **frontières de confiance** (*trust boundaries*) — exactement le genre de système qu'un **Data Flow Diagram** (DFD) sert à cartographier en threat modeling. Cette fiche déroule le flux complet, acteur par acteur, puis identifie où un attaquant a historiquement pu intercepter des données.

## Index

1. [Les acteurs](#1-les-acteurs)
2. [Le flux complet, étape par étape](#2-le-flux-complet-étape-par-étape)
3. [Les données qui circulent](#3-les-données-qui-circulent)
4. [Mécanismes de sécurité par étape](#4-mécanismes-de-sécurité-par-étape)
5. [Où un attaquant peut intercepter](#5-où-un-attaquant-peut-intercepter)
6. [Ce qu'il faut retenir](#6-ce-quil-faut-retenir)

---

## 1. Les acteurs

| Acteur | Rôle |
|---|---|
| **Porteur de carte** | Le client qui paie |
| **Commerçant** | Accepte le paiement (terminal physique ou site e-commerce) |
| **Acquéreur** (*acquirer*) | Banque du commerçant, qui reçoit la transaction de son terminal/site |
| **Réseau de carte** (*scheme*) | Visa, Mastercard, CB, Amex — le réseau qui route la transaction entre acquéreur et émetteur |
| **Émetteur** (*issuer*) | Banque du client, qui a émis la carte et détient le compte |
| **PSP / Passerelle de paiement** | Intermédiaire technique côté e-commerce (Stripe, Adyen...) qui relaie vers l'acquéreur |

## 2. Le flux complet, étape par étape

### 2.1. Présentation de la carte

- **En point de vente physique** : puce EMV (insertion ou contact), sans contact (NFC), ou bande magnétique (dégradé, en voie de disparition).
- **En ligne** (*Card Not Present*) : saisie du PAN (numéro de carte), date d'expiration, CVV.

### 2.2. Authentification / vérification du porteur

- **Puce + code PIN** : le terminal envoie un défi cryptographique à la puce, qui répond avec un cryptogramme signé par une clé privée stockée dans la puce (protocole **EMV**) — la puce n'est jamais clonable comme l'était la piste magnétique.
- **Sans contact** : vérification allégée en dessous d'un plafond (souvent pas de PIN), avec un cryptogramme EMV dynamique différent à chaque transaction.
- **En ligne** : **3D Secure** (Verified by Visa / Mastercard Identity Check) redirige le porteur vers sa banque pour une authentification forte (SMS OTP, appli bancaire, biométrie) — obligatoire en Europe sous DSP2/SCA (Strong Customer Authentication) pour la plupart des paiements en ligne.

### 2.3. Demande d'autorisation

Le terminal/site envoie une **demande d'autorisation** : commerçant → acquéreur → réseau de carte → émetteur. L'émetteur vérifie le solde/plafond et répond **approuvé/refusé**. Ce trajet aller-retour se fait en quelques centaines de millisecondes.

### 2.4. Réponse et ticket

La réponse redescend la même chaîne jusqu'au terminal/site, qui délivre le ticket/confirmation. À ce stade, l'argent n'a **pas encore été transféré** — seul un montant est réservé sur le plafond du porteur.

### 2.5. Compensation (*clearing*)

En fin de journée (ou par lots), le commerçant transmet le détail des transactions à son acquéreur, qui les regroupe et les soumet au réseau de carte pour compensation avec l'émetteur.

### 2.6. Règlement (*settlement*)

Le mouvement de fonds réel a lieu entre les banques : l'émetteur transfère l'argent à l'acquéreur (moins les commissions d'interchange), qui crédite le commerçant, généralement en **J+1 à J+3**. Pour les mouvements interbancaires domestiques, cela transite par les systèmes de compensation nationaux/européens (en zone euro : **SEPA** pour les virements/prélèvements ; **TARGET2** pour le règlement de gros montants entre banques centrales). Pour l'international hors zone couverte, les instructions de paiement entre banques transitent par le réseau de messagerie **SWIFT** (SWIFT ne transporte pas l'argent lui-même, seulement les instructions de règlement).

## 3. Les données qui circulent

| Donnée | Description |
|---|---|
| **PAN** | Le numéro de carte (16 chiffres) |
| **Cryptogramme EMV (ARQC)** | Signature dynamique unique par transaction, générée par la puce — rend le clonage de carte inopérant |
| **CVV/CVV2** | Code de vérification, jamais stocké après autorisation (norme PCI-DSS) |
| **Token** | Pour les wallets (Apple Pay, Google Pay) : un identifiant à usage unique/limité qui **remplace** le vrai PAN — le commerçant ne voit jamais le vrai numéro de carte |
| **Données 3DS** | Éléments contextuels (device, historique) utilisés pour le scoring de risque et déclencher ou non une authentification forte |

## 4. Mécanismes de sécurité par étape

- **EMV** — rend le clonage de carte physique très difficile (contrairement à la piste magnétique, cassée par simple copie).
- **Tokenisation** (Apple Pay/Google Pay, et de plus en plus les commerçants eux-mêmes) — le PAN réel ne transite jamais chez le commerçant.
- **3D Secure 2 / SCA** — authentification forte pour les paiements en ligne, transfère aussi la responsabilité de la fraude vers l'émetteur si l'authentification a été respectée.
- **Chiffrement TLS** — protège les échanges e-commerce entre navigateur et site marchand.
- **P2PE** (*Point-to-Point Encryption*) — chiffre les données de carte dès la lecture par le terminal physique jusqu'à l'acquéreur, empêchant leur lecture en clair même en cas de compromission du système de caisse.
- **PCI-DSS** — norme de sécurité imposée à tout acteur qui manipule des données de carte (segmentation réseau, chiffrement, restriction d'accès, tests d'intrusion réguliers).
- **HSM** (*Hardware Security Module*) — chez l'émetteur/acquéreur, les opérations cryptographiques sensibles (vérification PIN, génération de clés) s'exécutent dans du matériel dédié inviolable.
- **Scoring de fraude temps réel** — réseaux et émetteurs appliquent des règles de détection (vélocité, géolocalisation incohérente, montant inhabituel) avant d'approuver.

## 5. Où un attaquant peut intercepter

En reprenant le flux, les frontières de confiance qui ont historiquement été franchies :

| Étape | Vecteur d'attaque connu |
|---|---|
| Terminal physique | **Skimmers** — dispositifs physiques clonant la piste magnétique ou capturant le PIN (caméra/faux clavier) sur des distributeurs/TPE non P2PE |
| Système de caisse (POS) | **Malware de type RAM scraping** — capture les données de carte en clair dans la mémoire du terminal avant chiffrement (cas réel : la brèche **Target** en 2013, ~40 millions de cartes) |
| Site e-commerce | **Magecart / e-skimming** — injection de JavaScript malveillant sur la page de paiement pour exfiltrer les données saisies avant tokenisation |
| Réseau local du commerçant | **MITM** (ARP spoofing, rogue AP) si le trafic carte n'est pas correctement isolé/chiffré — voir [guide WiFi](../07-Wifi/01-Wifi-Penetration-Testing.md) et [PCredz](../22-Security-Tools/pcredz.md) pour les outils correspondants |
| Porteur | **Phishing / social engineering** pour obtenir PAN, CVV, ou contourner le 3D Secure (faux SMS demandant de "confirmer" un code) |
| Après compromission de données | **Carding** — utilisation de numéros de carte volés sur des sites à faible vérification (CNV, pas de 3DS) pour valider leur validité avant revente/fraude |

## 6. Ce qu'il faut retenir

- Une transaction carte suit un flux en deux temps : **autorisation** (quasi instantanée, réservation du montant) puis **compensation/règlement** (le vrai mouvement de fonds, à J+1/J+3).
- La chaîne d'acteurs est **porteur → commerçant → acquéreur → réseau de carte → émetteur**, avec un retour symétrique pour l'autorisation.
- Les défenses modernes (**EMV**, **tokenisation**, **3D Secure/SCA**, **P2PE**, **PCI-DSS**) visent toutes à faire en sorte que le **PAN réel ne soit jamais exposé en clair** plus loin que nécessaire dans la chaîne.
- Les compromissions historiques majeures (Target, Magecart) ont exploité le **point le plus faible du flux**, pas la cryptographie elle-même : malware sur le point de terminaison, JS injecté côté client, réseau non isolé.
- C'est un bon exercice de **Data Flow Diagram** : identifier chaque frontière de confiance (porteur↔commerçant, commerçant↔acquéreur, réseau de carte↔émetteur) et se demander, à chacune, quelle garantie (chiffrement, authentification, intégrité) protège la traversée.

## Voir aussi

- [Certificats et PKI](../../Cryptography/07-cles-publiques-privees-et-certificats.md) — le TLS qui protège les échanges e-commerce
- [PCredz](../22-Security-Tools/pcredz.md) — extraction de données de carte depuis du trafic réseau intercepté
- [WiFi Penetration Testing Guide](../07-Wifi/01-Wifi-Penetration-Testing.md) — techniques de MITM pertinentes pour l'interception réseau
