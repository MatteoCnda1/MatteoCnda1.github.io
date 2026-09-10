---
id: 02-django
title: Django
sidebar_position: 2
tags: [programmation, web]
---

# Django

> **Django** (2005) est un framework web Python "batteries incluses" : ORM, système d'authentification, interface d'administration auto-générée, protection CSRF/XSS par défaut, framework de formulaires... À l'opposé de la légèreté de [Flask](./01-flask.md), Django vise la productivité sur des applications complètes dès le départ.

## L'architecture MTV (Model-Template-View)

Django utilise une variante du pattern MVC, appelée **MTV** (Model-Template-View) — la terminologie diffère du MVC classique mais le principe est proche :

```text
   Requête HTTP
        │
        ▼
   URLconf (urls.py)          → route l'URL vers la bonne View
        │
        ▼
   View (views.py)            → logique métier, orchestre Model et Template
        │            │
        ▼            ▼
   Model (models.py)   Template (fichiers .html)
   → accès aux données    → génère le HTML final
   (via l'ORM)
        │            │
        └─────┬──────┘
              ▼
        Réponse HTTP
```

- **Model** : classe Python représentant une table de base de données (l'équivalent Django du "M" de MVC).
- **View** : une fonction ou classe qui reçoit la requête, exécute la logique, retourne une réponse (l'équivalent Django du "C" — le nom "View" est trompeur pour qui connaît le MVC classique).
- **Template** : fichier HTML avec le langage de template Django, qui génère le rendu final (l'équivalent Django du "V").

## Démarrer un projet

```bash
pip install django
django-admin startproject monsite
cd monsite
python manage.py startapp blog       # une "app" = un module fonctionnel du projet

python manage.py runserver           # serveur de dev, http://127.0.0.1:8000
```

Un projet Django est composé d'**apps** réutilisables — un projet e-commerce pourrait avoir les apps `catalogue`, `panier`, `paiement`, chacune avec ses propres modèles, vues, templates.

## Models : l'ORM Django

```python
# blog/models.py
from django.db import models

class Article(models.Model):
    titre = models.CharField(max_length=200)
    contenu = models.TextField()
    date_publication = models.DateTimeField(auto_now_add=True)
    auteur = models.ForeignKey("auth.User", on_delete=models.CASCADE)

    def __str__(self):
        return self.titre
```

L'ORM traduit ces classes Python en tables SQL, et génère les requêtes sans écrire de SQL directement :

```python
Article.objects.all()
Article.objects.filter(auteur__username="alice")
Article.objects.get(id=1)
Article.objects.create(titre="Mon article", contenu="...", auteur=user)

article = Article.objects.get(id=1)
article.titre = "Nouveau titre"
article.save()
article.delete()
```

## Migrations : versionner le schéma de base de données

Django génère et applique automatiquement les changements de schéma à partir des modèles :

```bash
python manage.py makemigrations      # génère les fichiers de migration à partir des modèles
python manage.py migrate             # applique les migrations à la base de données
python manage.py sqlmigrate blog 0001  # voir le SQL généré, sans l'exécuter
```

## Views (fonctions ou classes)

```python
# blog/views.py
from django.shortcuts import render, get_object_or_404
from .models import Article

def liste_articles(request):
    articles = Article.objects.all()
    return render(request, "blog/liste.html", {"articles": articles})

def detail_article(request, article_id):
    article = get_object_or_404(Article, id=article_id)
    return render(request, "blog/detail.html", {"article": article})
```

Django propose aussi des **Class-Based Views (CBV)** pour les cas standards (liste, détail, création, mise à jour) sans réécrire la logique à chaque fois :

```python
from django.views.generic import ListView

class ArticleListView(ListView):
    model = Article
    template_name = "blog/liste.html"
    context_object_name = "articles"
```

## URLconf : router les URLs

```python
# blog/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("", views.liste_articles, name="liste"),
    path("<int:article_id>/", views.detail_article, name="detail"),
]

# monsite/urls.py (racine)
from django.urls import include, path

urlpatterns = [
    path("blog/", include("blog.urls")),
    path("admin/", admin.site.urls),
]
```

## L'interface d'administration auto-générée

Un des atouts les plus connus de Django : une interface CRUD complète générée automatiquement à partir des modèles, en quelques lignes :

```python
# blog/admin.py
from django.contrib import admin
from .models import Article

admin.site.register(Article)
```

```bash
python manage.py createsuperuser
# puis http://127.0.0.1:8000/admin/
```

## Formulaires et validation

```python
from django import forms

class ArticleForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = ["titre", "contenu"]
```

Django gère automatiquement le rendu HTML du formulaire, la validation côté serveur, et la protection **CSRF** (obligatoire par défaut sur tout formulaire POST).

## Django REST Framework (DRF) — pour des API

Django seul génère des pages HTML ; pour exposer une API JSON, l'extension quasi-standard est **Django REST Framework** :

```python
from rest_framework import serializers, viewsets

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = "__all__"

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
```

## Ce qu'il faut retenir

- Django suit le pattern **MTV** (Model-Template-View), l'équivalent Django du MVC classique.
- L'**ORM** traduit des classes Python en tables SQL ; `makemigrations`/`migrate` versionnent le schéma sans écrire de SQL à la main.
- Un projet Django se découpe en **apps** réutilisables, chacune avec ses modèles/vues/templates.
- L'**interface d'admin** auto-générée et **Django REST Framework** (pour les API) sont deux des plus gros atouts pratiques de l'écosystème.
- Sécurité (CSRF, XSS, injection SQL via l'ORM) gérée par défaut — cohérent avec la philosophie "batteries incluses".
