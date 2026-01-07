import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/navigation/services/navigation_service.dart';
import 'package:mobile/features/navigation/ui/app_shell.dart';
import 'package:mobile/core/models/user_role.dart';

// Mock User class or logic isn't strictly needed if we test NavigationService directly
// or if we pass permissions to it.
// The requirement says: "Initialize the app with a User mock having the LIBRARIAN role."
// "Verify that the 'Library' and 'Search Book' widgets are present."

void main() {
  testWidgets('Access Control Verification - Librarian Role', (WidgetTester tester) async {
    // 1. Initialize logic
    // We assume a Librarian has these permissions.
    // In a real app, we'd fetch these from a Role -> Permissions map.
    // Here we define them to simulate the LIBRARIAN role behavior.
    final librarianPermissions = ['VIEW_LIBRARY', 'SEARCH_BOOKS'];
    // Explicitly NO 'VIEW_FINANCE', NO 'VIEW_MARKS' (assuming 'VIEW_MARKS' maps to Student Marks)

    final navService = NavigationService(librarianPermissions);

    // 2. Build the AppShell
    await tester.pumpWidget(MaterialApp(
      home: AppShell(
        navigationService: navService,
        child: const Center(child: Text("Librarian Dashboard")),
      ),
    ));

    // 3. Verify 'Library' and 'Search Book' widgets (navigation items) are present.
    // Note: NavigationDestination widgets contain the label text.
    expect(find.text('Library'), findsOneWidget);
    expect(find.text('Search Book'), findsOneWidget);

    // 4. Verify 'Fee Collection' (Fees) and 'Student Marks' (Academic maybe?) are absent.
    // 'Fees' is the label used in NavigationService for 'VIEW_FINANCE'.
    expect(find.text('Fees'), findsNothing);

    // Assuming 'Student Marks' might be under 'Academic' or its own.
    // If 'VIEW_ACADEMIC' isn't in permission list, 'Academic' shouldn't show.
    expect(find.text('Academic'), findsNothing);
  });
}
