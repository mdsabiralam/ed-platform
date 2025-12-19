// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('Login screen smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const EdApp());

    // Verify that our app shows the login screen.
    expect(find.text('Welcome to Ed'), findsOneWidget);
    expect(find.widgetWithText(ElevatedButton, 'Login'), findsOneWidget);

    // Tap the 'Login' button and trigger a frame.
    await tester.tap(find.widgetWithText(ElevatedButton, 'Login'));
    await tester.pump(); // Start the loading state

    // Verify that we show a loading indicator.
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    // Wait for the loading to finish.
    await tester.pumpAndSettle();

    // Verify that we show the success message.
    expect(find.text('Login Successful! Welcome Back.'), findsOneWidget);
  });
}
