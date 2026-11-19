# ApkStart

[简体中文](README.zh-CN.md)

<p align="center"><img src="docs/images/logo.png" alt="ApkStart Logo" width="160" /></p>

[![CI](https://github.com/RoutineMiku/apkstart/actions/workflows/ci.yml/badge.svg)](https://github.com/RoutineMiku/apkstart/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/RoutineMiku/apkstart?include_prereleases&sort=semver)](https://github.com/RoutineMiku/apkstart/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11%20x64-0078D6.svg)](#)

**Un lanceur d'applications Android pour Windows — installez et utilisez les applications Android comme des logiciels Windows natifs.**
Remarque : ce projet est encore à un stade précoce, un passe-temps de son auteur. Toutes les modifications sont effectuées après le travail et les week-ends. Open source et gratuit, sans publicité, pas encore très pratique, et sans aucune campagne de promotion — à prendre pour ce que c'est, sans attente démesurée.

- 🖱️ **Double-clic sur un .apk = installation** : après enregistrement de l'association de fichiers .apk, un double-clic sur un APK dans l'Explorateur déclenche automatiquement l'analyse → l'installation → la création d'une icône sur le bureau, sans jamais ouvrir d'interface d'émulateur.
- 🧩 **Une icône de bureau par application** : l'icône est extraite hors ligne de l'APK, convertie en ICO multi-tailles, et un double-clic sur l'icône du bureau lance directement l'application — exactement comme avec un logiciel Windows natif.
- 🪟 **L'application est une fenêtre** : l'exécution se fait en mode **avec fenêtre** (en mode sans tête, Android ne produit pas de VSYNC : le processus de l'application reste vivant mais l'écran est vide). ApkStart renomme cette fenêtre, remplace son icône par la vraie icône de l'application, la positionne selon le ratio portrait : c'est une fenêtre d'application autonome. Le **mode plein écran** remplit la hauteur de l'écran et est centré ; le **mode fenêtre** peut être déplacé et redimensionné librement, avec mémorisation des dimensions par application.
- 🔍 **Recherchable depuis Windows** : après l'installation, des raccourcis sont créés à la fois sur le bureau et dans le menu Démarrer (`Programmes\ApkStart\`) ; une recherche par nom d'application dans le menu Démarrer y mène directement, et les boutons de la barre des tâches sont regroupés par application.
- 📁 **Données partagées** : `%USERPROFILE%\ApkStartShared` ↔ `/sdcard/ApkStartShared` dans Android sont synchronisés en continu dans les deux sens ; les fichiers enregistrés par une application Android apparaissent directement sur la machine.
- 🪶 **Ultra-léger** : la couche elle-même n'a aucune dépendance tierce (même l'analyse ZIP / PNG / ICO / AXML est écrite à la main) ; le runtime est lancé à la demande et libéré automatiquement à l'intervalle. Il est aussi possible de réutiliser entièrement un runtime Android déjà présent sur votre machine, pour une empreinte supplémentaire nulle.

![Interface principale](docs/images/app.png)

```
┌────────────────────────────────────────────────────────────────────┐
│  Icône du bureau (vraie icône d'application .lnk)                  │
│      │  Double-clic                                                │
│      ▼                                                             │
│  ApkStart.exe --launch <nom de paquet>                             │
│      │  Runtime éteint ? → relance auto (Android Emulator + API34) │
│      ▼                                                             │
│  Lancement via le point d'entrée LAUNCHER résolu par le système    │
│  (pas l'Activity principale de l'APK)                              │
│      │  Veille 18 s, relance auto / reset données / droits         │
│      ▼                                                             │
│  Fenêtre émulateur = fenêtre appli (titre, icône, ratio portrait,  │
│  plein écran centré)                                               │
└────────────────────────────────────────────────────────────────────┘
```

## Télécharger et utiliser (sans compiler)

Les deux dépôts ont un contenu identique ; en Chine, privilégiez Gitee :

- GitHub : [github.com/RoutineMiku/apkstart/releases](https://github.com/RoutineMiku/apkstart/releases)
- Gitee : [gitee.com/daily-miku/apkstart/releases](https://gitee.com/daily-miku/apkstart/releases) (beaucoup plus rapide en Chine)

Paquets d'installation (trois formats, contenu et numéro de version rigoureusement identiques) :

| Format | Nom de fichier | Quand le choisir |
|---|---|---|
| Version Store | `ApkStart_<version en quatre segments>_x64.msix` | Installer depuis Microsoft Store. Runtime complet intégré, aucune connexion nécessaire après l'installation ; mises à jour gérées par le Store |
| Version portable complète | `ApkStart-v*-win64-full.zip` (~830 Mo, ~1,3 Go une fois décompressé) | **Pas envie d'installer ni d'attendre un téléchargement** : prêt à l'emploi après décompression, runtime (émulateur + image système) entièrement inclus |
| Version installateur | `ApkStart-v*-Setup.exe` (~1,3 Go) | Pour disposer de raccourcis bureau/menu Démarrer et d'une entrée de désinstallation |
| Version portable légère | `ApkStart-v*-win64-portable.zip` (96 Mio, ~227 Mo décompressé) | Pour essayer d'abord : le runtime n'est téléchargé qu'au premier lancement |

> Tous les formats de `ApkStart.exe` intègrent **une icône de marque + des ressources de version** (FileDescription = `ApkStart - Lanceur d'applications Android`,
> CompanyName = `RoutineMiku`, version synchronisée avec `package.json`) ; ce n'est plus l'icône par défaut d'Electron ni son numéro de version `33.x`.
> Lors d'un empaquetage depuis les sources : `npm run pack` (léger) / `npm run pack:full` (complet) / `npm run build:msix` (paquet Store).

### Comment le rendu remplit-il tout l'écran

L'**orientation physique du panel** de l'émulateur (`hw.lcd.width/height`) est la véritable forme de l'image. Quand l'orientation du panel ne correspond pas au `screenOrientation` déclaré par l'application, Android ne lui donne qu'une fine bande centrale en letterbox — avec des barres noires sur les côtés ; ni le redimensionnement de la fenêtre, ni `wm size`, ni la modification du style du letterbox ne permettent de remplir l'écran (cette combinaison a été testée point par point, voir les commentaires dans `src/core/apk.js`).

ApkStart **analyse donc `AndroidManifest.xml` hors ligne au moment de l'installation de l'APK**, détermine si l'application est naturellement paysage ou portrait (en pondérant l'Activity de lancement ; pour les orientations `sensor` / `fullSensor`, une valeur réelle est redemandée à Android après le premier lancement), l'enregistre dans `apps.json`, puis choisit le panel au démarrage en conséquence :

- Une application portrait comme Hongguo Free Short Drama → panel portrait 720×1280, droit, plein écran, density 190 (sw606dp), ce qui fournit aussi une mise en page tablette ;
- Une application paysage comme Moku Reader → panel paysage 1280×720, droit, plein écran.

Seul le cas « orientation du panel ≠ orientation de l'application » entraîne un redémarrage du runtime (environ 40 secondes, avec une indication dans la barre de titre) ; ensuite, les applications de même orientation démarrent en un instant. Le bouton de rotation de la barre de titre **mémorise** l'orientation pour cette application (les autres ne sont pas affectées), et Réglages → Fenêtre d'application → Orientation de l'écran permet de choisir « Forcer le paysage / Forcer le portrait ».

La mise en page est déterminée par la **densité logique** : 720 pixels de large à 190 dpi donnent **606 dp**, ce qui dépasse juste le seuil tablette de 600 dp d'Android ; la page des épisodes en deux colonnes et les réglages en deux panneaux de Hongguo n'apparaissent qu'à cette densité (le défaut du miroir, 320 dpi, ne donne que 360 dp, soit une mise en page de téléphone). C'est l'interrupteur « Mise en page tablette » des réglages, activé par défaut ; le désactiver revient à la mise en page mobile.

### Mise à jour en ligne (choix automatique de la source la plus rapide)

Réglages → **Mise à jour logicielle** → « Vérifier les mises à jour », ou clic droit sur l'icône de la barre d'état → « Vérifier les mises à jour ». Une fois une nouvelle version trouvée, cliquez sur « Mettre à jour maintenant ».

- La version installée télécharge `ApkStart-v*-Setup.exe` et l'installe silencieusement ;
- La version légère télécharge `ApkStart-v*-win64-portable.zip`, décompresse et remplace le **répertoire du programme** — le répertoire du runtime (`%APPDATA%\apkstart\runtime`), les applications installées et les snapshots ne se trouvent pas dans le répertoire du programme : la mise à jour ne perd donc rien ;
- Le remplacement est réalisé par un script PowerShell autonome (attendre la sortie du processus principal → écraser → relancer) : **pas de fenêtre « veuillez fermer le programme manuellement »**, ni de fenêtre d'émulateur résiduelle sur le bureau.

La chaîne de mise à jour n'est pas liée en dur à GitHub : la source est **testée et choisie à chaque fois** :

1. Interroger simultanément GitHub et Gitee pour connaître la dernière version, et retenir le numéro le plus élevé (un source en timeout ou bloquée n'affecte pas l'autre) ;
2. Établir une liste de candidats — « lien direct vers le site d'origine / asset homonyme sur Gitee / préfixe de miroir » — et, pour chaque adresse, télécharger réellement 256 Ko afin de mesurer la vitesse, en ne comptant que le débit **après réception du premier octet** (le temps du handshake est exclu, sinon une source à forte latence et grande bande passante serait classée à tort comme lente) ;
3. Trier par vitesse mesurée, puis télécharger par blocs en parallèle via la source la plus rapide ; en cas d'échec, passer automatiquement à la suivante.

L'option « Sources de téléchargement et de mise à jour » des réglages permet de forcer l'usage d'un seul côté (utile sur les réseaux d'entreprise qui n'autorisent qu'un seul domaine), de désactiver le miroir d'accélération public ou d'utiliser un préfixe de miroir personnalisé. La limite de Gitee est de 100 Mo par fichier ; le paquet portable, compressé avec le deflate de 7-Zip (`-mx=9`), fait **95,0 Mo** : sur Gitee également, c'est un paquet unique qu'il suffit de décompresser par double-clic (auparavant, il fallait le découper en `.part1/.part2` et les assembler manuellement ; cette version est abandonnée). Les paquets homonymes des deux dépôts n'ont pas exactement la même taille ; le client choisit une seule source d'après les résultats du test et ne mélange jamais les morceaux.

Les deux dépôts sont publics ; la liste des versions de Gitee est lisible de façon anonyme, sans aucun token. (Un token en lecture seule n'est à saisir dans les réglages que si Gitee renvoie 403/429 à cause d'une limitation de débit.)

**Comportements par défaut, prêts à l'emploi** (inutile d'aller chercher dans les réglages) :

