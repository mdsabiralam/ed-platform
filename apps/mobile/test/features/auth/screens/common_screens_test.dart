
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ed/features/auth/screens/common_screens.dart';

void main() {
  testWidgets('SplashScreen builds correctly', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MaterialApp(home: SplashScreen()));

    // Verify that the SplashScreen shows the school icon.
    expect(find.byIcon(Icons.school), findsOneWidget);
  });
}
