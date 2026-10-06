# News — Actualités géolocalisées & veille spécialisée

Application Flutter Cross-Platform + Web React d'actualités généralistes géolocalisées : monde, local, politique, économie, entreprises, société, sports, culture, divertissement, science, santé, environnement, éducation, voyage et lifestyle — avec des rubriques spécialisées technologie, IA, cybersécurité, open source, brevets et cloud. La technologie n'est qu'un thème parmi les autres.

---

## ✨ Présentation — pour les utilisateurs

**DZ News** est une application **gratuite, sans publicité et sans
suivi** qui rassemble les actualités par **géographie et thème** : l'utilisateur choisit un pays/région et un sujet, puis reçoit un flux adapté à cette zone. Les rubriques technologiques spécialisées restent disponibles, mais elles ne limitent plus le fil principal. Elle fonctionne dans
le navigateur sur ordinateur **et** sur téléphone Android, avec la même interface.

### Ce que vous pouvez faire

| Fonctionnalité | Ce qu'elle apporte |
|---|---|
| **Actualités géolocalisées** | Flux généraliste filtré par zone : Monde, France, Algérie, Maghreb, Chine, États-Unis, Allemagne, Royaume-Uni, Japon, Canada, avec sources géolocalisées. |
| **Thèmes complets** | Monde, politique, économie, entreprises, société, local, sports, culture, divertissement, science, santé, environnement, éducation, voyage, lifestyle, puis technologie et sous-thèmes spécialisés. |
| **Tendances GitHub & Hacker News** | Les dépôts et discussions qui montent, avec les liens directs vers les projets. |
| **Hub d'API gratuites** | Un catalogue d'API utiles (news, recherche, données) à tester directement depuis l'app. |
| **Export de code Flutter** | Extraits et intégrations prêts à l'emploi : API, modèles IA, tunnels, configuration Firebase. |
| **Briefing audio quotidien** | Votre veille résumée **en audio** pour l'écouter dans les transports ou en multitâche. |
| **Favoris synchronisés** | Enregistrez un article et retrouvez-le sur tous vos appareils via votre compte Google. |
| **Notifications push** | Soyez alerté des sujets importants (activables ou désactivables à tout moment). |
| **Fonctionne hors ligne** | Les articles déjà consultés restent lisibles sans connexion grâce au cache local. |
| **6 langues / 10 zones** | Interface en français, anglais, espagnol, allemand, arabe et japonais. |

### Sur quelles plateformes

| Plateforme | Comment y accéder |
|---|---|
| 🌐 **Web (ordinateur / mobile)** | `https://device-streaming-ccab91bb.web.app` — rien à installer |
| 📱 **Android** | Télécharger l'APK depuis la [page Releases](https://github.com/Connacri/News/releases) |
| 🛒 **Google Play** | Non publiée — l'identifiant `com.flutternews.osint` est conservé tel quel (pas de migration) |

### Démarrer en 30 secondes

1. Ouvrez `https://device-streaming-ccab91bb.web.app` — ou installez l'APK sur Android.
2. Choisissez votre zone et votre thème dans le menu latéral (☰). Le flux général est géolocalisé ; la technologie n'est qu'une catégorie parmi toutes les autres.
3. *(Facultatif)* Connectez-vous avec **Google** pour synchroniser vos favoris.
4. *(Facultatif)* Activez les notifications push : vous ne partagez aucune donnée personnelle sans votre accord.

### Vos données

