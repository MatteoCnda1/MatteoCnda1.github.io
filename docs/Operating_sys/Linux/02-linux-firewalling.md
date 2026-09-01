---
id: 02-linux-firewalling
title: Linux Firewalling
---

# Linux — Pare-feu (Firewalling)

> Contrôle et filtrage du trafic réseau sous Linux : Netfilter, iptables et alternatives modernes.

---

## Introduction

Le rôle premier d'un pare-feu est de fournir un mécanisme de sécurité pour **contrôler et surveiller le trafic réseau** entre différents segments (réseau interne/externe, zones distinctes…). Il protège les réseaux contre les accès non autorisés, le trafic malveillant et diverses menaces.

Concrètement, un pare-feu **filtre le trafic entrant et sortant** selon des règles prédéfinies (protocoles, ports, adresses IP…) pour empêcher les accès non autorisés et atténuer les menaces. L'objectif précis dépend des besoins de l'organisation : garantir la **confidentialité**, l'**intégrité** et la **disponibilité** des ressources réseau (triade CIA).

### Un peu d'histoire

- **`ipfwadm`** puis **`ipchains`** : les premiers outils de filtrage Linux.
- **`iptables`** : introduit avec le **noyau Linux 2.4 en 2000**, il les a remplacés en apportant un mécanisme flexible et efficace. Il est devenu le standard de fait pendant deux décennies.
- **`nftables`** : successeur moderne d'iptables (noyau 3.13+, 2014), désormais le back-end par défaut sur la plupart des distributions récentes.

### Netfilter

