# Flutter / Dart
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Firebase / Play Services
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**

# flutter_local_notifications
-keep class com.dexterous.** { *; }
-dontwarn com.dexterous.**

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# Play Core (deferred components referenced by the Flutter engine)
-dontwarn com.google.android.play.core.**
-keep class com.google.android.play.core.** { *; }