---
id: 02-subnetting-vlsm
title: "Subnetting et VLSM"
sidebar_position: 2
tags: [reseau, cheatsheet]
---

# Subnetting et VLSM

> Le **subnetting** consiste à découper un bloc d'adresses IPv4 en sous-réseaux plus petits, en empruntant des bits à la partie hôte. Le **VLSM** (Variable Length Subnet Mask) permet d'utiliser des masques de tailles différentes selon les besoins de chaque sous-réseau, pour éviter le gaspillage d'adresses.

## Méthode de calcul (la "table des puissances de 2")

```text
   Bits empruntés (n) → nb de sous-réseaux = 2^n
   Bits hôte restants (h) → nb d'hôtes utilisables = 2^h − 2

   /24 = 255.255.255.0 → 8 bits hôte disponibles dans le dernier octet

   Emprunter 2 bits (n=2) pour créer 4 sous-réseaux :
   /24 → /26 (255.255.255.192), h = 6 bits restants → 62 hôtes/sous-réseau

   Bloc (incrément) = 256 − 192 = 64
   Sous-réseaux obtenus :
     192.168.1.0/26     (.0   à .63,   hôtes .1–.62,   broadcast .63)
     192.168.1.64/26    (.64  à .127,  hôtes .65–.126, broadcast .127)
     192.168.1.128/26   (.128 à .191,  hôtes .129–.190,broadcast .191)
     192.168.1.192/26   (.192 à .255,  hôtes .193–.254,broadcast .255)
```

**Méthode rapide de l'incrément** : l'incrément entre sous-réseaux = 256 − (valeur du masque dans l'octet intéressant). Pour /26 → 256−192 = 64. Pour /28 → 256−240 = 16. Il suffit ensuite d'énumérer les multiples de l'incrément.

## Exemple complet : découper 192.168.10.0/24 en 4 sous-réseaux égaux

```text
   Besoin : 4 sous-réseaux → emprunter 2 bits (2^2 = 4) → masque /26

   192.168.10.0/26    → hôtes 192.168.10.1   – 192.168.10.62   (bcast .63)
   192.168.10.64/26   → hôtes 192.168.10.65  – 192.168.10.126  (bcast .127)
   192.168.10.128/26  → hôtes 192.168.10.129 – 192.168.10.190  (bcast .191)
   192.168.10.192/26  → hôtes 192.168.10.193 – 192.168.10.254  (bcast .255)
```

## VLSM : adresser selon le besoin réel de chaque segment

Le subnetting classique (masque fixe) gaspille des adresses si les besoins des sous-réseaux sont très différents (ex. un lien point-à-point n'a besoin que de 2 adresses, un LAN utilisateurs de 100). Le **VLSM** consiste à subdiviser successivement, en commençant toujours par le **plus gros besoin** pour éviter la fragmentation.

```text
   Bloc de départ : 192.168.10.0/24
   Besoins : Site A = 100 hôtes, Site B = 50 hôtes, Liaison WAN = 2 hôtes

   1. Site A (100 hôtes → besoin /25 = 126 hôtes utilisables) :
      192.168.10.0/25      (hôtes .1–.126)

   2. Site B (50 hôtes → besoin /26 = 62 hôtes utilisables), dans
      l'espace restant (192.168.10.128/25) :
      192.168.10.128/26    (hôtes .129–.190)

   3. Liaison WAN (2 hôtes → besoin /30 = 2 hôtes utilisables), dans
      l'espace restant (192.168.10.192/26) :
      192.168.10.192/30    (hôtes .193–.194)

   → le reste de l'espace (192.168.10.196/30 et au-delà) reste
     disponible pour une extension future
```

## Tableau de référence rapide (par octet emprunté)

| Bits empruntés | Masque résultant | Sous-réseaux | Hôtes utilisables |
|---|---|---|---|
| 1 | /25 (255.255.255.128) | 2 | 126 |
| 2 | /26 (255.255.255.192) | 4 | 62 |
| 3 | /27 (255.255.255.224) | 8 | 30 |
| 4 | /28 (255.255.255.240) | 16 | 14 |
| 5 | /29 (255.255.255.248) | 32 | 6 |
| 6 | /30 (255.255.255.252) | 64 | 2 |

## Cas d'usage concret : liaisons point-à-point en /30

Entre deux routeurs (aucun autre hôte sur le lien), utiliser un /24 ou /26 gaspillerait des dizaines d'adresses inutilisées. Le standard est le **/30** (2 hôtes utilisables, exactement ce qu'il faut) — ou le **/31** (RFC 3021, pas d'adresse réseau/broadcast, 2 adresses utilisables sur les 2 disponibles) sur les équipements qui le supportent, pour économiser encore plus d'espace.

## Ce qu'il faut retenir

- Emprunter *n* bits à la partie hôte crée 2^n sous-réseaux ; il reste 2^h − 2 hôtes utilisables par sous-réseau.
- **Incrément** = 256 − valeur du masque dans l'octet concerné → énumération rapide des sous-réseaux.
- **VLSM** : subdiviser en partant du plus gros besoin vers le plus petit, pour minimiser le gaspillage d'adresses.
- Les liens point-à-point utilisent classiquement un **/30** (voire /31, RFC 3021).

## Pour aller plus loin

- [RFC 3021 — Using 31-Bit Prefixes on IPv4 Point-to-Point Links](https://www.rfc-editor.org/rfc/rfc3021)
- [Wikipedia — Variable-length subnet masking](https://en.wikipedia.org/wiki/Variable-length_subnet_masking)
