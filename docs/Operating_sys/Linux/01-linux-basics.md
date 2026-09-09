---
id: 01-linux-basics
title: Linux Basics
tags: [linux]
---

# Linux — Les fondamentaux

> Base de connaissances : commandes essentielles, gestion système, réseau et sauvegarde sous Linux (Debian/Ubuntu).

---

## Le prompt du shell

Le prompt indique le niveau de privilège de l'utilisateur courant :

| Symbole | Signification |
|:-------:|---------------|
| `$` | Shell utilisateur non privilégié |
| `#` | Shell root (privilégié) |

### Personnaliser le prompt (variable `PS1`)

Le prompt est défini par la variable d'environnement `PS1`. On peut y insérer des caractères spéciaux :

| Séquence | Description |
|----------|-------------|
| `\d` | Date (ex. `Mon Feb 6`) |
| `\D{%Y-%m-%d}` | Date au format personnalisé (`YYYY-MM-DD`) |
| `\H` | Nom d'hôte complet (FQDN) |
| `\h` | Nom d'hôte court (jusqu'au premier `.`) |
| `\j` | Nombre de jobs gérés par le shell |
| `\n` | Nouvelle ligne |
| `\r` | Retour chariot |
| `\s` | Nom du shell |
| `\t` | Heure au format 24h (`HH:MM:SS`) |
| `\T` | Heure au format 12h (`HH:MM:SS`) |
| `\@` | Heure courante (format AM/PM) |
| `\u` | Utilisateur courant |
| `\w` | Chemin complet du répertoire courant |
| `\W` | Nom de base du répertoire courant |

**Exemple :**
```bash
export PS1="\u@\h:\w\$ "
# -> mcan@debian:/home/mcan$
```

> 💡 Pour rendre le changement permanent, ajoutez la ligne `export PS1=...` dans `~/.bashrc`.

---

## Informations système

| Commande | Description |
|----------|-------------|
| `whoami` | Affiche l'utilisateur courant |
| `id` | Retourne l'identité de l'utilisateur (UID, GID, groupes) |
| `hostname` | Définit ou affiche le nom d'hôte du système |
| `uname -a` | Informations sur le noyau et le matériel |
| `pwd` | Affiche le répertoire de travail courant |
| `ifconfig` | Affiche/configure une interface réseau *(déprécié)* |
| `ip` | Affiche/manipule le routage, les interfaces et les tunnels |
| `netstat` | Affiche l'état du réseau |
| `ss` | Investigue les sockets (remplaçant moderne de `netstat`) |
| `ps` | Affiche l'état des processus |
| `who` | Affiche les utilisateurs connectés |
| `env` | Affiche l'environnement ou exécute une commande |
| `lsblk` | Liste les périphériques de bloc (disques) |
| `lsusb` | Liste les périphériques USB |
| `lsof` | Liste les fichiers ouverts |
| `lspci` | Liste les périphériques PCI |
| `uptime` | Temps de fonctionnement + charge système |
| `free -h` | Utilisation de la mémoire (RAM/swap) |
| `df -h` | Espace disque utilisé par point de montage |
| `du -sh <dir>` | Taille d'un répertoire |

---

## Connexion via SSH

```bash
ssh student@[adresse_IP]
```

Options utiles :
```bash
ssh -p 2222 user@host          # Port personnalisé
ssh -i ~/.ssh/id_ed25519 user@host   # Clé privée spécifique
ssh -L 8080:localhost:80 user@host   # Tunnel local (port forwarding)
```

> 🔐 Bonne pratique : privilégier l'authentification par clé (Ed25519) plutôt que par mot de passe. Générer une paire avec `ssh-keygen -t ed25519`.

---

## Rechercher fichiers et répertoires

### `which`
Localise le chemin d'un exécutable présent dans le `PATH`.
```bash
which python3
```

### `find`
Recherche puissante et récursive.
```bash
find <emplacement> <options>
```
**Exemple complet :**
```bash
find / -type f -name "*.conf" -user root -size +20k -newermt 2020-03-03 -exec ls -al {} \; 2>/dev/null
```
| Option | Rôle |
|--------|------|
| `-type f` | Fichiers uniquement (`d` pour dossiers) |
| `-name "*.conf"` | Filtre par nom |
| `-user root` | Fichiers appartenant à root |
| `-size +20k` | Plus grands que 20 Ko |
| `-newermt` | Modifiés après une date |
| `-exec ... {} \;` | Exécute une commande sur chaque résultat |