- Démarrage automatique avec Windows, présence permanente dans la barre d'état ; un double-clic sur l'icône du bureau mène directement dans l'application.
- Après l'installation d'un APK, création automatique de **deux raccourcis : bureau + menu Démarrer** ; la recherche Windows trouve directement le nom de l'application ; les raccourcis oubliés par les anciennes versions sont ajoutés automatiquement au démarrage.
- La fenêtre d'application est rendue nativement (pas d'une projection d'écran) : le **mode plein écran** remplit la hauteur de l'écran et est centré, sans déformer le ratio du téléphone ; le **mode fenêtre** reste en portrait, se déplace et se redimensionne librement, avec une taille mémorisée séparément pour chaque application. Bascule possible à tout moment avec `F11` ou par un clic droit sur l'icône de la barre d'état.
- Les autorisations d'exécution demandées par l'application sont accordées automatiquement après l'installation, sans blocage sur une boîte de dialogue système ; en cas de crash, l'application est relancée automatiquement et ses données sont réinitialisées si nécessaire.
- **Le réseau utilise directement celui de l'hôte** : côté Android, le trafic passe par le NAT utilisateur de QEMU et sort par la carte réseau physique de l'hôte ; **aucune carte réseau ni commutateur virtuel n'est créé sous Windows** (aucun pilote à installer, aucun adaptateur réseau supplémentaire). Aucun téléchargement réseau ni modification des paramètres réseau n'est requis.

