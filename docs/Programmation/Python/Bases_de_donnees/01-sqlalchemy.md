---
id: 01-sqlalchemy
title: SQLAlchemy
sidebar_position: 1
tags: [programmation, sql]
---

# SQLAlchemy

> **SQLAlchemy** (2006) est la bibliothèque de référence pour parler à une base de données relationnelle en Python — utilisée seule, ou comme moteur derrière l'ORM de [Flask](../Frameworks_Web/01-flask.md) (Flask-SQLAlchemy) ou de [FastAPI](../Frameworks_Web/03-fastapi.md). Elle propose en réalité **deux niveaux** d'abstraction bien distincts.

## Les deux couches de SQLAlchemy

```text
   Niveau ORM (haut niveau)
   → Classes Python ↔ tables, objets ↔ lignes, requêtes en Python
        │
        ▼
   Core / Expression Language (niveau intermédiaire)
   → Construire des requêtes SQL en Python, sans ORM, sans classes
        │
        ▼
   DBAPI (pilote de base de données : psycopg2, pymysql, sqlite3...)
   → Communication réseau réelle avec le SGBD
```

La plupart des projets utilisent l'**ORM**, mais Core reste accessible pour des requêtes complexes où l'ORM devient un obstacle plutôt qu'une aide.

## Se connecter : le moteur (`Engine`)

```python
from sqlalchemy import create_engine

moteur = create_engine("postgresql://user:motdepasse@localhost/madb")
moteur_sqlite = create_engine("sqlite:///local.db")
moteur_mysql = create_engine("mysql+pymysql://user:motdepasse@localhost/madb")
```

Le format d'URL encode le dialecte SQL (`postgresql`, `mysql`, `sqlite`...) et le pilote sous-jacent (`+pymysql`) — SQLAlchemy adapte automatiquement le SQL généré aux spécificités de chaque SGBD.

## Définir des modèles (ORM déclaratif)

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String

class Base(DeclarativeBase):
    pass

class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id: Mapped[int] = mapped_column(primary_key=True)
    nom: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(unique=True)

    commandes: Mapped[list["Commande"]] = relationship(back_populates="utilisateur")

class Commande(Base):
    __tablename__ = "commandes"

    id: Mapped[int] = mapped_column(primary_key=True)
    montant: Mapped[float]
    utilisateur_id: Mapped[int] = mapped_column(ForeignKey("utilisateurs.id"))

    utilisateur: Mapped[Utilisateur] = relationship(back_populates="commandes")

Base.metadata.create_all(moteur)     # crée les tables si elles n'existent pas
```

`relationship()` définit le lien objet-à-objet (`utilisateur.commandes` donne la liste des commandes) séparément de la clé étrangère SQL (`ForeignKey`, la contrainte réelle en base) — les deux travaillent ensemble mais ne sont pas la même chose.

## Sessions : la unité de travail

Toute interaction avec la base passe par une **Session**, qui suit les objets modifiés et les synchronise en base au bon moment :

```python
from sqlalchemy.orm import Session

with Session(moteur) as session:
    # Créer
    nouvel_utilisateur = Utilisateur(nom="Alice", email="alice@exemple.com")
    session.add(nouvel_utilisateur)
    session.commit()

    # Lire
    utilisateur = session.get(Utilisateur, 1)

    # Modifier — pas besoin d'appel explicite "update", la session détecte le changement
    utilisateur.nom = "Alice Dupont"
    session.commit()

    # Supprimer
    session.delete(utilisateur)
    session.commit()
```

## Requêtes avec l'ORM

```python
from sqlalchemy import select

# Équivalent de : SELECT * FROM utilisateurs WHERE nom = 'Alice'
stmt = select(Utilisateur).where(Utilisateur.nom == "Alice")
resultat = session.execute(stmt).scalars().all()

# Jointure implicite via la relation
stmt = select(Commande).join(Utilisateur).where(Utilisateur.email == "alice@exemple.com")

# Tri, limite
stmt = select(Utilisateur).order_by(Utilisateur.nom).limit(10)
```

Depuis SQLAlchemy 2.0, la syntaxe `select()` (Core-like) a remplacé l'ancienne API `Query` comme façon recommandée d'écrire des requêtes ORM — plus proche du SQL, plus explicite sur ce qui est exécuté.

## Migrations avec Alembic

SQLAlchemy ne gère pas lui-même l'évolution du schéma dans le temps — **Alembic** (même auteur, outil compagnon) s'en charge, sur le même principe que les migrations Django vues dans le cours [Django](../Frameworks_Web/02-django.md) :

```bash
pip install alembic
alembic init migrations
alembic revision --autogenerate -m "ajout table commandes"
alembic upgrade head
```

## Le piège du problème N+1

```python
# Sans précaution : 1 requête pour les utilisateurs, PUIS 1 requête PAR utilisateur
# pour accéder à .commandes (déclenchée à chaque accès) → N+1 requêtes au total
utilisateurs = session.execute(select(Utilisateur)).scalars().all()
for u in utilisateurs:
    print(u.commandes)     # une requête SQL supplémentaire à CHAQUE itération

# Avec chargement anticipé : tout est récupéré en 1 (ou 2) requêtes, en amont
from sqlalchemy.orm import selectinload

stmt = select(Utilisateur).options(selectinload(Utilisateur.commandes))
utilisateurs = session.execute(stmt).scalars().all()
for u in utilisateurs:
    print(u.commandes)     # déjà chargé, aucune requête supplémentaire
```

Le **problème N+1** est l'un des pièges de performance les plus classiques avec n'importe quel ORM — `selectinload`/`joinedload` permettent de contrôler explicitement quand les relations sont chargées.

## Ce qu'il faut retenir

- Deux niveaux : **ORM** (classes ↔ tables, le plus utilisé) et **Core** (requêtes SQL en Python, sans classes) — l'un n'exclut pas l'autre dans un même projet.
- La **Session** suit les objets modifiés et synchronise avec la base au `commit()` — pas besoin d'appeler explicitement un "update".
- **Alembic** gère les migrations de schéma, séparément de SQLAlchemy lui-même.
- Le **problème N+1** (une requête supplémentaire par relation accédée en boucle) se résout avec `selectinload`/`joinedload` pour charger les relations en amont.
