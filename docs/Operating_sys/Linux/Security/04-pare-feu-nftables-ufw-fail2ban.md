---
id: 04-pare-feu-nftables-ufw-fail2ban
title: Pare-feu — nftables, ufw, fail2ban
sidebar_position: 4
tags: [linux, reseau]
---

# Pare-feu — nftables, ufw, fail2ban

Le pare-feu contrôle quel trafic réseau entre et sort d'une machine. C'est une brique centrale de la sécurité : il définit la surface exposée. Ce cours couvre le moteur moderne (**nftables**), la surcouche simplifiée (**ufw**) et la protection dynamique contre le brute force (**fail2ban**). Il complète le cours réseau (où le pare-feu était situé) et ton cours existant sur le firewalling.

## Le principe et l'architecture

Sous Linux, le filtrage réseau est assuré par **netfilter**, un composant du noyau. On ne le configure pas directement : on utilise un outil qui pilote netfilter. Historiquement c'était **iptables** ; le standard moderne qui le remplace est **nftables**. Par-dessus, des surcouches comme **ufw** simplifient la gestion pour les cas courants.

Le principe de base d'un pare-feu : une liste de **règles** évaluées dans l'ordre, chacune décrivant un trafic (par direction, port, protocole, IP source/destination) et une **action** (accepter, rejeter, ignorer). Une **politique par défaut** s'applique si aucune règle ne correspond.

La bonne pratique fondamentale : une politique par défaut en **DROP** (tout bloquer), puis autoriser explicitement le nécessaire. C'est le principe de la **liste blanche** — on n'ouvre que ce dont on a besoin, tout le reste est fermé. L'inverse (tout ouvrir puis bloquer au cas par cas) est bien plus risqué car on oublie forcément quelque chose.

## nftables

**nftables** est le framework de pare-feu moderne. Sa configuration s'organise en **tables** (conteneurs, par famille de protocole), **chaînes** (points d'accrochage : trafic entrant, sortant, transféré) et **règles** (dans les chaînes).

Commandes de base :

```bash
sudo nft list ruleset                    # afficher toutes les règles actives
sudo systemctl enable --now nftables     # activer le service
```

La configuration se fait généralement dans un fichier (souvent `/etc/nftables.conf`) qu'on charge, plutôt qu'en tapant des règles une à une. Exemple minimal et commenté d'un jeu de règles pour un serveur :

```
table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;   # politique par défaut : tout bloquer

        ct state established,related accept    # accepter les réponses aux connexions qu'on a initiées
        iif lo accept                          # accepter le trafic local (loopback)
        tcp dport 22 accept                    # autoriser SSH
        tcp dport { 80, 443 } accept           # autoriser HTTP et HTTPS
        ip protocol icmp accept                # autoriser le ping
    }
    chain forward { type filter hook forward priority 0; policy drop; }
    chain output  { type filter hook output priority 0; policy accept; }
}
```

Lecture : la chaîne `input` (trafic entrant) a une politique par défaut `drop`, puis on autorise explicitement les connexions déjà établies, le loopback, SSH, HTTP/HTTPS et l'ICMP. Tout le reste est bloqué. La règle `ct state established,related accept` est essentielle : elle laisse revenir les réponses au trafic que la machine a elle-même initié (sinon, tu bloquerais tes propres navigations).

```bash
sudo nft -f /etc/nftables.conf           # charger la configuration depuis le fichier
```

nftables est puissant et précis, mais sa syntaxe demande un apprentissage. Pour un serveur aux besoins simples, ufw suffit souvent.

## ufw

**ufw** (Uncomplicated Firewall) est une surcouche qui simplifie radicalement la gestion du pare-feu pour les cas courants. Il pilote netfilter avec des commandes lisibles. C'est l'outil recommandé sur Ubuntu/Debian quand on n'a pas besoin de la finesse de nftables.