## Page de réglages : bien classée, et consultable par recherche

Les réglages se multipliant, depuis la version 0.6.0 la page est répartie en huit catégories, avec une navigation en colonne à gauche :

| Catégorie | Ce qui s'y trouve |
|---|---|
| Usage courant et installation | Runtime et environnement, configuration en un clic, démarrage avec Windows, empreinte disque et nettoyage |
| Affichage et fenêtre | Mode d'affichage, plein écran automatique, orientation de l'écran, rotation automatique du miroir, mise en page tablette, mode d'hébergement de la fenêtre, paramètres du système Android |
| Opérations et saisie | Touches de la souris, mappage clavier (manette de jeu) |
| Performance et ressources | Stratégie de ressources, qualité d'image, partition de données, langue du système, clavier chinois, snapshots, préchauffage au démarrage, paramètres avancés |
| Réseau et téléchargement | Sources de mise à jour et de téléchargement, miroir d'accélération public, nombre de threads de téléchargement |
| Diagnostic et réparation | Bilan de santé de la machine · configuration automatique, pilotes · correctifs de compatibilité, détection automatique · diagnostic intelligent |
| Intégration et fichiers | Bureau et applications, partage de fichiers, intégration système |
| Mise à jour et à propos | Mise à jour logicielle, à propos |

Une zone de recherche se trouve aussi en haut : saisissez des mots-clés comme « paysage », « mémoire » ou « proxy », et les résultats correspondants s'affichent **toutes catégories confondues** — pas de « trouvé mais invisible ». La dernière catégorie consultée est mémorisée et rouverte à la prochaine visite.

## Détection automatique (debug automatique)

Réglages → **Diagnostic et réparation** → « Détection automatique · Diagnostic intelligent ». En arrière-plan, la machine est analysée périodiquement et les problèmes sont listés par catégorie :

