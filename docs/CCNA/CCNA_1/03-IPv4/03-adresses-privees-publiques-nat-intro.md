---
id: 03-adresses-privees-publiques-nat-intro
title: "Adresses privées/publiques et introduction au NAT"
sidebar_position: 3
tags: [reseau]
---

# Adresses privées/publiques et introduction au NAT

> Face à l'épuisement des adresses IPv4 publiques, la quasi-totalité des réseaux internes utilisent des adresses **privées** (RFC 1918), traduites en adresse **publique** pour accéder à Internet via **NAT** (Network Address Translation). La configuration complète du NAT (statique, dynamique, PAT/overload) est détaillée en CCNA 2 — ce cours en pose les bases conceptuelles.

## Pourquoi des adresses privées ?

```text
   Espace IPv4 total : ~4,3 milliards d'adresses (32 bits)
   → épuisé au niveau des registres régionaux (RIR) depuis les années 2010

   Solution : réutiliser les MÊMES plages privées dans des millions de
   réseaux différents (RFC 1918), puisqu'elles ne sont jamais routées
   sur Internet public — seule une traduction (NAT) permet la sortie.
```

| Plage privée | Notation CIDR | Usage typique |
|---|---|---|
| 10.0.0.0 – 10.255.255.255 | 10.0.0.0/8 | Grands réseaux d'entreprise |
| 172.16.0.0 – 172.31.255.255 | 172.16.0.0/12 | Réseaux moyens, datacenters |
| 192.168.0.0 – 192.168.255.255 | 192.168.0.0/16 | Réseaux domestiques, petites entreprises |

## Principe du NAT

```text
   RÉSEAU INTERNE (privé)              INTERNET (public)
   192.168.1.10 ──┐
   192.168.1.11 ──┼──► [Routeur NAT] ──► 203.0.113.5 (IP publique unique)
   192.168.1.12 ──┘     traduit @IP
                        src privée en
                        @IP publique

   Table de traduction NAT (maintenue par le routeur) :
   192.168.1.10:54321  ←→  203.0.113.5:40001
   192.168.1.11:51234  ←→  203.0.113.5:40002
```

Le routeur en bordure de réseau (souvent aussi la passerelle par défaut) réécrit l'adresse IP source (et le port, pour le **PAT/NAT overload**) des paquets sortants, et effectue l'opération inverse pour le retour — de façon transparente pour les hôtes internes.

## Aperçu des variantes NAT (détail complet en CCNA 2)

| Variante | Principe | Usage |
|---|---|---|
| **NAT statique** | Une IP privée ↔ une IP publique fixe, en permanence | Serveur interne exposé (mail, web) |
| **NAT dynamique** | Pool d'IP publiques attribuées à la demande | Nombre limité d'IP publiques partagées |
| **PAT (NAT overload)** | Plusieurs IP privées ↔ 1 seule IP publique, distinguées par le port | Cas le plus courant (box internet domestique, la quasi-totalité des PME) |

## Cas d'usage concret

Une entreprise dispose d'une seule adresse IP publique fournie par son FAI mais de 200 postes internes en 192.168.0.0/24. Le routeur de bordure effectue du **PAT** : chaque connexion sortante (navigation web, DNS, etc.) est traduite vers l'IP publique unique avec un port source différent, permettant à 200 hôtes internes de partager une seule IP publique simultanément.

## Ce qu'il faut retenir

- Adresses **privées** (RFC 1918) non routées sur Internet ; adresses **publiques** routables mais épuisées, d'où la nécessité du NAT.
- **NAT statique** = correspondance fixe 1:1, **NAT dynamique** = pool partagé, **PAT** = plusieurs privées vers une seule publique via les ports (le cas le plus répandu).
- La configuration IOS détaillée (`ip nat inside/outside`, `ip nat pool`, `access-list` associée) est couverte dans le cours NAT de CCNA 2.

## Pour aller plus loin

- [RFC 1918 — Address Allocation for Private Internets](https://www.rfc-editor.org/rfc/rfc1918)
- [RFC 3022 — Traditional IP Network Address Translator](https://www.rfc-editor.org/rfc/rfc3022)
