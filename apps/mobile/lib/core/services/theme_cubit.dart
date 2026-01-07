import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/models/school_config.dart';

class ThemeCubit extends Cubit<ThemeData> {
  ThemeCubit(SchoolConfig config) : super(_buildTheme(config));

  static ThemeData _buildTheme(SchoolConfig config) {
    final primaryColor = Color(config.primaryColor);
    return ThemeData(
      primaryColor: primaryColor,
      colorScheme: ColorScheme.fromSeed(seedColor: primaryColor),
      useMaterial3: true,
      appBarTheme: AppBarTheme(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
      ),
      // Extend with other theme properties as needed
    );
  }

  void updateConfig(SchoolConfig newConfig) {
    emit(_buildTheme(newConfig));
  }
}