- **Runtime** : véritable cause du dernier échec de démarrage, amorçage bloqué, fichiers de verrou résiduels, processus d'émulateur orphelins, snapshot « coquille vide », absence d'accélération matérielle
- **Connexion de l'appareil** : adb non autorisé (une boîte « Autoriser le débogage USB ? » est apparue sans que personne ne réponde), état offline, runtime en cours d'exécution mais adb ne voit aucun appareil
- **Stockage** : espace disque restant, divergence entre la valeur configurée et la valeur réelle de la partition de données (un disque de différence bloque l'agrandissement), répertoire partagé non accessible en écriture
- **Réglages** : stratégie d'orientation en conflit avec le panel physique, plein écran automatique inefficace en fenêtre indépendante
- **Réseau / journaux** : Android sans accès réseau, source de téléchargement injoignable, erreurs dans les journaux récents

Chaque problème peut être traité en un clic (redémarrer le runtime, supprimer les verrous, nettoyer les processus orphelins, invalider le snapshot, libérer le disque, réinitialiser le réseau Android…). Une nouvelle vérification est effectuée automatiquement après la réparation.

Deux principes : **un échec de détection n'est jamais considéré comme un problème** (si l'état est indisponible, on affiche « inconnu » plutôt que de donner une fausse alerte) et **un seul avertissement par nouveau problème** (les anciens problèmes ne sont pas répétés, et le rétablissement est seulement enregistré silencieusement). Par défaut, une vérification toutes les 10 minutes ; la fréquence peut être désactivée ou modifiée sur la même page.

## Compilation depuis les sources

```powershell
# 1. Installer les dépendances (y compris le runtime Electron)
npm install

# 2. Démarrer et effectuer le déploiement du runtime (téléchargement unique de adb / Android Emulator / image système)
npm start

# 3. (Facultatif) Enregistrer l'installation par double-clic sur un .apk
npm run assoc:on

# 4. Empaqueter la version portable (sans installation, directement distribuable)
npm run pack
# Sortie : dist/ApkStart-win64-portable/ApkStart.exe
# 5. Compresser en zip pour la publication (utiliser obligatoirement ce script, et non Compress-Archive : le fichier serait plus gros de 5 Mo et ne tiendrait pas dans Gitee)
node build/zip.js dist/ApkStart-win64-portable ApkStart-win64-portable.zip
```

### EXE monofichier (runtime complet intégré, plus de réseau après installation)

Si vous souhaitez « envoyer un seul EXE, que le destinataire double-clique pour le lancer sans attendre de téléchargement », utilisez cette méthode :

```powershell
# Organiser d'abord engine/ en runtime distribuable (system.img compressé au maximum en xz/LZMA2, 3,1 Go → ~1,1 Go ;
# et retirer les parties inutiles de l'émulateur : QEMU arm64, backend Vulkan, packs de langues, outils qsn/autotest, ressources VR)
npm run runtime

# Puis produire l'installateur EXE (cible nsis d'electron-builder, installation dans le répertoire de l'utilisateur courant)
npm run build:exe
# Sortie : dist/release/ApkStart-<version>-Setup.exe
```

Composition de la taille (mesurée) : Electron ~180 Mo, émulateur après allègement ~480 Mo, image système après compression xz ~1,1 Go, pour un installateur final d'environ 1,32 Go (soit environ 490 Mo économisés par rapport à gzip). Le seuil de compression dur restant se situe au niveau de `system.img` (c'est le système Android lui-même, une image protégée par verity : les composants GMS ne peuvent pas être retirés de l'extérieur). Le réseau passe par défaut par le NAT de l'hôte, sans créer de carte réseau virtuelle, et ne dépend donc d'aucun pilote supplémentaire.

Au premier lancement, l'image xz est décompressée dans `%APPDATA%\apkstart\system-images` (~20 secondes, une seule fois), puis réutilisée directement à chaque démarrage suivant. L'AVD et les applications installées sont stockés à demeure dans `%APPDATA%\apkstart\avd` : même si la version portable est décompressée dans un répertoire temporaire à chaque fois, rien n'est perdu.

## À propos du runtime : totalement autonome, sans dépendance à un émulateur tiers

ApkStart est un projet **autonome** : tous les composants du runtime sont téléchargés, vérifiés et gérés par lui-même (dans `%APPDATA%\apkstart\runtime`). La version légère télécharge par défaut le paquet complet depuis **la GitHub Release de ce projet** (`ApkStart-runtime-*.zip`) et ne revient aux sources officielles ci-dessous que si elle ne peut pas y accéder :

