---
id: 054-caddy
title: Caddy — Serveur web / HTTPS automatique
sidebar_position: 54
tags: [linux, services, web]
---

# Caddy — Serveur web / HTTPS automatique

**Caddy** est un serveur web/reverse proxy dont l'argument phare est le **HTTPS automatique** : il obtient et renouvelle seul des certificats Let's Encrypt (ou ZeroSSL) pour chaque domaine configuré, sans intervention manuelle (`certbot` intégré nativement).

## Installation

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
sudo systemctl enable --now caddy
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/caddy/Caddyfile` | Configuration principale, syntaxe minimaliste |
| `/var/lib/caddy/.local/share/caddy/` | Certificats TLS gérés automatiquement |
| `/var/log/caddy/` | Logs (si configurés explicitement) |

## Commandes utiles

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
caddy version
```

## Exemple de configuration

```caddyfile
exemple.fr {
    reverse_proxy localhost:3000
    encode gzip
}
```

Ces quatre lignes suffisent à obtenir un reverse proxy avec HTTPS automatique valide — Caddy détecte le domaine, demande le certificat Let's Encrypt et redirige HTTP→HTTPS sans configuration additionnelle.

## Sécurisation

- Le HTTPS automatique nécessite que le port 80/443 soit accessible depuis Internet pour la validation ACME — le documenter clairement dans le pare-feu.
- `header` directive pour ajouter les en-têtes de sécurité (HSTS activé par défaut par Caddy sur HTTPS).
- Isoler les certificats/clés (`/var/lib/caddy`) avec les permissions par défaut du paquet (utilisateur `caddy` dédié).

## Logs & dépannage

```bash
journalctl -u caddy -f
sudo caddy validate --config /etc/caddy/Caddyfile
```

Erreur ACME fréquente : port 80 bloqué ou déjà utilisé par un autre serveur web → le challenge HTTP-01 échoue, vérifier avec `sudo ss -tlnp | grep :80`.

## Voir aussi

- [nginx](./049-nginx.md) — alternative plus répandue mais sans HTTPS automatique natif (nécessite certbot séparément)
