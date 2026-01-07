import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mobile/features/parent/cubit/parent_cubit.dart';
import 'package:mobile/features/parent/ui/child_selector.dart';
import 'package:mobile/core/services/token_storage_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mocktail/mocktail.dart';

// Mock Storage
class MockTokenStorageService extends Mock implements TokenStorageService {}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Sibling Switcher Integration Test', (WidgetTester tester) async {
    // 1. Setup Mock & Cubit
    final mockStorage = MockTokenStorageService();
    // Default to null, so it picks first child
    when(() => mockStorage.getCurrentStudentId()).thenAnswer((_) async => null);
    when(() => mockStorage.saveCurrentStudentId(any())).thenAnswer((_) async {});

    final parentCubit = ParentCubit(mockStorage);

    // 2. Build UI
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          appBar: AppBar(
            actions: [
              BlocProvider<ParentCubit>.value(
                value: parentCubit..loadChildren(),
                child: const ChildSelector(),
              ),
            ],
          ),
          body: BlocBuilder<ParentCubit, ParentState>(
            bloc: parentCubit,
            builder: (context, state) {
              if (state is ParentLoaded) {
                 final currentId = state.currentStudentId;
                 final currentName = state.children.firstWhere((c) => c['id'] == currentId)['name'];
                 // Mock Fee Widget
                 final fee = currentId == 'student_1' ? 500 : 0;
                 return Column(
                   children: [
                     Text('Current Student: $currentName'),
                     Text('Fee Due: \$$fee'),
                   ],
                 );
              }
              return const SizedBox();
            },
          ),
        ),
      ),
    );

    // Wait for load
    await tester.pumpAndSettle(const Duration(seconds: 2));

    // 3. Verify Default View (Child A)
    expect(find.text('Current Student: Child A'), findsOneWidget);
    expect(find.text('Fee Due: \$500'), findsOneWidget);

    // 4. Select Child B from Dropdown
    await tester.tap(find.byType(DropdownButton<String>));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Child B').last);
    await tester.pumpAndSettle();

    // 5. Verify Name changes to Child B
    expect(find.text('Current Student: Child B'), findsOneWidget);

    // 6. Verify Fee Due widget updates instantly
    expect(find.text('Fee Due: \$0'), findsOneWidget);
  });
}
