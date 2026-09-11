---
id: 051-httpd
title: httpd — Apache sur RHEL-like
sidebar_position: 51
tags: [linux, services, web]
---

# httpd — Apache sur RHEL-like

`httpd` est le même logiciel **Apache HTTP Server** que [apache2](./050-apache2.md), mais sous son nom de service et sa disposition de fichiers propres aux distributions RHEL-like (RHEL, Fedora, CentOS, Rocky, Alma). Cette fiche se limite aux différences ; pour le fonctionnement général d'Apache, voir la fiche `apache2`.

## Installation

```bash
sudo dnf install httpd
sudo systemctl enable --now httpd
sudo firewall-cmd --permanent --add-service=http --add-service=https
sudo firewall-cmd --reload
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/httpd/conf/httpd.conf` | Configuration principale |
| `/etc/httpd/conf.d/*.conf` | Vhosts et configuration additionnelle (chargés automatiquement, pas d'étape `a2ensite`) |
| `/etc/httpd/conf.modules.d/*.conf` | Modules (chargés automatiquement, pas d'étape `a2enmod`) |
| `/var/log/httpd/access_log` / `error_log` | Logs |
| `/var/www/html/` | DocumentRoot par défaut |

## Commandes utiles

```bash
sudo apachectl configtest
sudo systemctl reload httpd
httpd -M                            # Modules chargés
```

## Différences clés avec Debian/apache2

- Pas de `a2ensite`/`a2enmod` : tout fichier `.conf` dans `conf.d/` est chargé automatiquement — activer/désactiver = ajouter/renommer le fichier.
- **SELinux** est actif par défaut sur RHEL-like : un DocumentRoot hors de `/var/www` nécessite un contexte adapté (`semanage fcontext`, `restorecon`) sinon Apache reçoit un `403 Forbidden` malgré des permissions Unix correctes.
- `firewalld` (pas `ufw`) contrôle l'accès réseau — penser à ouvrir les services `http`/`https`.

## Sécurisation

- Vérifier le contexte SELinux du DocumentRoot : `ls -Z /var/www/html`, `sudo semanage fcontext -a -t httpd_sys_content_t "/data/web(/.*)?"` puis `restorecon -Rv /data/web`.
- Si le site doit se connecter à un service réseau (ex: reverse proxy vers une app distante), activer le booléen SELinux dédié : `setsebool -P httpd_can_network_connect on`.
- Mêmes bonnes pratiques que apache2 : `ServerTokens Prod`, modules minimaux, TLS moderne.

## Logs & dépannage

```bash
tail -f /var/log/httpd/error_log
journalctl -u httpd -f
sudo ausearch -m avc -ts recent     # Si SELinux bloque silencieusement une action (403 inattendu)
```

## Voir aussi

- [apache2](./050-apache2.md) — le cœur du fonctionnement Apache, commun aux deux distributions
- [selinux](./018-selinux.md) — contexte indispensable pour comprendre les blocages `httpd_*`
