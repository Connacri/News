# 🚀 FlutterNews OSINT & Patents — Projet Flutter Cross-Platform

Ce dossier contient l'application Flutter native multiplateforme pour Android, iOS, Web et Desktop.

## 🛠️ Démarrage Rapide

```bash
# 1. Aller dans le dossier flutter_app
cd flutter_app

# 2. Récupérer les dépendances
flutter pub get

# 3. Lancer l'application
flutter run -d chrome --web-renderer canvaskit   # Sur le Web
flutter run -d android --enable-impeller        # Sur Android
flutter run -d ios                             # Sur iOS
flutter run -d macos                           # Sur macOS Desktop
```

## 📦 Compilation des Versions Finales

```bash
# Android APK universel & découpé par ABI
flutter build apk --release --split-per-abi

# Android AAB pour Google Play Store
flutter build appbundle --release

# WebAssembly WasmGC pour Firebase Hosting
flutter build web --release --wasm
```

## 🌐 Déploiement

- **Firebase Hosting** : `firebase deploy --only hosting`
- **GitHub Actions** : Le workflow `.github/workflows/deploy_firebase_hosting.yml` et `.github/workflows/deploy_github_pages.yml` déploient automatiquement à chaque commit sur `main`.
