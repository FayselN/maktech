import 'package:flutter/material.dart';

class AppTheme {
  static const Color primary = Color(0xFF6366F1); // indigo-500
  static const Color primaryLight = Color(0xFF818CF8); // indigo-400
  static const Color primaryDark = Color(0xFF3730A3); // indigo-800
  static const Color accent = Color(0xFFF59E0B); // amber-500
  static const Color surface = Color(0xFF020617); // slate-950
  static const Color surfaceLight = Color(0xFFF8FAFC); // slate-50
  static const Color card = Color(0xFF0F172A); // slate-900
  static const Color cardLight = Color(0xFFFFFFFF); // white
  static const Color text = Color(0xFFF1F5F9); // slate-100
  static const Color textLight = Color(0xFF0F172A); // slate-900
  static const Color textSecondary = Color(0xFF94A3B8); // slate-400
  static const Color textSecondaryLight = Color(0xFF64748B); // slate-500
  static const Color border = Color(0xFF1E293B); // slate-800
  static const Color borderLight = Color(0xFFE2E8F0); // slate-200
  static const Color error = Color(0xFFEF4444); // red-500
  static const Color success = Color(0xFF10B981); // emerald-500

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: accent,
        surface: surface,
        error: error,
      ),
      scaffoldBackgroundColor: surface,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: text,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: text,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white.withValues(alpha: 0.05),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: Colors.white.withValues(alpha: 0.05),
        labelStyle: const TextStyle(color: text),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.05),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primary, width: 1.5),
        ),
        hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.3)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: card,
        contentTextStyle: const TextStyle(color: text, fontWeight: FontWeight.w500),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
        ),
        behavior: SnackBarBehavior.floating,
        elevation: 8,
      ),
      iconTheme: const IconThemeData(color: textSecondary),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme.light(
        primary: primary,
        secondary: accent,
        surface: surfaceLight,
        error: error,
      ),
      scaffoldBackgroundColor: surfaceLight,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: textLight,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: textLight,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardThemeData(
        color: cardLight,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: borderLight),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: Colors.black.withValues(alpha: 0.05),
        labelStyle: const TextStyle(color: textLight),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide(color: borderLight),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.black.withValues(alpha: 0.03),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primary, width: 1.5),
        ),
        hintStyle: TextStyle(color: Colors.black.withValues(alpha: 0.25)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: cardLight,
        contentTextStyle: const TextStyle(color: textLight, fontWeight: FontWeight.w500),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: borderLight),
        ),
        behavior: SnackBarBehavior.floating,
        elevation: 8,
      ),
      iconTheme: const IconThemeData(color: textSecondaryLight),
    );
  }
}

extension ThemeColors on BuildContext {
  Color get appText =>
      Theme.of(this).brightness == Brightness.light
          ? AppTheme.textLight
          : AppTheme.text;

  Color get appTextSecondary =>
      Theme.of(this).brightness == Brightness.light
          ? AppTheme.textSecondaryLight
          : AppTheme.textSecondary;

  Color get appBorder =>
      Theme.of(this).brightness == Brightness.light
          ? AppTheme.borderLight
          : AppTheme.border;

  Color get appCard =>
      Theme.of(this).brightness == Brightness.light
          ? AppTheme.cardLight
          : AppTheme.card;

  Color get appSurface =>
      Theme.of(this).brightness == Brightness.light
          ? AppTheme.surfaceLight
          : AppTheme.surface;
}
