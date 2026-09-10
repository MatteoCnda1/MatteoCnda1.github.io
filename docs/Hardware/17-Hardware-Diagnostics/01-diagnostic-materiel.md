---
id: 01-diagnostic-materiel
title: Diagnostic matériel
sidebar_position: 1
tags: [hardware, linux]
---

# Diagnostic matériel

> Distinguer une panne matérielle d'un problème logiciel est souvent le vrai défi — les symptômes se ressemblent (plantages, lenteurs, écrans noirs). Ce cours rassemble une méthode et les outils pour trancher, en s'appuyant sur les cours précédents ([Power](../10-Power/index.md), [Cooling](../11-Cooling/index.md), [RAM](../04-RAM/index.md), [Storage](../05-Storage/index.md)).

## Le POST et ses codes d'erreur

Comme vu dans le cours [Firmware](../12-Firmware/01-bios-uefi.md), le **POST** (Power-On Self-Test) est la toute première vérification matérielle effectuée par le firmware. Un échec du POST se manifeste souvent **avant même** qu'une image n'apparaisse à l'écran (logique : la carte graphique elle-même n'est pas encore validée) :

```text
   Bips du haut-parleur de la carte mère (beep codes) — varient selon le
   fabricant du firmware (AMI, Award/Phoenix...), mais un schéma courant :

   1 bip court                → tout va bien (démarrage normal)
   Bips longs répétés          → souvent un problème de RAM
   Pas de bip du tout          → carte mère ou alimentation en cause

   Codes LED / afficheur 7 segments (sur les cartes mères plus récentes)
   → un code numérique précis, à chercher dans le manuel de la carte mère
```

Le manuel de la carte mère (souvent disponible en PDF sur le site du fabricant) reste la référence la plus fiable pour interpréter un code POST précis — ils varient significativement d'un fabricant à l'autre.

## Méthode générale : isoler la variable

Le principe de base de tout diagnostic matériel sérieux : **changer une seule chose à la fois**, pour savoir avec certitude laquelle est responsable.

```text
   Symptôme observé
        │
        ▼
   Le système démarre-t-il jusqu'au POST ?
   ├── NON → suspect : alimentation, carte mère, CPU, RAM (voir plus bas)
   └── OUI → le système démarre-t-il l'OS ?
             ├── NON → suspect : disque de boot, bootloader, RAM
             └── OUI → le problème apparaît-il sous charge seulement ?
                       ├── OUI → suspect : refroidissement, alimentation
                       │         (voir Cooling, throttling thermique)
                       └── NON → probablement logiciel (pilotes, OS)
```

## Diagnostiquer la RAM

Une RAM défectueuse cause souvent des symptômes trompeurs : plantages aléatoires (pas systématiques, contrairement à un bug logiciel reproductible), écrans bleus/noirs sporadiques, corruption de fichiers sans cause apparente.

```bash
# memtest86+ : démarre depuis une clé USB dédiée, teste la RAM en profondeur
# (hors de tout système d'exploitation, pour tester la RAM "à nu")

# Sous Linux déjà démarré, test plus léger et moins exhaustif :
sudo apt install memtester
sudo memtester 1024 3     # teste 1024 Mo, 3 passes
```

Un test **memtest86+** complet peut prendre plusieurs heures — une seule passe sans erreur ne garantit pas l'absence totale de défaut (certaines erreurs n'apparaissent que sous conditions thermiques ou de charge précises), mais plusieurs passes propres sont un bon signal de confiance.

## Diagnostiquer le stockage

```bash
sudo smartctl -a /dev/sda           # santé SMART complète d'un disque
sudo smartctl -t short /dev/sda      # lancer un auto-test court
sudo smartctl -l selftest /dev/sda   # voir les résultats des auto-tests

sudo badblocks -v /dev/sda           # rechercher des secteurs défectueux (⚠️ lent, à faire hors production)
```

Les attributs **SMART** à surveiller particulièrement : `Reallocated_Sector_Count` (secteurs défectueux déjà remplacés — un compteur qui augmente est un signal d'alerte sérieux), `Current_Pending_Sector` (secteurs suspects en attente de vérification), et pour un SSD, l'usure restante (`Wear_Leveling_Count` ou équivalent selon le fabricant).

## Diagnostiquer CPU/GPU sous charge

```bash
# Stress-tester le CPU tout en surveillant la température
stress-ng --cpu 0 --timeout 300s &
watch -n1 sensors

# Stress-tester le GPU (exemple NVIDIA)
nvidia-smi -l 1                      # surveiller pendant une charge (jeu, rendu, benchmark)
```

Un système qui plante ou ralentit brutalement **uniquement** sous forte charge soutenue (jamais au repos) pointe typiquement vers un problème de [refroidissement](../11-Cooling/index.md) (throttling voire coupure de sécurité) ou d'[alimentation](../10-Power/index.md) (incapable de fournir la puissance de crête nécessaire).

## Diagnostiquer un problème d'alimentation

Plus difficile à isoler directement sans matériel de mesure dédié (multimètre, testeur de PSU) — mais des indices forts : redémarrages/extinctions brutales sous charge (surtout en jeu ou rendu GPU-intensif), instabilité qui disparaît en limitant la consommation (undervolting, limitation de puissance GPU), ou symptômes qui apparaissent après l'ajout d'un composant supplémentaire (nouveau disque, nouveau GPU) qui a fait dépasser la capacité réelle de l'alimentation.

## Outils de surveillance à connaître

| Outil | Rôle |
|---|---|
| `sensors` (lm-sensors) | Températures des capteurs matériels |
| `smartctl` (smartmontools) | Santé des disques (SMART) |
| `memtester` / **memtest86+** | Tests de RAM |
| `stress-ng` | Charge CPU/mémoire/disque synthétique |
| `lspci` / `lsusb` | Lister le matériel détecté et ses identifiants |
| `dmesg` | Journal noyau — souvent le premier endroit où regarder après un plantage |

## Ce qu'il faut retenir

- La méthode de base : **isoler une variable à la fois**, et déterminer à quel stade précis (POST, boot OS, sous charge) le problème apparaît.
- Une **RAM défectueuse** produit des symptômes irréguliers (pas systématiquement reproductibles), contrairement à un bug logiciel typique.
- Les attributs **SMART** (`Reallocated_Sector_Count` en tête) sont le premier réflexe pour juger de la santé d'un disque.
- Un problème qui n'apparaît **que sous charge soutenue** oriente vers le refroidissement ou l'alimentation, pas vers un composant défaillant au repos.

## Pour aller plus loin

- [memtest86+ — site officiel](https://www.memtest.org/)
- [smartmontools — documentation](https://www.smartmontools.org/)
- [Wikipedia — Power-on self-test](https://en.wikipedia.org/wiki/Power-on_self-test)
