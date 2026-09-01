---
id: 03-linux-apparmor
title: AppArmor
sidebar_position: 3
---

# AppArmor

## Concept : le contrôle d'accès obligatoire (MAC)

AppArmor est un module de sécurité du noyau Linux (LSM) qui **confine les applications** : il restreint ce que chaque programme a le droit de faire, indépendamment des permissions Unix classiques.

Il faut distinguer deux modèles de contrôle d'accès :

- **DAC (Discretionary Access Control)** — le modèle Unix habituel (`rwx`, propriétaire/groupe). C'est le *propriétaire* d'un fichier qui décide des droits, et un processus lancé par `root` peut tout faire. C'est « discrétionnaire » car laissé à la discrétion des utilisateurs.
- **MAC (Mandatory Access Control)** — une politique **imposée par le système**, que même `root` ne peut pas contourner à l'exécution. AppArmor implémente ce modèle : chaque application confinée est limitée à un périmètre défini à l'avance, quoi qu'il arrive.

L'intérêt est le **confinement en cas de compromission**. Si un service (par exemple Nginx) est exploité via une faille, un profil AppArmor l'empêche d'accéder à des fichiers hors de son périmètre (`/etc/shadow`, `/root/`...), d'exécuter des binaires non prévus ou d'ouvrir des sockets non autorisés. La faille reste cloisonnée. C'est une brique de **défense en profondeur** : elle ne remplace pas les autres protections, elle limite les dégâts.

AppArmor est le MAC natif de **Debian, Ubuntu et openSUSE** (sur RHEL/Rocky/Fedora, c'est SELinux). Il fonctionne **par chemin de fichier** (path-based) : les règles désignent les ressources par leur chemin (`/var/log/nginx/error.log`), contrairement à SELinux qui étiquette les inodes.

### Conséquence du modèle par chemin

Puisque AppArmor raisonne sur les chemins, un **lien dur**, un **bind mount** ou un **binaire renommé** peut échapper à une règle. C'est le compromis de sa simplicité : plus intuitif que SELinux, mais moins hermétique dans les cas extrêmes. Pour la grande majorité des serveurs, c'est suffisant ; SELinux garde l'avantage sur les environnements à exigence maximale.

## Les modes de fonctionnement

Chaque profil AppArmor fonctionne dans un mode. Les deux principaux :

- **enforce** — mode de production. Les accès non prévus par le profil sont **bloqués** et journalisés avec le marqueur `apparmor="DENIED"`. C'est le mode par défaut d'un profil chargé.
- **complain** — mode d'observation (audit). Les accès non prévus **ne sont pas bloqués** mais journalisés avec `apparmor="ALLOWED"`. Sert à construire ou déboguer un profil en observant les besoins réels de l'application sans la casser.

**Piège à retenir** : le mode complain n'est pas « aucune protection ». Une règle **`deny` explicite** reste appliquée même en complain. Le complain ne désactive que les refus *implicites* (ce qui n'est pas listé dans le profil).

Un profil peut aussi être en mode `unconfined` (chargé mais sans confinement actif).

## Les profils

Un **profil** est un fichier texte qui décrit précisément ce qu'une application peut faire : quels fichiers elle lit/écrit/exécute, quelles capabilities elle utilise, quels accès réseau. Un programme = un profil.

- Emplacement : `/etc/apparmor.d/`
- Convention de nommage : le chemin du binaire avec les `/` remplacés par des points. Le profil de `/usr/sbin/nginx` s'appelle `usr.sbin.nginx` ; celui de `/bin/ping` s'appelle `bin.ping`.
- Les règles ont une granularité au niveau du chemin, avec des **permissions** par ressource : `r` (read), `w` (write), `m` (mmap exécutable), `x` (exécution), etc.

## Prérequis

- Une distribution où AppArmor est le MAC natif : **Debian, Ubuntu ou openSUSE**.
- Un accès **root** (ou `sudo`).
- Le paquet **`apparmor-utils`** pour les outils `aa-*`.
- De préférence une **VM de test** : un profil enforce trop strict peut empêcher un service de démarrer.

