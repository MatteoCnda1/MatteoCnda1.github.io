---
id: 101-strongswan
title: strongSwan — VPN IPsec
sidebar_position: 101
tags: [linux, services, vpn]
---

# strongSwan — VPN IPsec

**strongSwan** est une implémentation complète d'**IPsec/IKEv2** pour Linux, très utilisée pour les VPN site-à-site en entreprise et l'accès distant (compatible clients natifs iOS/Android/Windows IKEv2, sans logiciel tiers). C'est la brique déjà utilisée dans le [cours VPN via nmcli](../Networking/vpn-nmcli.md) de ce site — cette fiche couvre l'angle **service systemd natif** (sans passer par NetworkManager), utile pour un serveur ou un tunnel site-à-site permanent.

## Installation

```bash
sudo apt install strongswan strongswan-swanctl   # Debian/Ubuntu
sudo dnf install strongswan                        # Fedora/RHEL
sudo systemctl enable --now strongswan             # (ou strongswan-starter selon la distro)
```

## Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `/etc/swanctl/swanctl.conf` | Config moderne (interface `swanctl`, remplace `ipsec.conf`) |
| `/etc/swanctl/x509/`, `/etc/swanctl/private/` | Certificats et clés privées |
| `/etc/ipsec.conf` / `/etc/ipsec.secrets` | Ancienne interface (`starter`), encore courante |

## Commandes utiles

```bash
systemctl status strongswan
swanctl --load-all              # recharger la config
swanctl --list-conns
swanctl --list-sas              # tunnels actifs
swanctl --initiate --child <nom>
```

## Exemple de configuration

```ini
# /etc/swanctl/swanctl.conf (extrait, site-à-site avec certificats)
connections {
  site-a-b {
    local_addrs = 203.0.113.1
    remote_addrs = 203.0.113.2
    local { auth = pubkey; certs = server.pem }
    remote { auth = pubkey }
    children {
      net-net { local_ts = 10.1.0.0/24; remote_ts = 10.2.0.0/24; esp_proposals = aes256gcm16 }
    }
  }
}
```

## Sécurisation

- Préférer l'authentification par **certificats** (pubkey) plutôt que par clé pré-partagée (PSK), surtout pour l'accès distant multi-utilisateurs.
- Restreindre les `esp_proposals`/`proposals` aux suites modernes (AES-GCM, ECDHE) et désactiver les suites IKEv1/DES/3DES historiques.
- Limiter les `local_ts`/`remote_ts` (traffic selectors) au strict nécessaire plutôt qu'un `0.0.0.0/0` large.

## Logs & dépannage

```bash
journalctl -u strongswan
swanctl --log                    # suivre les logs de négociation IKE en direct
ipsec statusall                  # (interface historique) état détaillé
```

## Voir aussi

- [VPN avec nmcli (IPsec / strongSwan)](../Networking/vpn-nmcli.md) — la même techno pilotée via NetworkManager, pour un poste client
- [ipsec](./102-ipsec.md) — l'interface historique de gestion, toujours présente en parallèle de `swanctl`
- [OpenVPN](./099-openvpn.md), [wg-quick](./100-wg-quick.md) — alternatives VPN
