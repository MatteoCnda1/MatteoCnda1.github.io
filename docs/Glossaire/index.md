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
- **Pentest** — test d'intrusion : simulation encadrée d'une attaque pour évaluer la sécurité d'un système, avec autorisation explicite. Voir [Wifi](../Cybersecurity/07-Wifi/index.md).
- **Red Team / Blue Team** — équipe offensive qui simule des attaques réelles / équipe défensive qui détecte et répond aux incidents.
- **Purple Team** — collaboration entre Red Team et Blue Team pour améliorer la détection à partir des techniques d'attaque testées.
- **Reverse Engineering** — rétro-ingénierie : analyse d'un programme ou d'un matériel pour comprendre son fonctionnement interne sans disposer du code source.
- **Payload** — code ou action exécutée par un exploit une fois la vulnérabilité déclenchée.
- **Privilege Escalation** — obtention de droits/privilèges supérieurs à ceux initialement accordés sur un système.
- **Lateral Movement** — déplacement d'un attaquant d'une machine compromise vers d'autres systèmes du même réseau.
- **IoT** — Internet of Things : objets connectés, souvent avec des contraintes de ressources et une surface d'attaque spécifique.

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
- **EtherChannel** — agrégation de plusieurs liens physiques en un seul lien logique pour augmenter la bande passante et la tolérance de panne.
- **802.1X** — protocole d'authentification réseau au niveau de la couche liaison, souvent utilisé pour contrôler l'accès filaire/Wi-Fi.
- **WPA2 / WPA3** — protocoles de sécurisation des réseaux Wi-Fi, WPA3 succédant à WPA2 avec un échange de clé plus robuste (SAE).
- **SLAAC** — StateLess Address AutoConfiguration : mécanisme d'auto-configuration d'adresses IPv6 sans serveur DHCP.

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
- **XOR** — opérateur logique « ou exclusif », brique de base de nombreux algorithmes de chiffrement. Voir [XOR et one-time pad](../Cryptography/01-xor-et-one-time-pad.md).
- **One-Time Pad** — masque jetable : chiffrement théoriquement incassable si la clé est aussi longue que le message et utilisée une seule fois. Voir [XOR et one-time pad](../Cryptography/01-xor-et-one-time-pad.md).
- **Diffie-Hellman** — protocole d'échange de clé permettant à deux parties d'établir un secret partagé sur un canal non sécurisé. Voir [Diffie-Hellman](../Cryptography/04-diffie-hellman.md).

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
- **fail2ban** — outil qui bannit automatiquement les adresses IP après un nombre d'échecs d'authentification, pour limiter le brute-force. Voir [Pare-feu — nftables, ufw, fail2ban](../Operating_sys/Linux/Security/04-pare-feu-nftables-ufw-fail2ban.md).
- **nftables / iptables** — outils de pare-feu Linux (nftables succède à iptables) pour filtrer le trafic réseau au niveau noyau.
- **GPO** — Group Policy Object : stratégie de groupe Windows permettant d'appliquer des configurations centralisées sur un domaine Active Directory.
- **Kerberos** — protocole d'authentification réseau par tickets, utilisé notamment par Active Directory.
- **LDAP** — Lightweight Directory Access Protocol : protocole d'interrogation d'annuaires (utilisateurs, groupes...), utilisé par Active Directory.

## Hardware

- **CPU** — Central Processing Unit, le processeur. Voir [CPU](../Hardware/02-CPU/index.md).
- **GPU** — Graphics Processing Unit, processeur graphique massivement parallèle. Voir [GPU](../Hardware/03-GPU/index.md).
- **RAM** — Random Access Memory, mémoire vive volatile. Voir [RAM](../Hardware/04-RAM/index.md).
- **BIOS / UEFI** — micrologiciel démarrant la machine avant le système d'exploitation. Voir [Firmware](../Hardware/12-Firmware/index.md).
- **TDP** — Thermal Design Power : puissance thermique maximale qu'un composant peut dissiper, utilisée pour dimensionner le refroidissement.
- **IOPS** — Input/Output Operations Per Second, mesure de performance d'un support de stockage. Voir [Storage](../Hardware/05-Storage/index.md).
- **SSD / HDD** — Solid State Drive (mémoire flash, rapide, sans pièce mobile) / Hard Disk Drive (disque magnétique mécanique).
- **PCIe** — PCI Express : bus d'interconnexion série à haut débit reliant CPU, GPU, SSD NVMe et autres cartes d'extension. Voir [Buses & Interfaces](../Hardware/07-Buses-Interfaces/index.md).
- **NVMe** — protocole de stockage optimisé pour les SSD connectés en PCIe, bien plus rapide que SATA.

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
- **JSON** — JavaScript Object Notation : format d'échange de données léger, très utilisé par les API.
- **CLI / GUI** — Command-Line Interface / Graphical User Interface : interface en ligne de commande vs interface graphique.

