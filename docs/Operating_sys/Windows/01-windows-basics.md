---
id: 01-windows-basics
title: Windows Basics
---
# Windows — Les fondamentaux

> Base de connaissances : architecture du système, systèmes de fichiers, permissions, services/processus et accès distant sous Windows.

---

## Structure du système d'exploitation

Principaux répertoires à la racine d'une installation Windows :

| Répertoire | Fonction |
|------------|----------|
| `PerfLogs` | Peut contenir les logs de performance Windows, mais vide par défaut. |
| `Program Files` | Sur systèmes 32 bits : tous les programmes 16 et 32 bits. Sur 64 bits : uniquement les programmes 64 bits. |
| `Program Files (x86)` | Programmes 16 et 32 bits sur les éditions 64 bits de Windows. |
| `ProgramData` | Dossier **caché** contenant des données essentielles à certains programmes, accessibles quel que soit l'utilisateur. |
| `Users` | Profils utilisateurs. Contient notamment les dossiers `Public` et `Default`. |
| `Default` | Modèle de profil par défaut : tout nouvel utilisateur est créé à partir de celui-ci. |
| `Public` | Dossier de partage entre utilisateurs, partagé sur le réseau par défaut (compte réseau valide requis). |
| `AppData` | Données/paramètres applicatifs **par utilisateur** (dossier caché). Contient trois sous-dossiers. |
| `Windows` | La majorité des fichiers du système d'exploitation. |
| `System`, `System32`, `SysWOW64` | Toutes les DLL des fonctions cœur de Windows et de l'API Windows. |
| `WinSxS` | *Windows Component Store* : copie de tous les composants, mises à jour et service packs. |

### Focus sur `AppData`

| Sous-dossier | Rôle |
|--------------|------|
| `Roaming` | Données **indépendantes de la machine** qui suivent le profil (ex. dictionnaires personnalisés). Synchronisé sur les profils itinérants. |
| `Local` | Spécifique à la machine, **jamais** synchronisé sur le réseau. |
| `LocalLow` | Comme `Local` mais avec un **niveau d'intégrité plus bas** (ex. navigateur en mode protégé/sandbox). |

> 🔎 **Piège classique en 64 bits :** `System32` contient les binaires **64 bits**, tandis que `SysWOW64` (WOW = *Windows-on-Windows*) contient les binaires **32 bits**. Le nommage est contre-intuitif !

### Explorer les répertoires en ligne de commande

```cmd
dir              :: Liste le contenu d'un répertoire
tree             :: Affiche l'arborescence des dossiers/fichiers
tree /F          :: Inclut les fichiers dans l'arborescence
dir /a           :: Affiche aussi les fichiers cachés
cd <chemin>      :: Change de répertoire
```

---

## Systèmes de fichiers

### FAT32

**Avantages :**
- **Compatibilité matérielle** : ordinateurs, appareils photo, consoles, smartphones, tablettes…
- **Compatibilité multi-OS** : Windows (depuis 95), macOS et Linux.

**Inconvénients :**
- Taille de fichier limitée à **moins de 4 Go**.
- Aucune protection de données ni compression intégrée.
- Chiffrement uniquement via outils tiers.

### NTFS (*New Technology File System*)

Système de fichiers par défaut de Windows depuis **Windows NT 3.1**. Il corrige les limites de FAT32 et ajoute un meilleur support des métadonnées et de meilleures performances.

**Avantages :**
- **Fiable** : peut restaurer la cohérence du système de fichiers après une panne ou coupure.
- **Sécurité** : permissions granulaires sur fichiers **et** dossiers.
- Support de **très grandes partitions**.
- **Journalisation** intégrée : les modifications (ajout, édition, suppression) sont journalisées.

**Inconvénients :**
- La plupart des appareils mobiles ne supportent pas NTFS nativement.
- Anciens appareils (TV, appareils photo) sans support NTFS.

### Comparatif rapide

