// Firebase configuration auto-generated for DZ News.
// Generated for project device-streaming-ccab91bb.
// Regenerate with: flutterfire configure

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show TargetPlatform, defaultTargetPlatform, kIsWeb;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        return linux;
      case TargetPlatform.fuchsia:
        throw UnsupportedError(
          'Firebase ne supporte pas encore la plateforme Fuchsia.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyBFt4Ip5ZMaI6B3ZHHwnKWP7ex8mFv3HjA',
    appId: '1:100841671094:web:7ce6f2e80bfd61ad315917',
    messagingSenderId: '100841671094',
    projectId: 'device-streaming-ccab91bb',
    authDomain: 'device-streaming-ccab91bb.firebaseapp.com',
    storageBucket: 'device-streaming-ccab91bb.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDHGfMfmHTV4KstlS8PJ6cpNaVnsZW6u_I',
    appId: '1:100841671094:android:d590e3e11201f56b315917',
    messagingSenderId: '100841671094',
    projectId: 'device-streaming-ccab91bb',
    storageBucket: 'device-streaming-ccab91bb.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyBFt4Ip5ZMaI6B3ZHHwnKWP7ex8mFv3HjA',
    appId: '1:100841671094:web:7ce6f2e80bfd61ad315917',
    messagingSenderId: '100841671094',
    projectId: 'device-streaming-ccab91bb',
    authDomain: 'device-streaming-ccab91bb.firebaseapp.com',
    storageBucket: 'device-streaming-ccab91bb.firebasestorage.app',
    iosBundleId: 'com.flutternews.osint',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyBFt4Ip5ZMaI6B3ZHHwnKWP7ex8mFv3HjA',
    appId: '1:100841671094:web:7ce6f2e80bfd61ad315917',
    messagingSenderId: '100841671094',
    projectId: 'device-streaming-ccab91bb',
    authDomain: 'device-streaming-ccab91bb.firebaseapp.com',
    storageBucket: 'device-streaming-ccab91bb.firebasestorage.app',
    iosBundleId: 'com.flutternews.osint',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyBFt4Ip5ZMaI6B3ZHHwnKWP7ex8mFv3HjA',
    appId: '1:100841671094:web:7ce6f2e80bfd61ad315917',
    messagingSenderId: '100841671094',
    projectId: 'device-streaming-ccab91bb',
    authDomain: 'device-streaming-ccab91bb.firebaseapp.com',
    storageBucket: 'device-streaming-ccab91bb.firebasestorage.app',
  );

  static const FirebaseOptions linux = FirebaseOptions(
    apiKey: 'AIzaSyBFt4Ip5ZMaI6B3ZHHwnKWP7ex8mFv3HjA',
    appId: '1:100841671094:web:7ce6f2e80bfd61ad315917',
    messagingSenderId: '100841671094',
    projectId: 'device-streaming-ccab91bb',
    authDomain: 'device-streaming-ccab91bb.firebaseapp.com',
    storageBucket: 'device-streaming-ccab91bb.firebasestorage.app',
  );
}