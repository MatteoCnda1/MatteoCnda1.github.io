---
id: 106-consul
title: Consul — service discovery / configuration
sidebar_position: 106
tags: [linux, services, ha-cluster]
---

# Consul — service discovery / configuration

**Consul** (HashiCorp) est un outil de **service discovery**, de **health checking** et de **stockage clé-valeur distribué**, utilisé pour permettre à des services répartis de se trouver dynamiquement les uns les autres (au lieu d'IP en dur) et de vérifier leur santé en continu. Souvent utilisé comme brique d'infrastructure pour du microservices/mesh réseau.

## Installation

```bash
# Dépôt officiel HashiCorp
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install consul
sudo systemctl enable --now consul
```

## Fichiers de configuration

| Chemin | Rôle |
|---|---|
| `/etc/consul.d/consul.hcl` (ou `.json`) | Configuration principale de l'agent |
| `/opt/consul` (ou `/var/lib/consul`) | Répertoire de données (état Raft pour les serveurs) |

## Commandes utiles

| Commande | Fonction |
|---|---|
| `consul members` | Lister les membres du cluster (agents) |
| `consul agent -dev` | Lancer un agent de développement local (test rapide) |
| `consul catalog services` | Lister les services enregistrés |
| `consul kv get/put <clé>` | Lire/écrire dans le magasin clé-valeur |
| `consul operator raft list-peers` | État du consensus Raft entre serveurs |

## Exemple de configuration

```hcl
datacenter = "dc1"
data_dir = "/opt/consul"
server = true
bootstrap_expect = 3
bind_addr = "10.0.0.5"
client_addr = "0.0.0.0"
ui_config {
  enabled = true
}
```

Un cluster Consul de production comporte typiquement 3 ou 5 **serveurs** (pour le quorum Raft) et un nombre arbitraire d'agents **client** sur chaque machine hébergeant des services.

## Sécurisation

- Activer **ACL** (`acl { enabled = true, default_policy = "deny" }`) — par défaut, tout agent qui rejoint le cluster a accès à tout.
- Chiffrer la communication gossip (`encrypt` avec une clé générée par `consul keygen`) et le trafic RPC (TLS entre agents).
- Ne jamais exposer l'UI/API Consul (port 8500) directement sur Internet.
- Limiter les nœuds pouvant rejoindre le cluster (`retry_join` avec une liste fermée, pas de découverte ouverte).

## Logs & dépannage

- `journalctl -u consul -f` — élections Raft, join/leave d'agents, échecs de health check.
- `consul members` — vérifier que tous les agents attendus sont `alive`.
- `consul monitor` — flux de logs en temps réel de l'agent local.

## Voir aussi

- [vault](./107-vault.md) — souvent déployé aux côtés de Consul (Consul comme backend de stockage pour Vault), mais un outil totalement différent (secrets vs discovery).
