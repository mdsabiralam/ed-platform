import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/dashboard/dashboard_factory.dart';
import 'package:mobile/features/dashboard/screens/student_home.dart';
import 'package:mobile/core/models/user_role.dart';
import 'package:flutter/material.dart';
import 'package:mobile/features/navigation/services/navigation_service.dart';

void main() {
  testWidgets('DashboardFactory creates correct widget for Student role', (WidgetTester tester) async {
    final widget = DashboardWidget.build(UserRole.student);

    // We wrap it in MaterialApp because widgets might need Theme/Directionality
    await tester.pumpWidget(MaterialApp(home: widget));

    expect(find.byType(StudentHome), findsOneWidget);
  });

  test('NavigationService filters items based on permissions', () {
    final service = NavigationService(['VIEW_ACADEMIC']); // No VIEW_FINANCE
    final items = service.getBottomNavItems();

    // Expect Home and Academic
    expect(items.any((item) => (item.label) == 'Fees'), isFalse);
    expect(items.any((item) => (item.label) == 'Academic'), isTrue);
  });

   test('NavigationService includes Fees if permitted', () {
    final service = NavigationService(['VIEW_FINANCE']);
    final items = service.getBottomNavItems();

    expect(items.any((item) => (item.label) == 'Fees'), isTrue);
  });
}