| Composant | Source | Taille | Rôle |
|---|---|---|---|
| adb (platform-tools) | Source officielle dl.google.com | ~8 Mo | Installation / lancement d'applications Android |
| Android Emulator | Source officielle dl.google.com (téléchargement parallèle à 8 threads) | ~440 Mo | Moteur d'exécution (modèles d'appareils et traduction GPU intégrés) |
| Image système Android 14 universelle (Google Play x86_64) | Source officielle dl.google.com | Image source ~3,1 Go (~1,1 Go après xz) | Seule couche de base : applications x86, applications ne contenant que des bibliothèques ARM et GMS fonctionnent ; l'image est le système, aucune installation nécessaire |
| Pilote AEHD (facultatif) | Source officielle dl.google.com | ~0,2 Mo | Accélération matérielle (ou WHPX, la « plateforme de l'hyperviseur Windows ») |

À la première utilisation, la page « Runtime » guide ce déploiement (**déploiement en un clic**) :
1. Téléchargement automatique de adb, du moteur d'exécution et de l'image système (sources officielles mesurées à plus de 10 Mo/s) ;
2. Une fois le déploiement terminé, **démarrage automatique** ; ensuite, le double-clic sur une icône du bureau relance le tout automatiquement, de façon totalement transparente.

![Assistant de déploiement du runtime](docs/images/setup.png)

**Compatibilité des appareils (gérée automatiquement, sans intervention)**

- Sans accélération matérielle, repli automatique sur la simulation logicielle ; en cas d'échec de démarrage, jusqu'à 4 combinaisons de paramètres sont réessayées automatiquement selon « backend de rendu → mode d'accélération → mémoire / démarrage à froid ».
- Le `-gpu` est choisi automatiquement according to la version du moteur (`software` pour les 37.x, `swiftshader_indirect` pour les anciennes versions) ; les modes dépréciés ne sont plus utilisés.
- La mémoire et le nombre de cœurs sont déduits de la mémoire physique (2–4 Go / 2–4 cœurs), la partition de données passe de 16 Go à 4 Go ; les ports sont choisis dynamiquement parmi les ports libres, les chemins chinois sont convertis automatiquement en chemins courts, et les fichiers de verrou de l'AVD sont nettoyés automatiquement.
- Les causes d'échec sont traduites en français et accompagnées de conseils de réparation ; les réglages permettent d'« exporter un rapport de diagnostic ».
- Les téléchargements de gros fichiers utilisent par défaut **8 threads avec découpage en blocs et reprise sur erreur** ; les sources qui ne gèrent pas Range reviennent automatiquement à un flux unique.
- **N'utilise que son propre runtime, indépendamment des autres émulateurs** : ApkStart ne détecte, ne prend en charge et ne pilote pas MuMu / LDPlayer / BlueStacks / WSA installés sur votre machine ; leur présence, leurs mises à jour et leurs changements de port n'ont aucun effet sur ApkStart. L'option « changer de moteur » a d'ailleurs été retirée des réglages.
- **Bilan de santé · configuration automatique** : après l'installation, ApkStart vérifie la virtualisation CPU (VT-x/SVM), la plateforme de l'hyperviseur Windows, la carte graphique et sa mémoire vidéo, la mémoire vive et la version du système ; ce qui peut être corrigé automatiquement (mémoire / cœurs / qualité / backend de rendu) est écrit dans les réglages et figé sous forme de pilote ; ce qui exige les droits administrateur dispose d'un bouton ; ce qui doit être modifié dans le BIOS s'accompagne d'explications. Voir [docs/preflight.md](docs/preflight.md).
- **Extension des pilotes (correctifs de compatibilité)** : si une machine particulière ne démarre qu'après modification des paramètres de lancement (ancienne carte graphique avec une version GLES trop basse, accélération matérielle désactivée, pilote qui plante dès que le rendu matériel est activé), vous pouvez écrire un correctif JSON : il déclare quelles machines correspondent et quels paramètres changer une fois la correspondance établie. La page de réglages permet d'importer, d'activer et d'exporter le modèle de la machine ; le correctif ne modifie que les options de lancement figurant sur une liste blanche et n'exécute aucun code. Voir [docs/drivers.md](docs/drivers.md).

**Exécution conteneurisée à faible coût**

- **Couche de base en lecture seule** : une seule copie de `system-images/` pour toute la machine, partagée par toutes les applications ; plus de double stockage AOSP + version compatible.
- **Couche inscriptible fine** : chaque AVD utilise des données utilisateur différentielles et un snapshot quickboot nommé ; après la fermeture de la dernière fenêtre d'application (donc à l'intervalle), l'état de la mémoire est enregistré en snapshot, et le prochain démarrage se fait par restauration plutôt que par démarrage à froid.
- **Préchauffage à l'intervalle (activé par défaut)** : comme WSA ou l'édition PC du store de Tencent, ApkStart amorce l'environnement Android en arrière-plan dès son lancement (fenêtre entièrement masquée) ; il ne reste alors plus qu'un `am start` au moment de cliquer sur l'application. Contrepartie : environ 1 Go de mémoire résidente à l'intervalle ; cette option est désactivable dans les réglages.
- **Accélération du démarrage à froid** : les résultats de la détection de l'accélération et de la version du moteur sont mis en cache sur disque (invalidés par l'empreinte de l'exe), l'énumération inutile des processus via `wmic` est supprimée, la détection au démarrage passe à un intervalle adaptatif (à partir de 350 ms) et les commandes de préparation côté invité sont regroupées en un seul aller-retour adb : 5 à 10 secondes gagnées à chaque démarrage.
- **`/data` est créé par ApkStart lui-même** : le `userdata.img` de l'image système officielle n'est qu'un espace de 1 Mo rempli de zéros ; le formatage réel était normalement effectué par les outils du SDK — lancer directement `emulator.exe` saute cette étape, `/data` ne peut pas être monté et l'invité tombe dans une boucle de redémarrage en recovery, ce qui se manifeste par « plusieurs minutes d'attente sans que rien ne s'ouvre ». Désormais, au premier lancement, ApkStart génère lui-même un ext4 avec blocs de 4 Ko, `ENCRYPT` (chiffrement au niveau du fichier) et `ext_attr` (étiquettes SELinux), puis l'agrandit à la capacité configurée à l'aide de son propre `qemu-img` + `resize2fs`. Mesures : démarrage à froid ~23 s, restauration de snapshot ~10 s.
- **Contrôle d'intégrité des snapshots** : les coquilles vides laissées par une sauvegarde interrompue (un `snapshot.pb` de quelques dizaines d'octets) sont détectées et nettoyées ; les versions récentes de l'émulateur écrivent `ram.bin` (les anciennes écrivaient `ram.img`) : les deux noms sont reconnus, et un snapshot de 3 Go fraîchement enregistré n'est plus pris à tort pour une coquille puis supprimé.
- **Aucune fenêtre de console n'apparaît** : la fenêtre console de qemu appartient à `conhost.exe`, dont le pid ne correspond pas à celui de qemu — une liste blanche de pids ne suffit pas à la masquer ; le démon réseau de l'émulateur, `netsimd`, ouvre lui aussi une fenêtre noire. Désormais, la suppression est **installée avant le démarrage de l'émulateur**, avec un repli par nom de classe/titre de fenêtre (emulator / qemu / netsim) et une analyse toutes les 120 ms pendant les 90 premières secondes suivant le démarrage.
- **Ouvrir un logiciel n'affiche que son interface** : la fenêtre principale de l'émulateur (`Android Emulator - apkstart5554`) n'apparaît jamais seule sur le bureau — elle est soit masquée par suppression, soit déjà intégrée à la fenêtre de l'application via `SetParent`. À la fermeture de la fenêtre de l'application, ApkStart la **détache d'abord** de la fenêtre hôte et la masque, **puis** détruit l'hôte (dans l'ordre inverse, Windows la rattacherait au bureau et l'afficherait) ; après la sortie de l'application, le proxy de fenêtre continue de « surveiller » jusqu'à 3 minutes, pour éviter qu'un émulateur quitté en cours de démarrage ne fasse réapparaître une fenêtre noire quelques dizaines de secondes plus tard.
- **Téléchargement à la demande** : l'image universelle n'est complétée que lorsqu'une application ne contient que des bibliothèques natives ARM ; les paquets fractionnés `.apks` / `.xapk` sont installés automatiquement avec `install-multiple`.
- **Récupérable** : les cibles QEMU non x86_64 sont retirées à la compilation (~400 Mo) ; la page de réglages permet de nettoyer les anciennes images, snapshots, fichiers de verrou et AVD abandonnés.