## Installation et vérification de l'état

Vérifier l'état global d'AppArmor :

```bash
sudo apparmor_status
```

Sortie typique (extrait) :

```
apparmor module is loaded.
134 profiles are loaded.
39 profiles are in enforce mode.
4 profiles are in complain mode.
91 profiles are in unconfined mode.
```

Ce rapport indique si le module est chargé, combien de profils existent et dans quel mode. La commande `aa-status` est équivalente.

Installer AppArmor et ses outils si nécessaire (Debian/Ubuntu) :

```bash
sudo apt update
sudo apt install apparmor apparmor-utils apparmor-profiles apparmor-profiles-extra
```

Vérifier le service (systemd) et l'activer au démarrage :

```bash
sudo systemctl status apparmor
sudo systemctl enable --now apparmor
```

Vérifier que le module noyau est bien actif :

```bash
cat /sys/module/apparmor/parameters/enabled   # doit renvoyer Y
cat /sys/kernel/security/lsm                   # doit contenir "apparmor"
```

Sur Debian/Ubuntu/openSUSE récents, AppArmor est **chargé par défaut sans paramètre noyau**. L'option GRUB `security=apparmor` (ou `apparmor=1`) ne sert qu'à le **réactiver** s'il a été explicitement coupé avec `apparmor=0`. Sur une installation standard, rien à ajouter au bootloader.

## Créer un profil : la méthode guidée avec aa-genprof

`aa-genprof` génère un profil en observant le comportement réel d'une application. C'est la méthode recommandée car elle gère automatiquement le passage en complain pendant l'observation.

Exemple complet avec Nginx. On lance `aa-genprof` sur le binaire, dans un premier terminal :

```bash
sudo apt install nginx curl
sudo aa-genprof /usr/sbin/nginx
```

L'outil se met en attente. Dans un **second terminal**, on fait fonctionner l'application pour générer des événements (démarrage, requêtes) :

```bash
sudo systemctl restart nginx
curl http://localhost
```

De retour dans le terminal de `aa-genprof`, chaque accès détecté est proposé, et on décide :

```
Profile:  /usr/sbin/nginx
Path:     /var/log/nginx/error.log
New Mode: w
Severity: 8
 [1 - /var/log/nginx/error.log w,]
(A)llow / [(D)eny] / (I)gnore / (G)lob / Glob with (E)xtension / (N)ew / Audi(t) / Abo(r)t / (F)inish
```

