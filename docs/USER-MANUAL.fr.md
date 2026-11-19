# Manuel utilisateur ApkStart et solutions aux problèmes

> Version : v0.6.2 · Plateforme : Windows 10/11 x64 · Mise à jour : 2026-11-19
>
> ApkStart est un lanceur d'applications Android sur Windows : **installez vos applications Android comme des logiciels Windows natifs, retrouvez-les sur le bureau et lancez-les d'un double-clic.**
> Ce manuel vous apprend d'abord à utiliser le logiciel, puis propose des solutions concrètes classées par « symptôme ». Chaque étape correspond à des boutons et des menus réellement présents dans le logiciel.

---

## Table des matières {#overview}

1. [ApkStart en 30 secondes](#1-apkstart-en-30-secondes)
2. [Installation et premier lancement](#2-installation-et-premier-lancement)
3. [Utilisation quotidienne](#3-utilisation-quotidienne)
4. [Comprendre les trois concepts clés (la clé pour comprendre les erreurs)](#4-comprendre-les-trois-concepts-clés-la-clé-pour-comprendre-les-erreurs)
5. [En cas de problème, commencez par cette étape : bilan de santé et détection automatique](#5-en-cas-de-problème-commencez-par-cette-étape-bilan-de-santé-et-détection-automatique)
6. [Solutions aux problèmes courants](#6-solutions-aux-problèmes-courants)
   - [6.1 Message « Accélération matérielle non activée » / démarrage très lent](#accel)
   - [6.2 Échec de l'installation (INSTALL_FAILED_*)](#install-failed)
   - [6.3 L'image système ne contient pas la couche de traduction ARM / les applications ARM ne s'installent pas ou plantent](#arm-translation)
   - [6.4 adb non autorisé (autoriser le débogage USB)](#adb-unauthorized)
   - [6.5 Double-clic sur l'icône sans effet / rotation infinie / fenêtre avec bouton de rotation](#startup)
   - [6.6 Tableau de dépannage rapide des autres problèmes de lancement](#other)
   - [6.7 Aucun son ou son très faible dans les applications](#sound)
7. [Référence de la ligne de commande](#7-référence-de-la-ligne-de-commande)
8. [Données et répertoires](#storage)
9. [Obtenir de l'aide et envoyer un retour](#9-obtenir-de-l-aide-et-envoyer-un-retour)

---

## 1. ApkStart en 30 secondes

```
Icône du bureau (véritable icône d'application .lnk)
      │ Double-clic
      ▼
ApkStart.exe --launch <nom-du-paquet>
      │ L'environnement d'exécution Android n'est pas lancé ? → lancement automatique (émulateur Android 14, intégré au paquet ou téléchargé au premier démarrage)
      ▼
Ouverture de l'application via le point d'entrée résolu par le système (et non l'Activity principale codée en dur dans l'APK)
      ▼
Fenêtre de l'émulateur = fenêtre de l'application (titre, icône, ratio portrait, plein écran centré)
```

**Ses caractéristiques**

- 🖱️ **Double-clic sur un .apk = installation** : après avoir enregistré l'association de fichiers dans l'Explorateur, double-cliquez sur un APK → analyse automatique → installation → création d'une icône sur le bureau.
- 🧩 **Une icône sur le bureau par application** : l'icône est extraite hors ligne de l'APK ; double-cliquer sur l'icône = accès direct à l'application.
- 🪟 **Une application = une fenêtre** : rendu natif, plein écran occupant toute la hauteur de l'écran et centré, mode fenêtre déplaçable et redimensionnable, avec mémorisation des dimensions pour chaque application.
- 🔍 **Détectable par Windows** : raccourcis sur le bureau + dans le menu Démarrer (`Programmes\ApkStart\`).
- 📁 **Partage des données** : synchronisation bidirectionnelle entre `%USERPROFILE%\ApkStartShared` et `/sdcard/ApkStartShared` dans Android.
- 🪶 **Environnement d'exécution intégré** : aucune dépendance envers MuMu, LDPlayer, WSA ou tout autre émulateur installé sur votre machine.

> Remarque : ce projet est encore à un stade précoce ; l'auteur le maintient pendant son temps libre. Il est open source, gratuit et sans publicité. Rencontrer des problèmes est normal : ce manuel est là pour cela.

---

## 2. Installation et premier lancement

### 2.1 Choisir la version qui vous convient

Les deux dépôts contiennent le même contenu ; en Chine, Gitee est recommandé :

- GitHub : `github.com/RoutineMiku/apkstart/releases`
- Gitee : `gitee.com/daily-miku/apkstart/releases` (beaucoup plus rapide en accès direct depuis la Chine)

| Forme | Nom de fichier | Quand la choisir |
| --- | --- | --- |
| **Version Store** | `ApkStart_<version_en_quatre_parties>_x64.msix` | Installation depuis le Microsoft Store. Environnement d'exécution complet intégré, aucune connexion réseau après l'installation, mises à jour gérées par le Store |
| **Version portable complète** | `ApkStart-v*-win64-full.zip` (environ 830 Mo, ~1,3 Go une fois décompressé) | Vous ne voulez ni installer ni attendre un téléchargement : décompressez et utilisez, tout l'environnement d'exécution est inclus |
| **Version installée** | `ApkStart-v*-Setup.exe` (environ 1,3 Go) | Vous voulez des raccourcis sur le bureau/dans le menu Démarrer et une entrée de désinstallation |
| **Version portable légère** | `ApkStart-v*-win64-portable.zip` (96 Mio, ~227 Mio une fois décompressé) | Vous voulez juste essayer : l'environnement d'exécution sera téléchargé au premier lancement |

> ⚠️ **Utilisez absolument la dernière version (actuellement 0.6.2)**. Les anciennes versions (0.5.x et antérieures) soit n'intègrent pas l'environnement d'exécution et cherchent/téléchargent 1,5 Go à chaque lancement, soit utilisent par défaut la fenêtre intégrée — c'est précisément l'origine typique des problèmes « lent, ne s'ouvre pas, fenêtre avec un bouton de rotation ». Si vous mettez à jour depuis une ancienne version, vérifiez que l'icône du bureau pointe vers le répertoire de la nouvelle version.

### 2.2 Que se passe-t-il au premier lancement

1. **(version légère uniquement) Téléchargement de l'environnement d'exécution** : adb, Android Emulator et l'image système Android 14. Débit mesuré à plus de 10 Mo/s depuis la source officielle, téléchargement parallèle en 8 flux avec reprise sur interruption. Les versions complète / Store ignorent cette étape.
2. **Première extraction de l'image** : l'image xz est extraite dans `%APPDATA%\apkstart\system-images` (environ 20 secondes, une seule fois).
3. **Première création de `/data`** : ApkStart génère lui-même les données utilisateur ext4 avec chiffrement et étiquettes SELinux (l'image officielle ne contient qu'un fichier de 1 Mo factice).
4. **Démarrage automatique** : ensuite, ouvrir une application ne fait qu'un `am start` ; démarrage à froid d'environ 23 secondes, environ 10 secondes avec un instantané en cache.

> Un premier lancement lent est normal : c'est un « coût unique ». Les lancements suivants sont quasi instantanés.

---

## 3. Utilisation quotidienne

### 3.1 Installer une application

Trois méthodes, libre à vous de choisir :

- **Double-cliquez sur le fichier APK** (enregistrez d'abord l'association : Paramètres → Intégration système → Associer les fichiers .apk) ;
- Choisissez « Installer une application » dans l'interface principale ;
- Ligne de commande : `ApkStart.exe <chemin\vers.apk>`.

Les paquets fractionnés `.apks` / `.xapk` sont pris en charge (via `install-multiple` automatiquement). Des raccourcis sur le bureau et dans le menu Démarrer sont créés automatiquement après l'installation.

### 3.2 Ouvrir une application

Double-cliquez simplement sur l'icône du bureau. Toutes les applications partagent le même environnement d'exécution : **la deuxième application démarre quasi instantanément**.

### 3.3 Fenêtres et affichage

| Action | Méthode |
| --- | --- |
| Bascule plein écran / fenêtre | `F11` ou menu contextuel de la barre des tâches. Le plein écran agrandit seulement la fenêtre, sans modifier le ratio de l'image |
| Rotation paysage / portrait | `Ctrl+Alt+R` (global) ou bouton de rotation dans la barre de titre ; l'orientation est mémorisée pour cette application |
| Plein écran automatique | Paramètres → Affichage et fenêtres → Plein écran automatique (fonctionne le mieux avec l'« orientation forcée ») |
| Forcer le paysage/portrait | Paramètres → Affichage et fenêtres → Orientation de l'écran |

> Seul le cas où « l'orientation du panneau diffère de celle de l'application » provoque un redémarrage de l'environnement d'exécution (environ 40 secondes, un message s'affiche dans la barre de titre). Les applications de même orientation s'ouvrent ensuite instantanément.

### 3.4 Raccourcis clavier

| Touche | Action |
| --- | --- |
| `F11` | Bascule plein écran / mode fenêtre |
| `Ctrl+Alt+R` | Fait pivoter l'application actuelle entre paysage et portrait |
| `Ctrl+R` | Rotation dans la fenêtre d'enveloppe (en mode fenêtre natif, utilisez `Ctrl+Alt+R`) |

### 3.5 Partage de fichiers (Windows ↔ Android)

Le dossier local `%USERPROFILE%\ApkStartShared` et `/sdcard/ApkStartShared` dans Android sont synchronisés dans les deux sens en quelques secondes.
Accès : Paramètres → Intégration et fichiers → Partage de fichiers (« Synchroniser maintenant » ou « Ouvrir le dossier »).

### 3.6 Navigation dans la page des paramètres {#settings}

Depuis la 0.6.0, les paramètres sont répartis en huit catégories, avec une barre de recherche en haut (saisissez des mots-clés comme « paysage », « mémoire », « proxy » ; la recherche couvre toutes les catégories) :

| Catégorie | Contenu principal |
| --- | --- |
| Courant et installation | Environnement d'exécution, configuration en un clic, démarrage automatique, occupation disque et nettoyage |
| Affichage et fenêtres | Mode d'affichage, plein écran automatique, orientation de l'écran, mise en page tablette, mode d'hébergement des fenêtres |
| Opérations et saisie | Boutons de la souris, mappage du clavier |
| Performances et ressources | Stratégie de ressources, qualité graphique, partition de données, langue du système, instantanés, préchauffage au démarrage |
| Réseau et téléchargements | Mises à jour et sources de téléchargement, miroirs d'accélération, nombre de threads de téléchargement |
| Diagnostic et réparation | Bilan de santé de la machine, pilotes/correctifs de compatibilité, détection automatique |
| Intégration et fichiers | Bureau et applications, partage de fichiers, intégration système |
| Mise à jour et à propos | Mise à jour du logiciel, à propos |

### 3.7 Mise à jour en ligne

Paramètres → Mise à jour et à propos → Rechercher des mises à jour, ou clic droit sur l'icône dans la barre des tâches → Rechercher des mises à jour. La mise à jour teste en temps réel et choisit la source la plus rapide (GitHub / Gitee / miroir), télécharge en parallèle par blocs et change automatiquement de source en cas d'échec. La mise à jour ne supprime ni l'environnement d'exécution, ni les applications installées, ni les instantanés.

---

## 4. Comprendre les trois concepts clés (la clé pour comprendre les erreurs)

La plupart des « problèmes bizarres » ont leur origine dans l'un des trois éléments ci-dessous. Une minute pour les comprendre, et le dépannage devient beaucoup plus simple.

### 4.1 Environnement d'exécution / image système

ApkStart ne simule pas un « Android vide » : il charge une **image système Android 14 complète** comme base.
La 0.6.2 n'utilise qu'**une seule image universelle** (Google Play x86_64) : les applications x86 comme ARM s'exécutent dessus — plus besoin des deux jeux « image AOSP / image de compatibilité » des anciennes versions.

- Image manquante / corrompue / incompatible avec d'anciennes données utilisateur → échec de démarrage, blocage sur l'écran de démarrage, redémarrages en boucle.
- Les données utilisateur (`/data`) forment une fine couche différentielle ; une seule image système est partagée par toute la machine.

### 4.2 Accélération matérielle

Pour que l'émulateur soit rapide, l'accélération par virtualisation du CPU est nécessaire. Sous Windows, il n'y a que deux options :

| Méthode | Qu'est-ce que c'est | Droits d'administrateur nécessaires | Redémarrage après installation ? |
| --- | --- | --- | --- |
| **WHPX** | Fonctionnalité Windows intégrée « Plateforme d'hyperviseur Windows » (HypervisorPlatform) | Lors de l'activation de la fonctionnalité | Oui |
| **AEHD** | Pilote noyau de Google | Lors de l'installation du pilote | Non |

**Le fonctionnement sans accélération est possible** (émulation logicielle pure TCG), mais le démarrage prend plusieurs minutes et le rendu saccade facilement — c'est une question de « lenteur », pas d'« échec de lancement ». ApkStart repasse automatiquement en mode logiciel et réessaie avec jusqu'à 4 jeux de paramètres : « moteur de rendu → mode d'accélération → mémoire/démarrage à froid ».

> Ne confondez pas **VirtualMachinePlatform** (utilisé par WSL2) avec l'interrupteur d'accélération. L'émulateur a besoin de **HypervisorPlatform**. Si vous activez uniquement le premier, `emulator -accel-check` indiquera toujours que l'accélération est indisponible.

### 4.3 Couche de traduction ARM

La grande majorité des applications Android chinoises ne fournissent que des **bibliothèques natives ARM** (arm64-v8a / armeabi-v7a), alors que l'image système est **x86_64** — il faut donc une « couche de traduction » pour convertir les instructions ARM vers le CPU x86. L'image universelle de la 0.6.2 intègre la nouvelle couche `ndk_translation` : installer une application ARM ne nécessite donc généralement aucun réglage.

- Lors de la première rencontre avec une application ARM, si les composants de traduction ne sont pas encore en place, ApkStart complète automatiquement l'image de compatibilité et redémarre l'environnement pour réessayer (voir 6.3).
- Les anciennes images (API 30) posent des problèmes de compatibilité avec la nouvelle couche (par exemple les applications ByteDance déclenchent `DoBadTrampoline` SIGABRT) ; l'image Android 14 corrige ce problème.

---

## 5. En cas de problème, commencez par cette étape : bilan de santé et détection automatique

Avant de parcourir ce manuel, laissez le logiciel effectuer son propre contrôle : il corrige automatiquement la plupart des problèmes.

### 5.1 Bilan de santé de la machine · configuration automatique

Emplacement : Paramètres → Diagnostic et réparation → **Lancer le bilan de santé**

- Ce qui est vérifié : activation de la virtualisation CPU (VT-x/SVM), disponibilité de Hyper-V/de la plateforme d'hyperviseur, carte graphique/mémoire vidéo/pilote, mémoire vive, version du système, `emulator -accel-check`, pilote AEHD.
- Cliquez sur « **Appliquer la configuration recommandée** » pour écrire automatiquement les valeurs sûres : mémoire / nombre de cœurs / résolution de rendu / qualité graphique / simulation logicielle forcée en l'absence d'accélération. Ces réglages sont enregistrés comme profil local et appliqués automatiquement par la suite.
- Les résultats sont classés : `ok` (normal) / `warn` (utilisable mais optimisation conseillée) / `bad` (bloquant sans intervention). Chaque élément dispose d'une couleur et d'une explication.

Seuls deux types d'actions nécessitent votre intervention :
- **Virtualisation dans le BIOS** : redémarrez et entrez dans le BIOS → activez Intel VT-x / AMD SVM → Enabled (le logiciel ne peut pas le faire à votre place).
- **Fonctionnalités Windows / pilote d'accélération** : voir 6.1.

### 5.2 Détection automatique (debug automatique) {#network}

Emplacement : Paramètres → Diagnostic et réparation → « Détection automatique · Diagnostic intelligent »

En arrière-plan, le logiciel contrôle la machine toutes les 10 minutes et classe les problèmes en six catégories. Chaque élément peut être **traité en un clic** (redémarrage de l'environnement, suppression des verrous, nettoyage des processus orphelins, invalidation des instantanés, nettoyage du disque, réinitialisation du réseau Android…), avec une nouvelle vérification automatique après la correction :

| Catégorie | Problèmes couverts |
| --- | --- |
| Environnement d'exécution | Vraie cause du dernier échec de lancement, blocage au démarrage, fichiers de verrou résiduels, processus d'émulateur orphelins, instantanés vides, absence d'accélération matérielle |
| Connexion de l'appareil | adb non autorisé, hors ligne, environnement actif mais appareil invisible pour adb |
| Stockage | Espace disque restant, configuration de la partition de données différente de la réalité, dossier partagé non accessible en écriture |
| Paramètres | Conflit entre l'orientation de l'écran et le panneau physique, plein écran automatique inefficace en fenêtre détachée |
| Réseau / journaux | Pas de réseau côté Android, source de téléchargement injoignable, erreurs dans les journaux récents |

> Deux principes : un échec de détection n'est pas considéré comme un problème (si l'état est indisponible, le logiciel indique « inconnu » plutôt que d'inventer quelque chose) ; un même ancien problème ne vous importune pas à nouveau.

### 5.3 Exporter le rapport de diagnostic

Emplacement : Paramètres → Diagnostic et réparation → **Exporter le rapport de diagnostic** (ou bouton du même nom dans la page d'intégration système)

Le rapport est un fichier texte brut contenant la configuration de la machine, les paramètres de lancement sélectionnés automatiquement, les journaux et les conclusions du diagnostic. Joignez-le lors d'un signalement : cela accélère grandement l'identification du problème.

### 5.4 Manuel intégré et tutoriels automatiques {#diagnose}

Depuis la 0.6.2, ce manuel est **intégré au logiciel** : le bouton « ? » de la barre de titre de l'interface principale et « Ouvrir le manuel utilisateur » dans Paramètres → À propos permettent de l'ouvrir directement. Vous pouvez y rechercher, défiler, imprimer ou enregistrer en PDF. À l'ouverture, le logiciel se positionne automatiquement sur la section liée au problème actuel.

La détection/la réparation automatique vous apporte aussi les tutoriels :

- Lorsque la détection automatique trouve un problème, un bouton « Tutoriel » apparaît à droite de l'entrée et mène directement à la section correspondante ;
- Pour l'accélération matérielle, les échecs d'installation, la couche de traduction ARM, l'autorisation adb ou l'absence de son, **le tutoriel correspondant s'ouvre automatiquement si la réparation automatique échoue** : inutile de venir chercher ici ;
- Un même tutoriel ne s'ouvre automatiquement qu'une fois par session, pour ne pas vous interrompre sans cesse.

> Ouverture manuelle : bouton `?` dans la barre de titre. Pour désactiver temporairement l'ouverture automatique, coupez les notifications dans les paramètres de détection automatique ; les tutoriels restent accessibles via le bouton « Tutoriel » des entrées de problème.

---

## 6. Solutions aux problèmes courants

### 6.1 Message « Accélération matérielle non activée » / démarrage très lent {#accel}

**Symptôme** : les paramètres/le diagnostic affichent « aucune accélération matérielle actuellement » ou « accélération matérielle indisponible » ; le démarrage prend plusieurs minutes et l'animation saccade.

**À préciser d'abord** : il s'agit généralement d'une question de « lenteur », pas d'« impossibilité d'ouvrir ». ApkStart est déjà repassé automatiquement en simulation logicielle. L'accélération n'est nécessaire que pour plus de fluidité.

**Procédure selon la version :**

- **Version installée / portable** : Paramètres → Diagnostic et réparation → Bilan de santé de la machine → trouvez « Accélération matérielle non activée » → cliquez sur **Réparer**. Une invite UAC s'affiche une fois, puis WHPX est activé automatiquement ; si l'activation échoue (système non pris en charge ou refus de votre part), le pilote AEHD est installé à la place.
- **Version Microsoft Store (MSIX)** : une application Store **ne peut pas s'élever elle-même en privilèges** ; cliquer sur « Réparer » ouvre la boîte de dialogue « Activer ou désactiver des fonctionnalités Windows » :
  1. Cochez **« Plateforme d'hyperviseur Windows » (HypervisorPlatform)** ;
  2. Validez, puis **redémarrez l'ordinateur** une fois.

  Vous pouvez aussi exécuter, dans **PowerShell en tant qu'administrateur** :

  ```powershell
  dism /online /enable-feature /featurename:HypervisorPlatform /all /norestart
  dism /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
  ```

> Deux pièges : ① n'activez pas seulement VirtualMachinePlatform — ce n'est pas l'accélération attendue par l'émulateur ; ② si VT-x/SVM n'est pas activé dans le BIOS, entrez d'abord dans le BIOS selon 5.1, sinon l'activation de la fonctionnalité Windows ne servira à rien.
> Si votre pilote graphique a plus de trois ans, mettez-le à jour depuis le site du fabricant ; ApkStart n'installe pas de pilote automatiquement (un mauvais pilote serait pire). Certaines vieilles cartes graphiques ou GPU intégrés nécessitent un correctif de compatibilité : voir Paramètres → Diagnostic et réparation → Pilotes · Correctifs de compatibilité.

---

### 6.2 Échec de l'installation (INSTALL_FAILED_*) {#install-failed}

**Symptôme** : une erreur survient lors de l'installation ; le message commence généralement par « Échec de l'installation : » et se termine par un code d'erreur `INSTALL_*`.

ApkStart traduit le message d'erreur anglais d'origine dans la langue de l'interface. Procédez selon le tableau ci-dessous :

| Code d'erreur | Signification | Que faire |
| --- | --- | --- |
| `INSTALL_FAILED_NO_MATCHING_ABIS` | L'application ne fournit que des bibliothèques ARM ; l'image actuelle ne contient pas de couche de traduction ARM | **Généralement traité automatiquement** : ApkStart bascule sur l'image de compatibilité et réessaie. Voir [6.3](#arm-translation) |
| `INSTALL_FAILED_OLDER_SDK` | L'application exige une version d'Android plus récente | Nécessite une image système plus récente ; actuellement Android 14 (API 34), très rarement déclenché |
| `INSTALL_PARSE_FAILED_NO_CERTIFICATES` | APK sans signature valide | APK corrompu ou paquet non officiel ; récupérez le fichier d'installation |
| `INSTALL_PARSE_FAILED_INCONSISTENT_CERTIFICATES` / `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | Signature différente de celle de la version installée | Désinstallez d'abord l'ancienne version, puis réinstallez |
| `INSTALL_FAILED_VERSION_DOWNGRADE` | Une version plus récente est déjà installée sur l'appareil | Impossible de revenir à une version antérieure : installez une version plus récente ou désinstallez d'abord |
| `INSTALL_FAILED_INSUFFICIENT_STORAGE` | Espace disque insuffisant pour l'environnement d'exécution | Libérez de l'espace ou déplacez le répertoire de données de l'environnement sur un disque ayant assez de place (Paramètres → Intégration système) |
| `INSTALL_FAILED_INVALID_APK` | APK corrompu/incomplet | Le téléchargement est peut-être inachevé ; téléchargez à nouveau |
| `INSTALL_FAILED_INVALID_URI` | Le chemin de l'APK contient des caractères spéciaux ou des caractères chinois | Déplacez l'APK vers un chemin ne contenant que des caractères ASCII, puis réinstallez |
| `INSTALL_FAILED_ALREADY_EXISTS` | Un paquet du même nom existe déjà avec une signature différente | Désinstallez d'abord |
| `INSTALL_FAILED_DEPRECATED_SDK_VERSION` | Application ciblant une très ancienne version d'Android | **Traité automatiquement** : ApkStart réessaie avec le paramètre de contournement officiel |
| `INSTALL_FAILED_TEST_ONLY` | Paquet réservé aux tests | **Traité automatiquement** : le paramètre pour les paquets de test est ajouté automatiquement avant de réessayer |
| `INSTALL_FAILED_MISSING_SHARED_LIBRARY` | Fonctionnalité de l'appareil ou bibliothèque constructeur absente | L'application dépend d'un environnement constructeur précis que l'émulateur ne peut pas fournir |
| `INSTALL_FAILED_USER_RESTRICTION` | L'installation est restreinte par le système | Redémarrez l'environnement d'exécution, puis réessayez |
| `INSTALL_FAILED_CONFLICTING_PROVIDER` | Conflit avec le ContentProvider d'une application déjà installée | Désinstallez l'application en conflit |
| `INSTALL_FAILED_INTERNAL_ERROR` | Erreur interne du système (le plus souvent espace insuffisant ou démarrage inachevé) | Redémarrez l'environnement, attendez la fin du démarrage, puis réessayez |

> Si le message d'erreur anglais ne figure pas dans ce tableau, exportez le rapport de diagnostic selon 5.3 et envoyez-le.

---

### 6.3 L'image système ne contient pas la couche de traduction ARM / les applications ARM ne s'installent pas ou plantent {#arm-translation}

**Symptôme** : lors de l'installation, l'erreur `INSTALL_FAILED_NO_MATCHING_ABIS` s'affiche avec un message indiquant que « l'application ne fournit que des bibliothèques natives ARM… l'image système actuelle ne contient pas de couche de traduction ARM » ; ou bien l'application se ferme immédiatement après le lancement et les journaux mentionnent `DoBadTrampoline`, `libndk_translation`, `UnsatisfiedLinkError`, `...so not found`.

**Principe** : la 0.6.2 utilise **une seule image Android 14 universelle** prenant en charge x86 et ARM, avec la couche de traduction intégrée. Les anciennes versions nécessitaient de changer d'image manuellement ; l'interrupteur « Image de compatibilité universelle (gestion automatique) » ne sert désormais **qu'à la compatibilité avec d'anciennes configurations et ne doit normalement pas être manipulé**.

**Ce qu'ApkStart fait automatiquement :**

1. Si `NO_MATCHING_ABIS` survient pendant l'installation : bascule automatique sur l'image de compatibilité → redémarrage de l'environnement → réinjection des applications déjà installées à partir de la sauvegarde locale des APK → nouvelle installation (voir le journal « Bascule vers l'image de compatibilité et redémarrage de l'environnement… »).
2. Si une application plante au lancement et que le journal pointe clairement vers la couche ARM (par exemple `DoBadTrampoline`), bascule automatique sur l'image de compatibilité Android 14 pour réessayer (journal : « Plantage de la couche de traduction ARM détecté, bascule automatique vers l'image de compatibilité… »).

**Ce que vous devez faire :**

- **Patientez** : le changement d'image redémarre l'environnement ; comptez environ 40 secondes à 1 minute, et une fenêtre d'information peut apparaître.
- **Vérifiez que l'image est en place** : Paramètres → Courant et installation → Environnement d'exécution ; regardez l'état de « Image de compatibilité universelle (gestion automatique) ». Si « non téléchargée » s'affiche, cliquez sur « Télécharger l'image de compatibilité » (environ 1,5 Go), puis **redémarrez l'environnement d'exécution** pour que le changement prenne effet.
- **Le plantage persiste** : quelques applications intègrent une détection anti-émulation plus poussée (vérification forcée de capteurs réels, du modem, etc.) et ne peuvent pas fonctionner dans un émulateur ; ces applications affichent une explication (en chinois) : c'est une limitation, pas un bug.

**Que faire si vous voyez « Échec de l'installation » en rouge alors que le message dit « nouvelle tentative après bascule automatique vers l'image de compatibilité » ?**

C'est une erreur d'affichage propre aux anciennes versions : le fichier d'image est bien présent sur le disque, mais lors de la réutilisation d'un ancien environnement sans couche de traduction, la bascule est ignorée et l'échec est signalé directement, alors que le message continue d'affirmer « nouvelle tentative en cours ». **Vous n'utilisez pas le code le plus récent : mettez à jour vers la dernière build 0.6.2** (la version correspondant à ce manuel corrige le problème : avant l'installation, les capacités réelles de traduction de l'environnement actuel sont détectées, au lieu de vérifier seulement la présence du fichier d'image ; `NO_MATCHING_ABIS` déclenche toujours bascule + redémarrage + suppression des anciens instantanés avant une nouvelle installation ; si la seconde tentative échoue encore, le message est sincère et ne prétend plus qu'une tentative est en cours). Réessayez l'installation après la mise à jour.

> Testé en pratique : Hongguo Free Short Dramas (com.phoenix.read, arm64-v8a uniquement) s'installe correctement avec l'image Android 14 + la nouvelle couche de traduction, affiche le flux de recommandations et lit les vidéos. Pour l'environnement actuel, `ro.product.cpu.abilist` = `x86_64,arm64-v8a`, ce qui confirme que la couche de traduction est active.

---

### 6.4 adb non autorisé (autoriser le débogage USB) {#adb-unauthorized}

**Symptôme** : le diagnostic signale « adb non autorisé » ou « autorisation du débogage Android inachevée », `adb devices` affiche `unauthorized` et l'application ne démarre jamais.

**Procédure correcte (dans l'ordre) :**

1. Vérifiez si une fenêtre d'émulateur affiche la boîte de dialogue **« Autoriser le débogage USB ? »** ; cliquez sur **Autoriser** dans cette fenêtre et cochez **« Toujours autoriser le débogage depuis cet ordinateur »** : la question ne se reposera plus.
2. Si la fenêtre ne répond pas ou n'apparaît pas : Paramètres → Environnement d'exécution → **Réinitialiser les données Android / Effacer les données Android**, puis réessayez (les applications installées sont supprimées, mais les fichiers APK restent et seront réinstallés automatiquement ; le système lui-même n'est pas touché).

> ⚠️ **Ne supprimez surtout pas `%USERPROFILE%\.android\adbkey`**. En pratique, c'est une manipulation contre-productive : Android n'écrit une nouvelle clé publique que lorsque le fichier `adb_keys` n'existe pas. Si vous remplacez la clé privée, l'ancienne clé publique enregistrée dans le système reste valide ; les deux ne correspondent plus et l'autorisation échouera définitivement.

> Dépannage en ligne de commande : le service adb d'ApkStart utilise le **port dédié 5044** (totalement séparé de votre port 5037 habituel) :
> ```powershell
> $env:ANDROID_ADB_SERVER_PORT = 5044
> adb devices    # 应看到 emulator-5554
> ```
> N'exécutez pas manuellement `adb connect` sur le port 5555 : l'image Play afficherait la boîte « Autoriser le débogage USB » par-dessus l'application, ce qui donnerait l'impression que le logiciel est cassé.

---

### 6.5 Double-clic sur l'icône sans effet / rotation infinie / fenêtre avec bouton de rotation {#startup}

Ces problèmes pointent presque tous vers le **point d'entrée de lancement ou la prise en charge de la fenêtre**. Procédez dans l'ordre ci-dessous.

**① Vérifiez que vous utilisez la nouvelle version**

- Regardez le début du journal `%APPDATA%\ApkStart\logs\app.log` : la ligne `start v0.6.2` est attendue. Si `v0.5.x` s'affiche, l'icône du bureau/du menu Démarrer pointe vers le répertoire d'une ancienne version.
- Les anciennes versions (0.5.x) n'intègrent pas l'environnement d'exécution et utilisent par défaut la fenêtre intégrée → « lent + fenêtre d'enveloppe avec bouton de rotation ». Passez à la 0.6.2 et pointez le raccourci vers le nouveau `ApkStart.exe`.

**② Ayez une attente réaliste sur la durée de démarrage**

Un démarrage à froid de 23 à 48 secondes et un redémarrage pour changement d'orientation d'environ 50 secondes sont dans la norme. Pendant ce temps, un clic sur l'icône semble « sans effet » alors que le démarrage se déroule en arrière-plan. **Ne cliquez pas plusieurs fois** : les clics répétés amènent une seconde instance à prendre le contrôle de l'émulateur, et la procédure de fermeture de la première instance peut entraîner l'émulateur avec elle, provoquant un échec (la 0.6.2 ajoute une protection `owner.pid`, mais l'attente dans la file ressemble encore à une absence de réponse). Cliquez une fois et attendez.

**③ La fenêtre native n'a pas été prise en charge → retour à la fenêtre intégrée avec bouton de rotation**

Si le journal contient `attach failed` ou `emu:0`, le mandataire de fenêtre n'a pas trouvé celle de l'émulateur et le logiciel est retombé en mode intégré (la fenêtre d'enveloppe avec barre de titre + bouton de rotation que vous voyez).
- Cela se produit facilement lors d'un lancement depuis une jonction de répertoires ou un chemin non standard ; la 0.6.2 demande au mandataire de résoudre le chemin réel avant la comparaison. Si le problème persiste, envoyez le journal.

**④ Réinitialiser les données Android (dernier recours)**

Paramètres → Courant et installation → **Réinitialiser les données Android** (avec confirmation). Cela supprime les applications et leurs données, mais conserve le système lui-même ; la liste des applications est conservée et elles sont réinstallées automatiquement lors de l'ouverture. Cette solution convient lorsque la partition de données est corrompue ou que `/data` ne peut pas être monté.

---

### 6.6 Tableau de dépannage rapide des autres problèmes de lancement {#other}

La plupart de ces erreurs d'exécution sont **déjà traitées automatiquement** par ApkStart ; le tableau indique ce qu'il fait et ce que vous pouvez encore faire. Si le traitement automatique échoue, exportez le rapport de diagnostic selon 5.3.

| Titre du diagnostic | Traitement automatique | Ce que vous pouvez faire |
| --- | --- | --- |
| Accélération matérielle indisponible | Retour à la simulation logicielle | Activez l'accélération selon 6.1 |
| Échec d'allocation de la mémoire | Réduction de la mémoire et du nombre de cœurs | Fermez les programmes gourmands en mémoire |
| Port de l'émulateur occupé | Choix automatique d'un port libre | Quittez les autres émulateurs (Nox/MuMu/BlueStacks) ou redémarrez |
| Fichiers de verrou résiduels / « Running multiple emulators with the same AVD » | Nettoyage automatique du verrou AVD et nouvelle tentative | Vérifiez qu'aucun autre émulateur n'utilise le même environnement |
| Image système manquante/corrompue/incompatible avec d'anciennes données | Redémarrage avec des données utilisateur propres | Paramètres → Environnement d'exécution : supprimez l'image et téléchargez-la à nouveau |
| Instantané de démarrage rapide corrompu | Abandon de l'ancien instantané et démarrage à froid | Il sera reconstruit à la prochaine fermeture normale ; ou désactivez les instantanés |
| Composants d'exécution supprimés / bibliothèque VC++ absente | — | Ajoutez ApkStart à la liste blanche de l'antivirus, puis décompressez à nouveau ; installez les bibliothèques Microsoft VC++ 2015-2022 |
| Espace disque insuffisant | — | Déplacez le répertoire d'exécution vers un disque ayant assez de place ; désactivez les instantanés ou réduisez la partition de données |
| Chemin contenant des caractères chinois/spéciaux | Utilisation automatique d'un chemin court | Déplacez ApkStart vers un répertoire au nom purement ASCII (par exemple `C:\ApkStart`) |
| Jeu d'instructions CPU absent (AVX/SSE4) | — | Le plus souvent un avertissement qui permet quand même le démarrage ; sinon utilisez une machine prenant en charge VT-x/AVX ou un ancien moteur |
| Le mode GPU choisi n'est pas accepté par l'environnement actuel | Resélection automatique d'un mode GPU compatible selon la version du moteur | — |
| Erreur graphique / erreur inconnue | Nouvelle tentative avec plusieurs jeux de paramètres | Mettez à jour le pilote graphique ; ou écrivez un correctif de compatibilité ; si rien ne marche, exportez le rapport de diagnostic |

**L'icône du bureau affiche le logo ApkStart / une icône vide** : Paramètres → Intégration système → **Recréer les raccourcis** (réécrit les raccourcis du bureau et du menu Démarrer selon la liste actuelle des applications, en corrigeant aussi les icônes et l'identité dans la barre des tâches). Recréer également les raccourcis si leur déplacement a rendu leur chemin invalide.

---

### 6.7 Aucun son ou son très faible dans les applications {#sound}

**Symptôme** : les vidéos et les sons de notification sont totalement silencieux dans les applications Android ; ou bien les autres logiciels Windows ont du son, mais seules les applications dans ApkStart sont muettes.

**À distinguer d'abord** : si le système lui-même n'a pas de son, réglez d'abord l'audio de Windows ; ne suivez la procédure ci-dessous que si seules les applications d'ApkStart sont silencieuses.

1. **Volume et périphérique de sortie Windows** : cliquez sur l'icône de volume dans la barre des tâches ; vérifiez qu'il n'y a pas de sourdine, que le volume n'est pas à zéro et que le périphérique de sortie est bien le casque/les enceintes que vous utilisez. Ouvrez le « Mixeur de volume » et vérifiez que la ligne ApkStart / environnement Android n'est pas mise en sourdine ou réglée à zéro.
2. **Volume dans l'application** : certaines applications règlent le volume multimédia à zéro lors de leur premier lancement ; augmentez-le dans les paramètres de l'application elle-même ou avec les touches de volume d'Android. Bilibili/Douyin et d'autres peuvent aussi désactiver la lecture automatique du son dans l'application.
3. **Interrupteur de son d'ApkStart** : Paramètres → Courant et installation → **Son des applications Android** doit être coché. La détection automatique de la 0.6.2 vérifie ce point ; si elle le trouve désactivé, elle le signale dans « Paramètres → Diagnostic et réparation » et un clic sur « Traiter » suffit à le réactiver. **Après la modification, redémarrez l'environnement Android** (l'interrupteur détermine si l'émulateur démarre avec `-no-audio` ; un changement en cours d'exécution ne produit pas de son immédiatement).
4. **Service audio Windows** : appuyez sur `Win+R`, saisissez `services.msc`, trouvez **Windows Audio** et vérifiez que son état est « En cours d'exécution » et son type de démarrage « Automatique ». S'il est désactivé, faites un clic droit pour le démarrer ; la détection automatique de la 0.6.2 le signale également. Depuis PowerShell en administrateur, vous pouvez exécuter `net start Audiosrv`.
5. **Casque Bluetooth / plusieurs périphériques de sortie** : après un basculement sur un casque Bluetooth, Windows ne transfère parfois pas les programmes déjà lancés. Déconnectez et reconnectez le casque, ou redémarrez une fois l'environnement Android.
6. **Toujours aucun son** : exportez le rapport via « Paramètres → Diagnostic et réparation → Exporter le rapport de diagnostic » et envoyez-le ; le rapport contient l'état de l'interrupteur de son et du service audio, ce qui permet de déterminer immédiatement si le problème vient de la configuration, d'un service système ou de l'application elle-même.

> Lorsque la réparation automatique échoue, le logiciel ouvre cette section automatiquement. Si vous avez désactivé les notifications de détection automatique, vous pouvez aussi y accéder via le bouton « Tutoriel » d'une entrée de problème ou le `?` de la barre de titre.

---

## 7. Référence de la ligne de commande

```
ApkStart.exe                        Ouvre l'interface principale
ApkStart.exe <chemin\vers.apk>      Installe un APK
ApkStart.exe --launch <nom-paquet>  Lance directement une application (c'est cette commande qu'utilise le raccourci du bureau)
```

---

## 8. Données et répertoires {#storage}

| Usage | Emplacement |
| --- | --- |
| Environnement d'exécution (adb / emulator / images) | Intégré au paquet, ou `%APPDATA%\apkstart\runtime` (version légère) |
| Image système extraite | `%APPDATA%\apkstart\system-images` |
| AVD / applications installées / instantanés | `%APPDATA%\apkstart\avd` |
| Icônes des applications | `%APPDATA%\apkstart\icons\<nom-paquet>.ico` |
| Paramètres et liste des applications | `%APPDATA%\ApkStart\settings.json` / `apps.json` |
| Journaux d'exécution / rapports de diagnostic | `%APPDATA%\ApkStart\logs\` |
| Dossier partagé Windows ↔ Android | `%USERPROFILE%\ApkStartShared` ↔ `/sdcard/ApkStartShared` |

> « Réinitialiser les données Android » ne nettoie que la couche de données utilisateur ; l'image système et les fichiers APK sont conservés. La mise à jour d'une application ne supprime ni l'environnement d'exécution, ni les applications installées, ni les instantanés.
>
> Conservez suffisamment d'espace sur le lecteur C : l'extraction de l'image + la partition de données + les instantanés peuvent totaliser plusieurs gigaoctets. Un espace insuffisant provoque des échecs d'installation (« Installing ») ou de démarrage.

---

## 9. Obtenir de l'aide et envoyer un retour

Lors d'un signalement, joignez ces trois éléments : cela accélère grandement l'identification du problème :

1. **Rapport de diagnostic** : Paramètres → Diagnostic et réparation → Exporter le rapport de diagnostic ;
2. **20 dernières lignes de app.log** : `%APPDATA%\ApkStart\logs\app.log` ;
3. **Votre version et votre forme** : par exemple « version Store 0.6.2 » ou « version portable complète 0.6.2 ».

- GitHub : <https://github.com/RoutineMiku/apkstart> (Issues / Releases)
- Gitee : <https://gitee.com/daily-miku/apkstart>

---

*Ce manuel correspond à la v0.6.2 et est mis à jour avec les versions. Si le libellé de l'interface diffère légèrement de ce document, le texte affiché dans le logiciel fait foi.*
