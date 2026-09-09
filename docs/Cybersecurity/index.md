---
title: Cybersecurity
sidebar_position: 1
---

import DocCardList from '@theme/DocCardList';

# Cybersecurity

> Base de connaissances personnelle dédiée à la cybersécurité.
>
> L'objectif est de comprendre les concepts, les techniques, les outils et les mécanismes de défense, en allant des fondamentaux jusqu'aux domaines spécialisés.

<DocCardList />

---

## 🗺️ Cartographie

### 01 — Fundamentals

Les concepts fondamentaux de la cybersécurité.

- CIA Triad
- AAA
- Threat / Vulnerability / Risk
- Attack Surface
- Attack Vector
- Exploit / Payload
- IOC / IOA
- TTP
- Defense in Depth
- Least Privilege
- Zero Trust

---

### 02 — Threat Modeling

Comprendre et modéliser les menaces pesant sur un système.

- Threat Modeling
- Assets
- Trust Boundaries
- Attack Trees
- STRIDE
- Risk Assessment
- Data Flow Diagrams

---

### 03 — Vulnerabilities

Comprendre les vulnérabilités et leur classification.

- CVE
- CWE
- CVSS
- Zero-Day
- Misconfiguration
- Privilege Escalation
- Authentication Bypass
- Authorization Bypass
- Information Disclosure
- Race Conditions
- Supply Chain Vulnerabilities

---

## ⚔️ Offensive Security

### 04 — Pentesting

Méthodologie et processus d'un test d'intrusion.

- Reconnaissance
- Enumeration
- Scanning
- Vulnerability Assessment
- Exploitation
- Privilege Escalation
- Post-Exploitation
- Lateral Movement
- Reporting
- Rules of Engagement

---

### 05 — Red Team

Simulation d'un adversaire réel et compréhension des chaînes d'attaque.

- Initial Access
- Execution
- Persistence
- Privilege Escalation
- Defense Evasion
- Credential Access
- Discovery
- Lateral Movement
- Command & Control
- Exfiltration
- Impact
- MITRE ATT&CK

---

### 06 — Web Security

Sécurité des applications et infrastructures Web.

- HTTP Security
- Authentication
- Authorization
- Sessions
- Cookies
- XSS
- SQL Injection
- CSRF
- SSRF
- XXE
- SSTI
- Path Traversal
- IDOR
- File Upload
- Race Conditions

---

### 07 — WiFi

Sécurité des réseaux sans fil.

- WiFi Basics
- IEEE 802.11
- WiFi Frames
- Authentication
- Association
- WPA / WPA2 / WPA3
- 802.1X
- EAP
- RADIUS
- Rogue AP
- Evil Twin
- Deauthentication
- WiFi Pentesting
- WiFi Defense
- WiFi Forensics

---

### 08 — Active Directory

Sécurité des environnements Windows et Active Directory.

- Active Directory Basics
- Domains
- Domain Controllers
- Forests
- OUs
- GPO
- LDAP
- Kerberos
- NTLM
- SMB
- SPN
- ACL
- Trusts
- BloodHound
- AD Attacks
- Lateral Movement

---

## 🛡️ Defensive Security

### 09 — Blue Team

Protection, durcissement et défense des systèmes.

- Hardening
- Endpoint Security
- Network Security
- Application Security
- Identity Security
- Logging
- Monitoring
- Detection
- Threat Hunting

---

### 10 — SOC

Security Operations Center et surveillance de la sécurité.

- SOC Architecture
- SIEM
- EDR
- XDR
- Alert Triage
- False Positives
- Incident Classification
- Log Analysis
- Escalation

---

### 11 — Detection

Détection et identification des comportements malveillants.

- Detection Engineering
- Sigma
- YARA
- Suricata
- Snort
- IOC
- IOA
- Threat Hunting
- MITRE ATT&CK Mapping

---

### 12 — Incident Response

Réponse aux incidents de sécurité.

- Preparation
- Identification
- Containment
- Eradication
- Recovery
- Evidence Handling
- Incident Reporting
- Lessons Learned

---

## 🔬 Security Analysis

### 13 — Digital Forensics

Analyse des traces numériques après un incident.

- Digital Evidence
- Chain of Custody
- Disk Forensics
- Memory Forensics
- Network Forensics
- File Systems
- Timeline Analysis
- Windows Forensics
- Linux Forensics

---

### 14 — Malware

Compréhension et analyse des logiciels malveillants.

- Malware Types
- Virus
- Worm
- Trojan
- Ransomware
- Rootkit
- Spyware
- RAT
- Botnet
- C2
- Persistence
- Malware Analysis

---

### 15 — Reverse Engineering

Comprendre le fonctionnement interne d'un programme.

- Static Analysis
- Dynamic Analysis
- Disassembly
- Debugging
- ELF
- PE
- Assembly
- Ghidra
- IDA
- x64dbg
- Frida

---

### 16 — Binary Security

Sécurité des programmes compilés et exploitation des corruptions mémoire.

- Memory Layout
- Stack
- Heap
- Buffer Overflow
- Use-After-Free
- Integer Overflow
- Format String
- ASLR
- DEP / NX
- Stack Canaries
- ROP
- Fuzzing

---

## ☁️ Infrastructure & Platforms

### 17 — Cloud Security

Sécurité des infrastructures Cloud.

- Cloud Security Basics
- IAM
- Roles
- Policies
- Secrets
- Storage
- Network Security
- Containers
- Serverless
- AWS
- Azure
- GCP

---

### 18 — Container Security

Sécurité des conteneurs et plateformes de déploiement.

- Docker
- Images
- Layers
- Registries
- Namespaces
- cgroups
- Linux Capabilities
- Container Escape
- Kubernetes
- RBAC
- Secrets
- Network Policies

---

### 19 — Mobile Security

Sécurité des applications et systèmes mobiles.

- Android
- APK
- ADB
- Android Permissions
- Android Keystore
- iOS
- App Sandboxing
- Mobile TLS
- Frida
- MobSF

---

### 20 — IoT Security

Sécurité des objets connectés et systèmes embarqués.

- Embedded Systems
- Firmware
- Bootloaders
- UART
- JTAG
- SPI
- I²C
- Debug Interfaces
- Embedded Linux
- IoT Protocols

---

### 21 — Hardware Security

Sécurité matérielle et firmware.

- Secure Boot
- TPM
- UEFI
- BIOS
- Firmware Security
- Hardware Debugging
- Side-Channel Attacks
- Hardware Attacks

---

## 🧰 Practice & Tools

### 22 — Security Tools

Référentiel des outils utilisés en cybersécurité.

- Nmap
- Wireshark
- tcpdump
- Burp Suite
- Metasploit
- Netcat
- Hashcat
- John the Ripper
- BloodHound
- Impacket
- Ghidra
- Frida
- ffuf
- Gobuster

Chaque outil pourra avoir sa propre fiche avec :

- Objectif
- Installation
- Fonctionnement
- Commandes principales
- Options importantes
- Exemples
- Limites
- Détection
- Défense

---

### 23 — CTF

Apprentissage pratique à travers des challenges de sécurité.

- CTF Methodology
- Web
- Crypto
- Pwn
- Reverse Engineering
- Forensics
- OSINT
- Steganography
- Misc

---


