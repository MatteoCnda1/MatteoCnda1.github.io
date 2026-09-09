---
title: Glossaire
sidebar_position: 100
---

# Glossaire

> Acronymes et termes clés utilisés à travers les différentes sections du site, avec un lien vers la ressource correspondante quand elle existe.

## Cybersécurité

- **CIA Triad** — Confidentialité, Intégrité, Disponibilité : les trois piliers de la sécurité de l'information. Voir [Cybersecurity](../Cybersecurity/index.md).
- **AAA** — Authentication, Authorization, Accounting.
- **CVE** — Common Vulnerabilities and Exposures : identifiant public d'une vulnérabilité connue.
- **CVSS** — Common Vulnerability Scoring System : score de sévérité d'une vulnérabilité.
- **CWE** — Common Weakness Enumeration : classification des types de faiblesses logicielles.
- **Zero-Day** — vulnérabilité inconnue de l'éditeur au moment de son exploitation, donc sans correctif disponible. Voir [Fundamentals](../Cybersecurity/01-Fundamentals/index.md).
- **IOC / IOA** — Indicator of Compromise / Indicator of Attack.
- **TTP** — Tactics, Techniques and Procedures : modes opératoires d'un attaquant.
- **MITRE ATT&CK** — Référentiel des tactiques et techniques d'attaque observées.
- **Kill Chain** — modèle décrivant les étapes successives d'une cyberattaque (reconnaissance, intrusion, exploitation, exfiltration...), popularisé par Lockheed Martin.
- **APT** — Advanced Persistent Threat : groupe d'attaquants sophistiqués et persistants, souvent étatique.
- **SOC** — Security Operations Center.
- **SIEM** — Security Information and Event Management.
- **EDR / XDR** — Endpoint / Extended Detection and Response.
- **WAF** — Web Application Firewall : pare-feu applicatif filtrant le trafic HTTP(S).
- **DLP** — Data Loss Prevention : outils/processus empêchant la fuite de données sensibles.
- **MFA / 2FA** — Multi-Factor / Two-Factor Authentication : authentification à plusieurs facteurs.
- **C2** — Command & Control : infrastructure de pilotage d'un malware.
- **RAT** — Remote Access Trojan.
- **Honeypot** — système leurre destiné à attirer et observer un attaquant.
- **Sandbox** — environnement isolé utilisé pour exécuter et analyser un programme sans risque pour le système hôte.
- **PoC** — Proof of Concept : démonstration minimale qu'une vulnérabilité est exploitable.
- **ROP** — Return-Oriented Programming, technique d'exploitation mémoire.
- **ASLR / DEP / NX** — Mécanismes de protection mémoire (Address Space Layout Randomization, Data Execution Prevention).
- **IDOR** — Insecure Direct Object Reference.
- **SSRF / XXE / SSTI** — Server-Side Request Forgery / XML External Entity / Server-Side Template Injection.
- **OWASP** — Open Web Application Security Project, organisation de référence en sécurité applicative (connue pour l'OWASP Top 10).

## Réseaux

- **VLAN** — Virtual Local Area Network.
- **BGP / OSPF / EIGRP** — Protocoles de routage (Border Gateway Protocol, Open Shortest Path First, Enhanced Interior Gateway Routing Protocol). Voir [Networking](../networking/index.md).
- **STP** — Spanning Tree Protocol : évite les boucles de commutation dans un réseau Ethernet redondant.
- **HSRP** — Hot Standby Router Protocol : redondance de passerelle par défaut chez Cisco.
- **ZBF** — Zone-Based Firewall.
- **DHCP** — Dynamic Host Configuration Protocol.
- **ARP** — Address Resolution Protocol : résolution d'une adresse IP en adresse MAC.
- **ICMP** — Internet Control Message Protocol (ex : ping, traceroute).
- **NAT / PAT** — Network / Port Address Translation.
- **MTU** — Maximum Transmission Unit : taille maximale d'un paquet transmis sur un lien réseau.
- **QoS** — Quality of Service : priorisation de certains flux réseau.
- **VPN** — Virtual Private Network : tunnel chiffré entre deux réseaux ou machines.
- **MPLS** — Multiprotocol Label Switching : technique de commutation par labels utilisée par les opérateurs.

## Cryptographie

- **RSA** — Algorithme de chiffrement asymétrique (Rivest–Shamir–Adleman). Voir [RSA](../Cryptography/03-rsa.md).
- **AES** — Advanced Encryption Standard, chiffrement symétrique par blocs. Voir [Chiffrement symétrique](../Cryptography/02-chiffrement-symetrique.md).
- **ECC** — Elliptic Curve Cryptography. Voir [Courbes elliptiques](../Cryptography/05-courbes-elliptiques.md).
- **PKI** — Public Key Infrastructure. Voir [Certificats](../Cryptography/07-cles-publiques-privees-et-certificats.md).
- **TLS/SSL** — Transport Layer Security / Secure Sockets Layer.
- **HMAC** — Hash-based Message Authentication Code : garantit intégrité et authenticité via une clé secrète. Voir [Fonctions de hachage](../Cryptography/06-fonctions-de-hachage.md).
- **Salage (Salt)** — valeur aléatoire ajoutée avant hachage pour empêcher les attaques par table précalculée (rainbow tables).
- **KDF** — Key Derivation Function : dérive une clé cryptographique à partir d'un secret (ex : mot de passe).
- **Nonce** — valeur utilisée une seule fois, pour empêcher les attaques par rejeu.
- **Forward Secrecy** — propriété garantissant que la compromission d'une clé long terme ne compromet pas les sessions passées.

## Systèmes & Infrastructure

- **Pod** — plus petite unité déployable dans Kubernetes, regroupant un ou plusieurs conteneurs. Voir [Pods](../Container_Orchestration/Pods/index.md).
- **Deployment** — objet Kubernetes qui gère le cycle de vie et la mise à jour d'un ensemble de pods. Voir [Container Orchestration](../Container_Orchestration/index.md).
- **Ingress** — objet Kubernetes exposant des services HTTP(S) à l'extérieur du cluster. Voir [Ingress](../Container_Orchestration/Ingress/index.md).
- **Helm Chart** — paquet décrivant une application Kubernetes prête à déployer. Voir [Helm](../Container_Orchestration/Helm/index.md).
- **RBAC** — Role-Based Access Control : contrôle d'accès basé sur des rôles. Voir [RBAC](../Container_Orchestration/RBAC/index.md).
- **OCI** — Open Container Initiative : standard ouvert définissant le format des images et runtimes de conteneurs. Voir [Containers](../Containers/index.md).
- **cgroups** — Control Groups, mécanisme Linux de limitation de ressources (CPU, mémoire...).
- **Namespaces (Linux)** — mécanisme Linux d'isolation des ressources (réseau, PID, montages...) utilisé par les conteneurs.
- **Hyperviseur** — logiciel permettant d'exécuter des machines virtuelles ; type 1 (bare-metal, ex. ESXi) ou type 2 (hébergé, ex. VirtualBox).
- **IaC** — Infrastructure as Code : gérer l'infrastructure via des fichiers de configuration versionnés. Voir [Configuration Management & Automation](../Configuration_Management_Automation/index.md).
- **CI/CD** — Continuous Integration / Continuous Delivery (ou Deployment).
- **SELinux / AppArmor** — Modules de contrôle d'accès obligatoire (MAC) sous Linux. Voir [Linux Security](../Operating_sys/Linux/Security/index.md).

## Hardware

- **CPU** — Central Processing Unit, le processeur. Voir [CPU](../Hardware/02-CPU/index.md).
- **GPU** — Graphics Processing Unit, processeur graphique massivement parallèle. Voir [GPU](../Hardware/03-GPU/index.md).
- **RAM** — Random Access Memory, mémoire vive volatile. Voir [RAM](../Hardware/04-RAM/index.md).
- **BIOS / UEFI** — micrologiciel démarrant la machine avant le système d'exploitation. Voir [Firmware](../Hardware/12-Firmware/index.md).
- **TDP** — Thermal Design Power : puissance thermique maximale qu'un composant peut dissiper, utilisée pour dimensionner le refroidissement.
- **IOPS** — Input/Output Operations Per Second, mesure de performance d'un support de stockage. Voir [Storage](../Hardware/05-Storage/index.md).

## Bases de données

- **DDL / DML** — Data Definition Language / Data Manipulation Language. Voir [Créer et remplir des tables](../Databases/01-creer-et-remplir.md).
- **ACID** — Atomicity, Consistency, Isolation, Durability : garanties d'une transaction fiable.
- **ORM** — Object-Relational Mapping : bibliothèque faisant correspondre objets du code et tables SQL.
- **Index (base de données)** — structure accélérant la recherche sur une colonne, au prix d'un coût en écriture.
- **NoSQL** — familles de bases de données non relationnelles (clé-valeur, document, colonne, graphe).

## Programmation

- **API** — Application Programming Interface : interface permettant à deux programmes de communiquer. Voir [Programmation](../Programmation/index.md).
- **REST** — style d'architecture pour API HTTP, basé sur les ressources et les verbes HTTP (GET, POST...).
- **IDE** — Integrated Development Environment : environnement de développement intégré.
- **Framework** — ensemble d'outils et de conventions structurant le développement d'une application.
- **Regex** — Regular Expression, expression régulière pour rechercher/manipuler du texte selon un motif.
- **Git** — système de contrôle de version décentralisé, utilisé pour l'ensemble de ce site.

## Intelligence Artificielle

- **LLM** — Large Language Model. Voir [LLM et IA générative](../Artificial_Intelligence/04-llm-ia-generative.mdx).
- **NLP** — Natural Language Processing, traitement automatique du langage naturel.
- **CNN / RNN** — Convolutional / Recurrent Neural Network, architectures de réseaux de neurones. Voir [Deep Learning](../Artificial_Intelligence/03-deep-learning.mdx).
- **Overfitting (surapprentissage)** — un modèle apprend trop précisément les données d'entraînement et généralise mal. Voir [Machine Learning](../Artificial_Intelligence/02-machine-learning.mdx).
- **Token (LLM)** — unité de texte (mot ou fragment de mot) traitée par un modèle de langage.
- **Fine-tuning** — ré-entraînement d'un modèle pré-entraîné sur un jeu de données spécifique.
- **Prompt Engineering** — pratique consistant à formuler des instructions pour obtenir de meilleurs résultats d'un LLM.
- **RAG** — Retrieval-Augmented Generation : combine recherche documentaire et génération de texte par LLM. Voir [IA et cybersécurité](../Artificial_Intelligence/05-ia-et-cybersecurite.mdx).

## Productivité

- **GTD** — Getting Things Done, méthode de gestion des tâches en 5 étapes. Voir [GTD](../Productivite/01-gtd-getting-things-done.md).
- **PARA** — Projects, Areas, Resources, Archives : méthode de classement de l'information par actionnabilité. Voir [Méthode PARA](../Productivite/08-methode-para.md).
- **OKR** — Objectives and Key Results : cadre de fixation d'objectifs ambitieux. Voir [SMART & OKR](../Productivite/11-objectifs-smart-et-okr.md).
- **Deep Work** — travail en concentration intense, sans distraction. Voir [Deep Work](../Productivite/07-deep-work.md).

## Divers

- **OSINT** — Open Source Intelligence, renseignement en sources ouvertes. Voir [OSINT](../OSINT/index.md).