Aucune publicité, aucun cookie de suivi, aucun profilage. **Rien n'est enregistré sur nos
serveurs si vous n'utilisez ni le compte Google, ni les notifications push** ; tout le reste
reste dans votre navigateur. Détails complets :
[`/security-policy`](https://device-streaming-ccab91bb.web.app/security-policy).

---

## Liens de déploiement

- **Web React (Vite)** — `https://device-streaming-ccab91bb.web.app`  
  Hébergé sur Firebase Hosting (site : `device-streaming-ccab91bb`, cible `web`)  
  Miroir : `https://connacri.github.io/News/`
- **Web Flutter (WasmGC)** — `https://flutter-news-osint.web.app`  
  Hébergé sur Firebase Hosting (site : `flutter-news-osint`, cible `mobile`)
- **Releases Android / Web** — `https://github.com/Connacri/News/releases`  
  APK (universal + split per ABI), AAB, zip Web signés à chaque push sur `main`.  
  Distribution utilisateur par **APK** : Play Store n'est pas utilisé.
- **Politique de confidentialité (RGPD)** — `https://device-streaming-ccab91bb.web.app/security-policy`  
  Page statique FR/EN, sans traqueur : `apps/web/public/security-policy.html` (copiée dans
  `apps/mobile/web/` pour le site Flutter). Servie via la réécriture Firebase
  `"/security-policy" → "/security-policy.html"`. Sur GitHub Pages, l'URL équivalente est
  `/security-policy.html` (Pages ne sert pas les URLs sans extension).

## Architecture du projet

```text
News/
├─ apps/
│  ├─ web/                # React 19 + Vite + Tailwind + TypeScript
│  └─ mobile/             # Flutter (Android, iOS, Web)
├─ services/
│  └─ api/                # API Express (proxy TTS Gemini, traduction)
├─ .github/workflows/      # CI/CD (releases APK/AAB/Web + déploiements)
├─ firebase.json          # Multisite Firebase Hosting (web + mobile)
├─ firestore.rules        # Règles Firestore
├─ package.json           # Workspace (npm workspaces)
├─ .env.example           # Variables d'environnement
└─ README.md
```

## Démarrage rapide

### Pré-requis

- Node.js >= 20, npm >= 10
- Flutter 3.44+ (Dart 3.12+)
- Firebase CLI (`firebase --version` : 15.32.1+)
- Git, Java 21 (build Android, AGP 9)

### Build Android

```bash
cd apps/mobile
flutter build appbundle --release   # AAB Play Store
flutter build apk --release         # APK universal
flutter analyze                    # doit remonter "No issues found!"
```

Le keystore de release est lu depuis `apps/mobile/android/key.properties`
(non versionné) ; sans ce fichier le build utilise la clé debug.

### Installation

```bash
npm ci
cd apps/mobile && flutter pub get && cd ../..
```

### Développement

```bash
# API Express + Vite (dev)
npm run dev

# App Web uniquement
npm run dev:web

# Lancer Flutter (mobile/web)
cd apps/mobile
flutter run -d chrome
```

### Traduction du podcast audio

Les scripts du podcast (édition FR / AR) sont traduits par un service de traduction
réel, et non par substitution de mots :

| `VITE_TRANSLATE_PROVIDER` | Comportement |
|---|---|
| `mymemory` | **Défaut** — endpoint public gratuit, sans clé, appelé depuis le navigateur. Titres/résumés d'articles publics uniquement, résultat mis en cache en local. |
| `gemini` | Utilise `POST /api/translate` (API Express). Nécessite l'API hébergée **et** `GEMINI_API_KEY`. |
| `off` | Aucune traduction réseau : seuls les scripts vérifiés du dictionnaire sont lus. |

Ordre de résolution d'un article du podcast :

1. script vérifié (`FRENCH_SCRIPTS` / `ARABIC_SCRIPTS`) → 100 % natif, hors ligne ;
2. sinon traduction réelle du titre et du résumé, avec nettoyage des préfixes de flux
   (`[HN Traduction]`, `Show HN:`, …) avant passage dans le moteur ;
3. en cas d'échec, le texte source est conservé et l'interface affiche un avertissement —
   aucun texte à moitié traduit n'est lu à la voix.

Le texte lu par la voix de synthèse est désormais coupé à une frontière de phrase
(4 000 caractères max) au lieu d'être tronqué brutalement.

### Build

```bash
# Build Web React (Vite) → apps/web/dist
npm run build

# Build API Express → services/api/dist
npm run build:api

# Build Flutter Web → apps/mobile/build/web
cd apps/mobile && flutter build web --release && cd ../..
```

### Déploiement Firebase Hosting

```bash
# Web React uniquement
npm run firebase:deploy:web

# Web Flutter uniquement
npm run firebase:deploy:mobile

# Les deux sites
firebase deploy --only hosting
```

## Firebase

- Projet : `device-streaming-ccab91bb`
- Site 1 : `device-streaming-ccab91bb` → React Web (`apps/web/dist`)
- Site 2 : `flutter-news-osint` → Flutter Web (`apps/mobile/build/web`)
- Apps enregistrées :
  - Web `1:100841671094:web:7ce6f2e80bfd61ad315917`
  - Android `1:100841671094:android:d590e3e11201f56b315917` (package `com.flutternews.osint`)
- Certificats SHA-1 / SHA-256 enregistrés (release + debug) pour l'APK signé
- Configuration embarquée : `apps/mobile/lib/firebase_options.dart` et
  `apps/mobile/android/app/google-services.json` (régénérable via `flutterfire configure`)

## CI/CD

Trois workflows dans `.github/workflows/` :

| Workflow | Rôle |
|---|---|
| `deploy_github_pages.yml` | Build React + publication GitHub Pages |
| `deploy_firebase_hosting.yml` | Build React + déploiement Firebase (cible `web`) |
| `flutter_crossplatform_release.yml` | Analyse, APK/AAB/Web signés, GitHub Release, déploiement Firebase (cible `mobile`) |

Chaque push sur `main` déclenche une **pre-release roulante** `build-<n°>` contenant :

- `app-release.apk` (universal) + `app-arm64-v8a` / `app-armeabi-v7a` / `app-x86_64` (split per ABI)
- `app-release.aab` (App Bundle Play Store)
- `flutter-news-web.zip` (build WasmGC)

Un tag `v*.*.*` publie la même release en version stable.

### Version code Android (Google Play)

Google Play exige un **`versionCode` strictement croissant** par import : renvoyer le même
numéro est refusé (*« Le code de version 1 a déjà été utilisé »*).

- La CI calcule automatiquement `versionCode = max(build number de pubspec, n° de run GitHub)`
  et le passe via `--build-number` aux builds AAB et APK.
- Chaque build de `main` produit donc un code unique et croissant : **utiliser l'AAB de la
  dernière release** pour un import Play, ne jamais ré-uploader le même artefact.
- Le build number de `apps/mobile/pubspec.yaml` (`version: 1.0.0+2`) n'est qu'un plancher
  pour les builds locaux : si le Play Console exige un code supérieur au n° de run,
  incrémenter ce nombre.

### Compatibilité des actions

Versions épinglées : `actions/checkout@v7`, `actions/setup-node@v7`, `actions/setup-java@v6`,
`actions/upload-artifact@v7`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`,
`actions/deploy-pages@v5`, `softprops/action-gh-release@v3`, `subosito/flutter-action@v2`,
`FirebaseExtended/action-hosting-deploy@v0`.

Secrets requis (GitHub Actions) :

| Secret | Usage |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | JSON du service account `github-actions-deployer` (rôle `roles/firebase.admin`) |
| `ANDROID_KEYSTORE_BASE64` | Keystore de release, encodé en base64 |
| `ANDROID_KEYSTORE_PASSWORD` / `ANDROID_KEY_PASSWORD` | Mots de passe du keystore |
| `ANDROID_KEY_ALIAS` | Alias de la clé (`upload`) |

Variables : `FIREBASE_PROJECT_ID`, `FIREBASE_WEB_SITE_ID`, `FIREBASE_MOBILE_SITE_ID`,
`ANDROID_PACKAGE`, `FLUTTER_VERSION`.

> Le keystore (`apps/mobile/android/app/upload-keystore.jks`) et `key.properties` sont
> ignorés par Git et ne vivent que dans les secrets CI. En cas de perte, la signature Play
> est irrécupérable : conserver une sauvegarde hors dépôt.

## Sécurité

- `npm audit` remonte 4 vulnérabilités *high* dans `@grpc/grpc-js`, dépendance
  **Node uniquement** du SDK Firestore (`~1.9.0` épinglée par `@firebase/firestore`).
  Le bundle navigateur n'embarque aucun code gRPC (vérifié dans `apps/web/dist`).
  Le correctif proposé par npm (`npm audit fix --force`) imposerait un retour à
  `firebase@9` : refusé, la correction amont est made in Firebase.
- Aucune clé n'est versionnée : keystore, `key.properties` et
  `google-services.json` sont ignorés par Git. Seuls les Secrets GitHub Actions
  portent les credentials de signature et le service account de déploiement.

## Licence

Projet interne.
