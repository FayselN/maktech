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
