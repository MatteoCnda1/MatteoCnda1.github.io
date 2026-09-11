---
id: 134-ansible-pull
title: ansible-pull — Ansible en mode agent
sidebar_position: 134
tags: [linux, services, ci-cd]
---

# ansible-pull — Ansible en mode agent

`ansible-pull` inverse le modèle habituel d'Ansible : au lieu qu'un contrôleur **pousse** (push, SSH) une configuration vers des machines cibles, chaque machine **récupère elle-même** (pull) un playbook depuis un dépôt Git et l'applique en local. Utile pour du bootstrap (cloud-init), des flottes très larges, ou des environnements où le contrôleur ne peut pas joindre les machines en SSH entrant. Pour la syntaxe des playbooks eux-mêmes, voir le cours [Ansible](../../../Configuration_Management_Automation/Ansible/index.md) — cette fiche se concentre sur la mise en service périodique via systemd.

## Installation

```bash
sudo apt install ansible
# ansible-pull est fourni avec le paquet ansible, pas de service dédié packagé
```

Il n'existe pas de démon `ansible-pull` : on planifie son exécution périodique via un **timer systemd** (préféré à cron pour la journalisation et la gestion des dépendances).

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/systemd/system/ansible-pull.service` | Unit définissant la commande à exécuter |
| `/etc/systemd/system/ansible-pull.timer` | Planification de l'exécution |
| `/etc/ansible/ansible.cfg` | Configuration Ansible générale |

## Commandes utiles

```bash
# Exécution manuelle
ansible-pull -U https://github.com/org/playbooks.git -C main playbook.yml

systemctl status ansible-pull.timer
systemctl list-timers ansible-pull.timer
journalctl -u ansible-pull.service -f
```

## Exemple de configuration

```ini
# /etc/systemd/system/ansible-pull.service
[Unit]
Description=Ansible Pull

[Service]
Type=oneshot
ExecStart=/usr/bin/ansible-pull -U https://github.com/org/playbooks.git -C main site.yml --only-if-changed
```

```ini
# /etc/systemd/system/ansible-pull.timer
[Unit]
Description=Exécute ansible-pull toutes les 30 minutes

[Timer]
OnBootSec=5min
OnUnitActiveSec=30min

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl enable --now ansible-pull.timer
```

## Sécurisation

- Signer/vérifier le dépôt Git source (le playbook exécuté a un accès root local complet — un dépôt compromis = machine compromise).
- Utiliser une **clé de déploiement en lecture seule** pour cloner le dépôt, jamais des identifiants avec droits d'écriture.
- Restreindre le dépôt à une branche/tag précis (`-C main` ou un tag figé) plutôt que suivre une branche mouvante sans contrôle.
- `--only-if-changed` évite de ré-appliquer inutilement le playbook si rien n'a changé, réduisant la fenêtre d'exécution.

## Logs & dépannage

```bash
journalctl -u ansible-pull.service --since "1 hour ago"
```

Un échec silencieux vient souvent d'un accès réseau bloqué vers le dépôt Git (firewall sortant) — vérifier la connectivité avant de creuser le playbook.

## Voir aussi

- [Ansible](../../../Configuration_Management_Automation/Ansible/index.md) — le cours général sur les playbooks/rôles/inventaires
- [rundeckd](./133-rundeckd.md) — approche centralisée alternative