Les choix principaux :
- **(A)llow** — autoriser cet accès (l'ajoute au profil).
- **(D)eny** — le refuser.
- **(G)lob** — généraliser le chemin avec un joker (ex. `/var/log/nginx/*` au lieu d'un fichier précis).
- **(I)gnore** — ignorer pour l'instant.
- **(F)inish** — terminer et écrire le profil.

À la fin, on sauvegarde avec **(S)ave**. Le cycle typique est : scanner le journal `(S)`, traiter les propositions, puis `(F)inish`.

**Tri des abstractions** : `aa-genprof` propose souvent des `include` hors sujet (par exemple des abstractions `dovecot-common` ou `postfix-common` pour un profil Nginx). Refuse tout ce qui ne correspond pas à l'application.

### Le profil généré

`aa-genprof` produit un fichier dans `/etc/apparmor.d/`. Exemple pour Nginx :

```
# Last Modified: Fri Dec 13 06:45:45 2024
abi <abi/4.0>,
include <tunables/global>

/usr/sbin/nginx {
  include <abstractions/base>
  include <abstractions/nameservice>

  capability dac_override,

  /usr/sbin/nginx mr,
  /var/log/nginx/access.log w,
  /var/log/nginx/error.log w,

  owner /etc/group r,
  owner /etc/nginx/mime.types r,
  owner /etc/nginx/nginx.conf r,
  owner /etc/nginx/sites-available/default r,
  owner /etc/nsswitch.conf r,
  owner /etc/passwd r,
  owner /run/nginx.pid rw,
}
```

Lecture des règles :
- `/usr/sbin/nginx mr,` — le binaire peut être lu (`r`) et mappé en mémoire exécutable (`m`).
- `/var/log/nginx/error.log w,` — écriture autorisée dans ce log.
- `owner /etc/nginx/nginx.conf r,` — lecture, uniquement si le processus est propriétaire du fichier (`owner`).
- `capability dac_override,` — autorise cette capability précise.
- `include <abstractions/base>` — importe un jeu de règles communes (voir plus bas).

## Ajuster un profil à partir des journaux

Après un premier profil, l'application a souvent encore des accès bloqués. Exemple : la page d'accueil renvoie une erreur 403 parce que Nginx ne peut pas lire son répertoire web.

On teste :

```bash
curl http://localhost
# <html>... 403 Forbidden ...</html>
```

On cherche la cause dans les journaux :

```bash
sudo journalctl | grep -i apparmor | tail -n 10
```

On y voit la ligne de refus :

```
apparmor="DENIED" operation="open" class="file" profile="/usr/sbin/nginx" name="/var/www/html/index.nginx-debian.html" requested_mask="r" denied_mask="r"
```

Le champ `denied_mask="r"` indique qu'une lecture a été refusée sur `/var/www/html/...`. On corrige en ajoutant la règle au profil `/etc/apparmor.d/usr.sbin.nginx` :

```
/var/www/html/ rw,
```

Puis on recharge le profil (voir commandes ci-dessous) et on re-teste.

`aa-logprof` automatise ce travail : il lit les refus dans les journaux et propose interactivement (comme `aa-genprof`) d'ajouter les règles correspondantes. C'est l'outil à utiliser pour faire évoluer un profil :

```bash
sudo aa-logprof
```

## Les abstractions (include)

Pour ne pas réécrire les mêmes règles dans chaque profil, AppArmor fournit des **abstractions** : des fichiers de règles réutilisables, à importer avec `include`. Elles sont dans `/etc/apparmor.d/abstractions/`.

Par exemple, `abstractions/web-data` regroupe les accès aux répertoires web courants :

```
/srv/www/htdocs/ r,
/srv/www/htdocs/** r,
@{HOME}/public_html/ r,
/var/www/html/ r,
/var/www/html/** r,
```

Plutôt que d'écrire ces lignes à la main, on inclut l'abstraction dans le profil Nginx :

```
include <abstractions/base>
include <abstractions/nameservice>
include <abstractions/web-data>
```

- `**` correspond à toute l'arborescence sous un répertoire ; `*` à un seul niveau.
- `@{HOME}` est une variable (tunable) qui se développe en répertoires home.
- On peut créer ses propres fichiers d'inclusion pour mutualiser des règles maison.

## Charger et changer le mode d'un profil

Recharger un profil après modification :

```bash
sudo apparmor_parser -r /etc/apparmor.d/usr.sbin.nginx
```

**Point important** : un profil écrit ou rechargé à la main avec `apparmor_parser -r` est chargé **directement en enforce**, immédiatement. L'application est donc confinée dès la première seconde, avant même que tu aies pu observer ses besoins. Si tu veux d'abord observer, bascule explicitement en complain juste après :

```bash
sudo apparmor_parser -r /etc/apparmor.d/usr.sbin.nginx
sudo aa-complain /usr/sbin/nginx     # à ne pas oublier
```

(`aa-genprof` gère cette bascule pour toi, d'où l'intérêt de passer par lui.)

Passer un profil en **enforce** (production, blocage réel) :

```bash
sudo aa-enforce /usr/sbin/nginx
```

Repasser en **complain** (observation) :

```bash
sudo aa-complain /usr/sbin/nginx
```

On peut aussi fixer le mode directement dans le profil via un flag :

```
/usr/sbin/nginx flags=(enforce) {
  ...
}
```

## Le cycle de travail complet

La méthode standard pour créer et maintenir un profil :

```
complain  →  faire fonctionner l'app (générer des refus)  →  aa-logprof  →  tester  →  enforce
```

1. Mettre le profil en **complain** (ou le générer avec `aa-genprof`).
2. **Exercer l'application** dans tous ses cas d'usage (démarrage, requêtes, fonctions) pour générer les événements.
3. Lancer **`aa-logprof`** pour intégrer les accès observés au profil.
4. **Tester** que tout fonctionne.
5. Passer en **enforce**.

**Maintenance dans le temps** : quand l'application évolue (mise à jour, nouveau module), repasser temporairement en complain, ré-observer avec `aa-logprof`, puis re-enforce. Cette approche itérative garde des profils précis sans casser le service.

## Dépannage

| Symptôme | Cause probable | Solution |
| --- | --- | --- |
| Un service ne démarre plus après `aa-enforce` | Un chemin nécessaire manque dans le profil | Repasser en `aa-complain`, reproduire l'usage, `aa-logprof`, puis `aa-enforce` |
| `aa-genprof` : `Can't find system log "/var/log/syslog"` | Debian 12 sans `rsyslog` (journald seul) | `journalctl -b -k -e -f > /var/tmp/aa.log &` puis `sudo aa-genprof -f /var/tmp/aa.log /usr/sbin/nginx` |
| Le profil « ne protège pas » en complain | Confusion complain / enforce | Normal : complain journalise `ALLOWED`. Seules les règles `deny` explicites bloquent en complain |
| Un profil désactivé réapparaît | Lien laissé dans `/etc/apparmor.d/disable/` | `sudo rm /etc/apparmor.d/disable/<profil>` puis `sudo apparmor_parser -r <profil>` |
| Un bac à sable (Chrome, AppImage) casse sur Ubuntu 24.04 | `apparmor_restrict_unprivileged_userns=1` par défaut | Créer un profil dédié plutôt que désactiver globalement |

Pour lire les refus, deux réflexes :

```bash
sudo journalctl | grep -i apparmor        # via journald
sudo dmesg | grep -i apparmor             # via le buffer noyau
```

Chercher le champ `denied_mask` (la permission refusée) et `name` (la ressource concernée) pour savoir quelle règle ajouter.

## Commandes de référence

| Commande | Rôle |
| --- | --- |
| `sudo aa-status` / `sudo apparmor_status` | État global, profils chargés et leurs modes |
| `sudo aa-genprof <binaire>` | Générer un profil en observant l'application |
| `sudo aa-logprof` | Mettre à jour les profils depuis les refus journalisés |
| `sudo aa-complain <binaire>` | Passer un profil en mode observation |
| `sudo aa-enforce <binaire>` | Passer un profil en mode blocage |
| `sudo apparmor_parser -r <profil>` | (Re)charger un profil (en enforce) |
| `sudo aa-disable <binaire>` | Désactiver un profil |

## À retenir

- AppArmor est un **MAC** (contrôle d'accès obligatoire) qui **confine chaque application** par un **profil**, au-delà des permissions Unix (DAC). Natif sur Debian/Ubuntu/openSUSE, **path-based**.
- Modèle par chemin = simple, mais **contournable** par lien dur / bind mount / renommage de binaire.
- **enforce** bloque et journalise `DENIED` ; **complain** journalise `ALLOWED` sans bloquer — mais les règles **`deny` explicites s'appliquent quand même** en complain.
- Profils dans **`/etc/apparmor.d/`**, nommés d'après le chemin du binaire (`usr.sbin.nginx`) ; permissions `r`/`w`/`m`/`x` par ressource.
- Cycle de travail : **complain → exercer l'app → `aa-logprof` → tester → enforce**. `aa-genprof` crée un profil en observant ; `aa-logprof` le fait évoluer depuis les journaux.
- Les **abstractions** (`include <abstractions/...>`) mutualisent des règles communes.
- Diagnostiquer un refus : `journalctl`/`dmesg` + `grep apparmor`, lire `denied_mask` et `name`.
- Attention : `apparmor_parser -r` charge **directement en enforce** ; basculer en `aa-complain` juste après si on veut observer.
