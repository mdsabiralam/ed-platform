enum UserRole {
  superAdmin,
  admin,
  headmaster,
  principal,
  teacher,
  staff,
  student,
  parent,
  driver,
  agent,
  customerCare,
  hostelSuper,
  librarian,
  shopKeeper,
  mcm,
  supplier,
  unknown;

  String toJson() {
    switch (this) {
      case UserRole.superAdmin:
        return 'SUPER_ADMIN';
      case UserRole.customerCare:
        return 'CUSTOMER_CARE';
      case UserRole.hostelSuper:
        return 'HOSTEL_SUPER';
      case UserRole.shopKeeper:
        return 'SHOP_KEEPER';
      default:
        return name.toUpperCase();
    }
  }

  static UserRole fromJson(String json) {
    final normalized = json.toUpperCase();
    switch (normalized) {
      case 'SUPER_ADMIN':
        return UserRole.superAdmin;
      case 'CUSTOMER_CARE':
        return UserRole.customerCare;
      case 'HOSTEL_SUPER':
        return UserRole.hostelSuper;
      case 'SHOP_KEEPER':
        return UserRole.shopKeeper;
      default:
        return UserRole.values.firstWhere(
          (e) => e.name.toUpperCase() == normalized,
          orElse: () => UserRole.unknown,
        );
    }
  }
}
