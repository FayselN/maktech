# Flutter specific
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Keep model classes used by json decoding
-keep class com.maktech.maktech.** { *; }

# Keep your application class
-keep class * extends io.flutter.app.FlutterApplication
-keep class * extends io.flutter.embedding.android.FlutterActivity

# Play Store dynamic feature support (needed by Flutter's PlayStoreDeferredComponentManager)
-dontwarn com.google.android.play.core.**
-keep class com.google.android.play.core.** { *; }

# WorkManager + Room — R8 breaks Room's generated WorkDatabase schema,
# causing a launch crash on Android 12+:
#   "Failed to create an instance of androidx.work.impl.WorkDatabase"
# (used by firebase_messaging / flutter_local_notifications)
-keep class androidx.work.** { *; }
-keep class androidx.room.** { *; }
-keep class * extends androidx.work.impl.WorkDatabase { *; }
-dontwarn androidx.work.**
-dontwarn androidx.room.**
