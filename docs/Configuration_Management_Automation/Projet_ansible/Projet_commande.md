---
id: Fiche-commande-rpojet
title: Fiche-commande-projet
sidebar_position: 1
---



# Fiche de commandes — Lab KVM / Libvirt / Debian / Ansible

> `<VM>` = nom de la machine virtuelle : `ansible-controller`, `bastion01`, `web01`, `app01`, `db01`, etc.

---

## 1. Gestion des VM avec virsh

### Voir toutes les VM

```bash
sudo virsh --connect qemu:///system list --all
```

### Voir uniquement les VM démarrées

```bash
sudo virsh --connect qemu:///system list
```

### Démarrer une VM

```bash
sudo virsh --connect qemu:///system start <VM>
```

### Arrêter proprement une VM

```bash
sudo virsh --connect qemu:///system shutdown <VM>
```

### Forcer l'arrêt d'une VM

⚠️ À utiliser seulement si `shutdown` ne fonctionne pas.

```bash
sudo virsh --connect qemu:///system destroy <VM>
```

### Redémarrer une VM

```bash
sudo virsh --connect qemu:///system reboot <VM>
```

---

## 2. Informations sur une VM

### Informations générales

```bash
sudo virsh --connect qemu:///system dominfo <VM>
```

### Voir l'adresse IP

```bash
sudo virsh --connect qemu:///system domifaddr <VM>
```

### Voir les interfaces réseau

```bash
sudo virsh --connect qemu:///system domiflist <VM>
```

### Voir les disques

```bash
sudo virsh --connect qemu:///system domblklist <VM>
```

### Voir la configuration complète

```bash
sudo virsh --connect qemu:///system dumpxml <VM>
```

### Voir le terminal série

```bash
sudo virsh --connect qemu:///system ttyconsole <VM>
```

---

## 3. Console d'une VM

### Se connecter à la console

```bash
sudo virsh --connect qemu:///system console <VM>
```

### Quitter la console

```text
Ctrl + ]
```

⚠️ Ce n'est pas `Ctrl+C`.

---

## 4. Gestion des disques

### Voir les images disponibles

```bash
sudo ls -lh /var/lib/libvirt/images/
```

### Vérifier une image QCOW2

```bash
sudo qemu-img info /var/lib/libvirt/images/<VM>.qcow2
```

### Voir les disques d'une VM

```bash
sudo virsh --connect qemu:///system domblklist <VM>
```

⚠️ Ne pas supprimer ou modifier le `.qcow2` d'une VM en fonctionnement.

---

## 5. Réseau libvirt

### Voir les réseaux

```bash
sudo virsh --connect qemu:///system net-list --all
```

### Informations sur le réseau default

```bash
sudo virsh --connect qemu:///system net-info default
```

### Démarrer le réseau default

```bash
sudo virsh --connect qemu:///system net-start default
```

### Activer le démarrage automatique

```bash
sudo virsh --connect qemu:///system net-autostart default
```

### Voir l'interface virbr0

```bash
ip addr show virbr0
```

### Voir les routes

```bash
ip route
```

---

## 6. Création d'une VM avec virt-install

### Modèle générique

```bash
sudo virt-install \
  --name <VM> \
  --memory <RAM_MB> \
  --vcpus <NOMBRE_CPU> \
  --disk size=<TAILLE_GB>,format=qcow2 \
  --location /var/lib/libvirt/images/<ISO> \
  --os-variant debian13 \
  --network network=default \
  --graphics none \
  --console pty,target_type=serial \
  --extra-args="console=ttyS0,115200n8"
```

### Exemple

```bash
sudo virt-install \
  --name web01 \
  --memory 1024 \
  --vcpus 1 \
  --disk size=10,format=qcow2 \
  --location /var/lib/libvirt/images/debian-13.6.0-amd64-netinst.iso \
  --os-variant debian13 \
  --network network=default \
  --graphics none \
  --console pty,target_type=serial \
  --extra-args="console=ttyS0,115200n8"
```

---

## 7. Connexion SSH

### Connexion simple

```bash
ssh <UTILISATEUR>@<IP_VM>
```

### Exemple

```bash
ssh matteo@192.168.122.117
```

### Avec une clé privée

```bash
ssh -i <CLE_PRIVEE> <UTILISATEUR>@<IP_VM>
```

---

## 8. Commandes utiles dans Debian

### Nom de la machine

```bash
hostname
```

```bash
hostnamectl
```

### Voir les interfaces réseau

```bash
ip addr
```

### Voir les routes

```bash
ip route
```

### Tester la connexion réseau

