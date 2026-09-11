---
id: 049-nginx
title: nginx — Serveur web / reverse proxy
sidebar_position: 49
tags: [linux, services, web]
---

# nginx — Serveur web / reverse proxy

**nginx** est un serveur web et reverse proxy événementiel (architecture asynchrone, un petit nombre de workers pour un très grand nombre de connexions). Utilisé aussi bien pour servir du contenu statique que comme reverse proxy/load balancer devant des applications (PHP-FPM, Node.js, Gunicorn...).

## Installation

```bash
sudo apt install nginx          # Debian/Ubuntu
sudo dnf install nginx          # RHEL/Fedora
sudo systemctl enable --now nginx
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/nginx/nginx.conf` | Configuration principale (contexte `http {}`, includes) |
| `/etc/nginx/sites-available/` + `sites-enabled/` | Vhosts (Debian/Ubuntu, activés par symlink) |
| `/etc/nginx/conf.d/` | Vhosts (RHEL, chargés automatiquement) |
| `/var/log/nginx/access.log` / `error.log` | Logs |

## Commandes utiles

```bash
sudo nginx -t                       # Vérifier la syntaxe avant de recharger
sudo systemctl reload nginx         # Recharger sans couper les connexions actives
sudo systemctl status nginx
nginx -V                            # Modules compilés
```

## Exemple de configuration

```nginx
server {
    listen 80;
    server_name exemple.fr;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Sécurisation

- Toujours `nginx -t` avant `reload` en production — une erreur de syntaxe non testée peut couper le service au prochain redémarrage.
- Terminer le TLS ici avec des paramètres modernes (`ssl_protocols TLSv1.2 TLSv1.3`), voir Certbot/Let's Encrypt.
- `server_tokens off;` pour ne pas divulguer la version dans les en-têtes.
- Limiter les requêtes (`limit_req_zone`) contre le bruteforce/DoS applicatif.
- Ajouter les en-têtes de sécurité (`X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`).
- Exécution sous un utilisateur dédié non-root (`user www-data;`), workers uniquement en écoute sur les ports nécessaires.

## Logs & dépannage

```bash
tail -f /var/log/nginx/error.log
journalctl -u nginx -f
sudo nginx -t                       # Diagnostiquer une erreur de config
```

## Voir aussi

- [HAProxy](./052-haproxy.md) et [Traefik](./053-traefik.md) — alternatives reverse proxy/load balancer
- [Varnish](./056-varnish.md) — souvent placé devant nginx comme cache HTTP
- [PHP-FPM](./057-php-fpm.md) — backend applicatif courant derrière nginx