| Critère | FAT32 | NTFS | exFAT |
|---------|:-----:|:----:|:-----:|
| Taille max fichier | 4 Go | ~16 To | ~128 Po |
| Permissions | ❌ | ✅ | ❌ |
| Journalisation | ❌ | ✅ | ❌ |
| Chiffrement (EFS) | ❌ | ✅ | ❌ |
| Compatibilité multi-OS | ✅✅ | Moyenne | ✅ |

> 💡 **exFAT** est le compromis moderne pour les clés USB/cartes SD : pas de limite des 4 Go de FAT32 et compatible Windows/macOS/Linux, mais sans les fonctions de sécurité de NTFS.

---

## Permissions

### Permissions de base (NTFS)

| Type de permission | Description |
|--------------------|-------------|
| **Full Control** | Lire, écrire, modifier et supprimer fichiers/dossiers. |
| **Modify** | Lire, écrire et supprimer fichiers/dossiers. |
| **List Folder Contents** | Voir et lister dossiers/sous-dossiers + exécuter des fichiers (dossiers uniquement). |
| **Read and Execute** | Voir/lister fichiers et sous-dossiers + exécuter (hérité par fichiers et dossiers). |
| **Write** | Ajouter des fichiers et écrire dans un fichier. |
| **Read** | Voir/lister dossiers et lire le contenu d'un fichier. |
| **Traverse Folder** | Autorise/refuse le passage à travers des dossiers pour atteindre un fichier cible, même sans droit de lister le contenu intermédiaire. |

