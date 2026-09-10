---
id: 05-selinux
title: SELinux
sidebar_position: 6
tags: [linux]
---

# SELinux

SELinux est, comme AppArmor, un système de **contrôle d'accès obligatoire (MAC)** pour Linux. Ce cours suppose acquis le concept de MAC vs DAC (voir le cours AppArmor) et se concentre sur ce qui est propre à SELinux : son modèle par étiquettes, ses modes, et sa gestion au quotidien. On termine par une comparaison des deux solutions.

## Rappel du contexte : pourquoi un MAC

Pour mémoire (détaillé dans le cours AppArmor) : le modèle Unix classique est le **DAC** (contrôle d'accès discrétionnaire), où le propriétaire d'un fichier décide des droits et où root peut tout. Le **MAC** (contrôle d'accès obligatoire) ajoute une politique **imposée par le système**, que même root ne peut contourner à l'exécution, confinant chaque processus à ce qui lui est explicitement permis. En cas de compromission d'un service, le MAC limite les dégâts.

SELinux (Security-Enhanced Linux) est le MAC développé à l'origine par la NSA, aujourd'hui intégré au noyau Linux. C'est le MAC natif de **RHEL, Rocky Linux, Fedora, CentOS** (là où AppArmor équipe Debian/Ubuntu/SUSE). Android l'utilise aussi (voir le cours Android).

## Le modèle par étiquettes (contextes)

C'est la différence fondamentale avec AppArmor. Là où AppArmor raisonne par **chemin de fichier**, SELinux raisonne par **étiquette** (label). Chaque élément du système — fichier, processus, port, socket — porte un **contexte de sécurité** SELinux, et la politique définit quelles interactions entre contextes sont autorisées.

Un contexte SELinux a la forme `user:role:type:niveau`. L'élément le plus important en pratique est le **type**. La politique fonctionne essentiellement par **type enforcement** : elle définit quels types de processus peuvent accéder à quels types de ressources. Par exemple, le processus du serveur web a le type `httpd_t`, et ses fichiers web le type `httpd_sys_content_t` ; la politique autorise `httpd_t` à lire `httpd_sys_content_t`, mais lui interdit de toucher, disons, les fichiers de type `shadow_t`.

Conséquence pratique majeure : comme SELinux étiquette les **inodes** (et non les chemins), déplacer ou renommer un fichier peut changer ou casser son étiquette, et un fichier au mauvais contexte sera refusé même si les permissions Unix sont bonnes. Beaucoup de problèmes SELinux viennent d'un **mauvais contexte** de fichier, pas d'une vraie interdiction. C'est plus robuste que le modèle par chemin (plus difficile à contourner) mais aussi plus déroutant au début.

## Les modes de SELinux

SELinux a trois modes globaux, à connaître absolument :

- **enforcing** — la politique est **appliquée** : les accès non autorisés sont bloqués et journalisés. C'est le mode de production.
- **permissive** — la politique n'est **pas appliquée** mais les violations sont **journalisées**. Mode d'audit/débogage : on voit ce qui *serait* bloqué sans rien casser, idéal pour construire ou corriger une politique.
- **disabled** — SELinux est désactivé (à éviter ; préférer permissive pour diagnostiquer).

```bash
getenforce                       # afficher le mode courant
sudo setenforce 0                # passer en permissive (temporaire)
sudo setenforce 1                # repasser en enforcing (temporaire)
sestatus                         # état détaillé de SELinux
```

Le mode par défaut au démarrage se configure dans `/etc/selinux/config`. Le parallèle avec AppArmor est direct : `enforcing`/`permissive` correspondent à `enforce`/`complain`.

## Gérer SELinux au quotidien

### Voir les contextes

```bash
ls -Z fichier                    # contexte SELinux d'un fichier (option -Z)
ps -Z                            # contexte des processus
id -Z                            # ton contexte
```

L'option `-Z` (sur `ls`, `ps`, `id`...) affiche les contextes SELinux — c'est le réflexe de base pour comprendre une situation.

### Diagnostiquer un refus

Quand quelque chose est bloqué par SELinux, la cause est dans les journaux d'audit. La bonne démarche :

```bash
sudo ausearch -m avc -ts recent          # chercher les refus SELinux (AVC denials) récents
sudo sealert -a /var/log/audit/audit.log # analyse lisible avec suggestions de correction
```

Les refus s'appellent des **AVC denials** (Access Vector Cache). L'outil `sealert` (du paquet setroubleshoot) est précieux : il traduit les refus cryptiques en explications claires avec des pistes de correction. Réflexe : « ça ne marche pas et je soupçonne SELinux » → passer en permissive pour confirmer, puis chercher l'AVC.

### Corriger les contextes de fichiers

La cause la plus fréquente de problème étant un mauvais contexte, on le corrige ainsi :

```bash
sudo restorecon -Rv /var/www/html        # réapplique les contextes par défaut (récursif)
sudo chcon -t httpd_sys_content_t fichier # forcer un type (ponctuel, non permanent)
sudo semanage fcontext -a -t httpd_sys_content_t "/chemin(/.*)?"   # règle permanente
```

`restorecon` réapplique le contexte correct selon la politique — c'est souvent la solution. `chcon` change un contexte temporairement ; `semanage fcontext` crée une règle permanente (puis `restorecon` pour l'appliquer).

### Les booléens SELinux

SELinux expose des **booléens** : des interrupteurs qui activent/désactivent des comportements prévus par la politique, sans avoir à l'écrire. Par exemple, autoriser le serveur web à se connecter au réseau, ou à accéder aux répertoires personnels.

```bash
getsebool -a                              # lister tous les booléens
sudo setsebool -P httpd_can_network_connect on   # activer un booléen de façon permanente (-P)
```

Cas d'usage : beaucoup d'ajustements courants se font en basculant un booléen plutôt qu'en modifiant la politique — plus simple et prévu pour ça. L'option `-P` rend le changement permanent (sinon il est perdu au redémarrage).

## SELinux vs AppArmor : quand et lequel

Les deux atteignent le même but (le MAC) avec des philosophies différentes :

- **Modèle** : SELinux par **étiquettes/types** (inodes), AppArmor par **chemins de fichiers**.
- **Robustesse** : SELinux est plus **strict et complet** (plus difficile à contourner, granularité plus fine), au prix d'une **complexité** supérieure. AppArmor est plus **simple à lire et à écrire** (les profils ressemblent à des listes de chemins), au prix d'une couverture parfois moins hermétique.
- **Distributions** : SELinux sur **RHEL/Fedora/Rocky/CentOS** (et Android) ; AppArmor sur **Debian/Ubuntu/SUSE**.
- **En pratique** : on utilise généralement celui fourni par sa distribution. Le choix se fait donc souvent en amont, avec la distribution, plutôt qu'au cas par cas.

Retiens l'essentiel : ce sont deux réponses au même besoin (confiner les applications au-delà des permissions Unix), et un profil sécurité doit savoir diagnostiquer les deux — reconnaître qu'un blocage vient du MAC, et savoir passer en mode permissif/complain pour le confirmer.

## Ce qu'il faut retenir

- SELinux est un **MAC** (comme AppArmor) : une politique imposée par le système qui confine les processus au-delà du DAC Unix, limitant les dégâts en cas de compromission. Natif sur **RHEL/Fedora/Rocky** (et Android).
- Différence clé : SELinux raisonne par **étiquettes/contextes** (`user:role:type:niveau`, le **type** étant central) sur les **inodes**, là où AppArmor raisonne par **chemin**. Beaucoup de problèmes viennent d'un **mauvais contexte** de fichier.
- **Modes** : `enforcing` (applique), `permissive` (journalise sans bloquer — pour diagnostiquer), `disabled`. `getenforce`/`setenforce`, config dans `/etc/selinux/config`.
- **Quotidien** : `ls -Z` (voir les contextes), `ausearch`/`sealert` (diagnostiquer les refus AVC), `restorecon` (réappliquer les bons contextes — souvent LA solution), **booléens** `setsebool -P` (activer des comportements prévus sans toucher à la politique).
- **SELinux vs AppArmor** : plus strict/complet mais plus complexe (SELinux) vs plus simple mais moins hermétique (AppArmor) ; on prend celui de sa distribution. Savoir diagnostiquer les deux.

## Voir aussi

- [AppArmor](./appArmor.md) — l'alternative plus simple.
- [Utilisateurs, groupes et permissions](./01-utilisateurs-groupes-permissions.md) — les permissions classiques que SELinux vient compléter.
