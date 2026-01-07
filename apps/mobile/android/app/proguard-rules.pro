# Flutter
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Keep DTOs and Models for JSON Serialization (if used in Native/JNI)
-keep class **.dto.** { *; }
-keep class **.models.** { *; }

# Sentry
-keepattributes LineNumberTable,SourceFile
-renamesourcefileattribute SourceFile
