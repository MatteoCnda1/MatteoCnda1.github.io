---
id: 043-containerd
title: containerd — Runtime de conteneurs
sidebar_position: 43
tags: [linux, services, conteneurs]
---

# containerd — Runtime de conteneurs

`containerd` est un runtime de conteneurs bas niveau (projet CNCF), utilisé comme moteur sous-jacent par Docker Engine (depuis la 18.09) et par Kubernetes (via CRI). Cette fiche couvre l'angle **service systemd** ; pour le fonctionnement détaillé du runtime, voir le lien en fin de page.

## Installation

```bash
apt install containerd
# ou en standalone depuis les releases officielles GitHub

systemctl enable --now containerd
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/containerd/config.toml` | Configuration principale (plugins, snapshotter, CRI) |
| `/var/lib/containerd/` | Données (images, snapshots) |
| `/run/containerd/containerd.sock` | Socket d'API |

## Commandes utiles

```bash
systemctl status containerd
ctr version                       # client bas niveau
ctr images ls
ctr containers ls
crictl ps                         # via l'API CRI (utilisé par Kubernetes)
containerd config default > /etc/containerd/config.toml   # générer une config par défaut
```

## Exemple de configuration

```toml
version = 2

[plugins."io.containerd.grpc.v1.cri"]
  sandbox_image = "registry.k8s.io/pause:3.9"

[plugins."io.containerd.grpc.v1.cri".containerd]
  default_runtime_name = "runc"
```

Configuration minimale activant le plugin CRI (nécessaire pour un usage Kubernetes/kubelet).

## Sécurisation

- Restreindre l'accès au socket `/run/containerd/containerd.sock` (accès équivalent root).
- Isoler les conteneurs sensibles avec un runtime alternatif comme `runsc` (gVisor) ou `kata-containers`, configurable via `config.toml`.
- Maintenir `runc` à jour (les failles d'évasion de conteneur historiques, type CVE-2019-5736, passent par le runtime bas niveau).

## Logs & dépannage

```bash
journalctl -u containerd -f
ctr -n k8s.io containers ls        # namespace utilisé par Kubernetes
```

## Voir aussi

- [containerd — cours complet](../../../Containers/containerd/01-containerd.md)
- [docker / dockerd](./042-docker.md) — pilote containerd en interne
- [kubelet](./045-kubelet.md) — consomme containerd via l'API CRI