```bash
ping -c 3 8.8.8.8
```

### Tester le DNS

```bash
ping -c 3 debian.org
```

### Mettre à jour Debian

```bash
sudo apt update
sudo apt upgrade
```

### Installer un paquet

```bash
sudo apt install <PAQUET>
```

### Supprimer un paquet

```bash
sudo apt remove <PAQUET>
```

---

## 9. Gestion des services avec systemctl

### Voir l'état d'un service

```bash
systemctl status <SERVICE>
```

### Démarrer un service

```bash
sudo systemctl start <SERVICE>
```

### Arrêter un service

```bash
sudo systemctl stop <SERVICE>
```

### Redémarrer un service

```bash
sudo systemctl restart <SERVICE>
```

### Activer un service au démarrage

```bash
sudo systemctl enable <SERVICE>
```

### Activer et démarrer immédiatement

```bash
sudo systemctl enable --now <SERVICE>
```

---

## 10. Commandes Ansible

### Tester tous les hôtes

```bash
ansible all -m ping
```

### Tester un groupe

```bash
ansible <GROUPE> -m ping
```

### Voir l'inventaire

```bash
ansible-inventory --list
```

### Voir l'inventaire sous forme d'arbre

```bash
ansible-inventory --graph
```

### Exécuter une commande sur un groupe

```bash
ansible <GROUPE> -m command -a "<COMMANDE>"
```

### Exécuter une commande sur tous les hôtes

```bash
ansible all -m command -a "<COMMANDE>"
```

### Exécuter un playbook

```bash
ansible-playbook <PLAYBOOK>.yml
```

### Exécuter un playbook avec un inventaire précis

```bash
ansible-playbook -i <INVENTAIRE> <PLAYBOOK>.yml
```

---

## 11. Diagnostic KVM / Libvirt

### Vérifier que KVM fonctionne

```bash
sudo /usr/sbin/kvm-ok
```

### Vérifier l'environnement de virtualisation

```bash
sudo virt-host-validate
```

### Vérifier que /dev/kvm existe

```bash
ls -l /dev/kvm
```

### Vérifier libvirt

```bash
sudo systemctl status libvirtd
```

---

# 12. Commandes à mémoriser en priorité

## VM

```bash
# Lister
sudo virsh --connect qemu:///system list --all

# Démarrer
sudo virsh --connect qemu:///system start <VM>

# Arrêter proprement
sudo virsh --connect qemu:///system shutdown <VM>

# Forcer l'arrêt
sudo virsh --connect qemu:///system destroy <VM>

# Redémarrer
sudo virsh --connect qemu:///system reboot <VM>

# Informations
sudo virsh --connect qemu:///system dominfo <VM>
```

## Réseau

```bash
# Réseaux libvirt
sudo virsh --connect qemu:///system net-list --all

# Interfaces de la VM
sudo virsh --connect qemu:///system domiflist <VM>

# IP de la VM
sudo virsh --connect qemu:///system domifaddr <VM>

# Interface NAT de l'hôte
ip addr show virbr0
```

## SSH

```bash
ssh <UTILISATEUR>@<IP_VM>
```

## Ansible

```bash
ansible all -m ping
ansible-inventory --graph
ansible-playbook <PLAYBOOK>.yml
```

---

# 13. Architecture du labo

```text
                         Internet
                            │
                            │
                     Debian hôte
                            │
                       libvirt/KVM
                            │
                    réseau NAT default
                    192.168.122.0/24
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
   ansible-controller    bastion01       autres VM
       192.168.122.x     192.168.122.x
             │              │
             │              │
             │         ┌────┼────┬────┐
             │         │    │    │    │
             ▼         ▼    ▼    ▼    ▼
          Ansible     web01 app01 db01 ...
```

---

# 14. Logique générale

```text
KVM / libvirt
      ↓
Gestion des VM avec virsh
      ↓
Réseau libvirt / NAT
      ↓
SSH
      ↓
Ansible
      ↓
Inventaire
      ↓
Playbooks
      ↓
Automatisation
```

---

# 15. Cycle de travail classique

```bash
# 1. Vérifier les VM
sudo virsh --connect qemu:///system list --all

# 2. Démarrer une VM
sudo virsh --connect qemu:///system start <VM>

# 3. Vérifier son réseau
sudo virsh --connect qemu:///system domifaddr <VM>

# 4. Se connecter en SSH
ssh <UTILISATEUR>@<IP_VM>

# 5. Travailler sur la VM

# 6. Quitter SSH
exit

# 7. Arrêter proprement la VM
sudo virsh --connect qemu:///system shutdown <VM>
```
