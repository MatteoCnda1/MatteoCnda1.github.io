---
id: 06-audit-detection-patch
title: Audit, détection et gestion des vulnérabilités
sidebar_position: 7
tags: [linux, blue-team]
---

# Audit, détection et gestion des vulnérabilités

Sécuriser un système ne se limite pas à le configurer : il faut aussi le **surveiller**, **détecter** les anomalies et **corriger** les vulnérabilités dans le temps. Ce cours couvre les journaux, l'audit système (auditd), les outils de détection (lynis, rkhunter), et la gestion des vulnérabilités (CVE, patch management). C'est la dimension « dans la durée » de la sécurité.

## Les processus et services : savoir ce qui tourne

Avant de détecter des anomalies, il faut savoir observer l'état normal du système. Un réflexe de sécurité de base : savoir ce qui s'exécute.

```bash
ps aux                       # tous les processus en cours (instantané)
top                          # processus en temps réel, triés par consommation
htop                         # version améliorée et interactive de top
systemctl list-units --type=service --state=running   # services actifs
systemctl status nginx       # état d'un service précis
```

Cas d'usage sécurité : repérer un processus inconnu qui consomme des ressources (possible malware, cryptomineur), vérifier qu'aucun service inattendu ne tourne, identifier ce qui écoute sur le réseau (à croiser avec `ss -tulnp` du cours réseau). Connaître l'état normal de sa machine est ce qui permet de repérer l'anormal.

## Les journaux (logs)

Les **journaux** enregistrent l'activité du système et des services : connexions, erreurs, événements de sécurité. Ils sont la mémoire du système et la première source pour toute investigation (diagnostic ou incident de sécurité).

Sur les systèmes modernes (systemd), les journaux sont gérés par **journald** et consultés avec `journalctl` :

```bash
journalctl                       # tout le journal
journalctl -u ssh                # journal d'un service précis (ici SSH)
journalctl -f                    # suivi en temps réel (comme tail -f)
journalctl --since "1 hour ago"  # depuis une heure
journalctl -p err                # seulement les erreurs et plus grave
journalctl -k                    # messages du noyau
```

Des fichiers texte traditionnels existent aussi dans `/var/log/` : `/var/log/auth.log` (authentifications, sudo, SSH — crucial en sécurité), `/var/log/syslog`, les logs des services web, etc.

```bash
sudo tail -f /var/log/auth.log   # suivre les tentatives d'authentification en direct
sudo grep "Failed password" /var/log/auth.log   # repérer les échecs de connexion SSH
```

Cas d'usage : investiguer après un incident (qui s'est connecté, quand, d'où ?), repérer des tentatives d'intrusion (rafales de « Failed password » = brute force SSH), diagnostiquer un service qui plante. Les journaux sont la base du travail d'analyse en sécurité — et ce que surveille fail2ban.

## auditd : l'audit système approfondi

**auditd** est le démon d'audit du noyau Linux. Il va bien plus loin que les journaux classiques : il enregistre de façon fine et fiable les **événements système** (accès à des fichiers, appels système, exécutions, modifications de configuration), selon des **règles** que tu définis. C'est l'outil de référence pour la traçabilité et la conformité (il est souvent exigé par les normes de sécurité).

```bash
sudo systemctl status auditd     # état du service d'audit
sudo auditctl -l                 # lister les règles d'audit actives
sudo ausearch -k cle_de_regle    # rechercher les événements d'une règle
sudo aureport                    # rapport de synthèse des événements audités
```

On définit des **règles de surveillance** dans `/etc/audit/rules.d/`. Exemples de ce qu'on peut auditer : toute modification de `/etc/passwd` ou `/etc/shadow` (surveiller les changements de comptes), tout accès à un dossier sensible, l'usage de certaines commandes. Chaque événement est horodaté et attribué à un utilisateur.

```bash
# Exemple : surveiller toute modification du fichier des mots de passe
sudo auditctl -w /etc/shadow -p wa -k surveillance_shadow
```

Cas d'usage : sur un serveur sensible, auditd permet de savoir précisément qui a accédé ou modifié quoi, quand — indispensable pour investiguer une compromission ou répondre à une exigence de conformité. C'est la « boîte noire » du système.

## lynis : l'audit de configuration

**lynis** est un outil d'**audit de sécurité** qui scanne le système et évalue son niveau de durcissement. Il passe en revue des centaines de points de contrôle (configuration SSH, pare-feu, permissions, comptes, services, mises à jour...) et produit un rapport avec des **recommandations** concrètes et un score de durcissement.

```bash
sudo lynis audit system          # audit complet du système
```

Cas d'usage : évaluer la posture de sécurité d'une machine, obtenir une liste priorisée d'améliorations, vérifier régulièrement qu'un serveur reste bien configuré. C'est un excellent point de départ pour durcir un système : on lance lynis, et on traite les recommandations une par une. Idéal aussi pour apprendre, car il explique chaque point.

## rkhunter : la détection de rootkits

