---
id: 004-systemd-timesyncd
title: systemd-timesyncd — Synchronisation de l'heure
sidebar_position: 4
tags: [linux, services, systeme, reseau]
---

# systemd-timesyncd — Synchronisation de l'heure

`systemd-timesyncd` est le client NTP **léger** intégré à systemd. Il synchronise l'horloge système via SNTP (une version simplifiée de NTP) auprès d'un ou plusieurs serveurs de temps. C'est la solution par défaut sur la plupart des distributions modernes pour un simple poste ou serveur qui n'a pas besoin de la précision ni des fonctions serveur de `chrony`/`ntpd`.

## Installation

Fourni nativement avec systemd sur la plupart des distributions — rien à installer, seulement à activer.

```bash
sudo systemctl enable --now systemd-timesyncd
timedatectl set-ntp true
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/systemd/timesyncd.conf` | Configuration principale (serveurs NTP) |
| `/etc/systemd/timesyncd.conf.d/*.conf` | Fragments de configuration additionnels |

## Commandes utiles

```bash
timedatectl status                # état de la synchronisation
timedatectl timesync-status       # détail du serveur NTP utilisé, décalage
systemctl status systemd-timesyncd
timedatectl set-timezone Europe/Paris
```

## Exemple de configuration

```ini title="/etc/systemd/timesyncd.conf"
[Time]
NTP=0.fr.pool.ntp.org 1.fr.pool.ntp.org
FallbackNTP=ntp.ubuntu.com
```

Définit des serveurs NTP français préférés, avec un serveur de repli si aucun n'est joignable.

## Sécurisation

- Une horloge désynchronisée casse la validation de certificats TLS (fenêtres de validité) et les protocoles sensibles au temps (Kerberos, TOTP/2FA) — garder `timedatectl status` avec `synchronized: yes`.
- Sur un serveur isolé (pas d'accès Internet), pointer vers un serveur NTP interne plutôt que de laisser le service échouer silencieusement.
- Pour un usage serveur NTP exigeant (précision, redondance, mode serveur pour d'autres machines), préférer [chrony](./005-chrony.md) : `timesyncd` est volontairement minimal (pas de mode serveur, précision moindre).

## Logs & dépannage

```bash
journalctl -u systemd-timesyncd -f
timedatectl timesync-status        # décalage actuel, dernière synchro
```

Si la synchro échoue : vérifier la connectivité sortante vers le port UDP 123, et que `timedatectl set-ntp true` est bien actif (un autre client NTP comme chrony peut être en conflit s'il tourne en parallèle).

## Voir aussi

- [chrony](./005-chrony.md) — alternative plus complète (mode serveur, meilleure précision)
- [ntpd](./006-ntpd.md) — implémentation NTP historique
