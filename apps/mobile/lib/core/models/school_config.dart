class SchoolConfig {
  final String schoolId;
  final String schoolName;
  final String logoUrl;
  final int primaryColor; // e.g., 0xFF2196F3

  SchoolConfig({
    required this.schoolId,
    required this.schoolName,
    required this.logoUrl,
    required this.primaryColor,
  });

  // Default configuration (fallback if data is not fetched)
  static SchoolConfig defaultConfig() {
    return SchoolConfig(
      schoolId: 'default',
      schoolName: 'Ed Platform',
      logoUrl: '',
      primaryColor: 0xFF2196F3, // Blue
    );
  }
}
