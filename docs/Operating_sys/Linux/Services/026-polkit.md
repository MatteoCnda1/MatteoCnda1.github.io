---
id: 026-polkit
title: polkit — Autorisation d'actions système
sidebar_position: 26
tags: [linux, services, systeme]
---

# polkit

**polkit** (PolicyKit, démon `polkitd`) est le système d'autorisation qui décide si un processus non privilégié a le droit de réaliser une action privilégiée (monter un disque, redémarrer la machine, changer la configuration réseau...) sans passer par un `sudo` complet. Il communique via [D-Bus](./025-dbus.md) et remplace l'ancien modèle « tout ou rien » de root.

## Installation

```bash
# Debian/Ubuntu
sudo apt install policykit-1

# Fedora/RHEL
sudo dnf install polkit

sudo systemctl enable --now polkit
```

Généralement installé et activé par défaut, car de nombreux services (NetworkManager, systemd-logind, udisks2) en dépendent.

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/polkit-1/rules.d/*.rules` | Règles JavaScript personnalisées (mécanisme moderne, prioritaire) |
| `/usr/share/polkit-1/actions/*.policy` | Définitions des actions et de leur autorisation par défaut (fournies par les paquets) |
| `/etc/polkit-1/localauthority/50-local.d/*.pkla` | Ancien format `.pkla` (obsolète, encore supporté pour compatibilité) |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `systemctl status polkit` | État du démon |
| `pkaction` | Lister toutes les actions polkit connues |
| `pkaction --verbose --action-id <id>` | Détails d'une action (autorisation par défaut, description) |
| `pkcheck --action-id <id> --process <pid>` | Vérifier si un processus donné serait autorisé pour une action |
| `pkexec <commande>` | Exécuter une commande avec élévation via polkit (équivalent graphique/API de sudo) |

## Exemple de configuration

```javascript
// /etc/polkit-1/rules.d/49-nopasswd-poweroff.rules
polkit.addRule(function(action, subject) {
    if (action.id == "org.freedesktop.login1.power-off" &&
        subject.isInGroup("staff")) {
        return polkit.Result.YES;
    }
});
```

Cette règle autorise sans mot de passe l'extinction de la machine pour tout utilisateur du groupe `staff`, sans toucher à la policy système par défaut.

## Sécurisation

- Éviter les règles `.rules` trop larges (`return polkit.Result.YES` sans condition précise) : elles s'appliquent globalement dès le prochain rechargement.
- Les fichiers `.rules` sont exécutés dans l'ordre alphabétique — un fichier numéroté plus haut (`90-...`) peut silencieusement écraser une règle plus restrictive définie plus bas.
- Vérifier avec `pkaction --verbose` l'autorisation par défaut (`implicit authorization`) de chaque action sensible avant de la surcharger.
- Ne pas désactiver polkit globalement pour « simplifier » : c'est la seule couche entre les applications utilisateur non privilégiées et des actions systèmes sensibles (montage de disques, gestion de l'alimentation, configuration réseau).

## Logs & dépannage

```bash
journalctl -u polkit
pkcheck --action-id org.freedesktop.udisks2.filesystem-mount --process $$
```

Une action refusée de façon inattendue se diagnostique en cherchant quelle règle (`.rules`) ou quelle policy (`.policy`) intercepte l'`action-id` concerné avec `pkaction --verbose --action-id <id>`.

## Voir aussi

- [dbus](./025-dbus.md) — le bus de communication sur lequel polkit s'appuie
