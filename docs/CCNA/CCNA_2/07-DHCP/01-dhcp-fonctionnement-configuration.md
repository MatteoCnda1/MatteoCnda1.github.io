---
id: 01-dhcp-fonctionnement-configuration
title: "DHCP : fonctionnement (DORA) et configuration IOS"
sidebar_position: 1
tags: [reseau, cheatsheet]
---

# DHCP : fonctionnement (DORA) et configuration IOS

> **DHCP** (Dynamic Host Configuration Protocol, RFC 2131) attribue automatiquement une configuration IP complète (adresse, masque, passerelle, DNS...) à un hôte, évitant la configuration manuelle sur chaque poste.

## Le processus DORA

```text
   CLIENT                                        SERVEUR DHCP

   1. DHCP DISCOVER (broadcast, le client n'a      ────────►
      pas encore d'adresse IP, src=0.0.0.0)

                                                   2. DHCP OFFER (propose une
                                                      adresse disponible)
                          ◄────────────────────────

   3. DHCP REQUEST (broadcast — confirme/demande    ────────►
      formellement l'adresse proposée ; le broadcast
      permet aussi d'informer les AUTRES serveurs
      DHCP ayant répondu que leur offre est déclinée)

                                                   4. DHCP ACK (confirme
                                                      l'attribution, bail
                                                      "lease" commence)
                          ◄────────────────────────

   Mnémonique : D-O-R-A (Discover, Offer, Request, Acknowledge)
```

- Toutes les étapes sont en **broadcast** (le client n'a pas encore d'IP pour de l'unicast) sauf exception avec un agent relais.
- Le **bail (lease)** a une durée définie ; le client tente un renouvellement (DHCP REQUEST unicast direct au serveur) à 50% de la durée du bail écoulée, puis retente en broadcast si échec à 87,5%.

## Configuration d'un serveur DHCP sur routeur Cisco

```bash
! Exclure les adresses réservées (passerelle, serveurs statiques...)
! AVANT de créer le pool — sinon elles pourraient être distribuées
Router(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.10

Router(config)# ip dhcp pool LAN_UTILISATEURS
Router(dhcp-config)# network 192.168.1.0 255.255.255.0
Router(dhcp-config)# default-router 192.168.1.1
Router(dhcp-config)# dns-server 8.8.8.8 8.8.4.4
Router(dhcp-config)# domain-name entreprise.local
Router(dhcp-config)# lease 7                          ! durée du bail en jours (défaut 24h si omis)
```

**Point critique fréquemment oublié à l'examen** : `ip dhcp excluded-address` doit être déclaré **avant** la création du pool (ou au moins avant que le pool ne commence à distribuer des adresses), sinon le serveur pourrait déjà avoir attribué l'adresse de la passerelle à un client.

## Réservation d'adresse statique (par MAC)

```bash
Router(config)# ip dhcp pool SERVEUR_FIXE
Router(dhcp-config)# host 192.168.1.50 255.255.255.0
Router(dhcp-config)# client-identifier 0100.aabb.ccdd.ee    ! format : 01 + @MAC
! (le "01" indique un identifiant de type Ethernet)
```

## Agent relais DHCP (ip helper-address)

```text
   Problème : DHCP DISCOVER est en BROADCAST, qui ne traverse
   PAS les routeurs par défaut → un serveur DHCP centralisé ne
   reçoit pas les requêtes des clients sur un AUTRE sous-réseau.

   [Client VLAN10] ──broadcast──► [Routeur/SVI] ──unicast──► [Serveur DHCP]
                                   (ip helper-address          (sur un autre
                                    convertit le broadcast       sous-réseau)
                                    en unicast vers le
                                    serveur)
```

```bash
Router(config)# interface vlan 10
Router(config-if)# ip helper-address 192.168.100.10   ! IP du serveur DHCP distant
```

Le routeur agit en **agent relais** : il intercepte le broadcast DHCP reçu sur l'interface, l'encapsule en unicast vers le serveur DHCP indiqué (en ajoutant l'option 82 / giaddr identifiant le sous-réseau d'origine, pour que le serveur sache quel pool utiliser), puis relaie la réponse en sens inverse.

## Vérification et diagnostic

```bash
Router# show ip dhcp binding
IP address       Client-ID/Hardware address   Lease expiration     Type
192.168.1.11      0100.aabb.ccdd.eeff           Sep 15 2026 10:00    Automatic

Router# show ip dhcp pool LAN_UTILISATEURS
Router# show ip dhcp conflict          ! adresses en conflit détectées (double attribution)
Router# show ip dhcp server statistics
```

```bash
# Côté client (Linux)
$ sudo dhclient -r eth0    # libère le bail
$ sudo dhclient eth0        # redemande une adresse
```

```powershell
:: Côté client (Windows)
ipconfig /release
ipconfig /renew
```

## Ce qu'il faut retenir

- Processus **DORA** : Discover → Offer → Request → Acknowledge, toutes les étapes en broadcast (sauf renouvellement en cours de bail).
- `ip dhcp excluded-address` (avant le pool) réserve les adresses statiques ; `ip dhcp pool` + `network`/`default-router`/`dns-server` configurent le service.
- `ip helper-address` sur l'interface du client convertit le broadcast DHCP en unicast vers un serveur DHCP distant (agent relais).
- `show ip dhcp binding` liste les baux actifs ; `show ip dhcp conflict` révèle les conflits d'adressage.

## Pour aller plus loin

- [RFC 2131 — Dynamic Host Configuration Protocol](https://www.rfc-editor.org/rfc/rfc2131)
- [Cisco — Configuring DHCP](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/ipaddr_dhcp/configuration/xe-16/dhcp-xe-16-book.html)