> 📌 **Exemple de Traverse Folder :** un utilisateur sans droit de lister `C:\users\bsmith\documents\webapps\backups\` peut tout de même accéder directement à `backup_02042020.zip` s'il possède la permission *Traverse Folder*.

### Integrity Control Access Control List — `icacls`

La commande `icacls` liste les permissions des fichiers/dossiers.

**Marqueurs d'héritage :**

| Marqueur | Signification |
|:--------:|---------------|
| `(CI)` | *Container Inherit* — héritage par les conteneurs (dossiers) |
| `(OI)` | *Object Inherit* — héritage par les objets (fichiers) |
| `(IO)` | *Inherit Only* — héritage uniquement (ne s'applique pas à l'objet courant) |
| `(NP)` | *Do Not Propagate* — pas de propagation de l'héritage |
| `(I)` | Permission héritée du conteneur parent |

**Permissions d'accès de base :**

| Code | Accès |
|:----:|-------|
| `F` | *Full access* — accès complet |
| `D` | *Delete access* — suppression |
| `N` | *No access* — aucun accès |
| `M` | *Modify access* — modification |
| `RX` | *Read and eXecute* — lecture et exécution |
| `R` | *Read-only* — lecture seule |
| `W` | *Write-only* — écriture seule |

**Modifier les permissions :**
```cmd
icacls C:\chemin\fichier /grant User:(F)        :: Accorde un accès complet
icacls C:\chemin\fichier /remove User           :: Retire les permissions
icacls C:\chemin\dossier /grant User:(OI)(CI)M  :: Modify avec héritage
icacls C:\chemin\fichier /deny User:(W)         :: Refuse explicitement l'écriture
```

> ⚠️ Un `/deny` explicite **prime toujours** sur un `/grant`, même hérité. C'est une source fréquente d'erreurs de configuration.

---

## Services et processus Windows

Les services Windows sont gérés par le **Service Control Manager (SCM)**, accessible via le composant MMC `services.msc`.

On peut aussi les interroger/gérer en ligne de commande via `sc.exe` ou via les cmdlets PowerShell comme `Get-Service`.

### Processus système critiques

| Processus | Description |
|-----------|-------------|
| `smss.exe` | *Session Manager SubSystem* — gère les sessions du système. |
| `csrss.exe` | *Client Server Runtime Process* — portion user-mode du sous-système Windows. |
| `wininit.exe` | Lance les processus d'initialisation en arrière-plan pour la session système. |
| `logonui.exe` | Facilite la connexion de l'utilisateur (interface de login). |
| `lsass.exe` | *Local Security Authority Subsystem* — vérifie la validité des connexions et gère l'authentification. |
| `services.exe` | Gère le démarrage et l'arrêt des services. |
| `winlogon.exe` | Gère la *secure attention sequence* (Ctrl+Alt+Suppr), le chargement du profil au logon et le verrouillage. |
| `System` | Processus système en arrière-plan exécutant le noyau Windows. |
| `svchost.exe` (RPCSS) | Héberge des services issus de DLL (Windows Update, pare-feu, Plug and Play) via le service **RPC**. |
| `svchost.exe` (DCOM/PnP) | Idem, via les services **DCOM** et **Plug and Play**. |

> 🔎 **Intérêt sécurité :** `lsass.exe` est une cible privilégiée des attaquants (extraction de credentials avec Mimikatz). Un `lsass.exe` dupliqué ou situé hors de `C:\Windows\System32\` est un indicateur de compromission.

### Examiner les services avec `sc`

```cmd
sc qc ServiceName          :: Affiche la configuration d'un service
sc query ServiceName       :: Affiche l'état d'un service
sc stop ServiceName        :: Arrête un service
sc start ServiceName       :: Démarre un service
sc sdshow ServiceName      :: Affiche les permissions (SDDL)
```

### Le Security Descriptor Definition Language (SDDL)

La sortie de `sc sdshow` est une chaîne au format **SDDL** : un enchaînement de caractères délimités par des parenthèses.

**Exemple — service Windows Update (`wuauserv`) :**
```
D:(A;;CCLCSWRPLORC;;;AU)
```

Décomposition (à lire **dans l'ordre**, pas forcément de gauche à droite comme du texte) :

| Élément | Signification |
|---------|---------------|
| `D:` | Les caractères suivants sont des permissions **DACL** (*Discretionary ACL*) |
| `A;;` | *Allowed* — l'accès est autorisé (`D` serait *Denied*) |
| `CC` | `SERVICE_QUERY_CONFIG` — interroger la config du service auprès du SCM |
| `LC` | `SERVICE_QUERY_STATUS` — interroger l'état courant |
| `SW` | `SERVICE_ENUMERATE_DEPENDENTS` — énumérer les services dépendants |
| `RP` | `SERVICE_START` — démarrer le service |
| `LO` | `SERVICE_INTERROGATE` — interroger l'état courant |
| `RC` | `READ_CONTROL` — lire le descripteur de sécurité |
| `AU` | *Authenticated Users* — le **security principal** (utilisateur/groupe concerné) |

**Structure d'une ACE (Access Control Entry) :**
```
(A ;; CCLCSWRPLORC ;;; AU)
 │        │              │
 │        │              └── Security principal (qui ?)
 │        └── Droits accordés (chaque paire de lettres = une action)
 └── Allow (A) ou Deny (D)
```

Chaque groupe de 2 caractères, entre les points-virgules, représente une action autorisée. Après le dernier `;;;`, on trouve le **security principal** (utilisateur/groupe). Ce descripteur possède trois jeux d'ACE car trois principaux différents ont chacun des permissions spécifiques.

> ⚠️ **Vecteur d'attaque :** un service dont les permissions SDDL autorisent un utilisateur non privilégié à `SERVICE_CHANGE_CONFIG` (modifier le binaire lancé) permet une **escalade de privilèges** (le service tournant souvent en `SYSTEM`).

---

## Interagir avec le système d'exploitation

### Remote Desktop Protocol (RDP)

RDP est un protocole propriétaire Microsoft permettant de se connecter à un système distant via une **interface graphique**. Le client RDP se connecte à un système cible exécutant le serveur RDP.

| Caractéristique | Détail |
|-----------------|--------|
| **Port** | `3389` (TCP/UDP) |
| **Usage** | Administration distante, télétravail (souvent via VPN) |
| **Expérience** | Accès au GUI comme si l'on était physiquement devant la machine |

> ⚠️ **Sécurité RDP :** le port 3389 exposé sur Internet est une cible majeure (bruteforce, ransomwares comme via BlueKeep). Bonnes pratiques : NLA (*Network Level Authentication*), VPN obligatoire, MFA, restriction par pare-feu, jamais d'exposition directe.

### WinRM & PowerShell Remoting

Alternative en ligne de commande à RDP pour l'administration :

| Protocole | Port | Usage |
|-----------|:----:|-------|
| WinRM (HTTP) | `5985` | *Windows Remote Management* |
| WinRM (HTTPS) | `5986` | WinRM chiffré |

```powershell
# Ouvrir une session distante
Enter-PSSession -ComputerName SERVEUR -Credential (Get-Credential)