**rkhunter** (Rootkit Hunter) recherche les signes de compromission : **rootkits** (outils qu'un attaquant installe pour garder un accès caché), portes dérobées, fichiers système modifiés, permissions suspectes. Il compare l'état du système à des signatures connues et à un état de référence.

```bash
sudo rkhunter --update           # mettre à jour la base de signatures
sudo rkhunter --propupd          # enregistrer l'état de référence (sur système sain)
sudo rkhunter --check            # lancer une analyse
```

Cas d'usage : détection d'une compromission. La bonne pratique est d'établir l'état de référence (`--propupd`) sur un système **fraîchement installé et sain**, puis de lancer des analyses régulières : toute modification suspecte des binaires système sera signalée. Un outil similaire est `chkrootkit`. À noter : ces outils produisent des faux positifs, l'interprétation demande de l'expérience.

## CVE et patch management

C'est la dimension la plus importante dans la durée, et souvent la plus négligée. La majorité des compromissions exploitent des **vulnérabilités connues** et déjà corrigées, sur des systèmes non mis à jour.

### Les CVE

Une **CVE** (Common Vulnerabilities and Exposures) est un identifiant unique attribué à une vulnérabilité de sécurité publiquement connue, de la forme `CVE-2024-12345`. Ce système mondial permet de référencer, suivre et communiquer sur les failles. Chaque CVE décrit la vulnérabilité, les logiciels affectés et souvent un score de gravité (**CVSS**, de 0 à 10). Les bases publiques (NVD, le site de MITRE, les bulletins des distributions) recensent les CVE.

Cas d'usage : quand une faille majeure est annoncée, tu cherches sa CVE pour savoir si tes systèmes sont concernés (quel logiciel, quelle version), sa gravité, et si un correctif existe. Suivre les CVE de ses composants est un travail de veille essentiel en sécurité.

### Le patch management

**Patcher**, c'est appliquer les correctifs de sécurité. La règle d'or : **maintenir le système et les applications à jour**, car chaque mise à jour de sécurité colmate des failles connues.

```bash
# Debian / Ubuntu
sudo apt update && sudo apt upgrade      # mettre à jour les paquets
sudo apt list --upgradable               # voir ce qui peut être mis à jour
sudo unattended-upgrades                 # mises à jour de sécurité automatiques (à configurer)

# RHEL / Fedora / Rocky
sudo dnf check-update
sudo dnf upgrade
```

Bonnes pratiques de patch management :
- **Appliquer rapidement** les correctifs de sécurité, surtout pour les failles critiques activement exploitées.
- **Automatiser** les mises à jour de sécurité quand c'est possible (`unattended-upgrades`), tout en surveillant qu'elles ne cassent rien.
- **Tester** les mises à jour majeures sur un environnement de préproduction avant la production.
- **Faire l'inventaire** de ce qui est installé, pour savoir quoi surveiller (on ne patche que ce qu'on connaît).
- **Redémarrer** quand c'est nécessaire (une mise à jour du noyau ne prend effet qu'après redémarrage).

Cas d'usage : le scénario catastrophe classique est un serveur oublié, non mis à jour, compromis via une faille corrigée depuis des mois. Le patch management régulier est la mesure de sécurité au meilleur rapport efficacité/effort — bien plus que n'importe quel outil sophistiqué.

## La démarche d'ensemble

Ces éléments forment un cycle de sécurité continue :
1. **Connaître** son système (processus, services, ports — l'état normal).
2. **Durcir** la configuration (les autres cours de cette section) et vérifier avec **lynis**.
3. **Surveiller** en continu via les **journaux** et **auditd**.
4. **Détecter** les compromissions avec **rkhunter** et l'analyse des logs.
5. **Corriger** en continu via le **patch management** et le suivi des **CVE**.

La sécurité n'est pas un état figé qu'on atteint une fois, mais un processus permanent de surveillance et de mise à jour.

## Ce qu'il faut retenir

- **Observer l'état normal** (processus `ps`/`top`/`htop`, services `systemctl`, ports `ss`) est le préalable pour repérer l'anormal.
- **Journaux** : `journalctl` (systemd, `-u` par service, `-f` en direct) et `/var/log/` (notamment `auth.log` pour les authentifications). Base de toute investigation ; repérer les « Failed password » (brute force).
- **auditd** : audit fin et fiable des événements système selon des **règles** (ex. surveiller `/etc/shadow`) ; traçabilité et conformité (`auditctl`, `ausearch`, `aureport`).
- **lynis** : audit de **configuration**, score de durcissement et recommandations concrètes — excellent point de départ pour durcir et apprendre.
- **rkhunter** : détection de **rootkits**/compromission par comparaison à un état de référence (établi sur système sain).
- **CVE** : identifiants mondiaux des vulnérabilités connues (`CVE-AAAA-NNNNN`, gravité **CVSS**) ; faire de la **veille** sur ses composants.
- **Patch management** : maintenir le système **à jour** (`apt upgrade`, `dnf upgrade`, `unattended-upgrades`) est la mesure la plus rentable — la plupart des attaques exploitent des failles **déjà corrigées**.
- La sécurité est un **cycle continu** : connaître → durcir → surveiller → détecter → corriger.

## Voir aussi

- [Pare-feu — nftables, ufw, fail2ban](./04-pare-feu-nftables-ufw-fail2ban.md) — le cours précédent.
- [Glossaire](../../../Glossaire/index.md) — CVE, CVSS, CWE.
