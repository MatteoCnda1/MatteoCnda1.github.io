---
id: 03-fastapi
title: FastAPI
sidebar_position: 3
tags: [programmation, web]
---

# FastAPI

> **FastAPI** (2018) est un framework moderne pour construire des **API** en Python, bâti sur les *type hints* natifs du langage. Sa promesse : validation automatique des données, documentation interactive générée toute seule, et des performances élevées grâce à un cœur **asynchrone** (ASGI, pas WSGI comme [Flask](./01-flask.md)/[Django](./02-django.md) historiquement).

## Ce qui le distingue de Flask/Django

```text
   Flask / Django (WSGI, synchrone historiquement)   FastAPI (ASGI, async natif)

   Une requête = un thread/process occupé             Une requête = une coroutine,
   pendant tout le traitement                          le serveur reste libre pendant
   (même en attente d'I/O : DB, appel réseau...)        les attentes I/O (async/await)

   Validation des données : manuelle ou via            Validation automatique à partir
   une extension (Marshmallow, DRF serializers)         des type hints Python (Pydantic)

   Doc API : à écrire/générer à part                    Doc interactive (Swagger UI) générée
                                                          automatiquement, sans rien écrire
```

FastAPI repose sur deux briques : **Starlette** (le framework ASGI bas niveau, gestion des requêtes/réponses async) et **Pydantic** (validation de données à partir des annotations de type Python).

## Application minimale

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def index():
    return {"message": "Bonjour depuis FastAPI"}
```

```bash
pip install "fastapi[standard]"
fastapi dev main.py          # serveur de dev avec rechargement automatique
# Documentation interactive générée automatiquement sur :
# http://127.0.0.1:8000/docs   (Swagger UI)
# http://127.0.0.1:8000/redoc  (ReDoc)
```

## Validation automatique via les type hints

C'est le cœur de la proposition de valeur de FastAPI : déclarer le type attendu suffit à obtenir validation, conversion et documentation, sans code supplémentaire.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Utilisateur(BaseModel):
    nom: str
    age: int
    email: str | None = None      # champ optionnel

@app.post("/utilisateurs")
def creer_utilisateur(utilisateur: Utilisateur):
    # utilisateur est déjà validé : "age" est garanti être un int, etc.
    # Une requête avec un "age" non numérique renvoie automatiquement une 422
    return {"cree": utilisateur}

@app.get("/utilisateurs/{user_id}")
def get_utilisateur(user_id: int, actif: bool = True):
    # user_id est extrait de l'URL et converti en int automatiquement
    # actif est un paramètre de query string optionnel (?actif=false)
    return {"id": user_id, "actif": actif}
```

Si une requête ne respecte pas les types déclarés, FastAPI renvoie automatiquement une erreur **422 Unprocessable Entity** avec le détail de ce qui ne va pas — sans avoir écrit une seule ligne de validation manuelle.

## Asynchrone : `async def`

```python
import httpx
from fastapi import FastAPI

app = FastAPI()

@app.get("/proxy")
async def appeler_api_externe():
    async with httpx.AsyncClient() as client:
        reponse = await client.get("https://api.exemple.com/donnees")
        return reponse.json()
```

Une route peut être une fonction normale (`def`) ou asynchrone (`async def`) — FastAPI gère les deux. L'intérêt de `async def` apparaît surtout quand la route attend des opérations I/O (appels réseau, requêtes base de données async) : pendant l'attente, le serveur peut traiter d'autres requêtes au lieu de bloquer un thread entier.

## Dependency Injection

Un système d'injection de dépendances intégré, très utilisé pour l'authentification, la pagination, ou l'accès à une session de base de données :

```python
from fastapi import Depends

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/articles")
def liste_articles(db=Depends(get_db)):
    return db.query(Article).all()
```

## Organiser un projet plus grand : `APIRouter`

Équivalent des Blueprints Flask ou des apps Django, pour découper les routes en modules :

```python
# routers/utilisateurs.py
from fastapi import APIRouter

router = APIRouter(prefix="/utilisateurs", tags=["utilisateurs"])

@router.get("/")
def liste():
    return []

# main.py
from routers import utilisateurs
app.include_router(utilisateurs.router)
```

## Intégration avec un ORM (SQLAlchemy)

FastAPI ne fournit pas d'ORM (contrairement à Django) — [SQLAlchemy](../Bases_de_donnees/01-sqlalchemy.md) est le choix le plus courant, souvent combiné à Pydantic pour séparer les modèles de base de données des schémas d'API.

## Déploiement

```bash
pip install uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

`uvicorn` est le serveur ASGI le plus utilisé pour FastAPI en production (équivalent de `gunicorn` pour Flask/Django, mais compatible async).

## Ce qu'il faut retenir

- FastAPI valide et documente automatiquement les entrées/sorties à partir des **type hints Python** (via Pydantic) — moins de code, moins d'erreurs de validation manuelle.
- Cœur **ASGI/asynchrone** (`async def`), plus adapté aux charges I/O-intensives que le modèle synchrone historique de Flask/Django.
- Documentation interactive (**Swagger UI**, **ReDoc**) générée automatiquement, sans configuration.
- Pas d'ORM fourni — [SQLAlchemy](../Bases_de_donnees/01-sqlalchemy.md) est le compagnon le plus courant.
- `uvicorn` comme serveur ASGI de production, équivalent de `gunicorn` pour du WSGI.
