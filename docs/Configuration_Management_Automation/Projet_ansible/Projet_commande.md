---
id: Fiche-commande-rpojet
title: Fiche-commande-projet
sidebar_position: 1
tags: [automatisation]
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

---

# Lab KVM — Ansible, Teleport & Bastion par isolation réseau

> Suite de la fiche de commandes. Couvre le déploiement des services via Ansible,
> la mise en place de Teleport (accès SSH centralisé + audit) et l'isolation
> réseau faisant du bastion l'unique point d'entrée.

---

## 1. Architecture cible

```text
                         Internet
                            │
                       Debian hôte (MSI)
                            │
              ┌─────────────┴─────────────┐
              │      réseau default        │
              │      192.168.122.0/24      │  (NAT, accessible depuis l'hôte)
              │                            │
        ansible-controller           bastion01
        192.168.122.x          eth0: 192.168.122.37
                                     eth1: 10.10.10.2
                                            │
              ┌─────────────────────────────┴────┐
              │      réseau isolated              │
              │      10.10.10.0/24                │  (SANS route vers l'hôte)
              │                                   │
          web01            app01              db01
        10.10.10.10      10.10.10.30       10.10.10.20
         (nginx)         (docker)          (mariadb)
```

Principe : le réseau `isolated` n'a **aucune route** vers l'hôte ni vers le
réseau `default`. Le bastion, seule machine à cheval sur les deux réseaux,
est le point d'entrée unique. Aucun pare-feu n'est utilisé : c'est la
**topologie** qui impose le passage par le bastion.

### Plan d'adressage réseau isolé

