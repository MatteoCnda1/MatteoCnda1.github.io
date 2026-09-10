---
id: 01-dockerfile
title: Dockerfile — référence complète
sidebar_position: 1
tags: [conteneurs, outil, cheatsheet]
---

# Dockerfile — référence complète

> Un Dockerfile est une recette texte, exécutée instruction par instruction, où **chaque instruction qui touche au système de fichiers crée une nouvelle [couche](../Images/index.md)**. Comprendre ça explique la plupart des bonnes pratiques d'écriture.

## Toutes les instructions

| Instruction | Rôle |
|---|---|
| `FROM` | Image de base à partir de laquelle construire (obligatoire, première instruction) |
| `RUN` | Exécute une commande **au moment du build**, crée une couche |
| `CMD` | Commande par défaut exécutée **au démarrage du conteneur** (peut être surchargée) |
| `ENTRYPOINT` | Commande fixe exécutée au démarrage (moins facile à surcharger que `CMD`) |
| `COPY` | Copie des fichiers depuis le contexte de build vers l'image |
| `ADD` | Comme `COPY`, mais gère aussi les URLs et l'extraction automatique d'archives |
| `WORKDIR` | Définit le répertoire de travail pour les instructions suivantes |
| `ENV` | Définit une variable d'environnement (persistante dans l'image et le conteneur) |
| `ARG` | Définit une variable **disponible uniquement pendant le build** |
| `EXPOSE` | Documente le port sur lequel l'application écoute (n'ouvre rien tout seul) |
| `VOLUME` | Déclare un point de montage qui doit être un volume |
| `USER` | Définit l'utilisateur d'exécution des instructions suivantes et du conteneur |
| `LABEL` | Ajoute des métadonnées (clé/valeur) à l'image |
| `HEALTHCHECK` | Définit une commande pour vérifier la santé du conteneur |
| `ONBUILD` | Instruction déclenchée seulement quand une AUTRE image hérite de celle-ci |
| `SHELL` | Change le shell par défaut utilisé par `RUN` |
| `STOPSIGNAL` | Change le signal envoyé par `docker stop` (par défaut `SIGTERM`) |

## `CMD` vs `ENTRYPOINT` — la confusion classique

```dockerfile
# Forme "shell" (exécuté via /bin/sh -c "...") — PID 1 devient le shell,
# pas ton programme ; les signaux (SIGTERM) sont moins bien transmis
CMD python app.py

# Forme "exec" (recommandée) — le programme devient directement PID 1
CMD ["python", "app.py"]
```

- **`CMD` seul** : commande par défaut, entièrement **remplacée** si l'utilisateur en fournit une (`docker run mon-image autre-commande`).
- **`ENTRYPOINT` seul** : commande fixe, toujours exécutée ; ce que l'utilisateur ajoute après `docker run mon-image` devient des **arguments** de l'entrypoint.
- **Les deux combinés** (pattern courant) : `ENTRYPOINT` fixe le programme, `CMD` fournit des arguments **par défaut** que l'utilisateur peut surcharger.

```dockerfile
ENTRYPOINT ["python", "app.py"]
CMD ["--port", "8080"]
# docker run mon-image                 → python app.py --port 8080
# docker run mon-image --port 9090     → python app.py --port 9090
```

## `COPY` vs `ADD`

Toujours préférer `COPY`, plus explicite et prévisible. `ADD` a deux comportements magiques rarement souhaités : il télécharge une URL, et il **extrait automatiquement** les archives locales (`.tar.gz`...) — utile seulement si c'est vraiment l'intention.

## Exemple complet — build multi-stage

Le **multi-stage build** permet d'utiliser une image lourde (avec compilateur, outils de build) pour *construire* l'application, puis de ne copier que le résultat final dans une image minimale — sans embarquer les outils de build dans l'image finale.

```dockerfile
# --- Stage 1 : build ---
FROM golang:1.23 AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /app/serveur .

# --- Stage 2 : image finale, minimale ---
FROM alpine:3.20
RUN apk add --no-cache ca-certificates && \
    adduser -D -u 1000 appuser
WORKDIR /app
COPY --from=builder /app/serveur .
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O- http://localhost:8080/health || exit 1
ENTRYPOINT ["./serveur"]
```

Résultat : une image finale de quelques mégaoctets (Alpine + binaire statique), sans le compilateur Go ni le code source, sans tourner en root.

## Bonnes pratiques

### Ordonner les instructions du moins au plus volatile

Docker met en cache chaque couche ; dès qu'une instruction change, **toutes les couches suivantes sont invalidées**. Placer les instructions qui changent rarement (installation de dépendances système) en premier, et celles qui changent souvent (copie du code source) en dernier :

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .              # change rarement
RUN pip install -r requirements.txt  # couche mise en cache tant que requirements.txt ne change pas
COPY . .                             # change à chaque commit → dernière étape
CMD ["python", "app.py"]
```

### Minimiser le nombre de couches et la taille

```dockerfile
# Mauvais : 3 couches, le cache apt reste dans l'image
RUN apt update
RUN apt install -y curl
RUN rm -rf /var/lib/apt/lists/*

# Bon : une seule couche, nettoyage dans la même instruction
RUN apt update && apt install -y curl && rm -rf /var/lib/apt/lists/*
```

### `.dockerignore`

Comme `.gitignore`, évite d'envoyer des fichiers inutiles (ou sensibles) dans le **contexte de build** (tout ce qui est copiable par `COPY`) :

```text
.git
node_modules
*.log
.env
```

### Ne pas tourner en root

```dockerfile
RUN adduser -D -u 1000 appuser
USER appuser
```

Voir le cours [Container Security](../Container_security/index.md) pour l'ensemble des bonnes pratiques de durcissement.

### Utiliser des tags précis pour `FROM`

```dockerfile
# À éviter : "latest" change dans le temps, build non reproductible
FROM python:latest

# Préférer : version précise, idéalement une variante "slim"/"alpine" plus légère
FROM python:3.12.4-slim
```

## Construire l'image

```bash
docker build -t mon-image:1.0 .
docker build -f Dockerfile.prod -t mon-image:prod .
docker build --build-arg VERSION=1.2 -t mon-image .
docker build --target builder -t mon-image:debug .   # s'arrêter à un stage précis
```

## Ce qu'il faut retenir

- Chaque instruction qui touche au filesystem (`RUN`, `COPY`, `ADD`) crée une **couche** — ordonner du moins volatile au plus volatile pour profiter du cache.
- `ENTRYPOINT` (fixe) + `CMD` (arguments par défaut, surchargeables) est le pattern le plus flexible ; toujours préférer la **forme exec** (`["cmd", "arg"]`) à la forme shell.
- Le **multi-stage build** sépare la construction (image lourde, outils) du résultat final (image minimale) sans embarquer les outils de build.
- `.dockerignore`, un utilisateur non-root, et des tags de base précis (pas `latest`) sont les trois réflexes de base pour un Dockerfile propre.
