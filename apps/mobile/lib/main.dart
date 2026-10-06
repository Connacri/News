import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:provider/provider.dart';

import 'firebase_options.dart';
import 'services/fcm_service.dart';
import 'services/news_api_service.dart';
import 'services/firestore_sync_service.dart';
import 'screens/home_screen.dart';

// Gestionnaire des notifications Push FCM en arrière-plan
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint("FCM Background: ${message.messageId} - ${message.notification?.title}");
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Initialisation de Firebase adaptée à la plateforme (Web, Android, iOS, Desktop)
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    if (!kIsWeb && (defaultTargetPlatform == TargetPlatform.android || defaultTargetPlatform == TargetPlatform.iOS)) {
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
      await FcmService.instance.initialize();
    }
  } catch (e) {
    debugPrint("Firebase init note: $e");
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => NewsApiService()),
        ChangeNotifierProvider(create: (_) => FirestoreSyncService()),
      ],
      child: const DZNewsApp(),
    ),
  );
}

class DZNewsApp extends StatefulWidget {
  const DZNewsApp({super.key});

  @override
  State<DZNewsApp> createState() => _DZNewsAppState();
}

class _DZNewsAppState extends State<DZNewsApp> {
  Locale _currentLocale = const Locale('fr', 'FR');

  void setLocale(Locale newLocale) {
    setState(() {
      _currentLocale = newLocale;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isRtl = _currentLocale.languageCode == 'ar';

    return MaterialApp(
      title: 'DZ News',
      debugShowCheckedModeBanner: false,
      locale: _currentLocale,
      themeMode: ThemeMode.dark, // Mode Dark par défaut pour la veille OSINT & tech

      // Thème Sombre Material 3 avec Palette Slate/Cyan
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorSchemeSeed: const Color(0xFF38BDF8),
        scaffoldBackgroundColor: const Color(0xFF020617), // slate-950
        cardColor: const Color(0xFF0F172A), // slate-900
        appBarTheme: const AppBarTheme(
          elevation: 0,
          backgroundColor: Color(0xFF0F172A),
          foregroundColor: Colors.white,
          centerTitle: false,
        ),
      ),

      // Support Multilingue Complet & Polices Arabes
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

      builder: (context, child) {
        return Directionality(
          textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
          child: child ?? const SizedBox(),
        );
      },

      home: HomeScreen(onLocaleChange: setLocale),
    );
  }
}
