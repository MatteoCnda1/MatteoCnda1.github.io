---
id: 01-bash-basics
title: Bash - Les bases
sidebar_position: 1
---

# Bash — Les bases

## Pourquoi Bash compte pour toi

Bash (Bourne Again Shell) n'est pas juste « un langage » : c'est **l'interface avec le système Unix/Linux**. En réseau, système et cybersécu, tu passes ton temps dans un terminal — sur un serveur en SSH, sur une machine cible en post-exploitation, dans un conteneur, sur un routeur. Savoir écrire du Bash correct, c'est la différence entre taper 200 commandes à la main et automatiser en 5 lignes. Et en pentest, le premier shell que tu obtiens sur une cible est presque toujours un shell Unix — autant le maîtriser.

Le modèle mental à avoir : Bash n'est pas un langage de calcul, c'est un **langage de colle** (glue language). Son rôle est d'enchaîner des programmes existants (`grep`, `awk`, `curl`, `nmap`...) en faisant circuler du texte de l'un à l'autre. Tout tourne autour de cette idée.

## Tout est texte, tout est fichier

Deux philosophies Unix à intégrer :

**Tout est fichier.** Un vrai fichier, mais aussi ton clavier, ton écran, une connexion réseau, un périphérique — tout s'expose comme un fichier qu'on lit/écrit. C'est pour ça que rediriger vers `/dev/tcp/...` peut ouvrir une connexion réseau (on y reviendra dans l'avancé, c'est une technique de reverse shell).

**Tout est texte.** Les programmes Unix communiquent par des flux de texte. C'est ce qui rend les pipes si puissants.

## Les trois flux standard

Chaque programme a trois canaux :

- **stdin** (0) — l'entrée standard (par défaut : le clavier).
- **stdout** (1) — la sortie standard (par défaut : l'écran).
- **stderr** (2) — la sortie d'erreur (l'écran aussi, mais séparée).

Séparer stdout et stderr est crucial : ça permet de traiter les résultats sans que les messages d'erreur ne polluent. Les redirections manipulent ces canaux :

```bash
commande > fichier.txt      # stdout vers un fichier (écrase)
commande >> fichier.txt     # stdout vers un fichier (ajoute)
commande 2> erreurs.txt     # stderr vers un fichier
commande > out.txt 2>&1     # stdout ET stderr vers le même fichier
commande 2>/dev/null        # jeter les erreurs (très courant)
commande < entree.txt       # lire stdin depuis un fichier
```

`/dev/null` est le « trou noir » : tout ce qu'on y envoie disparaît. `2>/dev/null` pour masquer les erreurs, `>/dev/null 2>&1` pour tout masquer (utile quand on veut juste le code de retour).

## Les pipes : le cœur de Bash

Le pipe `|` connecte le stdout d'une commande au stdin de la suivante. C'est LA construction fondamentale :

```bash
# Combien de processus Apache tournent ?
ps aux | grep apache | grep -v grep | wc -l

# Les 10 IP les plus fréquentes dans un log Apache
cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10
```

Cette deuxième ligne est un pattern que tu réutiliseras sans arrêt en analyse de logs : extraire un champ (`awk`), trier (`sort`), compter les occurrences uniques (`uniq -c`), retrier par fréquence (`sort -rn`), garder le top (`head`). Apprends-la par cœur, c'est un couteau suisse d'analyse.

## Variables et quoting (le piège n°1)

Les variables en Bash n'ont pas de type — tout est chaîne :

```bash
nom="Matteo"
echo "Bonjour $nom"        # Bonjour Matteo
echo 'Bonjour $nom'        # Bonjour $nom   (simple quote = pas d'interprétation)
```

**Le quoting est LA source de bugs en Bash.** Règle d'or : **mets toujours tes variables entre guillemets doubles**. Sans guillemets, Bash découpe la valeur sur les espaces (word splitting) et interprète les `*` (globbing) :

```bash
fichier="mon rapport.txt"
rm $fichier          # DANGER : supprime "mon" ET "rapport.txt" (deux fichiers)
rm "$fichier"        # correct : supprime le fichier "mon rapport.txt"
```

Ce genre d'erreur, sur un chemin contenant des espaces ou dans un script qui tourne en root, peut faire de gros dégâts. Guillemets systématiques.

## Substitution de commande

Capturer la sortie d'une commande dans une variable avec `$(...)` :

```bash
date_du_jour=$(date +%Y-%m-%d)
nb_users=$(who | wc -l)
echo "Le $date_du_jour, il y a $nb_users utilisateurs connectés"

# Utile en scripting réseau
mon_ip=$(ip -4 addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
```

L'ancienne syntaxe avec des backticks `` `commande` `` existe encore mais **préfère `$(...)`** : elle s'imbrique proprement et est plus lisible.

## Les tests et conditions

Les conditions utilisent `[ ]` (ou mieux, `[[ ]]` en Bash) :

