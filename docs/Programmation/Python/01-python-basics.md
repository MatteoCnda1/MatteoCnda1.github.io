---
id: 01-python-basics
title: Python - Les bases
sidebar_position: 1
tags: [programmation, scripting]
---

# Python — Les bases

## Pourquoi Python est le couteau suisse de la cybersécu

Python est devenu le langage de référence en sécurité, réseau et système pour trois raisons : il est **lisible** (on écrit vite, on relit facilement), il a un **écosystème gigantesque** (une bibliothèque pour tout : scapy pour les paquets, requests pour le web, pwntools pour l'exploitation), et il est **portable** (le même script tourne sur Kali, un serveur, un Raspberry Pi). La quasi-totalité des outils de sécurité modernes sont écrits en Python ou ont des bindings Python.

Ce cours couvre le langage lui-même (pas de bibliothèque spécifique, comme tu l'as demandé — ça viendra dans des sous-cours dédiés). L'objectif : comprendre les concepts fondamentaux et le modèle mental de Python.

Note : ce cours suppose Python 3 (Python 2 est mort depuis 2020). Sur ton système, la commande est souvent `python3`.

## Le modèle mental : tout est objet

En Python, **absolument tout est un objet** : les nombres, les chaînes, les fonctions, les classes elles-mêmes. Chaque objet a un type et des méthodes. Cette uniformité est la clé pour comprendre le langage.

```python
x = 42
print(type(x))        # <class 'int'>
print(x.bit_length()) # 6 — même un entier a des méthodes

# Une fonction est un objet qu'on peut passer, stocker, retourner
def saluer(nom):
    return f"Bonjour {nom}"

ma_fonction = saluer          # on assigne la fonction à une variable
print(ma_fonction("Matteo"))  # Bonjour Matteo
```

L'autre pilier : Python est **typé dynamiquement** mais **fortement typé**. « Dynamique » = tu ne déclares pas les types, une variable peut changer de type. « Fortement » = Python ne fait pas de conversions implicites hasardeuses (`"3" + 5` lève une erreur, contrairement à JavaScript).

## L'indentation fait la structure

Contrairement à la plupart des langages, Python n'utilise **pas d'accolades**. C'est l'**indentation** (les espaces en début de ligne) qui définit les blocs. C'est déroutant au début, mais ça force un code lisible.

```python
if age >= 18:
    print("Majeur")       # ce bloc appartient au if (indenté)
    print("Peut voter")
else:
    print("Mineur")       # ce bloc appartient au else

print("Toujours affiché")  # hors du if/else (pas indenté)
```

Règle absolue : **4 espaces par niveau, jamais de tabulations** (ou alors des tabs partout, mais pas de mélange — le mélange tabs/espaces est une erreur classique et pénible). Configure ton éditeur pour convertir les tabs en 4 espaces.

## Les types de base

```python
# Nombres
entier = 42
flottant = 3.14
complexe = 2 + 3j
grand = 10 ** 100          # Python gère nativement les très grands entiers (utile en crypto !)

# Chaînes (immuables)
texte = "réseau"
multiligne = """plusieurs
lignes"""
print(texte.upper())       # RÉSEAU
print(texte[0])            # r (indexation)
print(texte[-1])           # u (index négatif = depuis la fin)
print(texte[0:3])          # rés (slicing : du 0 au 3 exclu)

# Booléens et None
actif = True
resultat = None            # l'absence de valeur (équivalent null)

# f-strings : LA façon moderne de formater
nom = "Matteo"
port = 22
print(f"Connexion à {nom} sur le port {port}")
print(f"{port:04d}")       # 0022 (formatage : 4 chiffres, complété par des 0)
print(f"{3.14159:.2f}")    # 3.14 (2 décimales)
```

Les **f-strings** (chaînes préfixées de `f`) sont la façon moderne et lisible de construire des chaînes. Utilise-les partout.

Point important pour la crypto que tu fais : Python gère nativement les **entiers de taille arbitraire**. `10 ** 100` fonctionne sans déborder. C'est pour ça que ton RSA en Python pur est possible sans bibliothèque de grands nombres.

## Les structures de données (le cœur de Python)

Quatre structures fondamentales, à connaître parfaitement :

**Liste** (`list`) — ordonnée, modifiable, permet les doublons :

```python
ports = [22, 80, 443, 8080]
ports.append(3306)          # ajouter
ports.remove(8080)          # supprimer une valeur
ports[0] = 2222             # modifier
print(ports[1:3])           # [80, 443] (slicing)
print(len(ports))           # longueur
print(443 in ports)         # True (test d'appartenance)
```

**Tuple** (`tuple`) — comme une liste mais **immuable** (non modifiable) :

```python
adresse = ("192.168.1.1", 80)    # couple IP/port
ip, port = adresse                # unpacking : ip="192.168.1.1", port=80
```

Les tuples servent pour les données qui ne doivent pas changer (coordonnées, couples IP/port). L'**unpacking** (`ip, port = adresse`) est très idiomatique.

**Dictionnaire** (`dict`) — paires clé/valeur, ultra-utilisé :

```python
service = {
    "nom": "ssh",
    "port": 22,
    "protocole": "tcp"
}
print(service["port"])              # 22
service["actif"] = True             # ajouter/modifier
print(service.get("timeout", 30))   # 30 (valeur par défaut si clé absente)

for cle, valeur in service.items():  # itérer sur les paires
    print(f"{cle} = {valeur}")
```

Le `.get(cle, defaut)` évite les erreurs quand une clé peut être absente — préfère-le à `service[cle]` quand tu n'es pas sûr que la clé existe.

**Ensemble** (`set`) — collection non ordonnée sans doublons :

```python
ips_vues = {"10.0.0.1", "10.0.0.2"}
ips_vues.add("10.0.0.1")     # déjà présent, ignoré
print(len(ips_vues))          # 2

# Opérations d'ensemble (très pratiques pour comparer des listes)
scan1 = {22, 80, 443}
scan2 = {80, 443, 3306}
print(scan1 & scan2)          # {80, 443} — ports communs (intersection)
print(scan1 | scan2)          # tous les ports (union)
print(scan1 - scan2)          # {22} — dans scan1 mais pas scan2 (différence)
```

Les sets sont parfaits pour dédupliquer et comparer — comparer deux scans de ports, trouver les IP nouvellement apparues, etc.

## Les boucles et compréhensions

```python
# Boucle for (sur n'importe quel itérable)
for port in [22, 80, 443]:
    print(f"Test du port {port}")

for i in range(1, 255):       # range(début, fin exclue)
    ip = f"192.168.1.{i}"

# enumerate : index + valeur
for index, port in enumerate(ports):
    print(f"{index}: {port}")

# while
tentatives = 0
while tentatives < 3:
    tentatives += 1

# List comprehension : LA construction pythonique à maîtriser
carres = [x**2 for x in range(10)]                    # [0,1,4,9,...]
ports_ouverts = [p for p in ports if p < 1024]        # avec filtre
ips = [f"10.0.0.{i}" for i in range(1, 255)]          # générer des IP
```

La **list comprehension** `[expression for x in iterable if condition]` est une signature de Python. Elle remplace des boucles verbeuses par une ligne lisible. Il existe aussi les dict comprehensions `{k: v for ...}` et set comprehensions `{x for ...}`.

## Les fonctions

```python
def scan_port(host, port, timeout=1):    # timeout a une valeur par défaut
    """Teste si un port est ouvert.        <- docstring

    Args:
        host: l'adresse à tester
        port: le port TCP
        timeout: délai en secondes
    Returns:
        True si ouvert, False sinon
    """
    # ... logique ...
    return True

# Appels
scan_port("10.0.0.1", 22)                       # timeout par défaut = 1
scan_port("10.0.0.1", 22, timeout=5)            # argument nommé
scan_port(host="10.0.0.1", port=80)             # tous nommés (plus lisible)

# Nombre variable d'arguments
def logger(*args, **kwargs):
    # args = tuple des arguments positionnels
    # kwargs = dict des arguments nommés
    print(args, kwargs)
```

La **docstring** (la chaîne juste après la def) documente la fonction et est accessible via `help(scan_port)`. Prends l'habitude d'en écrire.

Les **arguments par défaut** et **nommés** rendent les appels clairs. Piège classique à connaître : ne jamais utiliser un objet mutable (liste, dict) comme valeur par défaut (`def f(x=[])`) — c'est un bug subtil qu'on verra dans l'avancé.

## Gestion des erreurs

```python
try:
    resultat = 10 / 0
except ZeroDivisionError:
    print("Division par zéro")
except (ValueError, TypeError) as e:
    print(f"Erreur de valeur ou type : {e}")
except Exception as e:
    print(f"Erreur inattendue : {e}")
else:
    print("Aucune erreur")       # exécuté si pas d'exception
finally:
    print("Toujours exécuté")    # nettoyage (fermer un fichier, une socket)
```

Python encourage le style **EAFP** (Easier to Ask Forgiveness than Permission) : essaie, et gère l'erreur si elle survient, plutôt que de tout vérifier avant. C'est souvent plus lisible et plus rapide que de multiplier les `if`.

## Lire et écrire des fichiers

```python
# LE bon pattern : with (ferme le fichier automatiquement)
with open("cibles.txt", "r") as f:
    for ligne in f:                    # itère ligne par ligne (efficace en mémoire)
        ip = ligne.strip()             # enlève le \n et les espaces
        print(ip)

# Lire tout d'un coup
with open("cibles.txt") as f:
    contenu = f.read()                 # tout le fichier en une chaîne
    lignes = f.readlines()             # liste de lignes

# Écrire
with open("rapport.txt", "w") as f:    # "w" écrase, "a" ajoute
    f.write("Scan terminé\n")

# JSON (format d'échange universel)
import json
with open("config.json") as f:
    config = json.load(f)              # JSON → dict Python
with open("resultats.json", "w") as f:
    json.dump(resultats, f, indent=2)  # dict → JSON formaté
```

Le `with open(...) as f` (context manager) garantit que le fichier est fermé même en cas d'erreur — utilise-le toujours plutôt qu'un `open()` suivi de `close()`. Le `.strip()` sur chaque ligne est un réflexe (enlever le `\n` de fin).

## Les modules et l'organisation

```python
# Importer un module de la bibliothèque standard
import os
import sys
from datetime import datetime
from pathlib import Path

print(os.getcwd())                     # répertoire courant
print(sys.argv)                        # arguments de la ligne de commande
print(datetime.now())
chemin = Path("/var/log") / "app.log"  # pathlib : manipulation moderne de chemins

# Le bloc main : code exécuté seulement si le fichier est lancé directement
if __name__ == "__main__":
    print("Script lancé directement")
    # (pas exécuté si le fichier est importé comme module)
```

Le `if __name__ == "__main__":` est un idiome fondamental : il sépare le code exécutable du code importable. Ça permet à ton fichier d'être à la fois un script (`python3 monfichier.py`) et un module réutilisable (`import monfichier`).

La **bibliothèque standard** de Python est énorme et couvre l'essentiel sans rien installer : `os`, `sys`, `socket` (réseau bas niveau), `subprocess` (lancer des commandes), `hashlib` (hachage), `re` (regex), `json`, `pathlib`, `datetime`, `collections`. On les explore dans le cours avancé.

## Ce qu'il faut retenir

- Python : **tout est objet**, typé dynamiquement mais fortement. L'**indentation** (4 espaces) structure le code.
- Les **f-strings** (`f"{var}"`) sont la façon moderne de formater. Python gère les **entiers de taille arbitraire** (précieux en crypto).
- Maîtrise les quatre structures : **list** (ordonnée, modifiable), **tuple** (immuable), **dict** (clé/valeur), **set** (unique, opérations d'ensemble pour comparer des scans).
- La **list comprehension** `[x for x in iterable if cond]` est la construction pythonique par excellence.
- Gère les fichiers avec `with open(...)`, les erreurs avec `try/except` (style EAFP), et sépare code exécutable/importable avec `if __name__ == "__main__":`.
- La **bibliothèque standard** couvre déjà énormément : `os`, `socket`, `subprocess`, `hashlib`, `re`, `json`.
