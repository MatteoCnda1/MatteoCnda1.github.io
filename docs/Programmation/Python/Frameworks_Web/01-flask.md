---
id: 01-flask
title: Flask
sidebar_position: 1
tags: [programmation, web]
---

# Flask

> **Flask** (2010) est un *micro-framework* web Python : il fournit le strict nécessaire (routage, requêtes/réponses, templates) et laisse le développeur choisir le reste (ORM, authentification, validation...) via des extensions. À l'opposé de la philosophie "batteries incluses" de [Django](./02-django.md).

## Philosophie : micro-framework

```text
              Django (batteries incluses)         Flask (micro-framework)

   ┌─────────────────────────────────┐     ┌─────────────────────────┐
   │  ORM intégré                      │     │  Routage + requêtes/       │
   │  Système d'admin                  │     │  réponses (le cœur)        │
   │  Authentification                 │     │                             │
   │  Formulaires                      │     │  Tout le reste : au choix   │
   │  Templates                        │     │  via extensions             │
   │  Routage                          │     │  (SQLAlchemy, Flask-Login,  │
   │  ... tout fourni par défaut       │     │   Flask-WTF, Marshmallow…)  │
   └─────────────────────────────────┘     └─────────────────────────┘
```

Ce choix rend Flask très lisible pour de petites applications ou des API simples, au prix de devoir choisir et assembler soi-même les briques pour un projet plus gros.

## Application minimale

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def index():
    return "Bonjour depuis Flask"

if __name__ == "__main__":
    app.run(debug=True)
```

```bash
pip install flask
python app.py                      # serveur de dev sur http://127.0.0.1:5000
flask --app app run --debug        # équivalent via la CLI Flask
```

## Le cycle requête → réponse

```text
   Requête HTTP entrante
          │
          ▼
   Routage (@app.route) → trouve la fonction "vue" correspondante
          │
          ▼
   Exécution de la fonction (accès à `request`, logique métier)
          │
          ▼
   Retour : string / dict (JSON auto) / objet Response / template rendu
          │
          ▼
   Réponse HTTP envoyée au client
```

## Routage et méthodes HTTP

```python
from flask import request, jsonify

@app.route("/utilisateurs/<int:user_id>")
def get_utilisateur(user_id):
    return jsonify({"id": user_id, "nom": "Alice"})

@app.route("/utilisateurs", methods=["POST"])
def creer_utilisateur():
    donnees = request.get_json()
    return jsonify({"cree": donnees}), 201
```

- `<int:user_id>` : convertisseur de type dans l'URL (aussi `<string:...>`, `<float:...>`, `<path:...>`).
- `request` : objet global (thread-local) donnant accès aux données de la requête en cours — `request.args` (query string), `request.form` (formulaire), `request.get_json()` (corps JSON).
- Retourner un `dict` est automatiquement sérialisé en JSON.

## Templates avec Jinja2

Flask utilise **Jinja2** comme moteur de templates par défaut, avec héritage de templates et échappement automatique (protection XSS) :

```python
from flask import render_template

@app.route("/profil/<nom>")
def profil(nom):
    return render_template("profil.html", nom=nom)
```

```jinja2
{# templates/profil.html #}
<h1>Bonjour {{ nom }}</h1>
{% if nom == "admin" %}
  <p>Accès administrateur</p>
{% endif %}
```

## Organiser une application plus grande : Blueprints

Au-delà d'un petit script, on découpe l'application en **blueprints** (modules de routes réutilisables) :

```python
# routes/utilisateurs.py
from flask import Blueprint

bp = Blueprint("utilisateurs", __name__, url_prefix="/utilisateurs")

@bp.route("/")
def liste():
    return "Liste des utilisateurs"

# app.py
from routes.utilisateurs import bp as utilisateurs_bp
app.register_blueprint(utilisateurs_bp)
```

## Extensions courantes de l'écosystème

| Extension | Rôle |
|---|---|
| **Flask-SQLAlchemy** | Intégration de [SQLAlchemy](../Bases_de_donnees/01-sqlalchemy.md) comme ORM |
| **Flask-Login** | Gestion de sessions utilisateur/authentification |
| **Flask-WTF** | Formulaires et validation, protection CSRF |
| **Flask-Migrate** | Migrations de schéma de base de données (via Alembic) |
| **Marshmallow** | Sérialisation/validation de données (souvent pour des API) |

## Gestion des erreurs

```python
@app.errorhandler(404)
def page_non_trouvee(erreur):
    return jsonify({"erreur": "Ressource introuvable"}), 404
```

## Déploiement : ne jamais utiliser le serveur de dev en production

```bash
# Le serveur intégré (app.run()) n'est PAS pensé pour la charge/sécurité de prod.
# En production : un serveur WSGI comme gunicorn, derrière un reverse-proxy (nginx)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

## Ce qu'il faut retenir

- Flask est un **micro-framework** : routage et gestion HTTP au cœur, tout le reste via des **extensions** choisies au cas par cas.
- Le décorateur `@app.route` associe une URL à une fonction "vue" ; `request` donne accès aux données entrantes.
- **Jinja2** gère les templates avec héritage et échappement automatique.
- **Blueprints** pour structurer une application au-delà d'un simple script.
- En production, toujours passer par un serveur WSGI (`gunicorn`) derrière un reverse-proxy, jamais `app.run()`.