| Machine   | Rôle       | IP isolée     |
| --------- | ---------- | ------------- |
| (bridge)  | virbr1     | *(pas d'IP)*  |
| bastion01 | teleport   | 10.10.10.2    |
| web01     | nginx      | 10.10.10.10   |
| db01      | mariadb    | 10.10.10.20   |
| app01     | docker     | 10.10.10.30   |

---

## 2. Structure du projet Ansible

```text
~/lab-ansible/
├── inventory.ini
└── playbooks/
    ├── web01-nginx.yml
    ├── app01-docker.yml
    ├── db01-mariadb.yml
    └── teleport-agent.yml
```

### Inventaire (avec rebond via le bastion)

Fichier `inventory.ini` : les machines isolées sont jointes en passant par le
bastion grâce à `ProxyJump`.

```ini
[bastion]
bastion01 ansible_host=192.168.122.37

[web]
web01 ansible_host=10.10.10.10

[db]
db01 ansible_host=10.10.10.20

[app]
app01 ansible_host=10.10.10.30

[all:vars]
ansible_user=matteo
ansible_python_interpreter=/usr/bin/python3

[web:vars]
ansible_ssh_common_args='-o ProxyJump=matteo@192.168.122.37 -o StrictHostKeyChecking=no'
[db:vars]
ansible_ssh_common_args='-o ProxyJump=matteo@192.168.122.37 -o StrictHostKeyChecking=no'
[app:vars]
ansible_ssh_common_args='-o ProxyJump=matteo@192.168.122.37 -o StrictHostKeyChecking=no'
```

> Le bastion doit posséder la clé SSH publique de chaque machine isolée
> (`ssh-copy-id matteo@10.10.10.x` depuis le bastion).

### Vérifier la connectivité

```bash
ansible all -i inventory.ini -m ping
ansible web:app:db -i inventory.ini -m ping
ansible-inventory -i inventory.ini --graph
```

---

## 3. Playbooks de déploiement des services

### Nginx (web01)

```yaml
---
- name: Installer Nginx sur web01
  hosts: web
  become: true
  tasks:
    - name: Installer nginx
      apt:
        name: nginx
        state: present
        update_cache: true
    - name: Démarrer et activer nginx
      systemd:
        name: nginx
        state: started
        enabled: true
```

### Docker (app01)

Sur Debian 13, `apt-key` n'existe plus : la clé GPG est déposée dans
`/etc/apt/keyrings/` et référencée via `signed-by`.

```yaml
---
- name: Installer Docker sur app01
  hosts: app
  become: true
  tasks:
    - name: Dépendances
      apt:
        name: [ca-certificates, curl, gnupg]
        state: present
        update_cache: true

    - name: Créer le dossier keyrings
      file:
        path: /etc/apt/keyrings
        state: directory
        mode: "0755"

    - name: Télécharger la clé GPG Docker
      get_url:
        url: https://download.docker.com/linux/debian/gpg
        dest: /etc/apt/keyrings/docker.asc
        mode: "0644"

    - name: Dépôt Docker
      apt_repository:
        repo: "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian {{ ansible_distribution_release }} stable"
        state: present
        filename: docker

    - name: Installer Docker Engine
      apt:
        name: [docker-ce, docker-ce-cli, containerd.io, docker-buildx-plugin, docker-compose-plugin]
        state: present
        update_cache: true

    - name: Activer docker
      systemd:
        name: docker
        state: started
        enabled: true
```

### MariaDB (db01)

```yaml
---
- name: Installer MariaDB sur db01
  hosts: db
  become: true
  tasks:
    - name: Installer MariaDB
      apt:
        name: [mariadb-server, python3-pymysql]
        state: present
        update_cache: true
    - name: Démarrer et activer MariaDB
      systemd:
        name: mariadb
        state: started
        enabled: true
```

### Lancer les playbooks

```bash
ansible-playbook -i inventory.ini playbooks/web01-nginx.yml --ask-become-pass
ansible-playbook -i inventory.ini playbooks/app01-docker.yml --ask-become-pass
ansible-playbook -i inventory.ini playbooks/db01-mariadb.yml --ask-become-pass
```

---

## 4. Teleport — Cluster sur le bastion

### Installation (bastion01)

```bash
# Installer une version précise de Teleport Community
curl https://cdn.teleport.dev/install.sh | sudo bash -s 18.10.0

teleport version
tctl version
```

### Configuration du cluster (IP + certificat auto-signé)

```bash
sudo teleport configure -o file \
  --cluster-name=192.168.122.37 \
  --public-addr=192.168.122.37:443
```

Fichier généré : `/etc/teleport.yaml`. Vérifier que `acme` est vide
(`acme: {}`) et non `acme: true` (sinon Teleport tente Let's Encrypt et
échoue faute de domaine public).

### Démarrage

```bash
sudo systemctl enable --now teleport
sudo systemctl status teleport --no-pager
sudo ss -tlnp | grep teleport   # doit écouter sur 443, 3025, 3022...
```

### Créer l'utilisateur admin

```bash
sudo tctl users add matteo --roles=editor,access --logins=matteo
```

La commande renvoie une **URL d'invitation valable 1h**. L'ouvrir dans un
navigateur (accepter l'avertissement de certificat auto-signé), définir le
mot de passe et configurer le 2FA (OTP).

### Se connecter avec le client tsh

```bash
tsh login --proxy=192.168.122.37:443 --user=matteo --insecure
tsh ls                       # liste les nœuds
tsh ssh matteo@web01         # session SSH via le bastion
```

> `--insecure` est nécessaire à cause du certificat auto-signé.

---

## 5. Teleport — Enrôler les agents (web / app / db)

Les machines isolées rejoignent le cluster via la **patte isolée** du bastion
(`10.10.10.2:443`). Elles établissent un **tunnel inversé** (reverse tunnel)
vers le proxy : elles n'ont pas besoin d'être joignables directement.

### Générer un token d'enrôlement (bastion)

```bash
sudo tctl tokens add --type=node --ttl=1h
sudo tctl status | grep "CA pin"    # récupérer le CA pin
```

### Playbook d'enrôlement

Fichier `playbooks/teleport-agent.yml` :

```yaml
---
- name: Enrôler web/app/db comme nœuds Teleport
  hosts: web:app:db
  become: true
  vars:
    teleport_version: "18.10.0"
    teleport_token: "<TOKEN>"
    teleport_ca_pin: "sha256:<CA_PIN>"
    teleport_auth_server: "10.10.10.2:443"

  tasks:
    - name: Installer curl
      apt:
        name: curl
        state: present
        update_cache: true

    - name: Installer Teleport (script officiel)
      shell: |
        curl -fsSL https://cdn.teleport.dev/install.sh | bash -s {{ teleport_version }}
      args:
        creates: /usr/local/bin/teleport

    - name: Écrire la config agent (ssh_service uniquement)
      copy:
        dest: /etc/teleport.yaml
        mode: "0644"
        content: |
          version: v3
          teleport:
            nodename: {{ inventory_hostname }}
            data_dir: /var/lib/teleport
            join_params:
              token_name: {{ teleport_token }}
              method: token
            proxy_server: {{ teleport_auth_server }}
            ca_pin: {{ teleport_ca_pin }}
          auth_service:
            enabled: "no"
          proxy_service:
            enabled: "no"
          ssh_service:
            enabled: "yes"
      register: tp_config

    - name: Créer le dossier de l'override systemd
      file:
        path: /etc/systemd/system/teleport.service.d
        state: directory
        mode: "0755"

    - name: Override systemd pour démarrage insecure
      copy:
        dest: /etc/systemd/system/teleport.service.d/override.conf
        mode: "0644"
        content: |
          [Service]
          ExecStart=
          ExecStart=/usr/local/bin/teleport start --insecure --config /etc/teleport.yaml --pid-file=/run/teleport.pid
      register: tp_override

    - name: Re-join propre (vider l'état si config changée)
      block:
        - name: Arrêter teleport
          systemd:
            name: teleport
            state: stopped
        - name: Supprimer l'ancien état
          file:
            path: /var/lib/teleport
            state: absent
      when: tp_config.changed

    - name: Recharger systemd, activer et démarrer teleport
      systemd:
        name: teleport
        state: restarted
        enabled: true
        daemon_reload: true
      when: tp_config.changed or tp_override.changed
```

### Lancer et vérifier

```bash
ansible-playbook -i inventory.ini playbooks/teleport-agent.yml --ask-become-pass

# sur le bastion
sudo tctl nodes ls          # doit lister bastion + web + app + db
```

### Supprimer un nœud (doublon / fantôme)

```bash
# lister les UUID
sudo tctl nodes ls
# supprimer par UUID
sudo tctl rm nodes/<UUID>
```

> Un nœud arrêté disparaît de lui-même après ~10-15 min (heartbeat expiré).

---

## 6. Isolation réseau — le bastion comme point d'entrée unique

### Créer le réseau libvirt isolé

Fichier `isolated.xml` — **sans bloc `<forward>`** (pas de NAT) et
**sans bloc `<ip>`** (pas d'adresse côté hôte → l'hôte n'a aucune route
vers le réseau isolé) :

```xml
<network>
  <name>isolated</name>
  <bridge name="virbr1" stp="on" delay="0"/>
  <domain name="isolated" localOnly="yes"/>
</network>
```

```bash
sudo virsh net-define isolated.xml
sudo virsh net-start isolated
sudo virsh net-autostart isolated
sudo virsh net-list --all
```

### Redéfinir un réseau existant

Un réseau actif ne peut pas être redéfini directement :

```bash
sudo virsh net-destroy isolated     # arrêter
sudo virsh net-undefine isolated    # supprimer la définition
sudo virsh net-define isolated.xml  # redéfinir
sudo virsh net-start isolated
sudo virsh net-autostart isolated
```

### Attacher une interface isolée à une VM

```bash
sudo virsh attach-interface <VM> network isolated --model virtio --config --live
sudo virsh domiflist <VM>           # vérifier les 2 interfaces
```

### Détacher l'interface default (couper le filet)

À faire **une VM à la fois**, après avoir validé l'accès via le bastion.

```bash
# récupérer la MAC de l'interface "default"
sudo virsh domiflist <VM>

# détacher
sudo virsh detach-interface <VM> --type network --mac <MAC_default> --config --live
```

### Configurer l'IP fixe dans la VM

Fichier `/etc/network/interfaces.d/isolated` (adapter le nom d'interface
retourné par `ip -br link` et l'adresse) :

```text
auto enp7s0
iface enp7s0 inet static
    address 10.10.10.10
    netmask 255.255.255.0
```

> **Pas de ligne `gateway`** : le réseau isolé n'a pas de route sortante.
> La sortie Internet contrôlée passera par un proxy (Tinyproxy).

```bash
sudo ifup enp7s0
```

---

## 7. Validation de l'isolation

### Depuis l'hôte (MSI) — tout doit ÉCHOUER

```bash
ping -c2 10.10.10.10    # ❌ pas de route hôte → isolé
ping -c2 10.10.10.20    # ❌
ping -c2 10.10.10.30    # ❌
ip addr show virbr1     # ne doit PAS avoir d'IP 10.10.10.x
```

### Depuis le bastion — tout doit MARCHER

```bash
ping -c2 10.10.10.10    # ✅
ping -c2 10.10.10.20    # ✅
ping -c2 10.10.10.30    # ✅
```

### Depuis le controller — via le bastion

```bash
ansible all -i inventory.ini -m ping    # ✅ les 4 en pong
```

### Via Teleport (UI web ou tsh)

```bash
tsh ssh matteo@web01    # ✅ accès + session enregistrée
```

---

## 8. Dépannage réseau (post-mortem)

### Symptôme : « No route to host » depuis le bastion vers les VM isolées

**Cause fréquente** : après un `net-destroy` / `net-start`, la patte isolée
du bastion n'est plus rattachée au bridge `virbr1`, ou son nom d'interface
a changé (ex. `enp7s0`), cassant la config statique.

**Diagnostic (sur l'hôte)** — vérifier que les interfaces des VM sont bien
esclaves du bridge :

```bash
ip link show master virbr1     # doit lister les vnet des VM isolées
```

Si la patte du bastion n'apparaît pas en `master virbr1`, la ré-attacher :

```bash
sudo virsh detach-interface bastion01 --type network --mac <MAC> --config --live
sudo virsh attach-interface bastion01 network isolated --model virtio --config --live
```

**Diagnostic (dans le bastion)** — vérifier le nom réel vs la config :

```bash
ip -br link
cat /etc/network/interfaces.d/isolated
```

Aligner le nom d'interface du fichier sur le nom réel, puis :

```bash
sudo ifdown <iface> ; sudo ifup <iface>
ip addr show <iface>     # doit porter 10.10.10.2
```

### Symptôme : IP isolée perdue au reboot

L'IP posée avec `ip addr add` est **volatile**. Toujours la déclarer dans
`/etc/network/interfaces.d/isolated` pour qu'elle survive au redémarrage.

### VM gelées : redémarrage complet du lab

```bash
# arrêt propre, puis forcé si besoin
for vm in bastion01 web01 app01 db01; do
  sudo virsh shutdown $vm
done
sleep 20
sudo virsh list --all
# forcer les récalcitrantes
for vm in bastion01 web01 app01 db01; do
  sudo virsh destroy $vm
done
# redémarrer, bastion en premier
sudo virsh net-start isolated 2>/dev/null
sudo virsh start bastion01 ; sleep 10
for vm in web01 app01 db01; do sudo virsh start $vm; done
```

---

## 9. Points de vigilance / améliorations

- **Noms d'interface instables** : après un détach/attach, le nom
  (`enpXs0`) et la MAC peuvent changer et casser la config statique.
  Parade durable : fixer le nom d'interface via une règle basée sur la MAC.
- **Secrets en clair** : le token et le CA pin sont dans le playbook.
  Bonne pratique : chiffrer avec **Ansible Vault**.
- **Certificat auto-signé** : `--insecure` est acceptable en lab mais à
  éviter en production (utiliser une vraie CA / Let's Encrypt avec un domaine).
- **Sortie Internet** : les VM isolées n'ont plus de route sortante.
  Prévoir un **proxy HTTP (Tinyproxy)** pour les `apt update/install`,
  ce qui centralise et rend auditable le trafic sortant.

---

## 10. Cycle de travail type

```bash
# 1. Vérifier les VM
sudo virsh list --all

# 2. Vérifier les réseaux
sudo virsh net-list --all

# 3. Tester la connectivité Ansible (via bastion)
ansible all -i inventory.ini -m ping

# 4. Vérifier les nœuds Teleport (sur le bastion)
sudo tctl nodes ls

# 5. Accéder à une machine isolée
tsh ssh matteo@web01
```

---

## 11. Sortie Internet contrôlée — Tinyproxy

Les VM isolées n'ont **aucune route sortante** (pas de passerelle sur le réseau
`isolated`). Pour leur permettre de faire `apt update/install` tout en gardant
l'isolation, on installe un **proxy HTTP (Tinyproxy)** sur le bastion. Chaque
accès Internet des machines isolées passe alors par un point unique, **tracé
et auditable** — contrairement à un NAT transparent.

### Placement

Tinyproxy est installé **sur le bastion**, déjà bi-domicilié :

- il écoute sur la patte isolée `10.10.10.2` (joignable par web/app/db) ;
- il relaie vers Internet via la patte default `192.168.122.37` (NAT de l'hôte).

Le proxy n'écoute **pas** sur la patte default : il n'est donc pas exposé au
réseau `default`, seules les VM isolées peuvent l'utiliser.

```text
   web/app/db ──HTTP/HTTPS──▶ Tinyproxy (10.10.10.2:8888) ──▶ Internet
   (réseau isolé)             sur le bastion                  (via NAT hôte)
                                    │
                                    ▼
                        /var/log/tinyproxy/tinyproxy.log
                        (journal de tout le trafic sortant)
```

### Playbook — installer Tinyproxy (bastion)

Fichier `playbooks/tinyproxy.yml` :

```yaml
---
- name: Installer et configurer Tinyproxy sur le bastion
  hosts: bastion
  become: true
  vars:
    tinyproxy_port: 8888
    allowed_network: "10.10.10.0/24"

  tasks:
    - name: Installer tinyproxy
      apt:
        name: tinyproxy
        state: present
        update_cache: true

    - name: Configurer tinyproxy
      copy:
        dest: /etc/tinyproxy/tinyproxy.conf
        mode: "0644"
        content: |
          User tinyproxy
          Group tinyproxy
          Port {{ tinyproxy_port }}
          Timeout 600
          DefaultErrorFile "/usr/share/tinyproxy/default.html"
          StatFile "/usr/share/tinyproxy/stats.html"
          LogFile "/var/log/tinyproxy/tinyproxy.log"
          LogLevel Info
          MaxClients 100
          # Écoute uniquement sur la patte isolée
          Listen 10.10.10.2
          # Autorise uniquement le réseau isolé
          Allow {{ allowed_network }}
          # Autorise CONNECT pour le HTTPS
          ConnectPort 443
          ConnectPort 563
      register: tp_conf

    - name: Activer et (re)démarrer tinyproxy
      systemd:
        name: tinyproxy
        state: restarted
        enabled: true
      when: tp_conf.changed
```

```bash
ansible-playbook -i inventory.ini playbooks/tinyproxy.yml --ask-become-pass
```

**Options importantes de la configuration :**

| Directive             | Rôle                                                        |
| --------------------- | ---------------------------------------------------------- |
| `Listen 10.10.10.2`   | N'écoute que sur la patte isolée (non exposé au default).  |
| `Allow 10.10.10.0/24` | Seul le réseau isolé peut utiliser le proxy.               |
| `ConnectPort 443`     | Autorise la méthode CONNECT → indispensable pour le HTTPS. |
| `LogFile ...`         | Journalise chaque requête (source, destination, heure).    |

### Playbook — configurer apt sur les VM isolées

Fichier `playbooks/apt-proxy.yml` :

```yaml
---
- name: Configurer apt pour passer par Tinyproxy
  hosts: web:app:db
  become: true
  vars:
    proxy_url: "http://10.10.10.2:8888"

  tasks:
    - name: Déclarer le proxy pour apt (http + https)
      copy:
        dest: /etc/apt/apt.conf.d/95proxy
        mode: "0644"
        content: |
          Acquire::http::Proxy "{{ proxy_url }}";
          Acquire::https::Proxy "{{ proxy_url }}";
```

```bash
ansible-playbook -i inventory.ini playbooks/apt-proxy.yml --ask-become-pass
```

### Vérification

```bash
# Le proxy écoute-t-il sur la bonne patte ? (sur le bastion)
sudo ss -tlnp | grep 8888          # doit afficher 10.10.10.2:8888

# apt fonctionne-t-il depuis une VM isolée (sans route directe) ?
ansible web01 -i inventory.ini -m apt -a "update_cache=true" --become
```

### Audit du trafic sortant

C'est l'intérêt majeur du proxy : tout le trafic Internet des VM isolées est
centralisé et journalisé.

```bash
# sur le bastion
sudo tail -f /var/log/tinyproxy/tinyproxy.log
```

Exemple de trace (web01 télécharge ses paquets Debian) :

```text
CONNECT  Connect (file descriptor 9): 10.10.10.10
CONNECT  Request: GET http://deb.debian.org/debian/dists/trixie-updates/InRelease
```

On y lit la **source** (`10.10.10.10`), la **destination** et l'**horodatage** :
chaque accès sortant est attribuable à une machine précise.

### Points de vigilance

- **Bastion = point de sortie unique.** Le proxy concentre le trafic HTTP(S)
  sortant sur le bastion, qui centralise aussi l'accès SSH (Teleport). Toute la
  médiation est sur une seule machine → audit simplifié, mais machine critique.
- **HTTPS via CONNECT.** Le proxy relaie le HTTPS sans le déchiffrer (tunnel
  CONNECT) : il voit le domaine de destination, pas le contenu. Suffisant pour
  l'audit d'accès, insuffisant pour inspecter les payloads.
- **Filtrage possible.** Tinyproxy permet des listes `Filter` (autoriser /
  bloquer des domaines) — piste d'amélioration pour restreindre les
  destinations autorisées (ex. n'autoriser que les dépôts Debian).
