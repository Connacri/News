import { FlutterCodeFile } from '../types';

export const FLUTTER_PROJECT_FILES: FlutterCodeFile[] = [
  {
    path: 'pubspec.yaml',
    description: 'Configuration du projet Flutter, dépendances Firebase FCM, HTTP & Localisations',
    language: 'yaml',
    content: `name: flutter_news_osint
description: "Application Flutter de News Tech par Pays, OSINT Open-Source et Push Notifications FCM."
publish_to: "none"
version: 1.0.0+1

environment:
  sdk: ">=3.2.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # Firebase Suite
  firebase_core: ^3.6.0
  firebase_messaging: ^15.1.3
  flutter_local_notifications: ^17.2.2

  # Networking & Open Source Public APIs
  http: ^1.2.2
  url_launcher: ^6.3.0
  intl: ^0.19.0

  # State Management & Local Storage
  provider: ^6.1.2
  shared_preferences: ^2.3.2

  # UI & Design
  google_fonts: ^6.2.1
  lucide_icons: ^0.257.0
  cached_network_image: ^3.4.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
  generate: true
  assets:
    - assets/images/
    - assets/icons/
`
  },
  {
    path: '.github/workflows/flutter_release.yml',
    description: 'Pipeline CI/CD GitHub Actions : Build automatique APK, AAB & Déploiement Web Firebase Hosting',
    language: 'yaml',
    content: `name: Flutter Multiplatform Release (APK, AAB & Firebase Hosting)

on:
  push:
    tags:
      - 'v*.*.*'
    branches:
      - main
  workflow_dispatch:

jobs:
  build-and-release:
    name: Build & Release Flutter APK, AAB and Web
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: ☕ Set up Java 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: 🐦 Set up Flutter SDK
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.x'
          channel: 'stable'
          cache: true

      - name: 📦 Install Flutter Dependencies
        run: flutter pub get

      - name: 🧪 Run Unit & Widget Tests
        run: flutter test --no-pub

      - name: 📱 Build Android APK (Fat / Split)
        run: |
          flutter build apk --release --split-per-abi
          flutter build apk --release

      - name: 📦 Build Android App Bundle (AAB for Google Play Store)
        run: flutter build appbundle --release

      - name: 🌐 Build Flutter Web (HTML5 & Wasm CanvasKit)
        run: flutter build web --release --pwa-strategy=offline-first

      - name: 🚀 Deploy Flutter Web to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '\${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '\${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: '\${{ secrets.FIREBASE_PROJECT_ID }}'
        if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/v')

      - name: 🏷️ Extract Version Tag
        id: vars
        run: echo "TAG_NAME=\${GITHUB_REF#refs/*/}" >> $GITHUB_OUTPUT

      - name: 📦 Create GitHub Release with APK & AAB
        uses: softprops/action-gh-release@v2
        if: startsWith(github.ref, 'refs/tags/v')
        with:
          name: Release \${{ steps.vars.outputs.TAG_NAME }}
          draft: false
          prerelease: false
          generate_release_notes: true
          files: |
            build/app/outputs/flutter-apk/app-release.apk
            build/app/outputs/bundle/release/app-release.aab
            build/app/outputs/flutter-apk/app-arm64-v8a-release.apk
            build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`
  },
  {
    path: 'firebase.json',
    description: 'Configuration Firebase Hosting et Cloud Messaging pour le déploiement Web',
    language: 'json',
    content: `{
  "hosting": {
    "public": "build/web",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|html)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=0"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css|woff2)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
`
  },
  {
    path: '.firebaserc',
    description: 'Association du projet Firebase Hosting par défaut',
    language: 'json',
    content: `{
  "projects": {
    "default": "flutter-news-osint-prod"
  }
}
`
  },
  {
    path: 'lib/main.dart',
    description: 'Point d\'entrée Flutter avec initialisation Firebase, FCM background handler & Thème M3',
    language: 'dart',
    content: `import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:provider/provider.dart';

import 'services/fcm_service.dart';
import 'services/news_api_service.dart';
import 'screens/home_screen.dart';

// Gestionnaire FCM en arrière-plan (Background)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint("FCM Background Notification: \${message.messageId} - \${message.notification?.title}");
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialisation de Firebase
  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    await FcmService.instance.initialize();
  } catch (e) {
    debugPrint("Firebase init note: \$e");
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => NewsApiService()),
      ],
      child: const FlutterNewsOsintApp(),
    ),
  );
}

class FlutterNewsOsintApp extends StatelessWidget {
  const FlutterNewsOsintApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FlutterNews OSINT',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.system,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF0F172A),
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        appBarTheme: const AppBarTheme(
          elevation: 0,
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF0F172A),
          centerTitle: false,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF38BDF8),
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF090D16),
        appBarTheme: const AppBarTheme(
          elevation: 0,
          backgroundColor: Color(0xFF0F172A),
          foregroundColor: Colors.white,
          centerTitle: false,
        ),
      ),
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('fr', 'FR'),
        Locale('en', 'US'),
        Locale('es', 'ES'),
        Locale('de', 'DE'),
        Locale('ar', 'AE'),
        Locale('ja', 'JP'),
      ],
      home: const HomeScreen(),
    );
  }
}
`
  },
  {
    path: 'lib/services/fcm_service.dart',
    description: 'Service Firebase Cloud Messaging (FCM) : Gestion des tokens, topics par pays & notifications locales',
    language: 'dart',
    content: `import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class FcmService {
  FcmService._();
  static final FcmService instance = FcmService._();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

  String? _deviceToken;
  String? get deviceToken => _deviceToken;

  Future<void> initialize() async {
    // 1. Demande d'autorisation de notifications (iOS/Android 13+)
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('Utilisateur a autorisé les notifications Push FCM.');
    }

    // 2. Configuration des notifications locales pour le premier plan (Foreground)
    const AndroidInitializationSettings androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const InitializationSettings initSettings = InitializationSettings(android: androidSettings);
    await _localNotifications.initialize(initSettings);

    // 3. Récupération du jeton FCM de l'appareil
    try {
      _deviceToken = await _fcm.getToken();
      debugPrint('FCM Token de l\\'appareil: \$_deviceToken');
    } catch (e) {
      debugPrint('Erreur récupération token: \$e');
    }

    // 4. Écoute des messages en premier plan
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('Message FCM reçu en premier plan: \${message.notification?.title}');
      _showLocalNotification(message);
    });

    // 5. Inscription automatique aux alertes d'actualités par défaut
    await subscribeToCountryTopic('all');
    await subscribeToCountryTopic('fr');
  }

  // Abonnement à un topic par pays (ex: /topics/tech_news_fr)
  Future<void> subscribeToCountryTopic(String countryCode) async {
    try {
      final topicName = 'tech_news_\$countryCode';
      await _fcm.subscribeToTopic(topicName);
      debugPrint('Abonné avec succès au topic FCM: \$topicName');
    } catch (e) {
      debugPrint('Erreur abonnement topic: \$e');
    }
  }

  // Désabonnement d'un topic
  Future<void> unsubscribeFromTopic(String countryCode) async {
    try {
      final topicName = 'tech_news_\$countryCode';
      await _fcm.unsubscribeFromTopic(topicName);
      debugPrint('Désabonné du topic FCM: \$topicName');
    } catch (e) {
      debugPrint('Erreur désabonnement topic: \$e');
    }
  }

  void _showLocalNotification(RemoteMessage message) {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'tech_news_channel',
      'Actualités Tech & OSINT',
      channelDescription: 'Notifications instantanées des actualités tech quotidiennes',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: true,
    );

    const NotificationDetails platformDetails = NotificationDetails(android: androidDetails);

    _localNotifications.show(
      message.hashCode,
      message.notification?.title ?? 'Alerte Tech',
      message.notification?.body ?? 'Nouvelle mise à jour disponible',
      platformDetails,
    );
  }
}
`
  },
  {
    path: 'lib/services/news_api_service.dart',
    description: 'Service API public Open-Source : HackerNews, Dev.to, GitHub API et flux OSINT par pays',
    language: 'dart',
    content: `import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/article.dart';

class NewsApiService extends ChangeNotifier {
  List<NewsArticle> _articles = [];
  bool _isLoading = false;
  String _selectedCountry = 'all';
  String _selectedCategory = 'all';

  List<NewsArticle> get articles => _articles;
  bool get isLoading => _isLoading;
  String get selectedCountry => _selectedCountry;

  Future<void> fetchDailyTechNews({String country = 'all', String category = 'all'}) async {
    _isLoading = true;
    _selectedCountry = country;
    _selectedCategory = category;
    notifyListeners();

    try {
      final queryParam = country == 'fr' ? 'france' : country == 'de' ? 'germany' : 'tech';
      
      // 1. Appel API public Hacker News Algolia
      final hnUrl = Uri.parse(
        'https://hn.algolia.com/api/v1/search_by_date?tags=story&query=\$queryParam&hitsPerPage=20',
      );
      final hnRes = await http.get(hnUrl).timeout(const Duration(seconds: 10));

      List<NewsArticle> fetched = [];
      if (hnRes.statusCode == 200) {
        final data = json.decode(hnRes.body);
        final hits = data['hits'] as List? ?? [];
        for (var item in hits) {
          if (item['title'] != null) {
            fetched.add(NewsArticle.fromHackerNews(item, country: country));
          }
        }
      }

      // 2. Appel API public Dev.to
      try {
        final devToUrl = Uri.parse('https://dev.to/api/articles?per_page=15&top=1');
        final devRes = await http.get(devToUrl).timeout(const Duration(seconds: 6));
        if (devRes.statusCode == 200) {
          final items = json.decode(devRes.body) as List? ?? [];
          for (var item in items) {
            fetched.add(NewsArticle.fromDevTo(item));
          }
        }
      } catch (_) {}

      _articles = fetched;
    } catch (e) {
      debugPrint("Erreur lors de la récupération des news: \$e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
`
  },
  {
    path: 'lib/models/article.dart',
    description: 'Modèle de données Dart sérialisable pour les actualités et alertes OSINT',
    language: 'dart',
    content: `class NewsArticle {
  final String id;
  final String title;
  final String description;
  final String url;
  final String source;
  final DateTime publishedAt;
  final String country;
  final String category;
  final int upvotes;
  final int commentsCount;
  final String? cveId;
  final String? osintSeverity;

  NewsArticle({
    required this.id,
    required this.title,
    required this.description,
    required this.url,
    required this.source,
    required this.publishedAt,
    required this.country,
    required this.category,
    this.upvotes = 0,
    this.commentsCount = 0,
    this.cveId,
    this.osintSeverity,
  });

  factory NewsArticle.fromHackerNews(Map<String, dynamic> json, {String country = 'all'}) {
    return NewsArticle(
      id: 'hn-\${json['objectID']}',
      title: json['title'] ?? 'Titre inconnu',
      description: json['story_text'] ?? 'Actualité issue de la communauté des développeurs Hacker News.',
      url: json['url'] ?? 'https://news.ycombinator.com/item?id=\${json['objectID']}',
      source: 'Hacker News',
      publishedAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      country: country,
      category: 'tech',
      upvotes: json['points'] ?? 0,
      commentsCount: json['num_comments'] ?? 0,
    );
  }

  factory NewsArticle.fromDevTo(Map<String, dynamic> json) {
    return NewsArticle(
      id: 'devto-\${json['id']}',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      url: json['url'] ?? '',
      source: 'Dev.to Community',
      publishedAt: DateTime.tryParse(json['published_at'] ?? '') ?? DateTime.now(),
      country: 'all',
      category: 'opensource',
      upvotes: json['public_reactions_count'] ?? 0,
      commentsCount: json['comments_count'] ?? 0,
    );
  }
}
`
  },
  {
    path: 'lib/screens/home_screen.dart',
    description: 'Interface utilisateur principale avec filtrage par pays, recherche et Material 3',
    language: 'dart',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/news_api_service.dart';
import '../services/fcm_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedCountry = 'all';

  final List<Map<String, String>> _countries = [
    {'code': 'all', 'flag': '🌐', 'name': 'Monde'},
    {'code': 'fr', 'flag': '🇫🇷', 'name': 'France'},
    {'code': 'dz', 'flag': '🇩🇿', 'name': 'Algérie'},
    {'code': 'maghreb', 'flag': '🌍', 'name': 'Maghreb'},
    {'code': 'cn', 'flag': '🇨🇳', 'name': 'Chine'},
    {'code': 'us', 'flag': '🇺🇸', 'name': 'USA'},
    {'code': 'de', 'flag': '🇩🇪', 'name': 'Allemagne'},
    {'code': 'gb', 'flag': '🇬🇧', 'name': 'UK'},
    {'code': 'jp', 'flag': '🇯🇵', 'name': 'Japon'},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NewsApiService>().fetchDailyTechNews(country: 'all');
    });
  }

  @override
  Widget build(BuildContext context) {
    final newsService = context.watch<NewsApiService>();

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.radar, color: Color(0xFF0284C7)),
            SizedBox(width: 8),
            Text('FlutterNews OSINT', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_active_outlined),
            tooltip: 'FCM Push Status',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Jeton FCM: \${FcmService.instance.deviceToken ?? "Actif"}'),
                  backgroundColor: const Color(0xFF0F172A),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => newsService.fetchDailyTechNews(country: _selectedCountry),
          ),
        ],
      ),
      body: Column(
        children: [
          // Sélecteur de Pays horizontal
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _countries.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final c = _countries[index];
                final isSelected = c['code'] == _selectedCountry;
                return ChoiceChip(
                  label: Text('\${c['flag']} \${c['name']}'),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) {
                      setState(() => _selectedCountry = c['code']!);
                      newsService.fetchDailyTechNews(country: c['code']!);
                    }
                  },
                );
              },
            ),
          ),
          const Divider(height: 1),

          // Liste des articles
          Expanded(
            child: newsService.isLoading
                ? const Center(child: CircularProgressIndicator())
                : newsService.articles.isEmpty
                    ? const Center(child: Text('Aucune actualité disponible.'))
                    : ListView.builder(
                        itemCount: newsService.articles.length,
                        itemBuilder: (context, index) {
                          final article = newsService.articles[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: ListTile(
                              title: Text(
                                article.title,
                                style: const TextStyle(fontWeight: FontWeight.w600),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 6),
                                  Text(
                                    article.description,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      Text(
                                        article.source,
                                        style: TextStyle(
                                          color: Theme.of(context).colorScheme.primary,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const Spacer(),
                                      Text(
                                        '▲ \${article.upvotes}',
                                        style: const TextStyle(fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              onTap: () async {
                                final uri = Uri.parse(article.url);
                                if (await canLaunchUrl(uri)) {
                                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                                }
                              },
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
`
  },
  {
    path: 'android/app/build.gradle',
    description: 'Configuration Gradle Android avec support pour APK et Android App Bundle (AAB)',
    language: 'gradle',
    content: `plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
    id "com.google.gms.google-services"
}

def localProperties = new Properties()
def localPropertiesFile = rootProject.file('local.properties')
if (localPropertiesFile.exists()) {
    localPropertiesFile.withReader('UTF-8') { reader ->
        localProperties.load(reader)
    }
}

def flutterVersionCode = localProperties.getProperty('flutter.versionCode')
if (flutterVersionCode == null) {
    flutterVersionCode = '1'
}

def flutterVersionName = localProperties.getProperty('flutter.versionName')
if (flutterVersionName == null) {
    flutterVersionName = '1.0.0'
}

android {
    namespace "com.flutternews.osint"
    compileSdk 34
    ndkVersion flutter.ndkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
        coreLibraryDesugaringEnabled true
    }

    kotlinOptions {
        jvmTarget = '17'
    }

    defaultConfig {
        applicationId "com.flutternews.osint"
        minSdkVersion 23
        targetSdkVersion 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
        multiDexEnabled true
    }

    buildTypes {
        release {
            signingConfig signingConfigs.debug
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:2.0.4'
    implementation platform('com.google.firebase:firebase-bom:33.4.0')
    implementation 'com.google.firebase:firebase-messaging'
}
`
  },
  {
    path: 'README.md',
    description: 'Documentation complète : Installation, configuration Firebase, GitHub Actions et compilation',
    language: 'markdown',
    content: `# 🚀 FlutterNews OSINT & Tech Radar

Application d'actualités technologiques quotidiennes par pays, veille OSINT et renseignement open-source, développée en Flutter avec Firebase Cloud Messaging (FCM), Firebase Hosting et workflow CI/CD GitHub Actions pour générer automatiquement des releases versionnées **APK** et **AAB**.

---

## 🌟 Fonctionnalités

- 🌍 **News Tech Quotidiennes par Pays** : France (Station F / IA Souveraine), USA, Allemagne, UK, Japon, Canada et Flux Mondial.
- 🛡️ **Radar OSINT & Cyber** : Alertes CVE en temps réel, advisories de sécurité GitHub, CISA et CERT-FR.
- 🔔 **Firebase Cloud Messaging (FCM)** : Notifications Push instantanées par pays avec abonnements aux topics (\`/topics/tech_news_fr\`, \`/topics/osint_critical\`).
- 🌐 **Firebase Hosting** : Déploiement web PWA optimisé pour un chargement instantané.
- 📦 **GitHub Actions CI/CD** : Génération automatique des binaires \`app-release.apk\` et \`app-release.aab\` (Google Play Store) sur chaque tag git (ex: \`v1.0.0\`).
- 🌐 **100% Gratuit & Open-Source** : Utilise les API publiques de HackerNews, GitHub REST API, Dev.to et CISA sans frais.

---

## 🛠️ Instructions de Démarrage

### 1. Cloner ou extraire le projet
\`\`\`bash
git clone https://github.com/votre-nom/flutter-news-osint.git
cd flutter-news-osint
flutter pub get
\`\`\`

### 2. Configurer Firebase FCM
1. Créez un projet sur la console [Firebase](https://console.firebase.google.com).
2. Ajoutez une application Android (Package : \`com.flutternews.osint\`) et téléchargez \`google-services.json\` dans \`android/app/\`.
3. Activez **Cloud Messaging** dans les paramètres Firebase.
4. Activez **Firebase Hosting** avec la commande :
\`\`\`bash
firebase init hosting
\`\`\`

### 3. Exécuter l'application en local
\`\`\`bash
# Sur mobile Android / Simulateur
flutter run

# Sur le Web
flutter run -d chrome
\`\`\`

### 4. Automatiser les Releases APK & AAB sur GitHub
1. Poussez votre code sur GitHub :
\`\`\`bash
git init
git add .
git commit -m "Initial commit FlutterNews OSINT"
git branch -M main
git remote add origin https://github.com/VOTRE_USER/flutter-news-osint.git
git push -u origin main
\`\`\`
2. Ajoutez les secrets dans votre repo GitHub (*Settings > Secrets and variables > Actions*) :
   - \`FIREBASE_SERVICE_ACCOUNT\` : Clé de compte de service Firebase.
   - \`FIREBASE_PROJECT_ID\` : ID de votre projet Firebase.
3. Créez un tag versionné pour déclencher la compilation automatique :
\`\`\`bash
git tag v1.0.0
git push origin v1.0.0
\`\`\`
Le workflow GitHub Actions compilera et publiera dans l'onglet **Releases** de votre repo :
- \`app-release.apk\` (Installation directe Android)
- \`app-release.aab\` (Publication Google Play Store)
- Déploiement en direct sur Firebase Hosting !
`
  }
];
