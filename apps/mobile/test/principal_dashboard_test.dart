import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/principal_dashboard/principal_dashboard_screen.dart';

void main() {
  testWidgets('Principal Dashboard Usability Test', (WidgetTester tester) async {
    // Build the Principal Dashboard
    await tester.pumpWidget(const MaterialApp(home: PrincipalDashboardScreen()));

    // --- Scenario 1: Approval Queue ---
    // Check initial state
    expect(find.text('Approval Queue (1 Pending)'), findsOneWidget);
    expect(find.text('Sign & Approve'), findsOneWidget);

    // Act: Click Approve
    await tester.tap(find.text('Sign & Approve'));
    await tester.pump(); // Start dialog animation
    expect(find.text('Digitally Signing...'), findsOneWidget); // Verify feedback

    await tester.pump(const Duration(milliseconds: 500)); // Wait for delay
    await tester.pumpAndSettle(); // Wait for navigation/snackbar

    // Verify Result
    expect(find.text('Signed & Approved'), findsOneWidget); // SnackBar
    expect(find.text('Approved'), findsOneWidget); // Text update

    // --- Scenario 2: Staff Oversight ---
    // Check initial state
    expect(find.text('Mrs. Smith (Math)'), findsOneWidget);
    // Note: CircleAvatar colors are hard to test by text, but we can check the substitute button
    expect(find.text('Assign Sub'), findsOneWidget);

    // Act: Assign Substitute
    await tester.tap(find.text('Assign Sub'));
    await tester.pumpAndSettle();

    // Verify Dialog
    expect(find.text('Assign Substitution'), findsOneWidget);

    // Select Teacher (Simulate Dropdown Tap)
    await tester.tap(find.byType(DropdownButton<String>));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Mr. White (Reserve)').last);
    await tester.pumpAndSettle();

    // Verify Result
    expect(find.text('Substitution Assigned to Mr. White (Reserve)'), findsOneWidget);

    // --- Scenario 3: Broadcast Message ---
    // Check initial state
    expect(find.text('Emergency Broadcast'), findsOneWidget);

    // Act: Type Message
    await tester.enterText(find.byType(TextField), 'School Closed due to rain');
    await tester.tap(find.text('Send Alert'));
    await tester.pump(); // Snackbars need a pump

    // Verify Result
    expect(find.text('Sent to 500 Parents'), findsOneWidget);
  });
}
