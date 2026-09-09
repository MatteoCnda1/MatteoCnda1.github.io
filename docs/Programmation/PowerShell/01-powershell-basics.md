---
id: 01-powershell-basics
title: PowerShell - Les bases
sidebar_position: 1
tags: [programmation, scripting]
---

# PowerShell — Les bases

## Pourquoi PowerShell est différent (et pourquoi ça compte)

Si tu viens de Bash, PowerShell va te surprendre. Là où Bash fait circuler du **texte** entre les commandes, PowerShell fait circuler des **objets**. C'est la différence fondamentale, et elle change tout.

En Bash, quand tu fais `ps aux | grep apache`, tu manipules des lignes de texte que tu dois découper à la main (avec `awk`, `cut`). En PowerShell, quand tu fais `Get-Process | Where-Object CPU -gt 100`, tu manipules de vrais objets avec des propriétés typées (`.CPU`, `.Name`, `.Id`) — pas besoin de parser du texte. C'est plus robuste : pas de galère de colonnes, d'espaces, de formats qui changent.

Pour toi en réseau/système/cybersécu, PowerShell est **incontournable côté Windows** : administration de serveurs, Active Directory, réponse à incident, et... c'est aussi l'outil offensif n°1 sur Windows (les attaquants l'adorent, d'où l'importance de le comprendre pour défendre). Depuis 2016, PowerShell est aussi multi-plateforme (PowerShell Core / `pwsh` sur Linux et macOS).

## Les cmdlets : Verbe-Nom

Les commandes PowerShell (appelées **cmdlets**, prononcé « command-lets ») suivent toutes une convention stricte **Verbe-Nom** :

```powershell
Get-Process        # obtenir les processus
Stop-Service       # arrêter un service
New-Item           # créer un élément
Set-Location       # changer de répertoire (l'équivalent de cd)
Get-Content        # lire un fichier (équivalent de cat)
```

Cette convention est une force : elle est **prévisible**. Les verbes sont standardisés (`Get`, `Set`, `New`, `Remove`, `Start`, `Stop`, `Test`...). Si tu cherches à faire quelque chose, tu peux souvent deviner le nom de la cmdlet, ou la trouver :

```powershell
Get-Command *network*        # toutes les cmdlets contenant "network"
Get-Command -Verb Get        # toutes les cmdlets qui commencent par Get
Get-Help Get-Process -Full   # l'aide complète d'une cmdlet
Get-Process | Get-Member     # LES propriétés et méthodes d'un objet (essentiel !)
```

`Get-Member` est ton meilleur ami : il te montre toutes les propriétés et méthodes d'un objet, donc tout ce que tu peux en extraire. Réflexe à avoir dès que tu découvres une nouvelle cmdlet.

## Les alias : le pont depuis Bash/CMD

PowerShell fournit des alias pour que les habitués d'autres shells ne soient pas perdus :

```powershell
ls    # alias de Get-ChildItem
cat   # alias de Get-Content
cd    # alias de Set-Location
pwd   # alias de Get-Location
rm    # alias de Remove-Item
cp    # alias de Copy-Item
ps    # alias de Get-Process
```

Pratique en interactif, mais **dans un script, écris toujours les cmdlets complètes** (`Get-ChildItem` plutôt que `ls`) : c'est plus lisible et portable (les alias peuvent différer selon les environnements).

## Le pipeline d'objets

Le cœur de PowerShell. On enchaîne les cmdlets, et ce sont des objets qui passent :

```powershell
# Les 5 processus qui consomment le plus de mémoire
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 5

# Filtrer les services arrêtés
Get-Service | Where-Object Status -eq "Stopped"

# Les fichiers de plus de 100 Mo dans un dossier
Get-ChildItem C:\ -Recurse | Where-Object Length -gt 100MB
```

Note qu'on accède directement aux propriétés (`WorkingSet`, `Status`, `Length`) sans parser quoi que ce soit. Et les unités comme `100MB`, `2GB` sont natives — pratique.

Les cmdlets de manipulation du pipeline à connaître :

- **`Where-Object`** (alias `?`) — filtre les objets selon une condition.
- **`Select-Object`** (alias `select`) — sélectionne certaines propriétés ou certains objets.
- **`Sort-Object`** (alias `sort`) — trie.
- **`ForEach-Object`** (alias `%`) — exécute une action sur chaque objet.
- **`Measure-Object`** — compte, somme, moyenne.
- **`Group-Object`** — regroupe par propriété.

```powershell
# Exemple combiné : compter les processus par nom, top 5
Get-Process | Group-Object Name | Sort-Object Count -Descending |
    Select-Object -First 5 Name, Count
```

## Variables et types

Les variables commencent par `$`. Contrairement à Bash, PowerShell a de **vrais types** :

```powershell
$nom = "Matteo"              # string
$age = 25                    # int
$actif = $true              # booléen ($true / $false)
$liste = @(1, 2, 3, 4)      # tableau
$config = @{ port = 22; host = "10.0.0.1" }   # hashtable (dictionnaire)

# Accès
Write-Output "Bonjour $nom"           # interpolation dans les guillemets doubles
Write-Output '$nom non interprété'    # simples quotes = littéral
Write-Output "$($config.port)"        # $() pour évaluer une expression dans une chaîne
```

Le `$(...)` dans une chaîne (subexpression) est important : `"$config.port"` afficherait l'objet suivi de `.port` littéralement, alors que `"$($config.port)"` évalue bien la propriété.

Variables automatiques utiles :
- `$_` ou `$PSItem` — l'objet courant dans un pipeline.
- `$?` — succès de la dernière commande.
- `$args` — les arguments d'un script/fonction.
- `$PWD`, `$HOME`, `$env:PATH` — les variables d'environnement s'accèdent via `$env:`.

## Les conditions et boucles

Syntaxe proche du C/JavaScript, avec des opérateurs particuliers :

```powershell
# Les opérateurs de comparaison sont TEXTUELS (pas de <, >)
if ($age -gt 18) { "Majeur" } else { "Mineur" }

# -eq -ne -gt -ge -lt -le  (equal, not equal, greater than...)
# -like (wildcards) -match (regex) -contains (dans un tableau)

if ($nom -like "Mat*") { "Commence par Mat" }
if ($ip -match "^\d{1,3}(\.\d{1,3}){3}$") { "Ressemble à une IPv4" }
if ($liste -contains 3) { "3 est dans la liste" }

# Boucles
foreach ($item in $liste) {
    Write-Output "Élément : $item"
}

for ($i = 1; $i -le 254; $i++) {
    Test-Connection "192.168.1.$i" -Count 1 -Quiet -TimeoutSeconds 1
}

# ForEach-Object dans un pipeline
1..254 | ForEach-Object { "192.168.1.$_" }
```

Le point qui déroute au début : **pas de `<`, `>`, `==`** pour les comparaisons (ces symboles sont réservés à la redirection). On utilise `-lt`, `-gt`, `-eq`. La logique vient de Bash d'ailleurs.

Le `1..254` génère une plage — très pratique. Et `Test-Connection` est le `ping` de PowerShell, avec `-Quiet` qui renvoie juste vrai/faux.

## Lire et écrire des fichiers

```powershell
# Lire
Get-Content fichier.txt                    # tout le fichier (tableau de lignes)
Get-Content fichier.txt -TotalCount 10     # les 10 premières lignes (head)
Get-Content fichier.txt -Tail 10           # les 10 dernières (tail)
Get-Content fichier.txt | Select-String "erreur"   # grep

# Écrire
"contenu" | Out-File rapport.txt
"ajout" | Add-Content rapport.txt          # append
Get-Process | Export-Csv processus.csv -NoTypeInformation   # export CSV natif !

# Importer du structuré
$data = Import-Csv utilisateurs.csv        # chaque ligne devient un objet
$config = Get-Content config.json | ConvertFrom-Json   # JSON → objet
```

L'export/import CSV et JSON natifs sont un gros atout : `Export-Csv` et `ConvertTo-Json` / `ConvertFrom-Json` transforment tes objets en formats d'échange sans effort. En analyse système, sortir un rapport CSV propre est trivial.

## Les fonctions

```powershell
function Test-Port {
    param(
        [string]$ComputerName,
        [int]$Port
    )

    $connexion = Test-NetConnection -ComputerName $ComputerName -Port $Port -WarningAction SilentlyContinue
    if ($connexion.TcpTestSucceeded) {
        Write-Output "Port $Port ouvert sur $ComputerName"
    } else {
        Write-Output "Port $Port fermé sur $ComputerName"
    }
}

Test-Port -ComputerName "192.168.1.1" -Port 445
```

Le bloc `param()` déclare les paramètres avec leurs types. Les appeler par nom (`-ComputerName`, `-Port`) rend le code lisible et auto-documenté. `Test-NetConnection` est la cmdlet réseau de référence (ping, test de port, tracert, tout-en-un).

## L'aide intégrée : ta ressource n°1

PowerShell a un des meilleurs systèmes d'aide de tous les shells. Utilise-le en permanence :

```powershell
Get-Help Get-Process -Examples      # des exemples concrets
Get-Help Get-Process -Online        # ouvre la doc en ligne
Update-Help                         # mettre à jour l'aide locale
Get-Command -Module NetTCPIP        # les cmdlets d'un module réseau
```

Combiné à `Get-Member` (pour voir les propriétés d'un objet), tu peux explorer et apprendre PowerShell sans quitter le terminal.

## Ce qu'il faut retenir

- PowerShell fait circuler des **objets typés**, pas du texte — pas besoin de parser, on accède aux propriétés directement (`.Status`, `.Length`).
- Les **cmdlets** suivent la convention **Verbe-Nom** (`Get-Process`, `Stop-Service`), ce qui les rend prévisibles.
- `Get-Member` (propriétés d'un objet), `Get-Command` (trouver une cmdlet) et `Get-Help` (documentation) sont tes trois outils d'exploration.
- Le pipeline se manipule avec `Where-Object` (filtrer), `Select-Object` (choisir), `Sort-Object`, `ForEach-Object`, `Group-Object`.
- Les comparaisons sont **textuelles** : `-eq`, `-gt`, `-like`, `-match` (pas de `==`, `<`, `>`).
- Import/export **CSV et JSON natifs** rendent les rapports et échanges de données triviaux.
- `Test-NetConnection` est la cmdlet réseau tout-en-un ; les alias (`ls`, `cat`, `cd`) dépannent en interactif mais s'évitent dans les scripts.
