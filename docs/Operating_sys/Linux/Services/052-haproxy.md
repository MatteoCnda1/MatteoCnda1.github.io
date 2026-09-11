---
id: 052-haproxy
title: haproxy — Load balancer / proxy
sidebar_position: 52
tags: [linux, services, web]
---

# haproxy — Load balancer / proxy

**HAProxy** est un répartiteur de charge et proxy TCP/HTTP haute performance, référence dans les infrastructures à haute disponibilité (répartition entre plusieurs backends, health checks, terminaison TLS).

## Installation

```bash
sudo apt install haproxy
sudo systemctl enable --now haproxy
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/haproxy/haproxy.cfg` | Configuration unique (sections `global`, `defaults`, `frontend`, `backend`) |
| `/var/log/haproxy.log` | Logs (souvent via rsyslog, voir plus bas) |

## Commandes utiles

```bash
sudo haproxy -c -f /etc/haproxy/haproxy.cfg   # Vérifier la syntaxe
sudo systemctl reload haproxy
echo "show stat" | sudo socat stdio /run/haproxy/admin.sock   # Socket d'admin (si activé)
```

## Exemple de configuration

```
frontend web
    bind *:80
    default_backend app_servers

backend app_servers
    balance roundrobin
    option httpchk GET /health
    server app1 10.0.0.11:3000 check
    server app2 10.0.0.12:3000 check
```

## Sécurisation

- Restreindre l'accès au socket d'admin/stats (`stats socket ... mode 600`, `stats auth user:pass`).
- Toujours `haproxy -c` avant `reload` — une erreur de config peut empêcher le redémarrage.
- Limiter les connexions (`maxconn`) au niveau global et par frontend pour absorber un pic sans effondrer les backends.
- Health checks (`option httpchk`) pour retirer automatiquement un backend défaillant de la rotation.
- Terminer le TLS ici plutôt que sur chaque backend, avec des paramètres modernes (`ssl-min-ver TLSv1.2`).

## Logs & dépannage

HAProxy logue par défaut via **syslog** — nécessite une configuration rsyslog dédiée (`local0`/`local2`) :

```bash
journalctl -u haproxy -f
# Si les logs n'apparaissent pas : vérifier /etc/rsyslog.d/49-haproxy.conf et log 127.0.0.1 local2 dans haproxy.cfg
```

## Voir aussi

- [nginx](./049-nginx.md) et [traefik](./053-traefik.md) — alternatives reverse proxy
- [keepalived](./103-keepalived.md) — souvent combiné à HAProxy pour une IP virtuelle haute disponibilité
- [rsyslog](./020-rsyslog.md) — nécessaire pour récupérer les logs HAProxy correctement