## Intelligence Artificielle

- **LLM** — Large Language Model. Voir [LLM et IA générative](../Artificial_Intelligence/04-llm-ia-generative.mdx).
- **NLP** — Natural Language Processing, traitement automatique du langage naturel.
- **CNN / RNN** — Convolutional / Recurrent Neural Network, architectures de réseaux de neurones. Voir [Deep Learning](../Artificial_Intelligence/03-deep-learning.mdx).
- **Overfitting (surapprentissage)** — un modèle apprend trop précisément les données d'entraînement et généralise mal. Voir [Machine Learning](../Artificial_Intelligence/02-machine-learning.mdx).
- **Token (LLM)** — unité de texte (mot ou fragment de mot) traitée par un modèle de langage.
- **Fine-tuning** — ré-entraînement d'un modèle pré-entraîné sur un jeu de données spécifique.
- **Prompt Engineering** — pratique consistant à formuler des instructions pour obtenir de meilleurs résultats d'un LLM.
- **RAG** — Retrieval-Augmented Generation : combine recherche documentaire et génération de texte par LLM. Voir [IA et cybersécurité](../Artificial_Intelligence/05-ia-et-cybersecurite.mdx).
- **Hallucination (LLM)** — réponse générée par un modèle de langage qui semble plausible mais est factuellement incorrecte ou inventée.
- **Embedding** — représentation vectorielle d'un texte (ou d'une image) dans un espace numérique, utilisée pour mesurer la similarité sémantique.
- **Backpropagation** — algorithme d'apprentissage des réseaux de neurones qui ajuste les poids en propageant l'erreur de la sortie vers l'entrée. Voir [Deep Learning](../Artificial_Intelligence/03-deep-learning.mdx).

## Physique

- **Onde** — perturbation qui se propage dans un milieu (ou dans le vide) en transportant de l'énergie sans transport de matière. Voir [Les ondes](../Physics/Les_ondes/index.md).
- **Fréquence / Longueur d'onde** — nombre d'oscillations par seconde (Hz) et distance entre deux crêtes successives d'une onde ; liées par la vitesse de propagation (v = f × λ).
- **Amplitude** — écart maximal d'une onde par rapport à sa position d'équilibre.

## Productivité

- **GTD** — Getting Things Done, méthode de gestion des tâches en 5 étapes. Voir [GTD](../Productivite/01-gtd-getting-things-done.md).
- **PARA** — Projects, Areas, Resources, Archives : méthode de classement de l'information par actionnabilité. Voir [Méthode PARA](../Productivite/08-methode-para.md).
- **OKR** — Objectives and Key Results : cadre de fixation d'objectifs ambitieux. Voir [SMART & OKR](../Productivite/11-objectifs-smart-et-okr.md).
- **Deep Work** — travail en concentration intense, sans distraction. Voir [Deep Work](../Productivite/07-deep-work.md).
- **Pomodoro** — technique de gestion du temps par sprints de concentration de 25 minutes entrecoupés de pauses. Voir [Technique Pomodoro](../Productivite/06-technique-pomodoro.md).
- **Zettelkasten** — méthode de prise de notes atomiques reliées entre elles en réseau, plutôt que rangées par dossiers. Voir [Zettelkasten](../Productivite/09-zettelkasten.md).
- **Time Boxing** — allocation d'une durée maximale fixe à une tâche pour lutter contre la loi de Parkinson. Voir [Time Blocking & Time Boxing](../Productivite/05-time-blocking-et-time-boxing.md).

## Divers

- **OSINT** — Open Source Intelligence, renseignement en sources ouvertes. Voir [OSINT](../OSINT/index.md).
- **RGPD** — Règlement Général sur la Protection des Données : cadre européen encadrant le traitement des données personnelles.
- **MVP** — Minimum Viable Product : version minimale d'un projet permettant de valider une idée avant d'investir davantage.