### `locate`
Recherche instantanée via une base de données indexée (plus rapide mais pas en temps réel).
```bash
locate "*.conf"
sudo updatedb   # Met à jour la base
```

---

## Descripteurs de fichiers et redirections

Les flux de données standards :

| Flux | Nom | Numéro |
|------|-----|:------:|
| Entrée | STDIN | `0` |
| Sortie | STDOUT | `1` |
| Erreur | STDERR | `2` |

**Rediriger STDOUT et STDERR vers des fichiers séparés :**
```bash
find /etc/ -name shadow 2> stderr.txt 1> stdout.txt
```

Autres redirections courantes :
```bash
commande > fichier      # STDOUT (écrase)
commande >> fichier     # STDOUT (ajoute)
commande 2>/dev/null    # Ignore les erreurs
commande &> fichier     # STDOUT + STDERR ensemble
commande1 | commande2   # Pipe : sortie de 1 vers entrée de 2
```

---

## Gestion des utilisateurs

| Commande | Description |
|----------|-------------|
| `sudo` | Exécute une commande en tant qu'autre utilisateur (root par défaut) |
| `su` | Change d'identité (superutilisateur par défaut) via PAM |
| `useradd` | Crée un nouvel utilisateur |
| `userdel` | Supprime un compte et ses fichiers associés |
| `usermod` | Modifie un compte utilisateur |
| `addgroup` | Ajoute un groupe |
| `delgroup` | Supprime un groupe |
| `passwd` | Change le mot de passe d'un utilisateur |

**Fichiers clés :**
- `/etc/passwd` — comptes utilisateurs
- `/etc/shadow` — mots de passe chiffrés (lisible par root uniquement)
- `/etc/group` — groupes
- `/etc/sudoers` — droits sudo (à éditer avec `visudo`)

**Exemple — ajouter un utilisateur à un groupe :**
```bash
sudo usermod -aG sudo mcan   # Ajoute mcan au groupe sudo
```

---

## Gestion des paquets

| Outil | Description |
|-------|-------------|
| `dpkg` | Installe/construit/supprime des paquets Debian (`.deb`) |
| `apt` | Interface haut niveau du gestionnaire de paquets |
| `aptitude` | Alternative à `apt` (interface haut niveau) |
| `snap` | Paquets universels conteneurisés (Canonical) |
| `gem` | Gestionnaire de paquets Ruby (RubyGems) |
| `pip` | Installateur de paquets Python |
| `git` | Système de contrôle de version distribué |

**Commandes `apt` courantes :**
```bash
sudo apt update              # Met à jour la liste des paquets
sudo apt upgrade             # Met à jour les paquets installés
sudo apt install <paquet>    # Installe
sudo apt remove <paquet>     # Désinstalle
sudo apt purge <paquet>      # Désinstalle + config
sudo apt search <terme>      # Recherche
apt show <paquet>            # Détails d'un paquet
```

---

## Gestion des services et processus

### Signaux

Lister tous les signaux disponibles :
```bash
kill -l
```

**Signaux les plus utilisés :**

| N° | Signal | Description |
|:--:|--------|-------------|
| 1 | `SIGHUP` | Envoyé quand le terminal contrôlant le processus est fermé (souvent utilisé pour recharger la config) |
| 2 | `SIGINT` | Interruption via `Ctrl + C` |
| 3 | `SIGQUIT` | Quitter via `Ctrl + D` |
| 9 | `SIGKILL` | Tue immédiatement le processus, sans nettoyage |
| 15 | `SIGTERM` | Terminaison propre (signal par défaut de `kill`) |
| 19 | `SIGSTOP` | Stoppe le processus (non interceptable) |
| 20 | `SIGTSTP` | Suspension via `Ctrl + Z` (interceptable) |

**Exemples :**
```bash
kill 1234          # Envoie SIGTERM au PID 1234
kill -9 1234       # Force la fin (SIGKILL)
killall firefox    # Tue tous les processus par nom
pkill -f script.sh # Tue par motif de ligne de commande
```

