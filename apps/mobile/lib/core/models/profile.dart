class Profile {
  final String id;
  final String name;
  final String role;

  Profile({required this.id, required this.name, required this.role});

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'],
      name: json['name'],
      role: json['role'],
    );
  }
}
