---
id: 022-logrotate
title: logrotate — rotation des logs
sidebar_position: 22
tags: [linux, services, logs]
---

# logrotate

`logrotate` gère la **rotation, compression et purge** des fichiers de logs texte, pour éviter qu'ils ne grossissent indéfiniment et ne remplissent le disque. Ce n'est pas un démon permanent : il s'exécute périodiquement via un timer systemd (ou une tâche cron), généralement une fois par jour.

## Installation

```bash
sudo apt install logrotate        # souvent déjà présent
sudo dnf install logrotate
```

Déclenché par un timer systemd (`logrotate.timer`) sur les distributions modernes, ou `/etc/cron.daily/logrotate` historiquement.

```bash
systemctl list-timers | grep logrotate
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/logrotate.conf` | Configuration globale par défaut |
| `/etc/logrotate.d/*` | Un fichier par service (nginx, rsyslog, apache2...), la plupart des paquets en installent un automatiquement |
| `/var/lib/logrotate/status` | État de la dernière rotation par fichier (évite les rotations en double) |

## Commandes utiles

```bash
logrotate -d /etc/logrotate.conf        # dry-run : simuler sans rien modifier
logrotate -f /etc/logrotate.conf        # forcer une rotation immédiate
logrotate -v /etc/logrotate.conf        # exécution verbeuse
systemctl status logrotate.timer
journalctl -u logrotate                 # logs d'exécution (via le service one-shot déclenché par le timer)
```

## Exemple de configuration

```
# /etc/logrotate.d/monapp
/var/log/monapp/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 monapp monapp
    postrotate
        systemctl reload monapp > /dev/null 2>&1 || true
    endscript
}
```

- `rotate 14` : conserve 14 fichiers tournés avant suppression.
- `delaycompress` : ne compresse le fichier tourné qu'au tour suivant (laisse le temps à un processus qui écrit encore de finir).
- `postrotate`/`endscript` : recharge le service après rotation, pour qu'il réouvre son fichier de log (sinon il continue d'écrire dans l'ancien fichier renommé).

## Sécurisation

- Toujours utiliser `create` avec des permissions restrictives (`0640`, propriétaire adapté) pour que les nouveaux fichiers de logs ne soient pas lisibles par tous.
- `missingok` et `notifempty` évitent des erreurs/rotations inutiles qui pourraient masquer un vrai problème (service qui n'écrit plus de logs).
- Vérifier que chaque service avec des logs verbeux a bien une règle de rotation — un fichier de log non tourné est un vecteur classique de saturation disque (DoS involontaire).
- Ne pas oublier le `postrotate` pour les services qui gardent le descripteur de fichier ouvert (sinon les logs continuent d'aller dans le fichier renommé, invisible).

## Logs & dépannage

```bash
logrotate -d /etc/logrotate.conf     # voir ce qui SERAIT fait, sans l'exécuter
cat /var/lib/logrotate/status        # dernière date de rotation par fichier
journalctl -u logrotate
```

## Voir aussi

- [rsyslog](./020-rsyslog.md) — la plupart des fichiers qu'il produit sont gérés par logrotate
