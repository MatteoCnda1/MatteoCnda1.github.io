---
id: 107-vault
title: Vault — gestion de secrets
sidebar_position: 107
tags: [linux, services, ha-cluster]
---

# Vault — gestion de secrets

**Vault** (HashiCorp) est un serveur de **gestion centralisée de secrets** : mots de passe, tokens API, certificats, clés de chiffrement. Il gère leur stockage chiffré, leur accès contrôlé par politique, leur rotation et leur expiration automatique (leases). 

> À ne pas confondre avec **Ansible Vault**, une fonctionnalité d'Ansible pour chiffrer des fichiers de variables — un outil totalement différent malgré le nom similaire.

## Installation

```bash
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install vault
sudo systemctl enable --now vault
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/vault.d/vault.hcl` | Configuration du serveur (listener, backend de stockage) |
| Backend de stockage (Consul, fichier, intégré Raft) | Où Vault persiste les données chiffrées |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `vault status` | État du serveur (scellé/descellé, HA) |
| `vault operator init` | Initialiser Vault (génère les clés de descellement) |
| `vault operator unseal` | Desceller Vault après un redémarrage (nécessite le seuil de clés) |
| `vault kv put/get secret/<path>` | Écrire/lire un secret |
| `vault login` | S'authentifier (token, LDAP, OIDC...) |

## Exemple de configuration

```hcl
storage "raft" {
  path = "/opt/vault/data"
  node_id = "vault-1"
}

listener "tcp" {
  address = "0.0.0.0:8200"
  tls_cert_file = "/etc/vault.d/tls/cert.pem"
  tls_key_file = "/etc/vault.d/tls/key.pem"
}

api_addr = "https://10.0.0.5:8200"
cluster_addr = "https://10.0.0.5:8201"
```

## Sécurisation

- Vault démarre toujours **scellé** (sealed) après un redémarrage — les données sont inaccessibles tant qu'un quorum de clés de descellement (`unseal keys`, générées à l'init via Shamir's Secret Sharing) n'est pas fourni. Ne jamais stocker toutes ces clés au même endroit.
- **TLS obligatoire** en production — jamais de `tls_disable = true` hors lab.
- Politiques d'accès (`policy`) en moindre privilège strict, par token/rôle.
- Activer l'**audit log** (`vault audit enable file ...`) pour tracer tout accès aux secrets.
- Auto-unseal via un KMS cloud (AWS KMS, GCP KMS...) en production, pour éviter l'intervention humaine manuelle à chaque redémarrage tout en gardant le chiffrement au repos.

## Logs & dépannage

- `journalctl -u vault -f` — démarrages, scellement/descellement, erreurs d'auth backend.
- `vault status` — premier réflexe : vérifier `Sealed: true/false`.
- Audit log configuré — trace complète de qui a lu quel secret et quand.

## Voir aussi

- [consul](./106-consul.md) — peut servir de backend de stockage à Vault, mais reste un outil distinct (discovery vs secrets).
