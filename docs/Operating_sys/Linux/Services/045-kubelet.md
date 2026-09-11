---
id: 045-kubelet
title: kubelet — Agent de nœud Kubernetes
sidebar_position: 45
tags: [linux, services, conteneurs, kubernetes]
---

# kubelet — Agent de nœud Kubernetes

`kubelet` est l'agent qui tourne sur chaque nœud d'un cluster Kubernetes. Il reçoit des spécifications de Pods (via l'API server) et s'assure que les conteneurs correspondants tournent réellement, en pilotant un runtime de conteneurs (containerd, CRI-O) via l'interface **CRI**.

## Installation

```bash
# Généralement installé via kubeadm, ou le gestionnaire de paquets du cluster
apt install kubelet kubeadm kubectl
systemctl enable --now kubelet
```

Sur un nœud géré par `kubeadm`, `kubelet` ne démarre pleinement qu'après `kubeadm init`/`kubeadm join`, car il a besoin de sa configuration de cluster.

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/var/lib/kubelet/config.yaml` | Configuration principale du kubelet (générée par kubeadm) |
| `/etc/kubernetes/kubelet.conf` | Kubeconfig utilisé par kubelet pour contacter l'API server |
| `/var/lib/kubelet/pki/` | Certificats du nœud |
| `/etc/systemd/system/kubelet.service.d/10-kubeadm.conf` | Override systemd (arguments de démarrage) |

## Commandes utiles

```bash
systemctl status kubelet
journalctl -u kubelet -f
kubectl get nodes                      # état vu depuis le control plane
kubectl describe node <nom>
crictl ps                              # conteneurs vus côté runtime CRI sur ce nœud
```

## Exemple de configuration

```yaml
# extrait de /var/lib/kubelet/config.yaml
authentication:
  anonymous:
    enabled: false
authorization:
  mode: Webhook
serverTLSBootstrap: true
```

Désactive l'authentification anonyme et délègue l'autorisation à l'API server — configuration de base recommandée.

## Sécurisation

- Désactiver l'**authentification anonyme** (`authentication.anonymous.enabled: false`) — sinon n'importe qui pouvant atteindre le port kubelet (10250) peut interroger/exécuter des commandes sans authentification.
- Activer `authorization.mode: Webhook` pour que kubelet délègue les décisions d'autorisation à l'API server plutôt qu'un mode `AlwaysAllow`.
- Restreindre l'accès réseau au port 10250 (API kubelet) aux seuls composants du control plane.
- Garder les certificats de nœud à jour via `serverTLSBootstrap`.

## Logs & dépannage

```bash
journalctl -u kubelet -f
kubectl get events --field-selector involvedObject.kind=Node
crictl logs <container-id>             # logs d'un conteneur via le runtime CRI
```

## Voir aussi

- [Pods](../../../Container_Orchestration/Pods/index.md), [kubectl](../../../Container_Orchestration/kubectl/index.md) — piloter et comprendre ce que kubelet exécute
- [containerd](./043-containerd.md) — runtime typiquement utilisé par kubelet via CRI
- [k3s](./046-k3s.md) — distribution Kubernetes légère qui embarque son propre kubelet
