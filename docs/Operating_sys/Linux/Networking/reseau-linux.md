---
id: reseau-linux
title: Réseau sous Linux
sidebar_position: 1
tags: [linux, reseau]
---

# Réseau sous Linux

Ce cours regroupe l'essentiel du réseau côté Linux : les concepts fondamentaux (TCP/IP, ports, DNS, routage, TLS) et les outils en ligne de commande pour configurer, diagnostiquer, capturer et tester un réseau. L'approche est celle d'un administrateur : comprendre ce que fait chaque outil, avec des exemples et des cas d'usage concrets.

## Rappels : le modèle TCP/IP en pratique

Avant les outils, quelques repères indispensables pour interpréter ce qu'ils affichent.

**Les couches.** Une communication réseau est organisée en couches empilées. En pratique, on manipule surtout :
- La couche **liaison** (Ethernet, WiFi) : les interfaces réseau, les adresses **MAC**.
- La couche **réseau** (IP) : les adresses **IP** et le **routage** (comment un paquet trouve son chemin).
- La couche **transport** (TCP / UDP) : les **ports** et la fiabilité.
- La couche **application** (HTTP, DNS, SSH...) : les protocoles que tu utilises.

**IP.** Chaque machine sur un réseau a une adresse **IP** (IPv4 comme `192.168.1.10`, ou IPv6). Une IP est associée à un **masque de sous-réseau** (notation CIDR, ex. `/24`) qui définit quelle partie identifie le réseau et quelle partie la machine. Exemple : `192.168.1.10/24` signifie que le réseau est `192.168.1.0` et que la machine y porte le numéro `10`.

