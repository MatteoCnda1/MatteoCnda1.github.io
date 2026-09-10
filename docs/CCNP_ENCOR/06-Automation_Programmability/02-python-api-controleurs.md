---
id: 02-python-api-controleurs
title: "Python et API de contrôleurs : DNA Center, parsing JSON"
sidebar_position: 2
tags: [reseau, automatisation, scripting]
---

# Python et API de contrôleurs : DNA Center, parsing JSON

> **Python** est le langage de scripting dominant pour interagir avec les API réseau (REST, NETCONF), notamment pour orchestrer des contrôleurs comme **DNA Center** — au-delà d'Ansible (déclaratif, "quoi faire") qui reste plus adapté aux tâches répétitives standardisées, Python offre un contrôle **procédural complet** pour une logique métier complexe.

## Requête REST basique avec la bibliothèque `requests`

```python
import requests

# Authentification auprès de DNA Center
url = "https://dnac.entreprise.local/dna/system/api/v1/auth/token"
response = requests.post(url, auth=("admin", "MotDePasse123"), verify=False)
token = response.json()["Token"]

# Récupération de la liste des équipements réseau
headers = {"X-Auth-Token": token, "Content-Type": "application/json"}
devices_url = "https://dnac.entreprise.local/dna/intent/api/v1/network-device"
devices = requests.get(devices_url, headers=headers, verify=False).json()

for device in devices["response"]:
    print(f"{device['hostname']} — {device['managementIpAddress']} — {device['softwareVersion']}")
```

## Parsing d'une réponse JSON

```python
import json

# Une réponse d'API typique arrive sous forme de texte JSON
reponse_brute = '{"interface": "GigabitEthernet0/1", "status": "up", "vlan": 10}'

donnees = json.loads(reponse_brute)         # texte JSON → dictionnaire Python
print(donnees["interface"])                  # accès comme un dict normal
print(donnees["status"] == "up")

# Sens inverse : dictionnaire Python → texte JSON (pour l'envoyer dans une requête)
nouvelle_config = {"vlan": 20, "description": "Nouveau VLAN"}
texte_json = json.dumps(nouvelle_config, indent=2)
```

## Bibliothèques spécialisées : Netmiko et NAPALM

```python
# Netmiko : automatise une session SSH classique vers un équipement
# (utile quand aucune API REST/NETCONF n'est disponible — la
#  majorité du parc installé plus ancien)
from netmiko import ConnectHandler

equipement = {
    "device_type": "cisco_ios",
    "host": "192.168.1.1",
    "username": "admin",
    "password": "MotDePasse123",
}

connexion = ConnectHandler(**equipement)
sortie = connexion.send_command("show ip interface brief")
print(sortie)

connexion.send_config_set([
    "interface gigabitEthernet 0/1",
    "description Configuré via script Python",
])
connexion.save_config()   # équivalent de "copy running-config startup-config"
connexion.disconnect()
```

```text
   NETMIKO                                 NAPALM

   Automatise la CLI (envoie des            Fournit une API PYTHON
   commandes SSH/Telnet comme un              UNIFIÉE, abstrayant les
   humain le ferait) — fonctionne              différences entre
   sur PRESQUE TOUT équipement                 CONSTRUCTEURS (Cisco,
   réseau, MÊME ancien                         Juniper, Arista...) :
                                                get_facts(), get_interfaces(),
   → simple mais "fragile" (dépend             compare_config()...
     du format texte exact des
     réponses CLI, peut casser si            → plus ROBUSTE (structure
     ce format change entre                    de données cohérente),
     versions)                                  mais nécessite un
                                                 support natif du
                                                 constructeur/plateforme
```

## Cas d'usage concret : audit de conformité automatisé

```python
from netmiko import ConnectHandler

equipements = [
    {"device_type": "cisco_ios", "host": "192.168.1.1", "username": "admin", "password": "pass"},
    {"device_type": "cisco_ios", "host": "192.168.1.2", "username": "admin", "password": "pass"},
]

for eq in equipements:
    connexion = ConnectHandler(**eq)
    config = connexion.send_command("show running-config | include transport input")
    if "telnet" in config.lower():
        print(f"NON CONFORME sur {eq['host']} : Telnet encore autorisé sur les VTY !")
    else:
        print(f"Conforme sur {eq['host']}")
    connexion.disconnect()
```

Un script comme celui-ci, exécuté périodiquement (ex. via une tâche planifiée), audite automatiquement des centaines d'équipements pour vérifier qu'une politique de sécurité (ici, Telnet désactivé) reste appliquée dans le temps — bien plus fiable qu'une vérification manuelle périodique, et détecte les dérives de configuration (*configuration drift*) rapidement.

## Ce qu'il faut retenir

- **Python + `requests`** interagit avec les API REST de contrôleurs comme DNA Center (authentification par token, requêtes GET/POST en JSON).
- **Netmiko** automatise une session CLI classique (SSH), fonctionne sur la quasi-totalité du parc existant mais reste dépendant du format texte des sorties.
- **NAPALM** fournit une API Python unifiée multi-constructeur (`get_facts`, `get_interfaces`...), plus robuste mais nécessite un support natif de la plateforme.
- Un script d'audit périodique détecte automatiquement les dérives de configuration (configuration drift) à grande échelle.

## Pour aller plus loin

- [Cisco DNA Center — API Reference](https://developer.cisco.com/docs/dna-center/)
- [Netmiko Documentation](https://github.com/ktbyers/netmiko)
- [NAPALM Documentation](https://napalm.readthedocs.io/)