```bash
sudo ufw enable                  # activer le pare-feu
sudo ufw status verbose          # voir l'état et les règles
sudo ufw default deny incoming   # politique par défaut : bloquer l'entrant (bonne pratique)
sudo ufw default allow outgoing  # autoriser le sortant
sudo ufw allow 22/tcp            # autoriser SSH
sudo ufw allow 80,443/tcp        # autoriser HTTP/HTTPS
sudo ufw allow from 192.168.1.0/24 to any port 22   # SSH seulement depuis le réseau local
sudo ufw delete allow 80/tcp     # supprimer une règle
```

Cas d'usage : sécuriser rapidement un serveur en trois commandes (deny incoming par défaut, allow SSH, allow le service voulu). La syntaxe proche du langage naturel rend ufw idéal pour les besoins standards et pour débuter. Pour des règles complexes (NAT, filtrage fin), on passe à nftables.

Point de vigilance récurrent : avant d'activer le pare-feu sur un serveur distant, **toujours autoriser SSH d'abord** (`ufw allow 22/tcp`), sinon tu te coupes l'accès à ta propre machine.

## fail2ban

**fail2ban** protège contre les attaques par **force brute** en surveillant les journaux et en **bannissant dynamiquement** les IP qui multiplient les échecs. Là où le pare-feu applique des règles statiques, fail2ban réagit au comportement en temps réel.

Fonctionnement : fail2ban lit les journaux des services (SSH, serveur web...), détecte les motifs d'échec (ex. plusieurs mauvais mots de passe SSH), et **ajoute automatiquement une règle de blocage** de l'IP fautive dans le pare-feu, pour une durée définie. Passé ce délai, l'IP est débloquée (ou bannie plus longtemps si elle récidive).

```bash
sudo systemctl status fail2ban    # état du service
sudo fail2ban-client status       # liste des « prisons » (jails) actives
sudo fail2ban-client status sshd  # détail de la prison SSH (IP bannies, tentatives)
sudo fail2ban-client set sshd unbanip 1.2.3.4   # débannir une IP manuellement
```

La configuration se fait dans `/etc/fail2ban/jail.local` (à créer, plutôt que de modifier `jail.conf`), où l'on définit par service : le nombre d'échecs tolérés (`maxretry`), la fenêtre de temps (`findtime`), et la durée de bannissement (`bantime`).

Cas d'usage : sur un serveur avec SSH exposé, fail2ban est quasi indispensable. Il casse net les attaques automatisées (des milliers de tentatives par jour sur le port 22) en bannissant les IP après quelques échecs. Combiné au durcissement SSH (clés uniquement, root désactivé), il rend le brute force inopérant.

## La combinaison gagnante

Ces outils sont complémentaires et se cumulent :
- **nftables ou ufw** définit la surface exposée (quels ports sont ouverts) — protection **statique**.
- **fail2ban** réagit aux comportements malveillants sur les services ouverts — protection **dynamique**.

Sur un serveur type : pare-feu en deny par défaut n'ouvrant que SSH et les services nécessaires, plus fail2ban qui surveille ces services ouverts. Le pare-feu réduit la surface, fail2ban protège ce qui doit rester accessible.

## Ce qu'il faut retenir

- Le filtrage repose sur **netfilter** (noyau), piloté par **nftables** (moderne, remplace iptables) ou la surcouche **ufw** (simple).
- Principe fondamental : **politique par défaut DROP** (tout bloquer) puis autoriser explicitement le nécessaire (**liste blanche**). Toujours autoriser les connexions `established,related` (les réponses au trafic sortant).
- **nftables** : tables/chaînes/règles, config dans `/etc/nftables.conf`, puissant mais technique. **ufw** : commandes lisibles (`ufw allow 22/tcp`, `ufw default deny incoming`), idéal pour les besoins courants.
- Réflexe : **autoriser SSH avant d'activer** le pare-feu sur une machine distante, sous peine de se verrouiller dehors.
- **fail2ban** : protection **dynamique** contre le brute force ; surveille les journaux et bannit automatiquement les IP fautives (config dans `jail.local`, `maxretry`/`bantime`). Indispensable pour SSH exposé.
- **Combinaison** : pare-feu (surface statique) + fail2ban (réaction dynamique) = défense en profondeur côté réseau.
