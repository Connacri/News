import java.util.Properties
import java.io.FileInputStream
import java.util.regex.Pattern
import java.security.MessageDigest

plugins {
    id("com.android.application")
    id("kotlin-android")
    id("dev.flutter.flutter-gradle-plugin")
    id("com.google.gms.google-services")
}

val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

android {
    namespace = "com.flutternews.osint"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        isCoreLibraryDesugaringEnabled = true
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    defaultConfig {
        applicationId = "com.flutternews.osint"
        minSdk = 23
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode.toInteger()
        versionName = flutter.versionName
        multiDexEnabled = true
        resValue("string", "google_app_id", "1:100841671094:android:7ce6f2e80bfd61ad315917")
    }

    signingConfigs {
        create("release") {
            if (keystorePropertiesFile.exists()) {
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
                storeFile = rootProject.file("app/${keystoreProperties["storeFile"]}")
                storePassword = keystoreProperties["storePassword"] as String
            }
        }
    }

    buildTypes {
        release {
            signingConfig = if (keystorePropertiesFile.exists()) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    packaging {
        resources {
            excludes += setOf("META-INF/*.version", "META-INF/DEPENDENCIES", "META-INF/LICENSE*")
        }
    }
}

dependencies {
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.5")
}

fun sha(alias: String): String {
    val keytool = "keytool -list -v -keystore app/${keystoreProperties["storeFile"]} -alias $alias -storepass ${keystoreProperties["storePassword"]}"
    val proc = ProcessBuilder(keytool.split(" ")).redirectErrorStream(true).start()
    val out = proc.inputStream.bufferedReader().readText()
    proc.waitFor()
    val sha1 = Pattern.compile("SHA1:\\s*([0-9A-F:]+)").matcher(out).let { if (it.find()) it.group(1) else "" }
    val sha256 = Pattern.compile("SHA256:\\s*([0-9A-F:]+)").matcher(out).let { if (it.find()) it.group(1) else "" }
    return "SHA1=$sha1\nSHA256=$sha256"
}

tasks.register("printSigningInfo") {
    doLast {
        if (keystorePropertiesFile.exists()) {
            println(sha(keystoreProperties["keyAlias"] as String))
        } else {
            println("no key.properties")
        }
    }
}