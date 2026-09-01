---
id: 01-android-basics
title: Android — les fondamentaux
sidebar_position: 1
---

# Android — les fondamentaux

## Qu'est-ce qu'Android ?

Android est un **système d'exploitation** (OS), au même titre que Linux, Windows ou macOS. La confusion la plus fréquente est de croire qu'Android est « juste l'interface d'un téléphone ». En réalité, c'est un OS complet, avec un noyau, une gestion des processus, un système de fichiers, un modèle de sécurité, et des applications — exactement comme les OS que tu connais.

Point fondamental pour toi : **Android est bâti sur le noyau Linux**. Ce n'est pas une distribution GNU/Linux classique (il n'utilise ni la glibc, ni les outils GNU habituels, ni un gestionnaire de paquets comme APT), mais son cœur est bien un noyau Linux modifié. Beaucoup de concepts Linux que tu maîtrises (processus, permissions, utilisateurs, système de fichiers, SELinux) s'y retrouvent, parfois sous une forme adaptée. C'est ton meilleur point d'ancrage pour aborder cet environnement.

Android est développé principalement par Google, et son cœur est **open source** : c'est l'**AOSP** (Android Open Source Project), sous licence Apache 2.0. C'est un point important, sur lequel on reviendra, car il explique l'existence des ROMs alternatives et l'écosystème libre autour d'Android.

### Android n'est pas que pour les téléphones

Android tourne sur une grande variété d'appareils, ce qui montre bien que c'est un OS polyvalent :

- **Smartphones et tablettes** — l'usage le plus connu.
- **Téléviseurs** (Android TV / Google TV).
- **Voitures** (Android Auto, et Android Automotive OS embarqué dans le véhicule).
- **Montres connectées** (Wear OS).
- **Objets connectés / IoT** (Android Things, aujourd'hui largement remplacé par d'autres solutions, mais le principe demeure).
- **Boîtiers TV, bornes, terminaux de paiement, systèmes embarqués** divers.

Cette omniprésence fait d'Android l'un des OS les plus déployés au monde (des milliards d'appareils actifs). Pour un profil réseau/sécurité, c'est une surface considérable à comprendre.

## AOSP vs Android « Google »

Distinction essentielle à saisir dès le début, car elle structure tout l'écosystème.

**AOSP (Android Open Source Project)** est la base libre et gratuite : le noyau, le système, le framework applicatif, les applications de base (téléphone, appareil photo minimal, etc.). N'importe qui peut télécharger le code source, le compiler, le modifier et le distribuer. C'est ce qui permet aux constructeurs (Samsung, Xiaomi...) de créer leurs propres versions, et à la communauté de créer des **ROMs alternatives** (LineageOS, /e/OS, GrapheneOS...).

**Les services Google (GMS, Google Mobile Services)** ne font **pas** partie de l'AOSP. Ce sont des composants propriétaires ajoutés par-dessus : le Play Store, les Google Play Services (une couche logicielle centrale utilisée par énormément d'applications), Gmail, Maps, etc. Pour les intégrer, un constructeur doit obtenir une licence de Google et respecter ses conditions.

