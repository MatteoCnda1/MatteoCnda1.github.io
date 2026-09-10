---
id: 02-ssh-durcissement
title: SSH — accès distant et durcissement
sidebar_position: 2
tags: [linux]
---

# SSH — accès distant et durcissement

SSH (Secure Shell) est le protocole standard pour administrer une machine à distance de façon chiffrée. C'est aussi l'une des premières portes visées par les attaquants (le port 22 subit en permanence des tentatives automatisées). Bien le configurer et le durcir est fondamental. Ce cours suppose acquises les bases de l'usage client (voir le cours réseau) et se concentre sur le serveur et sa sécurisation.

## Client et serveur

SSH fonctionne en deux parties :
- Le **serveur** (`openssh-server`, le démon `sshd`) tourne sur la machine à administrer et écoute les connexions.
- Le **client** (`openssh-client`, la commande `ssh`) est utilisé depuis ta machine pour te connecter.

```bash
sudo systemctl status ssh       # état du serveur SSH (parfois nommé sshd)
ssh utilisateur@serveur         # connexion depuis le client
```

La configuration serveur est dans `/etc/ssh/sshd_config` — c'est le fichier central de ce cours. La configuration client (par utilisateur) est dans `~/.ssh/config`.

## L'authentification par clé

C'est le point le plus important pour la sécurité. Plutôt qu'un mot de passe (vulnérable au brute force et au vol), SSH permet l'authentification par **paire de clés** asymétriques (rappel de ta crypto) :
- Une **clé privée**, gardée secrète sur ta machine, jamais partagée.
- Une **clé publique**, déposée sur le serveur.

Le serveur vérifie que tu possèdes la clé privée correspondant à une clé publique autorisée, sans que le secret ne circule. C'est bien plus sûr qu'un mot de passe.

Mise en place :

```bash
ssh-keygen -t ed25519 -C "mon commentaire"   # générer une paire (ed25519 : moderne et sûr)
ssh-copy-id utilisateur@serveur               # déposer la clé publique sur le serveur
ssh utilisateur@serveur                        # se connecter (sans mot de passe désormais)
```

La clé privée générée se trouve dans `~/.ssh/id_ed25519` (à protéger, permissions `600`), la publique dans `~/.ssh/id_ed25519.pub`. Sur le serveur, les clés autorisées sont listées dans `~/.ssh/authorized_keys`. On peut protéger la clé privée par une **passphrase** (mot de passe qui déchiffre la clé) pour qu'elle soit inutilisable si volée.

Cas d'usage : une fois les clés en place, on peut **désactiver complètement l'authentification par mot de passe** (voir durcissement), ce qui élimine d'un coup les attaques par force brute sur les mots de passe.

## Le durcissement de SSH

Voici les mesures concrètes de durcissement, à appliquer dans `/etc/ssh/sshd_config`. Après chaque modification, il faut recharger le service (`sudo systemctl restart ssh`) et **garder une session ouverte** pour ne pas se verrouiller dehors en cas d'erreur.

**Désactiver le login root direct.** On se connecte avec un utilisateur normal puis on utilise sudo. Cela évite qu'un attaquant vise directement le compte le plus puissant :

```
PermitRootLogin no
```

**Désactiver l'authentification par mot de passe** (une fois les clés en place). C'est la mesure la plus efficace contre le brute force :

```
PasswordAuthentication no
PubkeyAuthentication yes
```

**Changer le port par défaut** (de 22 vers un autre). Ce n'est pas une vraie protection (sécurité par l'obscurité), mais ça réduit énormément le bruit des scans automatisés :

```
Port 2222
```

**Limiter les utilisateurs autorisés** à se connecter en SSH :

```
AllowUsers alice bob
```

**Autres réglages utiles** : réduire le délai et le nombre de tentatives de connexion, désactiver les fonctionnalités inutilisées.

```
LoginGraceTime 30
MaxAuthTries 3
X11Forwarding no
```

Après modification, valider et recharger :

```bash
sudo sshd -t                     # teste la syntaxe de la config (évite de casser le service)
sudo systemctl restart ssh
```

Le `sshd -t` est un réflexe indispensable : il vérifie la configuration avant application, t'évitant de rendre le serveur inaccessible.

## Se protéger du brute force : fail2ban

Même bien configuré, le port SSH subit des tentatives. **fail2ban** surveille les journaux et **bannit automatiquement** (via le pare-feu) les adresses IP qui multiplient les échecs de connexion. C'est un complément quasi indispensable sur un serveur exposé. Il est traité en détail dans le cours pare-feu, mais retiens qu'il s'applique en priorité à SSH : après N échecs, l'IP fautive est bloquée pour un temps donné, ce qui casse net les attaques automatisées.

## Bonnes pratiques complémentaires

Quelques réflexes qui complètent le durcissement :
- Utiliser une **passphrase** sur les clés privées, et un **agent SSH** (`ssh-agent`) pour ne pas la retaper sans cesse.
- Fichier `~/.ssh/config` côté client pour définir des raccourcis et options par serveur (hôte, utilisateur, port, clé).
- Maintenir `openssh-server` **à jour** (les failles SSH sont corrigées régulièrement — voir le cours sur le patch management).
- Surveiller les **journaux** de connexion (`journalctl -u ssh`) pour repérer les tentatives suspectes.

Cas d'usage typique d'un serveur bien durci : SSH sur un port non standard, login root désactivé, mots de passe désactivés (clés uniquement), utilisateurs restreints, et fail2ban qui bannit les IP trop insistantes. Cette combinaison réduit la surface d'attaque de façon drastique.

## Ce qu'il faut retenir

- SSH = **serveur** (`sshd`, config `/etc/ssh/sshd_config`) + **client** (`ssh`, config `~/.ssh/config`). Le port 22 est constamment attaqué.
- **Authentification par clé** (paire privée/publique) : bien plus sûre que le mot de passe. `ssh-keygen -t ed25519` puis `ssh-copy-id` ; clé privée en `600`, protégée par **passphrase**.
- **Durcissement** (dans `sshd_config`) : `PermitRootLogin no`, `PasswordAuthentication no` (le plus efficace contre le brute force), changer le `Port`, `AllowUsers`, `MaxAuthTries`. Toujours `sshd -t` avant de recharger, et garder une session ouverte.
- **fail2ban** bannit automatiquement les IP qui échouent trop souvent (complément essentiel sur un serveur exposé).
- Compléments : passphrase + `ssh-agent`, `~/.ssh/config`, mises à jour régulières, surveillance des journaux (`journalctl -u ssh`).

## Voir aussi

- [Utilisateurs, groupes et permissions](./01-utilisateurs-groupes-permissions.md) — le cours précédent.
- [Pare-feu — nftables, ufw, fail2ban](./04-pare-feu-nftables-ufw-fail2ban.md) — fail2ban en détail.
