---
id: 017-apparmor
title: AppArmor — sécurité applicative
sidebar_position: 17
tags: [linux, services, securite]
---

# AppArmor — sécurité applicative

AppArmor est un module de sécurité du noyau (LSM) qui **confine chaque application** à un profil de permissions explicite (fichiers, capacités réseau...), en complément du contrôle d'accès Unix classique (DAC). Par défaut sur Ubuntu/Debian.

## Installation

```bash
sudo apt install apparmor apparmor-utils
sudo systemctl enable --now apparmor
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/apparmor.d/` | Profils de confinement, un fichier par binaire confiné |
| `/etc/apparmor.d/disable/` | Profils désactivés (symlinks) |
| `/sys/kernel/security/apparmor/` | Interface noyau (état runtime) |

## Commandes utiles

```bash
sudo systemctl status apparmor
sudo aa-status                          # profils chargés et leur mode
sudo aa-enforce /etc/apparmor.d/usr.sbin.nginx   # passer un profil en mode enforce
sudo aa-complain /etc/apparmor.d/usr.sbin.nginx  # mode permissif (log sans bloquer)
sudo aa-genprof /usr/sbin/monbinaire    # générer un profil interactivement
sudo apparmor_parser -r /etc/apparmor.d/monprofil # recharger un profil
```

## Exemple de configuration

```
# extrait de /etc/apparmor.d/usr.sbin.nginx
/usr/sbin/nginx {
  #include <abstractions/base>
  network inet stream,
  /etc/nginx/** r,
  /var/log/nginx/*.log w,
  /var/www/** r,
}
```

## Sécurisation

- Démarrer un nouveau profil en mode **complain** (log sans bloquer) pour observer le comportement réel avant de passer en **enforce**.
- Confiner en priorité les services **exposés au réseau** (nginx, sshd, services applicatifs) : c'est là que le confinement limite le plus l'impact d'une compromission.
- Vérifier régulièrement `aa-status` pour s'assurer qu'aucun profil critique n'est resté en `complain` par oubli.

## Logs & dépannage

```bash
journalctl -u apparmor
sudo dmesg | grep -i apparmor
sudo aa-logprof     # analyse les refus loggés et propose des règles à ajouter au profil
```

## Voir aussi

- [AppArmor](../Security/appArmor.md) — cours complet : modèle MAC vs DAC, écriture de profils, modes enforce/complain en détail.
