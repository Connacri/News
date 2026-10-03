# FlutterNews OSINT & Tech Radar

Application Flutter Cross-Platform + Web React pour la veille techno (news par pays, OSINT open-source, Google Patents, Blueprints) avec Firebase (Firestore, Auth, FCM), Vite/Express, CI/CD GitHub Actions.

## Liens de déploiement

- **Web React (Vite)** — `https://device-streaming-ccab91bb.web.app`  
  Hébergé sur Firebase Hosting (site : `device-streaming-ccab91bb`, cible `web`)
- **Web Flutter** — `https://flutter-news-osint.web.app`  
  Hébergé sur Firebase Hosting (site : `flutter-news-osint`, cible `mobile`)

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
- Git, Java 17 (pour build Android)

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
- Apps Android/Web enregistrées (configuration Firebase à synchroniser via `flutterfire configure`/firebase_options).

## CI/CD

Les workflows GitHub Actions sont disponibles dans `.github/workflows/` (déploiement Hosting, Pages, et releases multiplateformes). Les builds de releases APK/AAB/Web signés seront déclenchés sur tags `v*.*.*` ainsi que sur `main` selon le workflow Flutter.

## Licence

Projet interne.