**TCP vs UDP.** Deux protocoles de transport aux philosophies opposées :
- **TCP** établit une **connexion** fiable (les données arrivent complètes et dans l'ordre, avec accusés de réception). Utilisé par HTTP, SSH, etc. C'est le protocole « fiable mais avec surcoût ».
- **UDP** envoie des paquets **sans connexion** ni garantie de livraison, mais rapidement et sans surcoût. Utilisé par le DNS, la voix/vidéo, les jeux. C'est le protocole « rapide mais sans garantie ».

**Les ports.** Sur une même machine, le **port** (un numéro de 0 à 65535) identifie quel service est visé. Quelques ports « bien connus » : 22 (SSH), 53 (DNS), 80 (HTTP), 443 (HTTPS). Une communication est identifiée par le quadruplet IP source + port source + IP destination + port destination.

Ces notions sont le décodeur de tout ce qui suit : quand un outil affiche `192.168.1.10:443`, tu lis maintenant « la machine .10, service HTTPS ».

## Configuration et état : iproute2 (ip, ss)

La suite **iproute2** est l'outil moderne de configuration réseau sous Linux. Elle **remplace** les anciens outils (`ifconfig`, `route`, `netstat`) que tu croiseras encore dans de vieux tutos mais qui sont obsolètes.

### ip : interfaces, adresses, routes

La commande `ip` est le couteau suisse de la configuration réseau. Sa logique : `ip OBJET COMMANDE`.

```bash
ip addr show          # affiche les interfaces et leurs adresses IP (abrégé : ip a)
ip link show          # affiche les interfaces (couche liaison) et leur état (abrégé : ip l)
ip route show         # affiche la table de routage (abrégé : ip r)
ip neigh show         # affiche la table ARP (voisins connus sur le réseau local)
```

Exemples de lecture. `ip a` te montre pour chaque interface (ex. `eth0`, `wlan0`) son adresse IP, son masque (`/24`), son état (`UP`/`DOWN`). `ip r` te montre notamment la **route par défaut** (`default via 192.168.1.1`), c'est-à-dire la **passerelle** par laquelle sortent les paquets vers l'extérieur — une info capitale en diagnostic.

Configuration (temporaire, perdue au redémarrage — la config permanente se fait via le gestionnaire réseau de la distrib, NetworkManager ou systemd-networkd) :

```bash
sudo ip addr add 192.168.1.50/24 dev eth0    # attribuer une IP à une interface
sudo ip link set eth0 up                       # activer une interface
sudo ip route add default via 192.168.1.1      # définir la passerelle par défaut
```

Cas d'usage : diagnostiquer « je n'ai pas internet ». Tu vérifies dans l'ordre avec `ip a` (ai-je une IP ?), `ip r` (ai-je une route par défaut ?), puis un `ping` (voir plus bas).

### ss : les sockets et ports ouverts

`ss` (socket statistics) affiche les connexions réseau et les ports en écoute. Il remplace `netstat`. Options les plus utiles, à mémoriser en bloc :

```bash
ss -tulnp
```

Décomposition : `-t` (TCP), `-u` (UDP), `-l` (sockets en écoute / listening), `-n` (numérique, ne pas résoudre les noms — plus rapide), `-p` (afficher le processus associé, nécessite souvent sudo). C'est LA commande pour répondre à « quels services écoutent sur ma machine et sur quels ports ? ».

```bash
ss -tan               # toutes les connexions TCP (établies + écoute)
ss -tulnp | grep :443 # qui écoute sur le port 443 ?
```

Cas d'usage sécurité : après avoir installé un service, vérifier avec `ss -tulnp` qu'il écoute bien où tu le penses (et pas sur `0.0.0.0`, c'est-à-dire toutes les interfaces, si tu voulais le limiter au local). Un port ouvert inattendu peut signaler un problème.

## Tester la connectivité : ping, traceroute

**ping** (paquet iputils) envoie des paquets ICMP « echo request » et mesure le temps de réponse. C'est le premier réflexe pour tester si une machine est joignable et mesurer la latence.

```bash
ping 8.8.8.8          # teste la connectivité IP brute (ici le DNS de Google)
ping -c 4 exemple.fr  # 4 paquets puis stop ; teste aussi la résolution DNS
```

Méthode de diagnostic classique : `ping 8.8.8.8` fonctionne mais `ping exemple.fr` échoue → ta connexion IP marche mais le **DNS** est cassé (tu as un problème de résolution de noms, pas de réseau). C'est une distinction diagnostique fondamentale. Note : certains hôtes bloquent l'ICMP, un ping sans réponse ne signifie donc pas toujours « machine éteinte ».

**traceroute** affiche le chemin (la liste des routeurs, ou « sauts ») emprunté par les paquets jusqu'à une destination, avec le temps à chaque étape.

```bash
traceroute exemple.fr
```

Cas d'usage : identifier **où** ça bloque ou ralentit sur le trajet. Si le trace s'arrête ou explose en latence à un saut précis, le problème est situé là (chez ton FAI, sur une dorsale...). Utile pour comprendre la topologie et diagnostiquer une lenteur.

## La résolution de noms : DNS (dig, nslookup)

Le **DNS** (Domain Name System) traduit les noms de domaine (`exemple.fr`) en adresses IP. C'est l'annuaire d'internet. Sous Linux, la résolution est configurée dans `/etc/resolv.conf` (serveurs DNS utilisés) et `/etc/hosts` (correspondances statiques, prioritaires).

**dig** est l'outil de référence pour interroger le DNS, précis et complet.

```bash
dig exemple.fr                # résolution complète, avec détails
dig +short exemple.fr         # juste l'adresse IP (concis)
dig exemple.fr MX             # les serveurs de mail du domaine
dig exemple.fr NS             # les serveurs de noms faisant autorité
dig @1.1.1.1 exemple.fr       # interroger un serveur DNS précis (ici Cloudflare)
```

Les **types d'enregistrements** DNS à connaître : `A` (nom → IPv4), `AAAA` (nom → IPv6), `MX` (serveurs mail), `NS` (serveurs de noms), `CNAME` (alias), `TXT` (texte libre, utilisé pour SPF, vérifications...).

Cas d'usage : `dig @1.1.1.1 exemple.fr +short` te permet de tester la résolution via un serveur DNS externe pour savoir si un problème vient de **ton** serveur DNS ou du domaine lui-même.

**nslookup** fait un travail similaire, plus ancien et plus simple ; on le trouve partout (y compris Windows) :

```bash
nslookup exemple.fr
```

`dig` est préféré des admins pour sa précision ; `nslookup` dépanne quand `dig` n'est pas installé.

## Récupérer des ressources web : curl, wget

Deux outils pour dialoguer avec des serveurs HTTP(S), aux usages complémentaires.

**curl** est le couteau suisse des requêtes réseau (HTTP, mais aussi FTP, etc.). Il affiche par défaut la réponse sur la sortie standard.

```bash
curl https://exemple.fr                    # récupère le contenu d'une page
curl -I https://exemple.fr                 # seulement les en-têtes HTTP (headers)
curl -L https://exemple.fr                 # suit les redirections
curl -o page.html https://exemple.fr       # enregistre dans un fichier
curl -s https://api.exemple.fr/data        # mode silencieux (sans barre de progression)
curl -X POST -d "cle=valeur" https://api.exemple.fr   # envoyer des données (POST)
```

Cas d'usage : tester une API, vérifier les en-têtes d'un serveur (`curl -I` montre le code de statut HTTP, le serveur, les redirections), déboguer un site. C'est l'outil favori pour interagir avec des services web en ligne de commande et dans les scripts.

**wget** est spécialisé dans le **téléchargement** de fichiers, y compris récursif (aspirer un site). Il enregistre par défaut dans un fichier.

```bash
wget https://exemple.fr/fichier.iso        # télécharge un fichier
wget -c https://exemple.fr/gros.iso        # reprend un téléchargement interrompu
wget -r https://exemple.fr/                 # récupération récursive (miroir)
```

Distinction : `curl` pour **interagir** (tester, API, scripts, envoyer des données), `wget` pour **télécharger** robustement (reprise, récursif).

## Capturer et analyser le trafic : tcpdump

**tcpdump** capture les paquets qui transitent sur une interface et les affiche. C'est l'outil d'analyse réseau bas niveau par excellence, indispensable en diagnostic et en sécurité (il faut les droits root).

```bash
sudo tcpdump -i eth0                        # capture sur l'interface eth0
sudo tcpdump -i eth0 -n                     # sans résolution de noms (plus lisible/rapide)
sudo tcpdump -i eth0 port 443               # seulement le trafic sur le port 443
sudo tcpdump -i eth0 host 192.168.1.10      # seulement vers/depuis cette IP
sudo tcpdump -i eth0 -w capture.pcap        # écrit dans un fichier (analysable ensuite dans Wireshark)
```

Les expressions de **filtre** (port, host, tcp, udp, and, or...) sont essentielles pour ne garder que ce qui t'intéresse dans le flot de paquets. Cas d'usage : vérifier qu'une application envoie bien ses données là où tu crois, diagnostiquer une connexion qui échoue (voir si les paquets partent, s'il y a une réponse), ou analyser du trafic suspect. Le fichier `.pcap` produit peut être ouvert dans **Wireshark** (l'analyseur graphique) pour une analyse détaillée.

## Explorer et scanner : nmap

**nmap** (Network Mapper) est l'outil de référence pour découvrir les machines d'un réseau et les ports/services ouverts. Central en administration comme en sécurité (audit, pentest — un domaine que tu connais). À n'utiliser que sur des réseaux que tu es **autorisé** à scanner.

```bash
nmap 192.168.1.10                    # scan des ports courants d'une machine
nmap -sV 192.168.1.10                # détecte aussi les versions des services
nmap -p- 192.168.1.10                # scanne les 65535 ports
nmap 192.168.1.0/24                  # découvre les machines d'un sous-réseau entier
nmap -sn 192.168.1.0/24             # juste découvrir les hôtes vivants (ping scan)
nmap -O 192.168.1.10                 # tente de deviner l'OS
```

Cas d'usage : cartographier un réseau (quelles machines, quels services), auditer sa propre exposition (quels ports sont visibles depuis l'extérieur), vérifier qu'un pare-feu bloque bien ce qu'il doit. La détection de version (`-sV`) est précieuse pour repérer des services obsolètes et vulnérables.

## Bricoler des connexions : netcat, socat

**netcat** (commande `nc`), le « couteau suisse TCP/IP » : il lit et écrit des données sur des connexions réseau, ce qui permet une infinité de bidouilles.

```bash
nc -zv 192.168.1.10 22        # teste si le port 22 est ouvert (scan simple)
nc -lvp 4444                   # écoute sur le port 4444 (mode serveur)
nc 192.168.1.10 4444           # se connecte à ce port (mode client)
```

Cas d'usage : tester rapidement si un port est joignable (`-z` = scan, `-v` = verbeux), transférer un fichier vite fait entre deux machines, ouvrir un canal de communication brut pour du debug. C'est un outil emblématique aussi en sécurité (reverse shells, tests) — à connaître absolument.

**socat** est un netcat « sous stéroïdes » : il relie deux flux de nature quelconque (sockets, fichiers, ports, TLS...) et gère des cas que netcat ne sait pas faire, notamment le chiffrement TLS et les connexions bidirectionnelles complexes.

```bash
socat TCP-LISTEN:8080,fork TCP:192.168.1.10:80   # relais (port forwarding) simple
```

Cas d'usage : créer des relais, des tunnels, rediriger des ports, encapsuler une connexion dans du TLS. Plus puissant et plus complexe que netcat.

## Accès distant et transfert : ssh, scp, rsync

**SSH** (Secure Shell) permet de se connecter à distance à une machine, de façon chiffrée. C'est l'outil fondamental de l'administration à distance. Ici on voit l'usage **client** ; la configuration **serveur** et le **durcissement** sont traités dans le cours de sécurité dédié.

```bash
ssh utilisateur@192.168.1.10           # connexion à distance
ssh -p 2222 utilisateur@serveur.fr     # sur un port SSH non standard
ssh utilisateur@serveur "ls -la"       # exécuter une commande distante sans ouvrir de session
```

L'authentification par **clé** (paire clé privée / clé publique) est la norme, plus sûre que le mot de passe. On génère une paire avec `ssh-keygen` et on dépose la clé publique sur le serveur avec `ssh-copy-id` — détaillé dans le cours SSH de la section sécurité.

**scp** copie des fichiers **via SSH** (donc chiffré) :

```bash
scp fichier.txt utilisateur@serveur:/chemin/          # envoyer un fichier
scp utilisateur@serveur:/chemin/fichier.txt .          # récupérer un fichier
scp -r dossier/ utilisateur@serveur:/chemin/           # récursif (un dossier)
```

**rsync** synchronise des fichiers/dossiers de façon **intelligente** : il ne transfère que les différences, ce qui le rend bien plus efficace que scp pour des copies répétées ou volumineuses. Il fonctionne aussi via SSH.

```bash
rsync -avz dossier/ utilisateur@serveur:/sauvegarde/   # synchronise (archive, verbeux, compressé)
rsync -avz --delete source/ dest/                       # miroir exact (supprime en trop côté dest)
```

Décomposition des options courantes : `-a` (archive : préserve permissions, dates, liens), `-v` (verbeux), `-z` (compression pendant le transfert). Cas d'usage : **sauvegardes** incrémentales, déploiement de fichiers, synchronisation de gros répertoires — rsync est le standard pour tout ça car il ne recopie pas ce qui n'a pas changé.

## HTTP, HTTPS, TLS et certificats

**HTTP** est le protocole du web (port 80). **HTTPS** est HTTP dans un tunnel chiffré **TLS** (port 443). Comprendre TLS est essentiel en sécurité réseau.

**TLS** (Transport Layer Security, successeur de SSL) assure trois choses : le **chiffrement** (personne ne peut lire les échanges), l'**intégrité** (les données ne sont pas altérées), et l'**authentification** du serveur via un **certificat**. Le certificat est délivré par une **autorité de certification (CA)** de confiance : il prouve que tu parles bien au vrai serveur et pas à un imposteur. C'est ce mécanisme (chaîne de confiance, signatures — que tu retrouves de ta crypto) qui empêche les attaques de type « homme du milieu » sur HTTPS.

Inspecter un certificat et une connexion TLS avec **openssl** (le côté crypto pur d'openssl est traité dans le cours de sécurité) :

```bash
openssl s_client -connect exemple.fr:443              # ouvre une connexion TLS et affiche le certificat
openssl s_client -connect exemple.fr:443 -servername exemple.fr   # avec SNI (plusieurs sites sur une IP)
echo | openssl s_client -connect exemple.fr:443 2>/dev/null | openssl x509 -noout -dates   # dates de validité du certificat
```

Cas d'usage : vérifier qu'un certificat est valide, non expiré, émis pour le bon domaine ; diagnostiquer une erreur HTTPS ; contrôler la version de TLS et les algorithmes acceptés par un serveur (audit de configuration). Un certificat expiré ou invalide est une cause très fréquente d'erreur sur un site.

