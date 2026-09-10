---
id: 01-automatisation-api-programmabilite
title: "Programmabilité réseau : API, formats de données, Ansible"
sidebar_position: 1
tags: [reseau, automatisation, scripting]
---

# Programmabilité réseau : API, formats de données, Ansible

> La **programmabilité réseau** consiste à configurer et interroger les équipements via des **API** plutôt que via la CLI interactive — indispensable pour gérer des centaines/milliers d'équipements de façon cohérente et reproductible (contrairement à la configuration manuelle, source d'erreurs humaines et de dérive de configuration).

## Pourquoi automatiser : le problème de la CLI à grande échelle

```text
   CONFIGURATION MANUELLE (CLI)              AUTOMATISATION (API/scripts)

   Un admin se connecte en SSH à              Un script/playbook applique
   CHAQUE équipement, un par un                LA MÊME configuration à
   → lent, source d'erreurs de                  TOUS les équipements
     frappe, difficile à auditer                 CIBLES en une exécution
     (pas de trace structurée du               → rapide, cohérent, traçable
     changement effectué)                        (le script EST la
                                                    documentation du
                                                    changement)
```

## API REST : le modèle dominant

```text
   Méthodes HTTP standard, appliquées aux ressources réseau :

   GET    /api/v1/interfaces           → LIRE l'état des interfaces
   POST   /api/v1/vlans                → CRÉER un nouveau VLAN
   PUT    /api/v1/interfaces/gi0-1     → REMPLACER la config d'une interface
   PATCH  /api/v1/interfaces/gi0-1     → MODIFIER partiellement
   DELETE /api/v1/vlans/10              → SUPPRIMER un VLAN
```

```bash
# Exemple : interroger un contrôleur DNA Center via son API REST
curl -X GET "https://dnac.entreprise.local/dna/intent/api/v1/network-device" \
     -H "X-Auth-Token: $TOKEN" \
     -H "Content-Type: application/json"
```

## NETCONF et RESTCONF

```text
   NETCONF (RFC 6241)                     RESTCONF (RFC 8040)

   Protocole dédié à la gestion            "NETCONF avec une syntaxe
   de configuration réseau, basé            HTTP/REST" — plus simple
   sur des messages XML sur SSH             d'accès pour les
   → transactions ATOMIQUES                 développeurs déjà
     (rollback possible si erreur),         familiers du REST
     validation de config AVANT
     application (candidate-config)
```

```bash
Router(config)# netconf-yang
! active l'agent NETCONF sur l'équipement, exploitable via des
! modèles de données YANG standardisés
```

## YANG : modéliser la structure des données réseau

```text
   YANG (Yet Another Next Generation, RFC 7950) décrit la
   STRUCTURE des données de configuration/état d'un équipement,
   indépendamment du protocole utilisé pour y accéder (NETCONF,
   RESTCONF, gNMI) — un modèle de données standardisé, exploitable
   de façon identique quel que soit le constructeur (en théorie).
```

## Formats de données structurées : JSON, XML, YAML

```json
{
  "interface": "GigabitEthernet0/1",
  "vlan": 10,
  "status": "up",
  "ip_address": "192.168.1.1"
}
```

```yaml
interface: GigabitEthernet0/1
vlan: 10
status: up
ip_address: 192.168.1.1
```

| Format | Lisibilité | Usage typique |
|---|---|---|
| **JSON** | Correcte | API REST (format quasi-universel) |
| **XML** | Verbeuse | NETCONF (historique) |
| **YAML** | Très lisible (indentation) | Fichiers de configuration d'outils (Ansible playbooks) |

## Ansible : automatisation sans agent

```yaml
# playbook.yml — configure le hostname et un VLAN sur des switches Cisco
---
- name: Configuration de base des switches
  hosts: switches
  gather_facts: no
  tasks:
    - name: Définir le hostname
      cisco.ios.ios_config:
        lines:
          - hostname {{ inventory_hostname }}

    - name: Créer le VLAN 10
      cisco.ios.ios_vlans:
        config:
          - vlan_id: 10
            name: COMPTABILITE
        state: merged
```

```bash
$ ansible-playbook -i inventaire.yml playbook.yml
```

**Avantage clé** : Ansible est **sans agent** (agentless) — il se connecte via SSH (ou l'API du module réseau concerné) sans nécessiter d'installer un logiciel supplémentaire sur les équipements cibles, contrairement à d'autres outils de configuration management orientés serveurs (Puppet, Chef) qui nécessitent un agent installé.

## Cas d'usage concret

Déployer une nouvelle politique de sécurité (ex. désactiver Telnet, forcer SSH v2, appliquer une ACL de management standard) sur **200 switches** d'un campus : manuellement, plusieurs jours de travail répétitif avec un risque d'erreur/oubli sur certains équipements ; via un playbook Ansible testé au préalable sur un lab, l'opération devient reproductible, traçable (le playbook versionné dans Git documente exactement ce qui a été changé) et s'exécute en quelques minutes sur l'ensemble du parc.

## Ce qu'il faut retenir

- L'automatisation remplace la configuration manuelle répétitive par des scripts/playbooks reproductibles et traçables — indispensable à grande échelle.
- **API REST** (GET/POST/PUT/PATCH/DELETE) est le modèle d'accès dominant ; **NETCONF/RESTCONF** apportent des transactions atomiques et une validation de configuration, structurées par des modèles **YANG**.
- **JSON** domine les API REST, **YAML** domine les fichiers de configuration d'outils comme Ansible.
- **Ansible** automatise sans agent (SSH), largement utilisé pour la configuration réseau à grande échelle.

## Pour aller plus loin

- [RFC 6241 — Network Configuration Protocol (NETCONF)](https://www.rfc-editor.org/rfc/rfc6241)
- [RFC 7950 — The YANG 1.1 Data Modeling Language](https://www.rfc-editor.org/rfc/rfc7950)
- [Ansible — Cisco IOS Collection](https://docs.ansible.com/ansible/latest/collections/cisco/ios/)
