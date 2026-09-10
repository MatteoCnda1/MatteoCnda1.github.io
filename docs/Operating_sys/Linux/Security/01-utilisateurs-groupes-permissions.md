---
id: 01-utilisateurs-groupes-permissions
title: Utilisateurs, groupes et permissions
sidebar_position: 1
tags: [linux]
---

# Utilisateurs, groupes et permissions

C'est le socle de toute la sécurité Linux. Le modèle de permissions Unix (le DAC, contrôle d'accès discrétionnaire, vu dans le cours AppArmor) détermine qui peut lire, écrire, exécuter quoi. Le maîtriser est le prérequis de tout durcissement.

## Utilisateurs et groupes

Sous Linux, tout accès est rattaché à un **utilisateur** et à des **groupes**. Chaque utilisateur a un identifiant numérique unique, l'**UID** ; chaque groupe a un **GID**. L'utilisateur `root` (UID 0) est le superutilisateur : il a tous les droits, il échappe aux vérifications de permissions. C'est pourquoi limiter l'usage de root est la première règle de sécurité.

Les **groupes** permettent d'accorder des droits à plusieurs utilisateurs d'un coup (ex. un groupe `developpeurs` qui accède à un dossier partagé). Un utilisateur a un groupe principal et peut appartenir à des groupes secondaires.

Où sont stockées ces informations :
- `/etc/passwd` — la liste des comptes (nom, UID, GID, shell, répertoire personnel). Lisible par tous, mais **ne contient plus les mots de passe**.
- `/etc/group` — la liste des groupes et leurs membres.
- `/etc/shadow` — les **mots de passe chiffrés** (hachés), lisible par root uniquement. C'est la séparation historique : les infos publiques dans `passwd`, les secrets dans `shadow`.

Commandes de gestion :

```bash
id                          # affiche ton UID, GID et groupes
whoami                      # ton nom d'utilisateur
sudo adduser alice          # créer un utilisateur (interactif, Debian/Ubuntu)
sudo usermod -aG groupe alice   # ajouter alice à un groupe secondaire
sudo passwd alice           # définir/changer le mot de passe d'alice
groups alice                # groupes d'alice
```

## Le fichier shadow et les mots de passe

Le fichier `/etc/shadow` stocke les mots de passe sous forme **hachée** (jamais en clair — application directe de tes fonctions de hachage en crypto). Chaque ligne contient le hash, mais aussi des informations de **politique** : date du dernier changement, âge minimum/maximum du mot de passe, avertissement d'expiration, etc.

`passwd` gère les mots de passe et cette politique :

```bash
sudo passwd alice           # changer le mot de passe
sudo passwd -l alice        # verrouiller le compte (login par mot de passe impossible)
sudo passwd -e alice        # forcer le changement au prochain login
sudo chage -l alice         # voir la politique d'expiration du mot de passe
```

Cas d'usage sécurité : imposer l'expiration régulière des mots de passe, verrouiller un compte compromis, ou désactiver le login par mot de passe d'un compte de service.

## Les permissions de fichiers

Chaque fichier et dossier a des **permissions** définissant qui peut faire quoi, réparties en trois catégories et trois droits.

Les trois **catégories** :
- **u** (user) : le propriétaire du fichier.
- **g** (group) : le groupe propriétaire.
- **o** (others) : tous les autres.

Les trois **droits** :
- **r** (read, valeur 4) : lire le fichier / lister un dossier.
- **w** (write, valeur 2) : modifier le fichier / créer-supprimer dans un dossier.
- **x** (execute, valeur 1) : exécuter le fichier / entrer dans un dossier.

Quand tu fais `ls -l`, tu vois quelque chose comme `-rwxr-xr--`. Décodage : le premier caractère est le type (`-` fichier, `d` dossier, `l` lien), puis trois blocs de trois : `rwx` pour le propriétaire (lecture+écriture+exécution), `r-x` pour le groupe (lecture+exécution), `r--` pour les autres (lecture seule).

### La notation octale

On exprime souvent les permissions en **octal**, en additionnant les valeurs (r=4, w=2, x=1) par catégorie. Exemples à connaître :
- `chmod 755` = `rwxr-xr-x` (propriétaire tout, groupe et autres lecture+exécution) — typique d'un exécutable ou d'un dossier.
- `chmod 644` = `rw-r--r--` (propriétaire lecture+écriture, autres lecture seule) — typique d'un fichier de données.
- `chmod 600` = `rw-------` (propriétaire seul, lecture+écriture) — typique d'un fichier sensible (ex. clé privée SSH).
- `chmod 700` = `rwx------` (propriétaire seul, tout) — dossier privé.

### chmod et chown

**chmod** change les permissions, **chown** change la propriété :

```bash
chmod 640 fichier.conf          # notation octale
chmod u+x script.sh             # ajouter le droit d'exécution au propriétaire (notation symbolique)
chmod -R 755 dossier/           # récursif
sudo chown alice fichier        # changer le propriétaire
sudo chown alice:developpeurs fichier   # propriétaire + groupe
sudo chown -R alice:alice dossier/      # récursif
```

Cas d'usage : une clé privée SSH **doit** être en `600` (sinon SSH refuse de l'utiliser, à raison) ; un script doit être en `+x` pour s'exécuter ; un dossier web doit avoir les bonnes permissions pour que le serveur y accède sans être trop ouvert.

## Le umask