Sous Linux, le pare-feu repose sur le framework **Netfilter**, partie intégrante du noyau. Netfilter fournit un ensemble de **hooks** (points d'accroche) permettant d'intercepter et de modifier le trafic réseau lorsqu'il traverse le système. `iptables` est l'utilitaire historiquement utilisé pour configurer ces règles.

---

## Iptables

`iptables` offre un jeu de règles flexible pour filtrer le trafic selon de multiples critères : adresses IP source/destination, ports, protocoles, etc.

### Alternatives à iptables

| Outil | Description |
|-------|-------------|
| **nftables** | Syntaxe plus moderne et meilleures performances. ⚠️ Syntaxe **incompatible** avec iptables : la migration demande un effort. |
| **UFW** (*Uncomplicated Firewall*) | Interface simple et conviviale, construite au-dessus d'iptables/nftables. Idéale pour les serveurs et postes de travail. |
| **firewalld** | Solution dynamique et flexible, gère des zones et services personnalisés. Utilisée par défaut sur RHEL/Fedora/CentOS. |

### Les composants d'iptables

| Composant | Description |
|-----------|-------------|
| **Tables** (*Tables*) | Organisent et catégorisent les règles |
| **Chaînes** (*Chains*) | Groupent un ensemble de règles appliquées à un type de trafic |
| **Règles** (*Rules*) | Définissent les critères de filtrage et l'action à effectuer |
| **Correspondances** (*Matches*) | Critères de correspondance (IP, ports, protocoles…) |
| **Cibles** (*Targets*) | Action à effectuer pour les paquets correspondants |

---

## Tables

Les tables catégorisent les règles selon le **type de trafic** qu'elles traitent. Chaque table remplit un ensemble de tâches spécifiques.

| Table | Description | Chaînes intégrées |
|-------|-------------|-------------------|
| **filter** | Filtre le trafic selon IP, ports et protocoles | `INPUT`, `OUTPUT`, `FORWARD` |
| **nat** | Modifie les adresses IP source/destination des paquets | `PREROUTING`, `POSTROUTING` |
| **mangle** | Modifie les champs d'en-tête des paquets | `PREROUTING`, `OUTPUT`, `INPUT`, `FORWARD`, `POSTROUTING` |
| **raw** | Options de traitement spécial des paquets (ex. exemption du suivi de connexion) | `PREROUTING`, `OUTPUT` |

> ℹ️ Il existe aussi une table **`security`** (utilisée avec SELinux/MAC) plus rarement manipulée.

---

## Chaînes

Les chaînes organisent les règles qui définissent comment le trafic doit être filtré ou modifié. Il existe deux types de chaînes :

- **Chaînes intégrées** (*built-in*)
- **Chaînes définies par l'utilisateur** (*user-defined*)

### Chaînes intégrées

Prédéfinies et créées automatiquement avec la table. Chaque table possède son propre jeu de chaînes.

**Table `filter` :**
- `INPUT` — trafic entrant destiné à la machine locale
- `OUTPUT` — trafic sortant émis par la machine locale
- `FORWARD` — trafic transféré entre interfaces (routage)

**Table `nat` :**
- `PREROUTING` — modifie l'adresse **destination** des paquets entrants **avant** le routage
- `POSTROUTING` — modifie l'adresse **source** des paquets sortants **après** le routage

**Table `mangle` :**
- `PREROUTING`, `OUTPUT`, `INPUT`, `FORWARD`, `POSTROUTING` — modifient les champs d'en-tête des paquets.

### Chaînes définies par l'utilisateur

Elles simplifient la gestion en regroupant les règles selon des critères précis (IP source, port de destination, protocole…). On peut les rattacher à n'importe quelle table.

**Exemple :** une organisation possédant plusieurs serveurs web avec des règles similaires peut regrouper ces règles dans une chaîne dédiée, puis y aiguiller le trafic ciblant le port 80 (HTTP).

---

## Règles et cibles (Rules & Targets)

Les règles définissent les **critères de filtrage** et l'**action** à appliquer aux paquets correspondants. On les ajoute à une chaîne avec l'option `-A` suivie du nom de la chaîne.

Chaque règle = un ensemble de **matches** (critères) + une **target** (action).

### Cibles courantes

| Cible | Description |
|-------|-------------|
| `ACCEPT` | Autorise le paquet à traverser le pare-feu |
| `DROP` | Rejette le paquet **silencieusement** (aucune réponse à la source) |
| `REJECT` | Rejette le paquet **et** renvoie un message d'erreur à la source |
| `LOG` | Journalise les infos du paquet dans les logs système |
| `SNAT` | Modifie l'IP **source** (NAT — traduction IP privée → publique) |
| `DNAT` | Modifie l'IP **destination** (redirection de trafic) |
| `MASQUERADE` | Comme SNAT, mais pour une IP source **dynamique** |
| `REDIRECT` | Redirige les paquets vers un autre port/IP local |
| `MARK` | Ajoute/modifie la valeur de marque Netfilter (routage avancé) |

> 🔎 **DROP vs REJECT :** `DROP` rend un port « invisible » (le scanner attend un timeout), tandis que `REJECT` répond activement (le scanner sait que le port est fermé). `DROP` est souvent préféré pour ralentir la reconnaissance d'un attaquant, mais peut causer des délais côté clients légitimes.

### Exemple de règle

Autoriser le trafic TCP entrant sur le port 22 (SSH) :
```bash
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```

---

## Correspondances (Matches)

Les matches précisent les critères déterminant si une règle s'applique à un paquet ou une connexion (IP source/destination, protocole, port…).

| Match | Description |
|-------|-------------|
| `-p` / `--protocol` | Protocole à matcher (`tcp`, `udp`, `icmp`) |
| `--dport` | Port de destination |
| `--sport` | Port source |
| `-s` / `--source` | Adresse IP source |
| `-d` / `--destination` | Adresse IP destination |
| `-m state` | État de la connexion (`NEW`, `ESTABLISHED`, `RELATED`) |
| `-m multiport` | Plusieurs ports ou plages de ports |
| `-m tcp` | Paquets TCP + options spécifiques |
| `-m udp` | Paquets UDP + options spécifiques |
| `-m string` | Paquets contenant une chaîne de caractères |
| `-m limit` | Paquets à un débit limité (anti-flood) |
| `-m conntrack` | Basé sur le suivi de connexion (conntrack) |
| `-m mark` | Basé sur la marque Netfilter |
| `-m mac` | Basé sur l'adresse MAC |
| `-m iprange` | Basé sur une plage d'adresses IP |

Les matches se déclarent avec l'option `-m`.

**Exemple :** autoriser le trafic TCP entrant sur le port 80 (HTTP) :
```bash
sudo iptables -A INPUT -p tcp -m tcp --dport 80 -j ACCEPT
```
Cette règle matche le trafic TCP (`-p tcp`) sur le port 80 (`--dport 80`) et saute vers la cible `ACCEPT` (`-j ACCEPT`) si la correspondance réussit.

---

## Commandes iptables essentielles

### Gestion des règles

| Commande | Action |
|----------|--------|
| `iptables -A <chaîne>` | **Ajoute** une règle en fin de chaîne |
| `iptables -I <chaîne> <n°>` | **Insère** une règle à une position donnée |
| `iptables -D <chaîne> <n°>` | **Supprime** une règle |
| `iptables -R <chaîne> <n°>` | **Remplace** une règle |
| `iptables -F` | **Vide** toutes les règles (*flush*) |
| `iptables -L -v -n --line-numbers` | **Liste** les règles (avec numéros) |
| `iptables -P <chaîne> <cible>` | Définit la **politique par défaut** d'une chaîne |

### Lister les règles
```bash
sudo iptables -L -v -n --line-numbers
```

### Politique par défaut restrictive (bonne pratique)

Un pare-feu robuste applique le principe **« tout interdire, sauf ce qui est explicitement autorisé »** (*default deny*) :
```bash
sudo iptables -P INPUT DROP       # Bloque tout en entrée par défaut
sudo iptables -P FORWARD DROP     # Bloque le forwarding
sudo iptables -P OUTPUT ACCEPT    # Autorise la sortie
```

---

## Exemple concret : configuration d'un serveur

Voici un jeu de règles typique pour sécuriser un serveur (SSH + web) :

```bash
# 1. Autoriser le trafic local (loopback)
sudo iptables -A INPUT -i lo -j ACCEPT

# 2. Autoriser les connexions déjà établies et associées
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# 3. Autoriser SSH (port 22)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 4. Autoriser HTTP et HTTPS
sudo iptables -A INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT

# 5. Autoriser les pings (ICMP echo-request)
sudo iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT

# 6. Journaliser puis rejeter le reste
sudo iptables -A INPUT -j LOG --log-prefix "IPTABLES-DROP: "
sudo iptables -P INPUT DROP
```

> 💡 L'ordre des règles est **crucial** : iptables les évalue **de haut en bas** et s'arrête à la première correspondance. Placez toujours la règle `ESTABLISHED,RELATED` en tête pour la performance.

---

## Persistance des règles

⚠️ Les règles iptables sont **perdues au redémarrage**. Pour les rendre permanentes :

**Debian/Ubuntu — via `iptables-persistent` :**
```bash
sudo apt install iptables-persistent -y
sudo netfilter-persistent save
# Les règles sont sauvegardées dans /etc/iptables/rules.v4
```

**Sauvegarde/restauration manuelle :**
```bash
sudo iptables-save > /etc/iptables/rules.v4    # Sauvegarde
sudo iptables-restore < /etc/iptables/rules.v4 # Restauration
```

---

## Aperçu : UFW (l'alternative simple)

Pour un usage courant, UFW simplifie énormément la configuration :

```bash
sudo ufw enable                    # Active le pare-feu
sudo ufw default deny incoming     # Politique par défaut : refuser l'entrée
sudo ufw default allow outgoing    # Autoriser la sortie
sudo ufw allow 22/tcp              # Autoriser SSH
sudo ufw allow 80,443/tcp          # Autoriser web
sudo ufw limit ssh                 # Anti-bruteforce sur SSH
sudo ufw status verbose            # État détaillé
sudo ufw delete allow 80/tcp       # Supprimer une règle
```

> 💡 Pour ton Raspberry Pi 5, UFW est un excellent choix pour une première couche de filtrage avant de déployer des outils plus avancés comme Suricata (IDS/IPS).

---

## Aperçu : nftables (le successeur moderne)

`nftables` remplace iptables, ip6tables, arptables et ebtables sous une syntaxe unifiée :

```bash
# Lister le ruleset
sudo nft list ruleset

# Créer une table et une chaîne
sudo nft add table inet filter
sudo nft add chain inet filter input { type filter hook input priority 0 \; policy drop \; }

# Ajouter une règle (autoriser SSH)
sudo nft add rule inet filter input tcp dport 22 accept
```

**Avantages de nftables :** syntaxe plus lisible, meilleures performances, gestion IPv4/IPv6 unifiée, mises à jour atomiques du ruleset.

---

## Récapitulatif — le flux d'un paquet

Ordre de traversée des chaînes Netfilter par un paquet :

```
                    ┌─────────────┐
   Paquet entrant → │ PREROUTING  │ (nat, mangle, raw)
                    └──────┬──────┘
                           │
                   ┌───────┴────────┐
        Pour la    │  Décision de   │   À transférer ?
        machine ?  │    routage     │
                   └───┬────────┬───┘
                       │        │
                ┌──────▼──┐  ┌──▼────────┐
                │  INPUT  │  │  FORWARD  │
                └────┬────┘  └─────┬─────┘
                     │             │
              ┌──────▼──┐          │
              │ Process │          │
              │  local  │          │
              └────┬────┘          │
                   │               │
              ┌────▼─────┐         │
              │  OUTPUT  │         │
              └────┬─────┘         │
                   │               │
                   └───────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ POSTROUTING  │ (nat, mangle) → Paquet sortant
                    └──────────────┘
```