## Structure du répertoire

```
apkstart/
├─ src/
│  ├─ main.js               Processus principal : fenêtres / barre d'état / instance unique / dispatch en ligne de commande / IPC
│  ├─ preload.js            Pont sécurisé
│  ├─ ui/                   Couche de rendu (HTML/CSS/JS natifs, sans framework)
│  └─ core/
│     ├─ zip.js             Lecteur ZIP minimal (décompression à la demande)
│     ├─ axml.js            Analyse du XML binaire Android
│     ├─ arsc.js            Analyse de la table de ressources resources.arsc (restitution du nom et du chemin de l'icône de l'application)
│     ├─ apk.js             Métadonnées APK : nom de paquet / version / Activity de lancement / icône / ABI
│     ├─ png.js             Encodeur PNG sans dépendance + dessin des icônes du programme
│     ├─ shortcut.js        Génération d'ICO multi-tailles + raccourci .lnk
│     ├─ assoc.js           Association de fichiers .apk (HKCU, sans droits administrateur)
│     ├─ adb.js             Client adb (installation / lancement / synchronisation / capture d'écran / …)
│     ├─ engine.js          Gestion du runtime : détection / hébergement de l'émulateur / récupération à l'intervalle
│     ├─ sharer.js          Synchronisation bidirectionnelle du répertoire partagé local ↔ Android
│     ├─ installer.js       Orchestration du pipeline d'installation
│     └─ store.js           Persistance du catalogue d'applications et des réglages
├─ engine/                 Cache de téléchargement des composants du runtime (emulator / system-images / platform-tools)
├─ tools/platform-tools/   Emplacement de l'adb portable
├─ test/                   Tests unitaires + tests d'intégration Electron + captures de test (smoke)
├─ build/pack.js           Empaquetage de la version portable
└─ scripts/assoc.js        Interrupteur en ligne de commande de l'association .apk
```

