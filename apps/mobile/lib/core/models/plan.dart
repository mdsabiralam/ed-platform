class Plan {
  final String id;
  final String name;
  final double priceMonthly;
  final List<String> features; // Map এর বদলে List হবে

  Plan({
    required this.id,
    required this.name,
    required this.priceMonthly,
    required this.features,
  });

  factory Plan.fromJson(Map<String, dynamic> json) {
    // সেফটি চেক: ফিচার যদি লিস্ট হয়, তা সংগ্রহ করা
    List<String> parsedFeatures = [];
    if (json['features'] != null && json['features'] is List) {
      parsedFeatures = (json['features'] as List)
          .map((e) => e.toString())
          .toList();
    }

    return Plan(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      priceMonthly:
          double.tryParse(json['priceMonthly']?.toString() ?? '0') ?? 0.0,
      features: parsedFeatures,
    );
  }
}
