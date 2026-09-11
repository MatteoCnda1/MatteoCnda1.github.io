---
id: 056-varnish
title: Varnish — Cache HTTP
sidebar_position: 56
tags: [linux, services, web]
---

# Varnish — Cache HTTP

**Varnish** est un cache HTTP inverse (*HTTP accelerator*) placé devant un serveur web/applicatif : il met en cache les réponses en mémoire pour absorber le trafic répétitif et soulager le backend, avec un langage de configuration dédié (**VCL**, Varnish Configuration Language) très flexible.

## Installation

```bash
sudo apt install varnish
sudo systemctl enable --now varnish
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/varnish/default.vcl` | Logique de cache (VCL) |
| `/etc/default/varnish` (ou drop-in systemd) | Port d'écoute, taille du cache mémoire (`-s malloc,256m`) |

## Commandes utiles

```bash
sudo varnishd -C -f /etc/varnish/default.vcl   # Vérifier la compilation du VCL
sudo systemctl reload varnish                  # Recharge le VCL sans perdre le cache
varnishlog                                     # Suivre les requêtes en temps réel
varnishstat                                    # Statistiques de cache (hit/miss)
varnishadm vcl.list                            # VCL actuellement chargés
```

## Exemple de configuration

```vcl
vcl 4.1;
backend default {
    .host = "127.0.0.1";
    .port = "8080";
}

sub vcl_recv {
    if (req.url ~ "^/admin") {
        return (pass);   # Ne jamais mettre en cache l'admin
    }
}
```

Varnish écoute typiquement sur le port 80 et proxifie vers le backend réel (souvent nginx/Apache) sur un port interne (8080 dans l'exemple).

## Sécurisation

- Exclure explicitement (`return (pass)`) les zones sensibles (admin, API authentifiée, pages avec cookies de session) — un cache mal configuré peut servir la page d'un utilisateur à un autre (fuite de session).
- Purge/ban à la publication de contenu (`varnishadm ban`) pour éviter de servir du contenu périmé après une mise à jour.
- Varnish ne gère pas nativement le TLS (le terminer en amont via nginx/HAProxy, ou utiliser Hitch devant Varnish).
- Limiter l'accès au port d'administration (`varnishadm`, souvent en local uniquement par défaut — le garder ainsi).

## Logs & dépannage

```bash
varnishlog                          # Détail requête par requête
varnishstat                         # Ratio hit/miss du cache
journalctl -u varnish -f
sudo varnishd -C -f /etc/varnish/default.vcl   # Valider le VCL avant reload
```

## Voir aussi

- [nginx](./049-nginx.md) — backend typique derrière Varnish, ou terminaison TLS devant lui
- [redis](./070-redis.md) / [memcached](./071-memcached.md) — cache applicatif complémentaire (données), différent du cache HTTP de Varnish
