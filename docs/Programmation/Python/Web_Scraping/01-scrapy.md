---
id: 01-scrapy
title: Scrapy
sidebar_position: 1
tags: [programmation, web]
---

# Scrapy

> **Scrapy** (2008) est un framework complet d'extraction de données web — à différencier d'une simple combinaison `requests` + `BeautifulSoup` : Scrapy fournit une architecture **asynchrone** entière (crawl de milliers de pages en parallèle), la gestion des files d'attente de requêtes, le respect automatique de `robots.txt`, l'export structuré, et un système de plugins (middlewares).

> ⚠️ Le scraping doit respecter les conditions d'utilisation des sites ciblés, le fichier `robots.txt`, et le droit applicable (RGPD pour des données personnelles, droit d'auteur pour du contenu protégé). Ce cours couvre l'outil, pas le cadre légal de chaque cas d'usage — à vérifier au cas par cas.

## Architecture : le flux de données Scrapy

```text
   ┌──────────┐   requêtes   ┌───────────┐   requête HTTP   ┌───────────┐
   │  Spider   │ ───────────▶ │  Scheduler │ ───────────────▶ │ Downloader │ ──▶ Internet
   │ (ta logique)│              │ (file d'attente)│              └───────────┘
   └──────────┘                └───────────┘                       │
        ▲                                                          │ réponse HTTP
        │              items extraits                              ▼
        │         ┌────────────────────┐                  ┌───────────┐
        └────────── Item Pipeline        ◀──────────────── │  Spider    │
                   (nettoyage, export,                      │ (parse la  │
                    stockage en base...)                    │  réponse)  │
                   └────────────────────┘                  └───────────┘
```

- **Spider** : la classe qu'on écrit, qui définit par où commencer et comment extraire les données d'une page.
- **Scheduler** : gère la file d'attente des requêtes à effectuer (avec déduplication automatique par défaut).
- **Downloader** : effectue les requêtes HTTP, en parallèle, de façon asynchrone (via Twisted).
- **Item Pipeline** : traite chaque élément extrait après le parsing (validation, nettoyage, écriture en base/fichier).

## Créer un projet

```bash
pip install scrapy
scrapy startproject monprojet
cd monprojet
scrapy genspider citations citations.exemple.com
```

## Un spider minimal

```python
# monprojet/spiders/citations.py
import scrapy

class CitationsSpider(scrapy.Spider):
    name = "citations"
    start_urls = ["https://citations.exemple.com/page/1/"]

    def parse(self, response):
        for citation in response.css("div.citation"):
            yield {
                "texte": citation.css("span.texte::text").get(),
                "auteur": citation.css("small.auteur::text").get(),
                "tags": citation.css("div.tags a.tag::text").getall(),
            }

        # Suivre le lien vers la page suivante, si elle existe
        page_suivante = response.css("li.suivant a::attr(href)").get()
        if page_suivante is not None:
            yield response.follow(page_suivante, callback=self.parse)
```

```bash
scrapy crawl citations -o resultats.json
scrapy crawl citations -o resultats.csv
```

## Sélecteurs : CSS et XPath

Scrapy accepte les deux syntaxes de sélection, souvent mélangées selon ce qui est le plus lisible pour un cas donné :

```python
response.css("div.produit h2::text").get()          # premier résultat, ou None
response.css("div.produit h2::text").getall()        # liste de tous les résultats
response.css("a::attr(href)").get()                   # extraire un attribut

response.xpath("//div[@class='produit']/h2/text()").get()
response.xpath("//a[contains(@class, 'suivant')]/@href").get()
```

`::text` et `::attr(nom)` sont des extensions Scrapy à la syntaxe CSS standard, pour extraire respectivement le texte ou un attribut plutôt que l'élément entier.

## Items : structurer les données extraites

Pour un projet plus grand qu'un simple dictionnaire, on définit des classes `Item` (validation de structure, cohérence entre spiders) :

```python
# items.py
import scrapy

class CitationItem(scrapy.Item):
    texte = scrapy.Field()
    auteur = scrapy.Field()
    tags = scrapy.Field()
```

```python
from monprojet.items import CitationItem

def parse(self, response):
    for citation in response.css("div.citation"):
        item = CitationItem()
        item["texte"] = citation.css("span.texte::text").get()
        item["auteur"] = citation.css("small.auteur::text").get()
        yield item
```

## Pipelines : traiter les items après extraction

```python
# pipelines.py
class NettoyagePipeline:
    def process_item(self, item, spider):
        item["texte"] = item["texte"].strip()
        return item

class ValidationPipeline:
    def process_item(self, item, spider):
        if not item.get("auteur"):
            raise scrapy.exceptions.DropItem("Auteur manquant")
        return item
```

```python
# settings.py
ITEM_PIPELINES = {
    "monprojet.pipelines.NettoyagePipeline": 300,
    "monprojet.pipelines.ValidationPipeline": 400,
}
```

Les nombres (`300`, `400`) définissent l'ordre d'exécution des pipelines — utile pour garantir, par exemple, que le nettoyage se fait avant la validation.

## Respecter les sites ciblés : configuration essentielle

```python
# settings.py
ROBOTSTXT_OBEY = True              # respecter robots.txt (activé par défaut avec startproject)
DOWNLOAD_DELAY = 1                  # attendre 1s entre deux requêtes vers le même domaine
CONCURRENT_REQUESTS_PER_DOMAIN = 4  # limiter la charge envoyée à un même site
USER_AGENT = "monprojet (+https://mon-contact.exemple.com)"   # s'identifier clairement
AUTOTHROTTLE_ENABLED = True         # ajuste automatiquement le rythme selon la charge du site cible
```

## Gérer des sites avec JavaScript (rendu côté client)

Scrapy télécharge le HTML brut, sans exécuter de JavaScript — insuffisant pour des sites qui construisent leur contenu dynamiquement côté client. Deux approches courantes :

- **`scrapy-playwright`** (extension) : fait rendre la page par un vrai navigateur (Playwright) avant extraction.
- Identifier et appeler directement l'**API interne** que le site utilise pour charger ses données (souvent visible via les outils réseau du navigateur), en s'épargnant le rendu JavaScript complet.

## Le shell interactif Scrapy : tester ses sélecteurs

```bash
scrapy shell "https://citations.exemple.com/page/1/"
```

Ouvre une console Python avec la réponse déjà chargée dans `response` — permet de tester des sélecteurs CSS/XPath interactivement avant de les intégrer dans un spider, plutôt que de relancer tout le crawl à chaque essai.

## Ce qu'il faut retenir

- Scrapy est un **framework** de crawl asynchrone complet (Spider → Scheduler → Downloader → Pipeline), pas juste une bibliothèque de parsing HTML.
- Sélecteurs **CSS** (`::text`, `::attr()`) ou **XPath**, au choix selon lisibilité.
- Les **pipelines** traitent les items après extraction (nettoyage, validation, export) ; leur ordre est configuré par des priorités numériques.
- `ROBOTSTXT_OBEY`, `DOWNLOAD_DELAY`, `AUTOTHROTTLE_ENABLED` sont les réglages de base pour un scraping responsable, à ne pas ignorer.
- `scrapy shell` permet de tester des sélecteurs interactivement avant de les intégrer dans le code du spider.
