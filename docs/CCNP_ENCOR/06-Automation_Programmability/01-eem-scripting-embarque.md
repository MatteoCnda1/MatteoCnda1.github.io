---
id: 01-eem-scripting-embarque
title: "EEM (Embedded Event Manager) : automatisation embarquée"
sidebar_position: 1
tags: [reseau, automatisation, scripting]
---

# EEM (Embedded Event Manager) : automatisation embarquée

> **EEM** exécute une logique de réaction **directement sur l'équipement Cisco**, sans dépendre d'un serveur d'automatisation externe (Ansible, script Python distant) — utile quand une réaction **immédiate et locale** à un événement est nécessaire, même en cas de perte de connectivité vers un système central.

## Pourquoi EEM plutôt qu'un outil externe (Ansible, script distant)

```text
   AUTOMATISATION EXTERNE (Ansible, script Python distant)

   [Équipement] ──événement détecté──► doit ATTENDRE qu'un système
                                        EXTERNE (souvent via
                                        polling) détecte l'événement
                                        AVANT de réagir
   → délai de réaction dépendant de la fréquence de polling
   → INDISPONIBLE si la connectivité vers ce système externe
     est elle-même coupée (ex. le problème réseau qui déclenche
     l'événement empêche aussi de JOINDRE le système externe)

   EEM (embarqué, LOCAL à l'équipement)

   [Équipement] ──événement détecté──► RÉAGIT IMMÉDIATEMENT,
                                        LOCALEMENT, sans dépendre
                                        d'aucune connectivité externe
```

## Structure d'une policy EEM : Event → Action

```text
   EVENT DETECTOR (déclencheur)         ACTION (réponse)

   - Syslog (message spécifique)         - Envoyer un email/syslog
   - SNMP (seuil dépassé)                 - Exécuter une commande CLI
   - CLI (commande tapée)                 - Générer un fichier
   - Interface (up/down)                  - Redémarrer un processus
   - Timer (périodique/planifié)          - Appeler un script Tcl externe
   - CPU/mémoire (seuil)
```

## Exemple : redémarrage automatique d'une interface en erreur

```bash
Router(config)# event manager applet RESTART_INTERFACE_ERRDISABLE
Router(config-applet)# event syslog pattern "err-disable"
Router(config-applet)# action 1.0 syslog msg "Interface err-disabled detectee, restauration automatique"
Router(config-applet)# action 2.0 cli command "enable"
Router(config-applet)# action 3.0 cli command "configure terminal"
Router(config-applet)# action 4.0 cli command "interface gigabitEthernet 0/1"
Router(config-applet)# action 5.0 cli command "shutdown"
Router(config-applet)# action 6.0 cli command "no shutdown"
```

## Exemple : sauvegarde automatique avant tout changement de configuration

```bash
Router(config)# event manager applet BACKUP_AVANT_CHANGEMENT
Router(config-applet)# event cli pattern "configure terminal" sync no skip no
Router(config-applet)# action 1.0 cli command "enable"
Router(config-applet)# action 2.0 cli command "copy running-config tftp://192.168.1.50/backup-$_event_pub_time.cfg"
```

**Cas d'usage concret** : sur un équipement critique en zone géographiquement isolée (sans accès physique facile), EEM peut être configuré pour **automatiquement restaurer une interface WAN désactivée par erreur** (`errdisable`) sans intervention humaine, ou pour envoyer une alerte immédiate en cas de dépassement d'un seuil CPU — une réaction qui n'attend aucun système de supervision externe, réduisant considérablement le temps moyen de récupération (MTTR) sur des sites distants.

## Scripts Tcl avancés

```text
   Pour une logique plus complexe qu'un simple applet CLI
   (variables, conditions, boucles), EEM supporte des scripts
   Tcl COMPLETS, chargés directement sur l'équipement :

   event manager policy MON_SCRIPT.tcl type user
```

## Vérification

```bash
Router# show event manager policy registered
Router# show event manager environment all
Router# show event manager applet RESTART_INTERFACE_ERRDISABLE
```

## EEM vs automatisation externe — complémentarité

| Critère | EEM (embarqué) | Ansible / script externe |
|---|---|---|
| Dépendance réseau | Aucune (100% local) | Nécessite une connectivité vers l'équipement |
| Complexité de logique | Limitée (CLI/Tcl basique) | Élevée (langage complet, bibliothèques) |
| Portée | Un seul équipement à la fois | Orchestration de nombreux équipements simultanément |
| Cas d'usage typique | Réaction immédiate locale, site isolé | Déploiement de politique à grande échelle |

## Ce qu'il faut retenir

- **EEM** exécute une logique événementielle (event → action) directement sur l'équipement, sans dépendre de connectivité externe — utile pour une réaction immédiate et locale.
- Les déclencheurs incluent Syslog, SNMP, CLI, état d'interface, timer, seuils CPU/mémoire.
- Complémentaire (pas substitut) à l'automatisation externe (Ansible) : EEM pour la réaction locale immédiate, Ansible pour l'orchestration à grande échelle.

## Pour aller plus loin

- [Cisco — Embedded Event Manager Configuration Guide](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/eem/configuration/xe-16/eem-xe-16-book.html)