Le **umask** définit les permissions **par défaut** retirées aux nouveaux fichiers créés. C'est un « masque » soustractif. Un umask courant de `022` retire le droit d'écriture au groupe et aux autres : les fichiers naissent en `644` et les dossiers en `755`. Un umask plus strict de `077` fait naître les fichiers en `600` (privés au propriétaire), utile sur un système sensible.

```bash
umask                       # afficher le umask courant
umask 077                   # rendre les nouveaux fichiers privés par défaut
```

Cas d'usage : durcir un serveur en imposant un umask restrictif pour que les fichiers créés ne soient pas lisibles par tous par défaut.

## setuid, setgid et sticky bit

Trois permissions spéciales, importantes en sécurité car sources de vulnérabilités.

**setuid** (s sur le u) : un exécutable avec setuid s'exécute avec les droits de son **propriétaire**, pas de celui qui le lance. Exemple légitime : `passwd` est setuid root, car changer son mot de passe nécessite d'écrire dans `/etc/shadow` (réservé à root). Mais un binaire setuid root mal codé est une faille d'**élévation de privilèges** classique — d'où l'importance d'auditer les fichiers setuid.

**setgid** (s sur le g) : idem avec le groupe. Sur un dossier, il fait hériter le groupe aux fichiers créés dedans (utile pour un dossier partagé).

**sticky bit** (t sur les others) : sur un dossier, il empêche les utilisateurs de supprimer les fichiers des autres. Exemple : `/tmp` a le sticky bit, pour que chacun ne puisse effacer que ses propres fichiers temporaires.

```bash
chmod u+s fichier           # poser le setuid
chmod g+s dossier           # poser le setgid
chmod +t dossier            # poser le sticky bit
find / -perm -4000 -type f 2>/dev/null   # AUDIT : lister tous les binaires setuid root
```

Cette dernière commande est un réflexe d'audit : elle liste les binaires setuid, surface d'attaque à surveiller (un setuid inattendu peut être une porte dérobée).

## Les Linux capabilities

Le modèle « root a tous les droits / les autres n'ont rien » est trop grossier. Les **capabilities** découpent les privilèges de root en **droits fins** attribuables individuellement. Plutôt que de donner tous les pouvoirs à un programme, on lui donne juste la capability précise dont il a besoin.

Exemple : `CAP_NET_BIND_SERVICE` autorise à ouvrir un port inférieur à 1024 (normalement réservé à root) sans être root. Un serveur web peut ainsi écouter sur le port 80 sans tourner en root — réduisant fortement le risque en cas de compromission.

```bash
getcap /usr/bin/ping        # voir les capabilities d'un binaire
sudo setcap CAP_NET_BIND_SERVICE=+ep /usr/local/bin/monserveur   # attribuer une capability
getcap -r / 2>/dev/null     # audit : lister les binaires ayant des capabilities
```

Cas d'usage : appliquer le **principe de moindre privilège** — donner à chaque programme le minimum de droits nécessaires, plutôt que le tout-puissant root. C'est une brique clé du durcissement moderne.

## sudo : l'élévation contrôlée

**sudo** permet à un utilisateur d'exécuter des commandes avec les droits d'un autre (généralement root), de façon **contrôlée et journalisée**, sans partager le mot de passe root. C'est la bonne pratique face au fait de se connecter directement en root.

```bash
sudo commande               # exécuter en tant que root
sudo -u alice commande      # exécuter en tant qu'alice
sudo -l                     # lister ce que tu as le droit de faire
sudo visudo                 # éditer la config sudo en toute sécurité (vérifie la syntaxe)
```

La configuration se trouve dans `/etc/sudoers` (à éditer **uniquement** via `visudo`, qui valide la syntaxe et évite de se verrouiller dehors). On peut y accorder des droits très fins : autoriser un utilisateur à ne lancer qu'une commande précise, par exemple.

Avantages sécurité de sudo : chaque action privilégiée est **journalisée** (traçabilité — qui a fait quoi), les droits sont **granulaires** (on n'accorde que le nécessaire), et le mot de passe root n'a pas besoin d'être connu ni même défini. C'est le principe de moindre privilège appliqué à l'administration.

## Ce qu'il faut retenir

- Tout accès est rattaché à un **utilisateur (UID)** et des **groupes (GID)** ; **root (UID 0)** est tout-puissant, d'où l'intérêt de limiter son usage. Infos dans `/etc/passwd` (public), secrets dans `/etc/shadow` (mots de passe **hachés**, root seul).
- **Permissions** : catégories **u/g/o**, droits **r(4)/w(2)/x(1)** ; lues dans `ls -l` (`-rwxr-xr--`) et posées avec **chmod** (octal `755`, `644`, `600`...) ; propriété changée avec **chown**.
- **umask** : permissions retirées par défaut aux nouveaux fichiers (`022` courant, `077` strict).
- **Permissions spéciales** : **setuid** (s'exécute avec les droits du propriétaire — ex. `passwd`, mais risque d'élévation de privilèges), **setgid**, **sticky bit** (ex. `/tmp`). Auditer avec `find / -perm -4000`.
- **Capabilities** : découpent les pouvoirs de root en droits fins (ex. `CAP_NET_BIND_SERVICE`) → principe de **moindre privilège**. Audit avec `getcap -r /`.
- **sudo** : élévation **contrôlée, granulaire et journalisée** ; config via `visudo`. Préférer sudo à une connexion root directe.

## Voir aussi

- [SSH — accès distant et durcissement](./02-ssh-durcissement.md) — le cours suivant.
- [SELinux](./05-selinux.md) et [AppArmor](./appArmor.md) — contrôle d'accès obligatoire, au-delà des permissions classiques.