# Exécuter une commande à distance
Invoke-Command -ComputerName SERVEUR -ScriptBlock { Get-Service }
```

---

## Compléments utiles

### CMD vs PowerShell

| | CMD (`cmd.exe`) | PowerShell |
|---|---|---|
| Nature | Interpréteur de commandes historique | Shell orienté **objets** (.NET) |
| Sortie | Texte brut | Objets manipulables |
| Scripting | `.bat` / `.cmd` | `.ps1` (bien plus puissant) |
| Cmdlets | ❌ | `Verbe-Nom` (ex. `Get-Process`) |

### Commandes de diagnostic système essentielles

```cmd
systeminfo                :: Infos complètes sur le système
hostname                  :: Nom de la machine
whoami /all               :: Utilisateur courant + privilèges + groupes
ipconfig /all             :: Configuration réseau détaillée
netstat -ano              :: Connexions réseau + PID
tasklist                  :: Liste des processus
taskkill /PID <id> /F     :: Tue un processus
sfc /scannow              :: Vérifie l'intégrité des fichiers système
```

Équivalents PowerShell :
```powershell
Get-ComputerInfo          # Infos système
Get-Process               # Processus
Get-Service               # Services
Get-NetIPConfiguration    # Config réseau
Get-LocalUser             # Utilisateurs locaux
```

### Le Registre Windows

Base de données hiérarchique de configuration du système. Éditeur : `regedit`.

| Ruche (hive) | Contenu |
|--------------|---------|
| `HKLM` (*HKEY_LOCAL_MACHINE*) | Config de la machine (tous utilisateurs) |
| `HKCU` (*HKEY_CURRENT_USER*) | Config de l'utilisateur courant |
| `HKCR` (*HKEY_CLASSES_ROOT*) | Associations de fichiers et objets COM |
| `HKU` (*HKEY_USERS*) | Profils de tous les utilisateurs |
| `HKCC` (*HKEY_CURRENT_CONFIG*) | Profil matériel courant |

> 🔎 **Intérêt forensic/sécurité :** les clés `Run`/`RunOnce` (`HKLM\...\CurrentVersion\Run`) sont des mécanismes de **persistance** classiques pour les malwares.

### Niveaux d'intégrité (Mandatory Integrity Control)

Windows attribue un niveau d'intégrité aux processus/objets pour limiter l'accès :

| Niveau | Usage typique |
|--------|---------------|
| **System** | Processus noyau/SYSTEM |
| **High** | Processus élevés (admin) |
| **Medium** | Processus utilisateur standard |
| **Low** | Sandbox (ex. navigateur en mode protégé) |
| **Untrusted** | Le plus restreint |

### Comptes et groupes intégrés

| Compte / Groupe | Rôle |
|-----------------|------|
| `SYSTEM` (NT AUTHORITY\SYSTEM) | Compte le plus privilégié (services système) |
| `Administrator` | Compte administrateur local |
| `Guest` | Compte invité (désactivé par défaut) |
| `Administrators` | Groupe avec contrôle total sur la machine |
| `Users` | Groupe des utilisateurs standards |
| `Authenticated Users` | Tout compte authentifié (le `AU` du SDDL) |