```bash
if [[ -f "/etc/passwd" ]]; then
    echo "Le fichier existe"
fi

if [[ "$user" == "root" ]]; then
    echo "Tu es root"
else
    echo "Utilisateur normal"
fi
```

Les tests les plus utiles en admin système :

```bash
[[ -f fichier ]]    # le fichier existe et est un fichier régulier
[[ -d dossier ]]    # le dossier existe
[[ -r fichier ]]    # lisible
[[ -w fichier ]]    # inscriptible
[[ -x fichier ]]    # exécutable
[[ -z "$var" ]]     # la variable est vide
[[ -n "$var" ]]     # la variable n'est pas vide
[[ "$a" == "$b" ]]  # égalité de chaînes
[[ "$a" -eq "$b" ]] # égalité numérique (-eq -ne -lt -gt -le -ge)
```

Préfère `[[ ]]` à `[ ]` en Bash : plus sûr (pas de problème de word splitting), supporte `&&`, `||`, et les comparaisons de motifs.

## Les boucles

```bash
# Boucle sur une liste
for ip in 192.168.1.1 192.168.1.2 192.168.1.3; do
    ping -c 1 "$ip" &>/dev/null && echo "$ip est up"
done

# Boucle sur les fichiers d'un dossier
for f in /var/log/*.log; do
    echo "Traitement de $f"
done

# Boucle sur une plage (balayage réseau simple)
for i in {1..254}; do
    ping -c 1 -W 1 "192.168.1.$i" &>/dev/null && echo "192.168.1.$i actif" &
done
wait

# Lire un fichier ligne par ligne (la bonne façon)
while IFS= read -r ligne; do
    echo "Ligne : $ligne"
done < fichier.txt
```

Note le `while IFS= read -r ligne` : c'est **la** façon correcte de lire un fichier ligne par ligne. Le `IFS=` évite de rogner les espaces, le `-r` évite d'interpréter les backslashes. Un `for ligne in $(cat fichier)` naïf casse dès qu'il y a des espaces — ne le fais pas.

## Les fonctions

```bash
scan_port() {
    local host="$1"
    local port="$2"
    if timeout 1 bash -c "echo >/dev/tcp/$host/$port" 2>/dev/null; then
        echo "Port $port ouvert sur $host"
    fi
}

scan_port "192.168.1.1" "22"
scan_port "192.168.1.1" "80"
```

Deux choses importantes : les arguments arrivent en `$1`, `$2`, etc. (comme pour le script lui-même), et **déclare toujours tes variables locales avec `local`** — sinon elles polluent l'espace global et créent des bugs vicieux.

## Le squelette d'un script propre

```bash
#!/usr/bin/env bash
#
# Description : ce que fait le script
# Usage : ./script.sh <argument>

set -euo pipefail   # LA ligne à mettre dans tous tes scripts (voir avancé)

# Variables
LOG_DIR="/var/log/monapp"
DATE=$(date +%Y%m%d)

# Vérification des arguments
if [[ $# -lt 1 ]]; then
    echo "Usage : $0 <cible>" >&2
    exit 1
fi

cible="$1"

# Corps du script
echo "Traitement de $cible..."
```

Le `#!/usr/bin/env bash` en première ligne (le **shebang**) indique quel interpréteur utiliser. `env bash` est préférable à `/bin/bash` en dur car il trouve bash dans le PATH (portabilité).

## Codes de retour

Chaque commande renvoie un **code de sortie** : `0` = succès, tout le reste = erreur. C'est la base de l'automatisation :

```bash
if ping -c 1 192.168.1.1 &>/dev/null; then
    echo "Hôte joignable"
fi

# $? contient le code de la dernière commande
grep "erreur" log.txt
echo "grep a retourné : $?"    # 0 si trouvé, 1 sinon

# Enchaînement conditionnel
mkdir /tmp/backup && cp -r /data /tmp/backup    # cp seulement si mkdir réussit
commande_risquee || echo "Échec, on continue"   # message seulement si échec
```

Ce `commande && suite` / `commande || secours` est idiomatique et remplace souvent un `if` complet.

## Ce qu'il faut retenir

- Bash est un **langage de colle** : il enchaîne des programmes via les **pipes**, en faisant circuler du texte.
- Maîtrise les **trois flux** (stdin/stdout/stderr) et les **redirections** — c'est la base de tout.
- **Quote toujours tes variables** (`"$var"`) : le word splitting est la première source de bugs.
- Le pattern `sort | uniq -c | sort -rn` est ton couteau suisse d'analyse de logs.
- Lis les fichiers avec `while IFS= read -r`, pas avec `for in $(cat)`.
- Les **codes de retour** (0 = succès) pilotent l'automatisation via `&&`, `||`, et `if`.
- Commence tous tes scripts par un shebang et `set -euo pipefail` (expliqué dans le cours avancé).