### `systemctl` — gérer les services

```bash
sudo systemctl start <service>     # Démarre
sudo systemctl stop <service>      # Arrête
sudo systemctl restart <service>   # Redémarre
sudo systemctl status <service>    # État
sudo systemctl enable <service>    # Démarrage automatique au boot
sudo systemctl disable <service>   # Désactive au boot
```

---

## Planification de tâches

### Systemd Timers

**1. Créer le timer** (`/etc/systemd/system/mytimer.timer`) :
```ini
[Unit]
Description=My Timer

[Timer]
OnBootSec=3min
OnUnitActiveSec=1hour

[Install]
WantedBy=timers.target
```

**2. Créer le service associé** (`/etc/systemd/system/mytimer.service`) :
```ini
[Unit]
Description=My Service

[Service]
ExecStart=/full/path/to/my/script.sh

[Install]
WantedBy=multi-user.target
```

**3. Recharger systemd et activer le timer :**
```bash
sudo systemctl daemon-reload
sudo systemctl start mytimer.timer
sudo systemctl enable mytimer.timer
```

### Cron

Format d'une ligne de crontab (édition via `crontab -e`) :

```
┌───────── Minute (0-59)
│ ┌─────── Heure (0-23)
│ │ ┌───── Jour du mois (1-31)
│ │ │ ┌─── Mois (1-12)
│ │ │ │ ┌─ Jour de la semaine (0-7, 0 et 7 = dimanche)
│ │ │ │ │
* * * * *  commande_à_exécuter
```

| Champ | Plage | Description |
|-------|:-----:|-------------|
| Minutes | 0-59 | Minute d'exécution |
| Heures | 0-23 | Heure d'exécution |
| Jour du mois | 1-31 | Jour du mois |
| Mois | 1-12 | Mois |
| Jour de la semaine | 0-7 | Jour de la semaine |

**Exemple :** exécuter un backup tous les jours à 2h30 :
```
30 2 * * * /home/mcan/backup.sh
```

---

## NFS (Network File System)

Partage de répertoires entre machines sur un réseau.

**Installation (côté serveur) :**
```bash
sudo apt install nfs-kernel-server -y
```

**Options d'export :**

