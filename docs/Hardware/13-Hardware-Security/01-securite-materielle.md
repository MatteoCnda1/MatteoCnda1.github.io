---
id: 01-securite-materielle
title: Sécurité matérielle
sidebar_position: 1
tags: [hardware, cybersecurite]
---

# Sécurité matérielle

> La sécurité logicielle repose in fine sur des garanties matérielles : une chaîne de confiance qui commence dès la mise sous tension. Ce cours couvre TPM, Secure Boot, et les grandes familles d'attaques matérielles — un complément physique aux notions déjà vues côté logiciel dans [Cybersecurity](../../Cybersecurity/index.md).

## La chaîne de démarrage sécurisé (Secure Boot)

Comme vu dans le cours [Firmware](../12-Firmware/index.md), le [bootloader](../12-Firmware/01-bios-uefi.md) charge le noyau de l'OS. **Secure Boot** (partie de la spécification UEFI) vérifie **cryptographiquement**, à chaque étape, que le code chargé est signé par une autorité de confiance — empêchant un bootloader ou un noyau modifié (par un malware, par exemple un *bootkit*) de s'exécuter silencieusement avant même l'OS.

```text
   Firmware UEFI (contient des clés publiques de confiance)
        │
        ▼
   Vérifie la signature du bootloader ── signature invalide ──▶ démarrage refusé
        │ signature valide
        ▼
   Bootloader vérifie la signature du noyau ── invalide ──▶ refusé
        │ valide
        ▼
   Noyau démarre normalement
```

Chaque maillon vérifie le suivant avant de lui céder le contrôle — d'où le terme de **chaîne de confiance** (chain of trust) : la confiance dans le noyau final dépend de la confiance accordée, dès le départ, aux clés intégrées dans le firmware.

## Le TPM (Trusted Platform Module)

Une puce (ou une implémentation intégrée au CPU, dite *firmware TPM*) dédiée à des opérations cryptographiques et au stockage sécurisé de secrets — conçue pour que même un accès physique root/administrateur au système ne permette pas d'en extraire les clés privées qu'elle génère.

Usages principaux :

- **Chiffrement de disque** (BitLocker sous Windows, LUKS avec scellement TPM sous Linux) : la clé de déchiffrement du disque est scellée dans le TPM et n'est libérée que si l'état de démarrage (mesuré étape par étape) correspond à un état de confiance connu — empêchant un attaquant de démarrer sur un autre OS pour lire le disque directement.
- **Attestation** : prouver à un tiers (ex : un serveur d'entreprise) que la machine a démarré dans un état non altéré, sans révéler les détails exacts de cet état.
- **Stockage de clés** : générer et garder des clés cryptographiques qui ne quittent jamais la puce, même pour signer/déchiffrer (l'opération se fait *dans* le TPM).

```bash
# Vérifier la présence et l'état d'un TPM sous Linux
sudo dmesg | grep -i tpm
sudo tpm2_getcap properties-fixed   # nécessite tpm2-tools
```

## Attaques matérielles : les grandes familles

### Attaques par canal auxiliaire (side-channel)

Plutôt que d'attaquer directement l'algorithme cryptographique, on observe des **effets physiques indirects** de son exécution pour en déduire des secrets :

- **Timing attack** : le temps d'exécution d'une opération dépend parfois des bits de la clé secrète manipulée.
- **Analyse de consommation électrique** (SPA/DPA — Simple/Differential Power Analysis) : la consommation instantanée d'une puce varie selon les données traitées, mesurable avec une sonde et un oscilloscope.
- **Analyse électromagnétique** : les variations de champ électromagnétique émises par une puce en fonctionnement peuvent être captées à distance.

Ces attaques sont particulièrement pertinentes sur des dispositifs **embarqués** (cartes à puce, microcontrôleurs — voir [Embedded](../15-Embedded/index.md)) où l'attaquant a souvent un accès physique direct.

### Attaques par injection de faute

Provoquer délibérément une erreur matérielle (variation de tension, impulsion laser, glitch d'horloge) pendant une opération sensible, dans l'espoir que le composant se comporte de façon exploitable (par exemple, sauter une vérification de mot de passe ou une étape de vérification de signature).

### Attaques par accès physique direct

- **Cold boot attack** : la RAM conserve son contenu quelques secondes après la coupure d'alimentation (surtout si refroidie) — assez longtemps pour redémarrer rapidement sur un autre système et extraire des clés de chiffrement encore présentes en mémoire.
- **DMA attack** : certains ports (Thunderbolt, PCIe — voir [Bus & Interfaces](../07-Buses-Interfaces/index.md)) permettent historiquement un accès direct à la mémoire (*Direct Memory Access*) sans passer par le CPU/OS, exploitable pour lire la RAM d'une machine verrouillée mais allumée. Les systèmes modernes limitent ce risque via l'**IOMMU** (voir [Virtualization](../14-Virtualization/index.md)).

### Rowhammer

En accédant de façon répétée et très rapide à certaines lignes de mémoire **DRAM** (voir [RAM](../04-RAM/index.md)), il est possible de provoquer des **bit flips** dans des lignes adjacentes, par un effet purement électrique (interférence entre cellules voisines) — sans jamais accéder directement aux données visées. Une attaque qui illustre bien que la frontière entre "bug logiciel" et "défaut physique exploitable" peut être ténue.

## Confidential Computing : chiffrer la mémoire en cours d'utilisation

Technologies récentes (Intel SGX/TDX, AMD SEV) qui chiffrent la mémoire **pendant son utilisation active** par le CPU, pas seulement au repos sur disque — visant à protéger des données sensibles même contre un accès privilégié au système d'exploitation ou à l'hyperviseur hébergeant la machine (pertinent notamment pour du cloud computing où l'on ne contrôle pas l'infrastructure physique sous-jacente).

## Ce qu'il faut retenir

- **Secure Boot** vérifie cryptographiquement chaque maillon de la chaîne de démarrage ; le **TPM** génère/stocke des secrets qu'un accès système, même privilégié, ne peut extraire directement.
- Les attaques **side-channel** (timing, consommation, électromagnétique) exploitent des effets physiques indirects plutôt que de casser l'algorithme lui-même.
- **Cold boot** (RAM qui persiste après coupure) et **DMA** (accès mémoire direct via certains ports) sont des vecteurs d'attaque à accès physique classiques ; **Rowhammer** provoque des erreurs par interférence électrique pure entre cellules DRAM voisines.
- Le **Confidential Computing** (SGX, SEV) étend la protection à la mémoire en cours d'utilisation, pas seulement au stockage.

## Pour aller plus loin

- [Wikipedia — Trusted Platform Module](https://en.wikipedia.org/wiki/Trusted_Platform_Module)
- [Wikipedia — Side-channel attack](https://en.wikipedia.org/wiki/Side-channel_attack)
- [Wikipedia — Row hammer](https://en.wikipedia.org/wiki/Row_hammer)
