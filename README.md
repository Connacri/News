# FlutterNews OSINT & Tech Radar

Application Flutter Cross-Platform + Web React pour la veille techno (news par pays, OSINT open-source, Google Patents, Blueprints) avec Firebase (Firestore, Auth, FCM), Vite/Express, CI/CD GitHub Actions.

## Liens de déploiement

- **Web React (Vite)** — `https://device-streaming-ccab91bb.web.app`  
  Hébergé sur Firebase Hosting (site : `device-streaming-ccab91bb`, cible `web`)  
  Miroir : `https://connacri.github.io/News/`
- **Web Flutter (WasmGC)** — `https://flutter-news-osint.web.app`  
  Hébergé sur Firebase Hosting (site : `flutter-news-osint`, cible `mobile`)
- **Releases Android / Web** — `https://github.com/Connacri/News/releases`  
  APK (universal + split per ABI), AAB Play Store, zip Web signés à chaque push sur `main`
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
