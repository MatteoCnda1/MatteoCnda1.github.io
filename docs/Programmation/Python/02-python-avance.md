---
id: 02-python-avance
title: Python - Avancé
sidebar_position: 2
---

# Python — Avancé

Les bases acquises, on passe aux concepts qui distinguent le code Python amateur du code solide, avec un focus sur ce qui sert en réseau/système/cybersécu. On reste sur le langage et sa bibliothèque standard (les bibliothèques tierces comme scapy, requests, pwntools feront l'objet de sous-cours dédiés).

## Le modèle mémoire : références et mutabilité

C'est LE concept qui cause le plus de bugs subtils. En Python, une variable n'est pas une boîte contenant une valeur : c'est une **étiquette** pointant vers un objet en mémoire.

```python
a = [1, 2, 3]
b = a            # b et a pointent vers LA MÊME liste
b.append(4)
print(a)         # [1, 2, 3, 4] — a a changé aussi !

# Pour une vraie copie
import copy
b = a.copy()             # copie superficielle (shallow)
b = copy.deepcopy(a)     # copie profonde (récursive)
```

La distinction **mutable / immuable** est centrale :

- **Immuables** : `int`, `float`, `str`, `tuple`, `frozenset`. On ne peut pas les modifier en place ; toute « modification » crée un nouvel objet.
- **Mutables** : `list`, `dict`, `set`, et la plupart des objets custom.

Le piège classique — l'argument par défaut mutable :

```python
# BUG : le dict par défaut est créé UNE fois et partagé entre tous les appels
def ajouter(element, liste=[]):
    liste.append(element)
    return liste

print(ajouter(1))    # [1]
print(ajouter(2))    # [1, 2] !!! la liste a persisté entre les appels

# CORRECT
def ajouter(element, liste=None):
    if liste is None:
        liste = []
    liste.append(element)
    return liste
```

Ce bug mord tous les débutants. Retiens : **jamais de valeur par défaut mutable** ; utilise `None` comme sentinelle.

Note aussi `is` vs `==` : `==` compare les **valeurs**, `is` compare l'**identité** (même objet en mémoire). On utilise `is` uniquement pour `None` (`if x is None:`), jamais pour comparer des valeurs.

## Itérateurs et générateurs

Un **générateur** produit les valeurs une à une, à la demande, au lieu de tout construire en mémoire. Crucial quand tu traites de gros volumes (logs de plusieurs Go, scans de plages entières).

```python
# Une list comprehension construit TOUT en mémoire
carres_liste = [x**2 for x in range(10_000_000)]     # ~400 Mo en RAM

# Un générateur (parenthèses au lieu de crochets) ne stocke rien
carres_gen = (x**2 for x in range(10_000_000))        # quasi 0 mémoire
for c in carres_gen:                                   # produit à la volée
    ...

# Fonction génératrice avec yield
def lire_gros_log(chemin):
    with open(chemin) as f:
        for ligne in f:
            if "ERROR" in ligne:
                yield ligne.strip()      # produit une valeur, met en pause, reprend

# Traite un fichier de 10 Go sans jamais le charger entièrement
for erreur in lire_gros_log("/var/log/enorme.log"):
    print(erreur)
```

Le mot-clé `yield` transforme une fonction en générateur : elle « produit » des valeurs une par une et se met en pause entre chaque. C'est la façon pythonique de traiter des flux de données volumineux — indispensable en analyse de logs.

Le module `itertools` complète ça avec des outils puissants (`chain`, `islice`, `product`, `combinations`) pour composer des itérateurs.

## Les décorateurs

Un **décorateur** est une fonction qui enveloppe une autre fonction pour lui ajouter un comportement, sans modifier son code. On les reconnaît au `@`.

```python
import time
from functools import wraps

def chronometrer(fonction):
    @wraps(fonction)                     # préserve le nom/docstring de la fonction
    def wrapper(*args, **kwargs):
        debut = time.perf_counter()
        resultat = fonction(*args, **kwargs)
        duree = time.perf_counter() - debut
        print(f"{fonction.__name__} a pris {duree:.4f}s")
        return resultat
    return wrapper

@chronometrer                            # applique le décorateur
def scanner_reseau(plage):
    time.sleep(1)                        # simule un scan
    return "terminé"

scanner_reseau("192.168.1.0/24")         # affiche automatiquement le temps pris
```

Les décorateurs sont partout : `@property`, `@staticmethod`, les frameworks web (`@app.route` en Flask que tu as utilisé), le caching (`@functools.lru_cache` pour mémoriser les résultats). Comprendre qu'une fonction peut recevoir et retourner une fonction est la clé.

## La programmation orientée objet

```python
class Hote:
    """Représente un hôte du réseau."""

    def __init__(self, ip, hostname=None):     # constructeur
        self.ip = ip                            # attribut d'instance
        self.hostname = hostname
        self.ports_ouverts = []

    def ajouter_port(self, port):               # méthode
        self.ports_ouverts.append(port)

    def __repr__(self):                         # représentation pour le debug
        return f"Hote({self.ip}, ports={self.ports_ouverts})"

    def __eq__(self, autre):                    # définir l'égalité
        return self.ip == autre.ip

# Utilisation
h = Hote("192.168.1.1", "gateway")
h.ajouter_port(22)
print(h)                                        # Hote(192.168.1.1, ports=[22])
```

Les méthodes `__init__`, `__repr__`, `__eq__` sont des **dunder methods** (double underscore) qui définissent le comportement de l'objet avec les opérations du langage. `__repr__` est particulièrement utile en debug.

L'**héritage** permet de spécialiser :

```python
class Serveur(Hote):                            # Serveur hérite de Hote
    def __init__(self, ip, service):
        super().__init__(ip)                    # appelle le constructeur parent
        self.service = service
```

Pour des classes qui ne servent qu'à stocker des données, les **dataclasses** évitent le boilerplate :

```python
from dataclasses import dataclass

@dataclass
class Vulnerabilite:
    cve: str
    severite: float
    description: str = ""                        # valeur par défaut

v = Vulnerabilite("CVE-2024-1234", 9.8)
print(v)   # Vulnerabilite(cve='CVE-2024-1234', severite=9.8, description='')
# __init__, __repr__, __eq__ générés automatiquement
```

## Programmation réseau et système (bibliothèque standard)

C'est là que Python brille pour ton domaine. Sans rien installer :

```python
import socket

# Test de port TCP
def port_ouvert(host, port, timeout=1):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(timeout)
        return s.connect_ex((host, port)) == 0    # 0 = connexion réussie

# Résolution DNS
ip = socket.gethostbyname("example.com")
nom = socket.gethostbyaddr("8.8.8.8")

# Lancer des commandes système proprement
import subprocess
resultat = subprocess.run(
    ["nmap", "-sn", "192.168.1.0/24"],
    capture_output=True, text=True, timeout=60
)
print(resultat.stdout)
```

**Point de sécurité crucial sur `subprocess`** : utilise **toujours** la forme avec une **liste d'arguments** (`["nmap", "-sn", cible]`), **jamais** `shell=True` avec une chaîne construite à partir d'entrées utilisateur. `subprocess.run(f"ping {cible}", shell=True)` avec `cible = "8.8.8.8; rm -rf /"` exécute la commande injectée — c'est une **command injection**, une des failles les plus graves. La forme liste passe les arguments directement au programme sans passer par le shell, donc pas d'injection possible.

Le hachage, directement dans la stdlib :

```python
import hashlib
import hmac

# Hash d'un fichier (par blocs, pour les gros fichiers)
def hash_fichier(chemin):
    h = hashlib.sha256()
    with open(chemin, "rb") as f:
        for bloc in iter(lambda: f.read(8192), b""):
            h.update(bloc)
    return h.hexdigest()

# HMAC (cf. ton cours crypto) avec comparaison en temps constant
mac = hmac.new(b"cle", b"message", hashlib.sha256).hexdigest()
valide = hmac.compare_digest(mac, mac_recu)      # jamais == pour comparer des MAC
```

## Les expressions régulières

Indispensables pour parser des logs, extraire des IP, valider des formats :

```python
import re

texte = "Connexion depuis 192.168.1.42 sur le port 443"

# Extraire une IP
ip = re.search(r"\d{1,3}(?:\.\d{1,3}){3}", texte)
if ip:
    print(ip.group())                # 192.168.1.42

# Trouver toutes les occurrences
ips = re.findall(r"\d{1,3}(?:\.\d{1,3}){3}", log_complet)

# Compiler une regex réutilisée (plus rapide en boucle)
motif_ip = re.compile(r"\d{1,3}(?:\.\d{1,3}){3}")
for ligne in fichier:
    if motif_ip.search(ligne):
        ...

# Groupes nommés pour parser du structuré
motif = re.compile(r"(?P<ip>\d+\.\d+\.\d+\.\d+).*?(?P<code>\d{3})")
m = motif.search(ligne_apache)
if m:
    print(m.group("ip"), m.group("code"))
```

Le préfixe `r"..."` (raw string) évite d'échapper les backslashes — utilise-le toujours pour les regex. Compile les motifs réutilisés en boucle pour la performance.

## Environnements virtuels et gestion des dépendances

Réflexe professionnel indispensable : **jamais installer de paquets globalement**. Chaque projet a son environnement isolé :

```bash
python3 -m venv venv              # crée un environnement virtuel
source venv/bin/activate          # l'active (Linux/Mac)
# venv\Scripts\activate            # (Windows)
pip install requests scapy        # installe DANS l'environnement
pip freeze > requirements.txt     # fige les versions
deactivate                        # sort de l'environnement
```

Ça évite les conflits de versions entre projets et garde ton système propre. Sur Kali ou un serveur partagé, c'est encore plus important. L'outil moderne `uv` ou `pipx` (pour installer des outils CLI) va plus loin.

## Concurrence : threads, async, processus

Point délicat de Python : le **GIL** (Global Interpreter Lock) empêche deux threads d'exécuter du bytecode Python simultanément. Conséquence :

- **Tâches I/O-bound** (réseau, disque — l'essentiel en scan/pentest) : les threads ou `asyncio` fonctionnent bien, car pendant qu'un thread attend une réponse réseau, un autre travaille.
- **Tâches CPU-bound** (calcul lourd, cracking) : les threads n'accélèrent rien à cause du GIL ; il faut le `multiprocessing` (vrais processus séparés).

```python
from concurrent.futures import ThreadPoolExecutor

def scan(port):
    return port, port_ouvert("192.168.1.1", port)

# Scanner 1000 ports en parallèle (I/O-bound → threads efficaces)
with ThreadPoolExecutor(max_workers=100) as executor:
    resultats = executor.map(scan, range(1, 1001))
    ouverts = [p for p, ok in resultats if ok]
```

`ThreadPoolExecutor` est la façon simple de paralléliser des tâches réseau. Pour du calcul intensif, remplace par `ProcessPoolExecutor`. `asyncio` (avec `async`/`await`) est l'alternative moderne pour la concurrence I/O massive.

## Ce qu'il faut retenir

- **Modèle mémoire** : une variable est une référence ; distingue mutable/immuable ; jamais de défaut mutable (`def f(x=None)`), et `is` seulement pour `None`.
- Les **générateurs** (`yield`, parenthèses) traitent de gros volumes sans saturer la mémoire — indispensable pour les logs.
- Les **décorateurs** (`@`) ajoutent du comportement à une fonction ; base des frameworks et du caching.
- POO : dunder methods (`__init__`, `__repr__`), héritage (`super()`), **dataclasses** pour les objets de données.
- Réseau/système en stdlib : `socket`, `subprocess` (**toujours liste d'args, jamais `shell=True` sur entrée non fiable** → command injection), `hashlib`/`hmac`.
- **Regex** avec raw strings et motifs compilés pour parser logs et extraire des IP.
- **Toujours un venv** par projet ; jamais d'install globale.
- **Concurrence** : threads/asyncio pour l'I/O (scans), multiprocessing pour le CPU (le GIL bride les threads sur le calcul).
