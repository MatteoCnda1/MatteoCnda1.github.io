---
id: 021-systemd-journald
title: systemd-journald — journalisation système
sidebar_position: 21
tags: [linux, services, logs]
---

# systemd-journald

`systemd-journald` est le service de journalisation intégré à systemd. Il collecte les logs du noyau, des services démarrés par systemd (stdout/stderr inclus), et de l'authentification, dans un format binaire indexé (le **journal**), consultable avec `journalctl`. Sur la plupart des distributions modernes, il coexiste avec `rsyslog` (souvent en amont, `rsyslog` lisant le journal pour produire des fichiers texte classiques).

## Installation

Inclus nativement avec systemd — aucune installation séparée. Actif par défaut.

```bash
systemctl status systemd-journald
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/systemd/journald.conf` | Configuration principale (rétention, taille max, forward vers syslog) |
| `/etc/systemd/journald.conf.d/*.conf` | Fragments de configuration additionnels |
| `/var/log/journal/` | Stockage persistant du journal (si activé) |
| `/run/log/journal/` | Stockage volatile (par défaut si `/var/log/journal` n'existe pas — perdu au reboot) |

## Commandes utiles

```bash
journalctl                         # tout le journal
journalctl -u nginx                # logs d'un service précis
journalctl -f                      # suivre en direct (comme tail -f)
journalctl -b                      # logs depuis le dernier boot
journalctl -b -1                   # logs du boot précédent
journalctl --since "1 hour ago"
journalctl -p err                  # filtrer par niveau de priorité (err et plus grave)
journalctl --disk-usage            # espace disque utilisé par le journal
journalctl --vacuum-size=500M      # purger pour ne garder que 500 Mo
journalctl --vacuum-time=2weeks    # purger tout ce qui a plus de 2 semaines
```

## Exemple de configuration

```
# /etc/systemd/journald.conf
[Journal]
Storage=persistent          # forcer la persistance sur disque (sinon volatile par défaut)
SystemMaxUse=1G              # taille max du journal sur disque
ForwardToSyslog=yes          # transmettre aussi à rsyslog
Compress=yes
```

Après modification : `sudo systemctl restart systemd-journald`.

## Sécurisation

- Activer `Storage=persistent` et créer `/var/log/journal/` (`mkdir -p /var/log/journal && systemd-tmpfiles --create --prefix /var/log/journal`) pour ne pas perdre les logs au reboot — utile en forensics.
- Limiter la taille (`SystemMaxUse`) pour éviter qu'un service très verbeux ne remplisse le disque.
- Restreindre l'accès en lecture au journal aux groupes `adm`/`systemd-journal` plutôt qu'à tous les utilisateurs.
- Pour de l'audit sérieux, transmettre (`ForwardToSyslog` ou un exporteur type Filebeat) vers un système de logs centralisé — le journal local reste vulnérable si la machine est compromise.

## Logs & dépannage

```bash
journalctl -u systemd-journald     # logs du démon lui-même
journalctl --verify                # vérifier l'intégrité du journal (détecte la corruption)
journalctl --disk-usage
```

## Voir aussi

- [rsyslog](./020-rsyslog.md) — reçoit souvent les logs forwardés par journald pour centralisation
- [logrotate](./022-logrotate.md) — ne s'applique pas au journal binaire (géré par `journald.conf` lui-même via `SystemMaxUse`/vacuum), mais gère les logs texte classiques
- [Audit, détection et gestion des vulnérabilités](../Security/06-audit-detection-patch.md) — utilise le journal comme source d'investigation
