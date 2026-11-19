# ApkStart v0.7.0

Cette version est consacrée à la localisation française : l'interface, les messages, le manuel intégré et le README sont désormais disponibles en français, au choix de l'utilisateur.

---

## 1. Sélecteur de langue FR / ZH

- **Paramètres → Général et installation → Langue de l'interface** : `简体中文` / `Français`.
- Le choix est enregistré dans `settings.json` (`uiLanguage`) et s'applique **immédiatement** : fenêtre principale, menu du plateau système, dialogues, notifications, fenêtres d'application, écran de démarrage et manuel. Aucun redémarrage n'est nécessaire.
- La langue du système Android invité (`engine.locale`) reste un réglage indépendant et n'est pas modifiée.

## 2. Interface entièrement traduite

- **352 libellés statiques** : barre d'outils, panneau de paramètres et ses huit catégories, assistants de déploiement, cartes « À propos », info-bulles et textes de saisie.
- **Plus de 500 textes dynamiques** : notifications, confirmations, statuts, salutations, temps relatif, menu contextuel, rapports de diagnostic, historique de mise à jour.
- **Messages du processus principal et des modules métier** : dialogues natifs (libellés traduits en préservant l'ordre des boutons et le bouton par défaut), notifications, progression du déploiement, erreurs d'installation, diagnostic, sources de téléchargement, pilotes de compatibilité, etc.
- Les textes chinois d'origine restent comme **repli** : si une traduction manque, l'interface revient automatiquement au chinois. Aucune régression pour les utilisateurs chinois.

## 3. Manuel intégré en français

- Nouveau `docs/USER-MANUAL.fr.md` et `src/ui/manual.fr.html`, générés par `npm run build:manual:fr`.
- Le manuel s'ouvre dans la langue de l'interface. Les douze chapitres utilisent désormais des **ancres ASCII stables** : les boutons « Tutoriel » et l'auto-tutoriel continuent de pointer sur la bonne section après traduction.
- La recherche dans le sommaire, le titre de la fenêtre et l'impression / enregistrement en PDF sont également traduits.

## 4. Recherche et documentation

- La recherche du panneau de paramètres reconnaît les mots-clés **dans les deux langues** (par exemple « paysage », « 横屏 » ou « landscape »).
- `README.fr.md` a été ajouté, avec un lien depuis le README principal.
- Les presets de keymap suivent désormais la langue à chaud, sans redémarrage.

## 5. Périmètre et compatibilité

- Aucun changement de comportement fonctionnel : installation de `.apk`, fenêtres d'application, dossier partagé, mise à jour en ligne, diagnostic automatique.
- Les commentaires de code, la documentation développeur et les notes de version historiques restent en chinois, conformément à la convention du projet.
- `npm run i18n:check` vérifie la couverture des catalogues (doublons, clés manquantes ou orphelines). `npm test` (135 tests) et `npm run test:ui` (15 tests) passent sur cette version.

Merci à toutes les personnes qui ont demandé une version francophone.