## Ligne de commande

```
ApkStart.exe                          Ouvre l'interface principale
ApkStart.exe <chemin\vers.apk>        Installe un APK
ApkStart.exe --launch <nom de paquet> Lance directement une application (paramètre utilisé par les raccourcis du bureau)
```

## Tests

```powershell
npm test                                   # Tests unitaires Node purs + tests de la chaîne du moteur (aucun réseau requis)
npm run test:boot                          # Test d'amorçage réel : invité Alpine de 61 Mo pour valider les paramètres QEMU, la création de disque et l'arrêt propre
npm run selftest                           # Auto-test du runtime : une fois Android installé, valide en un clic installation → lancement → capture d'écran → répertoire partagé
electron test/electron-integration.js      # Tests d'intégration ICO / raccourci
electron . --smoke test\shot.png           # Lance l'application et prend une capture (test de fumée de l'interface)
```

`npm run selftest` est la « commande de recette » une fois le système installé : elle vérifie successivement la connexion adb de l'appareil courant, la version d'Android, la prise en charge du freeform et la synchronisation bidirectionnelle du répertoire partagé ; avec `--apk une-appli.apk`, elle effectue en plus un cycle complet : installation → lancement en fenêtre indépendante → confirmation au premier plan → capture d'écran.

## Choix de conception (explications honnêtes)

- **Pas un hyperviseur écrit de zéro** : le noyau Android, la traduction GPU et le runtime ART sont des projets de l'ordre de plusieurs années ; ce projet choisit de s'appuyer sur AOSP/QEMU/adb et concentre son travail sur « une expérience équivalente à celle d'une application native » — c'est d'ailleurs l'architecture commune à des produits comme l'édition PC du store de Tencent ou Google Play Games PC.
- **Le répertoire partagé est synchronisé, et non monté** : sans root sous Windows, impossible de monter un répertoire NTFS côté Android ; une synchronisation bidirectionnelle à la seconde offre la même expérience.
- **Applications ARM-only / applications ByteDance** : activez le « Mode de compatibilité ARM » dans les réglages pour passer à l'**image Google Play Android 14 (API 34)** (qui intègre la nouvelle couche de traduction ndk_translation) : les applications ne contenant que des bibliothèques natives ARM peuvent être installées et exécutées. **Test confirmé : Hongguo Free Short Drama (com.phoenix.read, arm64-v8a uniquement) s'installe correctement, entre dans le flux de recommandations et lit des vidéos** — sur l'ancienne image API 30, le gestionnaire de signaux non standard embarqué par ces applications déclenchait une assertion de protection de la couche de traduction (`DoBadTrampoline` SIGABRT),Corrigée par la nouvelle couche de l'image Android 14. Quelques applications ajoutent une détection d'émulateur plus poussée (vérification obligatoire de capteurs ou de la baseband réels) et peuvent rester limitées ; en cas d'échec d'installation ou de crash au lancement, ApkStart affiche une explication en français.

| Hongguo Free Short Drama en cours d'exécution en mode compatibilité (Android 14 · accélération matérielle AEHD) |
|:---:|
| ![Hongguo Short Drama fonctionnant en mode compatibilité dans ApkStart](docs/images/compat-hongguo-playing.png) |

### Que faire face au message « Accélération matérielle non activée »

Les émulateurs Android n'ont que deux routes d'accélération sous Windows :

| Méthode | Qu'est-ce que c'est | Qui a besoin des droits administrateur | Redémarrage après installation ? |
|---|---|---|---|
| **WHPX** | Fonctionnalité Windows intégrée « Plateforme de l'hyperviseur Windows » | Pour activer cette fonctionnalité | Oui |
| **AEHD** | Pilote noyau de Google | Pour installer le pilote | Non |