| Option | Description |
|--------|-------------|
| `rw` | Accès lecture/écriture au partage |
| `ro` | Accès lecture seule |
| `no_root_squash` | Le root du client garde ses droits root |
| `root_squash` | Le root du client est réduit aux droits d'un utilisateur normal |
| `sync` | Transfert synchrone (données écrites avant confirmation) |
| `async` | Transfert asynchrone (plus rapide, risque d'incohérence) |

> ⚠️ **Sécurité :** `no_root_squash` est dangereux — un attaquant contrôlant le client peut écrire des fichiers appartenant à root sur le serveur. À éviter en production.

**Créer un partage NFS :**
```bash
mkdir nfs_sharing
echo '/home/cry0l1t3/nfs_sharing hostname(rw,sync,no_root_squash)' >> /etc/exports
cat /etc/exports | grep -v "#"
# /home/cry0l1t3/nfs_sharing hostname(rw,sync,no_root_squash)
```

**Monter un partage NFS (côté client) :**
```bash
mkdir ~/target_nfs
mount 10.129.12.17:/home/john/dev_scripts ~/target_nfs
tree ~/target_nfs
```
```
target_nfs/
├── css.css
├── html.html
├── javascript.js
├── php.php
└── xml.xml

0 directories, 5 files
```

---

## VPN

**Installation :**
```bash
sudo apt install openvpn -y
```

**Connexion à un VPN :**
```bash
sudo openvpn --config internal.ovpn
```

---

## Sauvegarde avec `rsync`

`rsync` synchronise efficacement des fichiers/répertoires en ne transférant que les différences.

**Sauvegarder un répertoire local vers un serveur de backup :**
```bash
rsync -av /path/to/mydirectory user@backup_server:/path/to/backup/directory
```

**Avec compression, archivage des anciennes versions et suppression des fichiers obsolètes :**
```bash
rsync -avz --backup --backup-dir=/path/to/backup/folder --delete \
  /path/to/mydirectory user@backup_server:/path/to/backup/directory
```

**Restaurer une sauvegarde :**
```bash
rsync -av user@remote_host:/path/to/backup/directory /path/to/mydirectory
```

| Option | Rôle |
|--------|------|
| `-a` | Mode archive (préserve permissions, dates, liens…) |
| `-v` | Verbose |
| `-z` | Compression durant le transfert |
| `--delete` | Supprime côté destination les fichiers absents de la source |
| `--backup` | Conserve les versions écrasées |

> 💡 `rsync` fonctionne au-dessus de SSH par défaut pour les transferts distants : le trafic est chiffré.

---

## Configuration réseau

Sous Ubuntu/Debian, on configure les interfaces réseau avec `ifconfig` (déprécié) ou `ip` (moderne).

### Consulter les paramètres réseau

**Avec `ifconfig` :**
```bash
ifconfig
```
```
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 178.62.32.126  netmask 255.255.192.0  broadcast 178.62.63.255
        inet6 fe80::88d9:faff:fecf:797a  prefixlen 64  scopeid 0x20<link>
        ether 8a:d9:fa:cf:79:7a  txqueuelen 1000  (Ethernet)
```

**Avec `ip` (recommandé) :**
```bash
ip addr
```
```
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
    link/ether 8a:d9:fa:cf:79:7a brd ff:ff:ff:ff:ff:ff
    inet 178.62.32.126/18 brd 178.62.63.255 scope global dynamic eth0
```

> ℹ️ `ifconfig` est déprécié dans les distributions récentes au profit de `ip` (paquet `iproute2`), plus complet.

### Activer une interface
```bash
sudo ifconfig eth0 up          # ancienne méthode
sudo ip link set eth0 up       # méthode moderne
```

### Assigner une adresse IP
```bash
sudo ifconfig eth0 192.168.1.2
# ou
sudo ip addr add 192.168.1.2/24 dev eth0
```

### Assigner un masque de sous-réseau
```bash
sudo ifconfig eth0 netmask 255.255.255.0
```

### Définir la passerelle par défaut
```bash
sudo route add default gw 192.168.1.1 eth0
# ou
sudo ip route add default via 192.168.1.1 dev eth0
```

### Configurer le DNS

Les serveurs DNS traduisent les noms de domaine (ex. `example.com`) en adresses IP.

```bash
sudo vim /etc/resolv.conf
```
```
nameserver 8.8.8.8
nameserver 8.8.4.4
```

> ⚠️ Les modifications directes de `/etc/resolv.conf` **ne sont pas persistantes** : le fichier est régénéré par `NetworkManager` ou `systemd-resolved`. Pour un réglage permanent, passer par l'outil de gestion réseau approprié.

### Rendre la configuration persistante

Éditer `/etc/network/interfaces` :
```bash
sudo vim /etc/network/interfaces
```
```
auto eth0
iface eth0 inet static
  address 192.168.1.2
  netmask 255.255.255.0
  gateway 192.168.1.1
  dns-nameservers 8.8.8.8 8.8.4.4
```

Puis redémarrer le service réseau :
```bash
sudo systemctl restart networking
```

> ℹ️ Sur Ubuntu récent (17.10+), la configuration réseau se fait via **Netplan** (`/etc/netplan/*.yaml`) plutôt que `/etc/network/interfaces`.

---

## Annexe — Arborescence Linux (FHS)

Rappel des principaux répertoires du *Filesystem Hierarchy Standard* :

| Répertoire | Contenu |
|------------|---------|
| `/` | Racine du système |
| `/bin`, `/sbin` | Binaires essentiels (utilisateur / système) |
| `/etc` | Fichiers de configuration système |
| `/home` | Répertoires personnels des utilisateurs |
| `/root` | Répertoire personnel de root |
| `/var` | Données variables (logs, caches, mails) |
| `/tmp` | Fichiers temporaires (effacés au reboot) |
| `/usr` | Applications et bibliothèques utilisateur |
| `/opt` | Logiciels optionnels tiers |
| `/proc`, `/sys` | Systèmes de fichiers virtuels (infos noyau/processus) |
| `/dev` | Fichiers de périphériques |
| `/mnt`, `/media` | Points de montage |
