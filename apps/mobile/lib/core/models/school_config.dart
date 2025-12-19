class SchoolConfig {
  final String schoolId;
  final String schoolName;
  final String logoUrl;
  final int primaryColor; // যেমন: 0xFF2196F3
  SchoolConfig({
    required this.schoolId,
    required this.schoolName,
    required this.logoUrl,
    required this.primaryColor,
  });
  // ডিফল্ট কনফিগারেশন (যদি সার্ভার থেকে ডাটা না আসে)
  static SchoolConfig defaultConfig() {
    return SchoolConfig(
      schoolId: 'default',
      schoolName: 'Ed Platform',
      logoUrl: '',
      primaryColor: 0xFF2196F3, // Blue
    );
  }
}