- **Version installée / portable** : Réglages → Vérification de l'environnement → à droite de « Accélération matérielle non activée », cliquez sur **Réparer** : une fenêtre UAC s'affichera une fois et WHPX sera activé automatiquement ; si l'activation échoue (système non pris en charge ou vous avez répondu « Non »), le pilote AEHD sera installé automatiquement à la place.
- **Version Microsoft Store (MSIX)** : une application du Store **ne peut pas s'élever elle-même en privilèges** ; le clic sur « Réparer » ouvre donc directement la boîte de dialogue « Activer ou désactiver les fonctionnalités Windows », dans laquelle vous cochez **« Plateforme de l'hyperviseur Windows »** (HypervisorPlatform en anglais), puis **redémarrez l'ordinateur** une fois.

  Vous pouvez aussi effectuer l'opération vous-même avec PowerShell en tant qu'administrateur :

  ```powershell
  dism /online /enable-feature /featurename:HypervisorPlatform /all /norestart
  dism /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
  ```

> Attention : n'activez pas seulement « Plateforme de machines virtuelles (VirtualMachinePlatform) » — c'est celle qu'utilise WSL2 ; l'émulateur a besoin de la
> **« Plateforme de l'hyperviseur (HypervisorPlatform) »**. Si seule la première est activée, `emulator -accel-check` indiquera toujours que l'accélération est indisponible.
>
> Sans accélération, cela fonctionne quand même (simulation entièrement logicielle), mais l'ouverture prend plusieurs minutes — c'est précisément l'objet de cette indication dans l'application,
> et non un échec de lancement.

### L'icône du bureau est fausse / affiche celle d'ApkStart

Le raccourci sur le bureau de chaque application Android devrait utiliser **sa propre icône** (extraite de l'APK à l'installation et enregistrée dans `%APPDATA%\apkstart\icons\<nom de paquet>.ico`). Si vous voyez à la place le bouton de lecture vert d'ApkStart, ou simplement une icône vide :

1. **Réglages → Intégration système → Recréer les raccourcis** (les raccourcis du bureau et du menu Démarrer sont réécrits d'après le catalogue d'applications courant, ce qui répare aussi les icônes et l'identité dans la barre des tâches) ;
2. Si cela ne suffit pas, supprimez le raccourci concerné, puis dans ApkStart faites un clic droit sur l'application → Recréer le raccourci, ou réinstallez-la une fois.

> Pourquoi cela se produit : les anciennes versions alignaient l'`IconLocation` de ces `.lnk` sur l'icône de marque d'ApkStart ;
> en outre, après avoir déplacé tout le répertoire de la version portable, le chemin absolu mémorisé dans le `.lnk` devient invalide. Une recréation suffit.
>
> À noter au passage : chaque raccourci d'application porte son propre AppUserModelID ;
> une fois **épinglé à la barre des tâches**, le bouton et l'élément épinglé utilisent la même icône d'application, sans être confondus avec ApkStart.

### Pourquoi `adb devices` ne voit-il pas cet appareil Android

Le serveur adb d'ApkStart tourne sur un **port dédié, le 5044**, complètement séparé de votre adb système (port 5037) : votre Android Studio / scrcpy ne se bat pas avec lui pour l'appareil, et lui ne tue pas par erreur l'émulateur que vous avez lancé manuellement.

Pour s'y connecter en ligne de commande :

```powershell
$env:ANDROID_ADB_SERVER_PORT = 5044
adb devices              # Affiche emulator-5554
```

⚠️ **Ne faites pas** de `adb connect` manuel vers le port `5555` : l'image système Play afficherait une boîte « Autoriser le débogage USB ? » qui recouvrirait l'application en cours d'exécution, donnant l'impression que le programme a un problème.

## À propos de l'auteur

ApkStart est développé et maintenu par **RoutineMiku**.

- GitHub : <https://github.com/RoutineMiku/apkstart>
- Compte WeChat : scannez le QR code pour suivre le projet

<p align="center"><img src="docs/images/brand.png" alt="À propos : QR code du compte WeChat et liens du projet" width="560" /></p>

<p align="center"><i>Propulsé par <b>RoutineMiku</b></i></p>

## Participation

Les Issues / PR sont les bienvenues. La couche reste sans dépendance tierce ; veuillez exécuter `npm test` avant de soumettre ; les détails sont dans [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

[MIT](LICENSE). Le paquet publié ne contient que le code d'ApkStart lui-même et le runtime Electron ; il ne distribue ni image système Android, ni binaire QEMU, ni composants Google : ceux-ci sont téléchargés à la demande depuis les sources officielles lors du premier lancement sur la machine de l'utilisateur, conformément à leurs licences respectives.