Conséquence concrète : un appareil peut faire tourner Android **sans** les services Google (c'est le cas de nombreux appareils, notamment en Chine avec Huawei, ou des ROMs axées vie privée comme GrapheneOS). L'appareil est alors « dégooglisé ». C'est un sujet directement lié à ta sensibilité open source et aux questions de vie privée : la partie visible d'Android est libre, mais l'écosystème applicatif dépend largement d'une couche Google propriétaire.

## Android vs iOS, et vs Linux desktop

Pour situer Android, deux comparaisons utiles.

**Android vs iOS** (l'OS des iPhone, développé par Apple) : Android est ouvert (AOSP), permet l'installation d'applications hors magasin officiel (**sideloading**), autorise des magasins alternatifs, et équipe des appareils de très nombreux constructeurs. iOS est fermé, verrouillé à un seul magasin (App Store) sur un matériel Apple uniquement, avec un contrôle beaucoup plus strict. Cette ouverture d'Android est à double tranchant : plus de liberté, mais aussi une surface d'attaque et une fragmentation plus grandes.

**Android vs distribution GNU/Linux classique** (Debian, Ubuntu...) : bien qu'ils partagent le noyau Linux, ils diffèrent profondément au-dessus. Une distribution classique utilise la bibliothèque C GNU (glibc), les utilitaires GNU, un système d'init (systemd), un gestionnaire de paquets (APT/DNF), et fait tourner des programmes compilés en natif. Android remplace tout ça : une bibliothèque C différente (Bionic), son propre système de démarrage et de services, pas d'APT, et des applications qui tournent dans une **machine virtuelle** dédiée (voir plus bas). Retiens : **même noyau, écosystème totalement différent au-dessus**.

## L'architecture d'Android : les couches

C'est la partie centrale pour comprendre le concept d'Android. Le système est organisé en **couches empilées** (une « stack »), du matériel jusqu'aux applications. Chaque couche s'appuie sur celle du dessous et offre des services à celle du dessus. On les parcourt de bas en haut.

### 1. Le noyau Linux (Linux Kernel)

Tout en bas, le **noyau Linux** (une version modifiée pour le mobile). Comme sur n'importe quel Linux, il gère :

- Les **processus** et leur ordonnancement.
- La **mémoire**.
- Les **pilotes** (drivers) du matériel : écran, appareil photo, WiFi, Bluetooth, capteurs, etc.
- La **sécurité de bas niveau** (permissions, isolation des processus).
- La **gestion de l'énergie** (crucial sur mobile — Android ajoute des mécanismes spécifiques comme le *wakelock* pour gérer la batterie).

Android ajoute au noyau standard des composants spécifiques au mobile, dont le plus emblématique est **Binder**, le mécanisme de communication inter-processus (IPC) qui permet aux différents composants d'Android de se parler. Binder est un pilier discret mais fondamental de l'architecture.

### 2. La couche d'abstraction matérielle (HAL)

Au-dessus du noyau, la **HAL (Hardware Abstraction Layer)** offre une interface standardisée entre le matériel et les couches logicielles supérieures. Elle permet au reste d'Android de dire « prends une photo » ou « active le WiFi » sans connaître les détails du composant matériel précis du fabricant. Chaque type de matériel (caméra, audio, capteurs...) a son module HAL. C'est ce qui permet à Android de tourner sur des matériels très variés : il suffit d'écrire la bonne HAL pour un composant donné.

### 3. Les bibliothèques natives (C/C++)

Un ensemble de **bibliothèques écrites en C/C++** fournit des fonctions de base performantes : le moteur de rendu graphique, les codecs multimédia, la base de données embarquée **SQLite** (celle-là même que tu as vue dans ton cours SQL — elle est au cœur d'Android pour le stockage des applications), les bibliothèques de dessin, etc. On y trouve aussi la bibliothèque C d'Android, **Bionic** (l'équivalent de la glibc, mais plus légère et adaptée au mobile).

### 4. L'Android Runtime (ART)

Voici une des idées les plus importantes à comprendre. Les applications Android ne sont **pas** exécutées directement par le processeur comme un programme natif classique. Elles tournent dans un **environnement d'exécution dédié**, l'**ART (Android Runtime)**.

Le principe : une application Android est écrite en Java ou Kotlin, puis compilée en un **bytecode** spécifique appelé **DEX** (Dalvik Executable). Ce bytecode n'est pas du code machine directement exécutable ; c'est un format intermédiaire. C'est l'ART qui exécute ce bytecode sur l'appareil.

Pourquoi ce détour ? Pour la **portabilité** : le même bytecode DEX peut tourner sur des processeurs différents (ARM, x86...) sans être recompilé, car c'est l'ART, spécifique à chaque appareil, qui fait le lien avec le matériel. C'est le même principe que la machine virtuelle Java (JVM) sur PC. Chaque application s'exécute dans sa **propre instance** de l'environnement, isolée des autres — ce qui est aussi un mécanisme de sécurité (on y revient).

Note historique utile : avant Android 5, ce runtime s'appelait **Dalvik** et utilisait de la compilation « juste à temps » (JIT). ART l'a remplacé avec de la compilation « à l'avance » (AOT) puis un modèle hybride, pour de meilleures performances. Si tu croises le terme « Dalvik » ou l'extension « .dex », c'est de ça qu'il s'agit.

### 5. Le framework applicatif (Java API Framework)

Au-dessus du runtime, le **framework** offre aux développeurs un ensemble d'API (interfaces de programmation) de haut niveau, en Java/Kotlin, pour construire des applications sans réinventer la roue. Il fournit des « gestionnaires » (managers) pour chaque grand service du système :

- **Activity Manager** — gère le cycle de vie des applications et de leurs écrans.
- **Package Manager** — gère les applications installées.
- **Window Manager** — gère l'affichage des fenêtres.
- **Location Manager** — gère la géolocalisation.
- **Notification Manager**, **Telephony Manager**, **Connectivity Manager**, etc.

C'est cette couche que manipule un développeur d'applications au quotidien.

### 6. Les applications (Applications)

Tout en haut, les **applications** : celles fournies avec le système (téléphone, contacts, paramètres...) et celles que tu installes. Du point de vue d'Android, les applications système et les applications tierces utilisent en grande partie les mêmes API — il n'y a pas de caste privilégiée fondamentalement différente (avec quelques exceptions pour les apps système).

**Récapitulatif de la pile**, de bas en haut : Noyau Linux → HAL → Bibliothèques natives + ART → Framework applicatif → Applications. Chaque couche isole la complexité de celle du dessous. C'est cette architecture en couches qui rend Android à la fois portable (grâce à la HAL et l'ART) et modulaire.

## Le modèle applicatif : comment fonctionne une application Android

Comprendre comment est faite une application est essentiel, car c'est le cœur de l'expérience Android.

### L'APK : le format d'une application

Une application Android est distribuée sous forme d'un fichier **APK** (Android Package). C'est en réalité une **archive** (un fichier ZIP, comme un `.zip` ou un `.jar`) qui contient tout ce dont l'application a besoin :

- Le **code compilé** (le bytecode DEX, dans un fichier `classes.dex`).
- Les **ressources** : images, sons, mises en page d'interface (fichiers XML), textes.
- Le **manifeste** (`AndroidManifest.xml`), la carte d'identité de l'application (voir ci-dessous).
- La **signature** cryptographique du développeur (voir la section sécurité).
- D'éventuelles **bibliothèques natives** (code C/C++ compilé, dans des dossiers par architecture).

Cas d'usage concret : tu peux renommer un `.apk` en `.zip` et l'ouvrir avec un gestionnaire d'archives pour voir sa structure. C'est d'ailleurs le point de départ de l'**analyse d'APK** en sécurité (retro-ingénierie, recherche de malware). Le format moderne pour la distribution via le Play Store est l'**AAB** (Android App Bundle), à partir duquel le Store génère des APK optimisés pour chaque appareil, mais le concept reste le même.

### Le manifeste : la carte d'identité de l'app

Le fichier **`AndroidManifest.xml`** déclare tout ce que le système doit savoir sur l'application avant de l'exécuter :

- Le **nom du paquet** (package name), un identifiant unique de type `com.exemple.monapp` (notation inversée de nom de domaine, pour garantir l'unicité).
- Les **composants** de l'application (voir ci-dessous).
- Les **permissions** demandées (accès à internet, à la caméra, aux contacts...).
- La **version d'Android minimale** requise et visée.
- Les caractéristiques matérielles nécessaires.

Exemple simplifié d'un manifeste (à titre illustratif) :

```xml
<manifest package="com.exemple.monapp">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application android:label="Mon App">
        <activity android:name=".EcranPrincipal">
            <!-- déclare l'écran de démarrage -->
        </activity>
        <service android:name=".ServiceSync" />
    </application>
</manifest>
```

Le système lit ce manifeste à l'installation pour savoir quels composants existent et quelles permissions l'application réclame.

### Les composants d'une application

Une application Android n'est pas un bloc unique : elle est faite de **composants** de plusieurs types, que le système peut activer indépendamment. C'est un concept structurant qu'il faut bien comprendre.

**Les Activités (Activities)** — Une activité représente **un écran** de l'application, avec son interface. Par exemple, une application de messagerie a une activité pour la liste des conversations, une autre pour l'écran de rédaction. L'utilisateur navigue d'activité en activité. Le système gère leur **cycle de vie** (création, mise en pause quand on change d'app, reprise, destruction) via des méthodes que le développeur implémente (`onCreate`, `onPause`, `onResume`, etc.). Comprendre ce cycle de vie est central en développement Android, car une app doit sauvegarder son état quand elle passe en arrière-plan.

**Les Services (Services)** — Un service effectue un travail **en arrière-plan**, sans interface visible. Exemples : jouer de la musique pendant que tu utilises une autre app, synchroniser des données, télécharger un fichier. Le service continue de tourner même quand l'utilisateur n'est pas sur l'application. C'est l'équivalent conceptuel d'un démon (daemon) sous Linux. Android moderne encadre fortement les services d'arrière-plan pour économiser la batterie.

**Les Broadcast Receivers (récepteurs d'annonces)** — Ils permettent à une application de **réagir à des événements système** diffusés à l'ensemble du système. Exemples d'événements : « la batterie est faible », « le WiFi s'est connecté », « le téléphone a redémarré », « un SMS est arrivé ». Une app peut s'abonner à ces annonces (broadcasts) et déclencher une action. Cas d'usage : une app de sauvegarde qui se lance automatiquement quand l'appareil se connecte au WiFi et se met en charge.

**Les Content Providers (fournisseurs de contenu)** — Ils gèrent le **partage de données entre applications**, de façon contrôlée. Par exemple, tes contacts sont exposés par un content provider système : une application autorisée peut les lire sans savoir comment ils sont stockés. C'est une interface standardisée d'accès aux données (souvent adossée à une base SQLite). Cas d'usage : une app de messagerie qui accède à tes contacts passe par le content provider des contacts, pas directement au fichier.

### Les Intents : le ciment entre composants

Voici l'un des concepts les plus élégants et importants d'Android : l'**Intent** (intention). Un intent est un **message** qui permet de demander une action, à l'intérieur d'une application ou **entre applications différentes**. C'est le mécanisme de communication de haut niveau du système.

Deux grands usages :

- **Intent explicite** — tu désignes précisément le composant à activer (« ouvre l'écran de rédaction de MON application »). Utilisé pour naviguer dans sa propre app.
- **Intent implicite** — tu décris une **action** sans désigner l'app, et le système propose les applications capables de la réaliser (« je veux partager cette photo » → Android affiche toutes les apps capables de partager ; « ouvre ce lien » → propose les navigateurs).

Cas d'usage parlant : quand tu appuies sur « Partager » dans une app et qu'un menu te propose WhatsApp, email, Bluetooth... c'est un **intent implicite** qui interroge le système « qui sait partager du texte/une image ? ». Ce mécanisme rend Android très modulaire : les applications collaborent sans se connaître à l'avance. C'est aussi une surface de sécurité (une app malveillante peut se déclarer capable de traiter certains intents), point pertinent pour ton profil.

## Le modèle de sécurité d'Android

C'est la section la plus intéressante pour ton profil cyber, et elle réutilise directement tes connaissances Linux. Le modèle de sécurité d'Android repose sur plusieurs mécanismes empilés.

### Le bac à sable applicatif (sandbox) : un utilisateur Linux par app

Le mécanisme fondamental, et il va te parler : **chaque application reçoit son propre identifiant utilisateur Linux (UID) unique**. Souviens-toi de ton cours Linux sur les utilisateurs et permissions — Android détourne ce système à des fins d'isolation.

Concrètement, quand tu installes une application, Android lui attribue un UID dédié (par exemple `u0_a123`). L'application tourne dans un **processus séparé** avec cet UID, et ses fichiers privés lui appartiennent. Grâce aux **permissions Linux classiques** (celles que tu connais, `rwx` par propriétaire), une application ne peut donc **pas** lire les fichiers d'une autre application : elles ont des UID différents, et le système de fichiers l'interdit. C'est le **bac à sable applicatif** (application sandbox).

C'est une utilisation brillante d'un mécanisme Linux existant : l'isolation entre apps n'est pas une couche exotique, c'est la séparation des utilisateurs Unix appliquée à chaque application. Chaque app est comme un « utilisateur » différent qui ne peut pas fouiller chez les autres.

### SELinux sur Android

Deuxième couche, et tu viens justement de l'étudier : **Android utilise SELinux** (le contrôle d'accès obligatoire, MAC) depuis Android 4.3, et en mode strict (enforcing) depuis Android 5. C'est le même concept que ce que tu as vu avec AppArmor/SELinux : au-delà des permissions Unix (DAC), une politique **imposée par le système** confine chaque processus à ce qu'il a le droit de faire, même s'il tourne avec des privilèges élevés.

Le lien avec ton cours AppArmor est direct : tu as appris le principe MAC vs DAC. Android l'applique à grande échelle — chaque processus système et chaque application est confiné par une politique SELinux. Si un composant est compromis, SELinux limite ce qu'il peut atteindre. C'est de la défense en profondeur, exactement dans la logique que tu as vue. (Android a choisi SELinux et non AppArmor, notamment parce que le modèle par étiquettes de SELinux résiste mieux dans un environnement où les chemins sont variables.)

### Le modèle de permissions

Une application ne peut pas accéder aux ressources sensibles (caméra, micro, localisation, contacts, SMS, stockage...) sans **permission**. Ce système a évolué :

- **Avant Android 6** : les permissions étaient accordées **en bloc à l'installation** (« cette app veut accéder à X, Y, Z — installer ? oui/non »). Problème : c'était tout ou rien, et l'utilisateur validait sans vraiment choisir.
- **Depuis Android 6** : les permissions **dangereuses** sont demandées **à l'exécution** (runtime permissions), au moment où l'app en a besoin, avec une boîte de dialogue (« Autoriser MonApp à accéder à votre position ? »). L'utilisateur peut accorder ou refuser individuellement, et révoquer plus tard dans les paramètres.

Android distingue les permissions **normales** (accordées automatiquement, peu risquées, comme l'accès à internet) et **dangereuses** (nécessitant l'accord explicite de l'utilisateur, car touchant à la vie privée ou à la sécurité). Les versions récentes ont ajouté des raffinements : permissions temporaires (« seulement cette fois »), localisation approximative vs précise, accès au presse-papier signalé, etc.

Cas d'usage sécurité : l'analyse des permissions demandées par une app est un premier réflexe pour détecter un comportement suspect. Une simple lampe torche qui réclame l'accès aux SMS et aux contacts est un signal d'alarme classique — abus de permissions, potentiellement du logiciel espion.

### La signature des applications

Chaque APK est **signé cryptographiquement** par son développeur (avec une clé privée, principe que tu connais de ta crypto — signature asymétrique). Cette signature garantit deux choses :

- L'**intégrité** : l'APK n'a pas été modifié depuis sa signature (une altération invaliderait la signature).
- L'**authenticité de la mise à jour** : Android n'accepte d'installer une mise à jour que si elle est signée avec la **même clé** que la version déjà installée. Cela empêche une app malveillante de se faire passer pour la mise à jour d'une app légitime.

C'est une application directe des concepts de signature et de fonctions de hachage que tu as vus en cryptographie.

### Verified Boot et autres protections

Android empile d'autres mécanismes :

- **Verified Boot** — au démarrage, le système vérifie cryptographiquement l'intégrité des partitions système, pour détecter une altération (par un malware persistant, par exemple). Une chaîne de confiance depuis le démarrage.
- **Chiffrement du stockage** — les données de l'appareil sont chiffrées (chiffrement intégral ou par fichier selon les versions), de sorte qu'elles restent illisibles sans déverrouiller l'appareil. Pertinent pour la confidentialité en cas de vol.
- **Google Play Protect** — un service (côté Google) qui analyse les applications à la recherche de comportements malveillants, sur le Store et sur l'appareil. C'est une protection propriétaire (absente des appareils sans services Google).
- **Mises à jour de sécurité** — Android publie des correctifs de sécurité mensuels. La difficulté (voir fragmentation) est qu'ils n'atteignent pas tous les appareils rapidement.

## Le système de fichiers Android

Comme tout OS basé sur Linux, Android a une **arborescence de fichiers** unique partant de la racine `/`. Mais son organisation en **partitions** est spécifique et importante à connaître.

Les principales partitions :

- **`/boot`** — contient le noyau et le ramdisk de démarrage.
- **`/system`** — le système Android lui-même (le framework, les applications système). Historiquement en **lecture seule** en fonctionnement normal, ce qui protège le cœur de l'OS.
- **`/vendor`** — les composants spécifiques au fabricant (pilotes, HAL). Séparé de `/system` depuis Android 8 (projet Treble) pour faciliter les mises à jour.
- **`/data`** — les **données des utilisateurs et des applications**. C'est la partition qui contient tout ce que tu ajoutes : apps installées, réglages, fichiers. C'est aussi ce qui est effacé lors d'un « retour aux paramètres d'usine » (factory reset).
- **`/recovery`** — un mode de maintenance minimal, séparé du système principal, pour réparer, mettre à jour ou réinitialiser l'appareil (voir la section ROMs).
- **`/cache`** — données temporaires.

### Où vivent les données des applications

Chaque application a un répertoire privé sous `/data/data/<nom_du_paquet>/`. Par exemple, une app `com.exemple.monapp` stocke ses données dans `/data/data/com.exemple.monapp/`. Ce dossier appartient à l'UID de l'application (rappel du sandbox) et contient typiquement :

- `databases/` — ses bases SQLite.
- `shared_prefs/` — ses réglages (fichiers XML clé-valeur).
- `files/` — ses fichiers internes.
- `cache/` — son cache.

Grâce aux permissions Linux, seules cette application (et le système) peuvent accéder à ce dossier. C'est le sandbox en pratique, au niveau du système de fichiers.

### Stockage interne, externe et scoped storage

Android distingue le **stockage interne privé** (le `/data/data/...` ci-dessus, propre à chaque app) et le **stockage partagé** (autrefois appelé « carte SD » ou stockage externe), destiné aux fichiers accessibles par plusieurs apps : photos, téléchargements, documents.

Concept moderne important : le **scoped storage** (stockage cloisonné), introduit progressivement à partir d'Android 10. Avant, une app avec la permission de stockage pouvait lire/écrire à peu près partout dans le stockage partagé — un risque pour la vie privée. Désormais, une app est cantonnée par défaut à ses propres fichiers et à des dossiers publics bien définis (via des mécanismes contrôlés). C'est une évolution typique d'Android : resserrer progressivement les accès au fil des versions pour renforcer la vie privée et la sécurité.

## Les versions d'Android et le problème de la fragmentation

Android évolue par **versions annuelles**, chacune avec un numéro et (historiquement) un nom de dessert (Cupcake, KitKat, Oreo, Pie...), abandonné depuis Android 10 au profit du seul numéro.

Pour les développeurs, ce qui compte n'est pas tant le nom commercial que le **niveau d'API (API level)** : un numéro qui identifie précisément l'ensemble des fonctionnalités disponibles. Une application déclare dans son manifeste le niveau d'API **minimal** qu'elle exige et le niveau **visé** (target). Cela garantit qu'une app ne s'installe pas sur un système trop ancien pour elle.

Le grand défi historique d'Android est la **fragmentation** : contrairement à iOS (où Apple contrôle matériel et logiciel, et pousse les mises à jour à tous), les mises à jour Android dépendent d'une chaîne longue (Google → fabricant de puce → constructeur → opérateur), si bien que beaucoup d'appareils tournent sous des versions anciennes, sans les derniers correctifs de sécurité. Cas concret : à un instant donné, des dizaines de versions d'Android coexistent dans la nature, ce qui complique le développement (il faut supporter plusieurs niveaux d'API) et pose un vrai problème de sécurité (des appareils non patchés). Des initiatives comme **Project Treble** (séparer la couche fabricant du système) et les **mises à jour de composants via le Play Store** visent à réduire ce problème.

## ADB : l'outil en ligne de commande incontournable

Pour un profil technique comme le tien, voici la porte d'entrée vers Android « sous le capot » : **ADB (Android Debug Bridge)**. C'est un outil en ligne de commande, fourni par Google, qui permet de **communiquer avec un appareil Android depuis un ordinateur** (via USB ou réseau). C'est l'équivalent d'un accès shell distant à ton téléphone — tu vas te sentir en terrain connu.

### Activer le débogage

Pour utiliser ADB, il faut activer les **options pour développeurs** sur l'appareil (traditionnellement en appuyant 7 fois sur le numéro de build dans les paramètres), puis activer le **débogage USB** (USB debugging). C'est une porte puissante : elle donne un accès étendu à l'appareil, donc à n'activer qu'en connaissance de cause (un appareil avec le débogage USB ouvert et connecté à une machine non fiable est un risque de sécurité).

### Commandes ADB de base

Quelques commandes fondamentales, pour donner le concept (tu retrouveras la logique d'un shell Linux) :

```bash
adb devices                 # liste les appareils connectés
adb shell                   # ouvre un shell sur l'appareil (tu es sous Linux !)
adb install monapp.apk      # installe une application (sideloading en ligne de commande)
adb uninstall com.exemple.monapp   # désinstalle une app par son package name
adb push fichier.txt /sdcard/       # envoie un fichier vers l'appareil
adb pull /sdcard/photo.jpg .        # récupère un fichier depuis l'appareil
adb logcat                  # affiche les journaux système en temps réel (débogage)
adb reboot                  # redémarre l'appareil
```

La commande `adb shell` est particulièrement parlante pour toi : elle t'ouvre un véritable shell sur l'appareil, où tu retrouves des commandes Linux (`ls`, `cat`, `ps`, `cd`...), le système de fichiers Android, les processus. Cas d'usage : inspecter les apps installées, lire des logs pour diagnostiquer un problème, automatiser des tâches. `adb logcat` est l'équivalent Android de la lecture de journaux (`journalctl`) — l'outil de débogage par excellence.

ADB est central en développement, mais aussi en **analyse de sécurité** et en **forensique mobile** : c'est souvent le point d'entrée pour examiner un appareil, extraire des données, ou tester des applications.

## Rooting, bootloader et ROMs alternatives

Sujet qui parlera à ta sensibilité open source : la personnalisation profonde d'Android.

### Le rooting

**Rooter** un appareil, c'est obtenir l'accès **root** (superutilisateur), c'est-à-dire les pleins pouvoirs sur le système — exactement la notion de root que tu connais sous Linux. Par défaut, Android **ne te donne pas** cet accès : c'est une mesure de sécurité (le sandbox et SELinux reposent en partie là-dessus). Rooter contourne cette limite.

- **Pourquoi rooter ?** Installer des applications nécessitant un accès système profond, retirer des applications préinstallées imposées (bloatware), personnaliser en profondeur, faire du pare-feu avancé, du contrôle fin.
- **Les risques.** Rooter **affaiblit le modèle de sécurité** : un accès root mal maîtrisé, ou accordé à une app malveillante, ouvre l'appareil en grand. Cela peut aussi casser Verified Boot, empêcher certaines applications sensibles de fonctionner (banque, paiement, qui détectent le root), et faire perdre la garantie. À manier avec précaution et compréhension.

### Le bootloader et le recovery

Deux notions liées :

- Le **bootloader** est le tout premier programme qui s'exécute au démarrage et lance le système. Il est généralement **verrouillé** par le constructeur (il n'accepte de démarrer qu'un système signé et officiel — c'est lié à Verified Boot). Le **déverrouiller** (unlock) est le préalable à l'installation d'un système alternatif. Le déverrouillage efface généralement toutes les données (mesure de sécurité, pour qu'on ne puisse pas contourner le verrouillage d'écran ainsi).
- Le **recovery** est un mini-système de maintenance, indépendant du système principal. Le recovery d'origine permet des opérations limitées (mise à jour, réinitialisation). Un **recovery personnalisé** (comme TWRP, historiquement) offre bien plus : sauvegardes complètes, installation de ROMs, etc.

### Les ROMs alternatives (custom ROMs)

Puisque le cœur d'Android est open source (AOSP), la communauté produit des **versions alternatives du système**, les « custom ROMs ». On remplace le système du constructeur par une autre build d'Android. Les plus connues :

- **LineageOS** — l'héritière de CyanogenMod, la ROM communautaire de référence, proche de l'Android « pur », qui prolonge souvent la durée de vie d'appareils abandonnés par leur fabricant (mises à jour de sécurité prolongées).
- **GrapheneOS** et **CalyxOS** — axées **sécurité et vie privée**, dégooglisées, très pertinentes pour un profil sécurité. GrapheneOS est reconnue pour son durcissement (hardening) poussé.
- **/e/OS** — axée vie privée et dégooglisation, grand public.

Cas d'usage pour toi : installer LineageOS ou GrapheneOS sur un appareil compatible pour un contrôle total, sans les services Google, avec un système à jour — un excellent projet pratique qui combine ta fibre open source, la sécurité, et la compréhension profonde d'Android. Attention : la procédure (déverrouillage du bootloader, flash) comporte des risques (perte de données, appareil inutilisable si mal fait) et dépend fortement du modèle.

## Le développement Android (survol)

Pour situer, sans en faire un cours de dev. Une application Android se développe principalement en :

- **Kotlin** — le langage officiellement recommandé par Google aujourd'hui, moderne et concis.
- **Java** — historiquement le langage principal, encore très présent.

L'outil de référence est **Android Studio**, l'environnement de développement (IDE) officiel, qui inclut l'éditeur, le compilateur, un **émulateur** (pour tester une app sur un appareil virtuel sans matériel réel), et les outils de débogage. Le kit de développement s'appelle le **SDK Android** (il contient notamment ADB).

Le flux de développement, en résumé : écrire le code (Kotlin/Java) et l'interface (en XML ou avec Jetpack Compose, l'approche moderne), compiler en APK/AAB, tester sur émulateur ou appareil réel via ADB, puis publier. Tu n'as pas besoin de savoir développer pour comprendre Android, mais connaître ce paysage aide à saisir d'où viennent les applications.

## Angle sécurité : Android comme surface d'attaque

Pour ton profil, un survol des enjeux de sécurité propres à Android (à approfondir séparément) :

- **Applications malveillantes** — le vecteur principal. Malgré Play Protect, des applications piégées passent parfois les contrôles, et le **sideloading** (installation hors Store) contourne toute vérification. Toujours se méfier des APK d'origine douteuse.
- **Abus de permissions** — des apps qui réclament plus de droits que nécessaire pour exfiltrer des données (contacts, localisation, SMS). L'analyse des permissions est un réflexe de base.
- **Analyse d'APK (reverse engineering)** — décompiler un APK pour comprendre son fonctionnement, chercher du code malveillant ou des failles. Des outils existent (analyse statique du DEX, du manifeste, des permissions).
- **Vulnérabilités système** — failles dans le noyau, les bibliothèques ou le framework, corrigées par les correctifs mensuels — d'où l'importance des mises à jour (et le problème de la fragmentation).
- **Réseau** — un appareil Android sur un réseau est un hôte comme un autre : interception de trafic, MITM sur WiFi non sécurisé, etc. Ton domaine réseau s'applique directement.
- **Forensique mobile** — extraire et analyser les données d'un appareil (souvent via ADB, ou des techniques plus poussées), un champ entier de la cybersécurité.

C'est un domaine riche, à l'intersection de tes compétences (Linux, réseau, crypto, sécurité). Android est l'un des systèmes les plus attaqués au monde du simple fait de son ubiquité.

## Ce qu'il faut retenir

- **Android est un OS complet basé sur le noyau Linux**, mais avec un écosystème totalement différent d'une distribution GNU/Linux (Bionic au lieu de glibc, pas d'APT, apps en bytecode). Il équipe bien plus que les téléphones.
- Le cœur est **open source (AOSP)** ; les **services Google (GMS)** sont une couche propriétaire distincte — d'où les appareils et ROMs « dégooglisés ».
- **Architecture en couches** : Noyau Linux → HAL → bibliothèques natives + **ART** (runtime qui exécute le bytecode **DEX** des apps) → framework → applications.
- **Modèle applicatif** : une app est un **APK** (archive) décrit par son **manifeste**, composée de **composants** (Activités = écrans, Services = arrière-plan, Broadcast Receivers = réactions aux événements, Content Providers = partage de données), reliés par des **Intents** (messages inter-composants et inter-apps).
- **Sécurité** (le lien fort avec ton profil) : **sandbox = un UID Linux par application** (tes permissions Unix appliquées à l'isolation), **SELinux** (le MAC que tu as étudié, en mode enforcing), **modèle de permissions** (runtime depuis Android 6), **signature cryptographique** des APK, **Verified Boot**, chiffrement.
- **Système de fichiers** en partitions (`/system` en lecture seule, `/data` pour les données) ; chaque app isolée dans `/data/data/<paquet>/` ; évolution vers le **scoped storage** pour la vie privée.
- **Versions** identifiées par **niveau d'API** ; grand défi = la **fragmentation** (mises à jour lentes, appareils non patchés).
- **ADB** est ton outil en ligne de commande pour piloter un appareil depuis un PC (`adb shell` ouvre un vrai shell Linux, `adb logcat` lit les journaux) — porte d'entrée du dev, de l'analyse et de la forensique.
- **Rooting** = obtenir root (puissant mais affaiblit la sécurité) ; **bootloader** déverrouillable pour installer des **ROMs alternatives** (LineageOS, **GrapheneOS** axée sécurité/vie privée — projet idéal pour ta fibre open source).
- Android est une **surface d'attaque majeure** (apps malveillantes, abus de permissions, analyse d'APK, forensique) — à l'intersection directe de tes compétences Linux/réseau/crypto/sécurité.

---

*Cours d'introduction : chaque section (sécurité Android, ADB, analyse d'APK, installation d'une ROM) peut être approfondie dans une note dédiée.*
