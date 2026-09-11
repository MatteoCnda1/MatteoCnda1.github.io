---
id: 091-winbind
title: winbind — Intégration Windows/AD
sidebar_position: 91
tags: [linux, services, partage-fichiers]
---

# winbind

**winbind** (démon `winbindd`, suite Samba) permet à une machine Linux de s'intégrer à un domaine **Active Directory** : il traduit les utilisateurs/groupes Windows en identités Unix (UID/GID), permettant l'authentification AD sur des services Linux (login système, Samba, sudo...) via PAM/NSS.

## Installation

```bash
sudo apt install winbind
sudo systemctl enable --now winbind
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/samba/smb.conf` | Section `[global]` : `security = ads`, `realm`, `idmap config` |
| `/etc/nsswitch.conf` | Doit référencer `winbind` pour `passwd`/`group` |
| `/etc/krb5.conf` | Configuration Kerberos (l'auth AD repose sur Kerberos) |
| `/etc/pam.d/` | Intégration PAM pour l'authentification |

## Commandes utiles

```bash
net ads join -U administrateur@DOMAINE.LOCAL   # joindre la machine au domaine
wbinfo -u                       # lister les utilisateurs du domaine vus par winbind
wbinfo -t                       # tester la connectivité au contrôleur de domaine
getent passwd 'DOMAINE\\utilisateur'   # vérifier la résolution via NSS
systemctl restart winbind
```

## Exemple de configuration

```ini
[global]
   workgroup = DOMAINE
   security = ads
   realm = DOMAINE.LOCAL
   idmap config * : backend = tdb
   idmap config * : range = 10000-19999
   idmap config DOMAINE : backend = rid
   idmap config DOMAINE : range = 20000-9999999
```

`idmap config` définit comment les SID Windows sont mappés vers des UID/GID Unix — un mauvais mapping est la cause la plus fréquente de permissions incohérentes après une jonction au domaine.

## Sécurisation

- La jonction au domaine (`net ads join`) nécessite un compte AD à privilèges élevés temporairement — utiliser un compte dédié, pas un compte Domain Admin permanent.
- Restreindre `security = ads` (Kerberos) plutôt que NTLM quand c'est possible — Kerberos est nettement plus robuste.
- Vérifier la **synchronisation d'horloge** (Kerberos échoue au-delà de ~5 minutes de dérive) — voir [chrony](./005-chrony.md).
- Limiter les groupes AD autorisés à se connecter à la machine Linux (`pam_winbind` avec `require_membership_of`).

## Logs & dépannage

```bash
journalctl -u winbind
tail -f /var/log/samba/log.winbindd
wbinfo -t                       # échec = problème de confiance de domaine ou d'horloge
klist                           # vérifier les tickets Kerberos obtenus
```

Problème fréquent : `wbinfo -t` échoue → vérifier la résolution DNS du contrôleur de domaine et la synchronisation NTP (Kerberos est très sensible au décalage d'horloge).

## Voir aussi

- [smbd](./089-smbd.md) — s'appuie sur winbind pour authentifier des utilisateurs de domaine sur des partages Samba
- [chrony](./005-chrony.md) — la synchronisation d'horloge, prérequis silencieux de Kerberos/AD
