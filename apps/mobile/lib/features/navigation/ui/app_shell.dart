import 'package:flutter/material.dart';
import '../services/navigation_service.dart';

class AppShell extends StatefulWidget {
  final Widget child;
  final NavigationService navigationService;

  const AppShell({
    super.key,
    required this.child,
    required this.navigationService,
  });

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _selectedIndex = 0;

  void _onDestinationSelected(int index) {
    setState(() {
      _selectedIndex = index;
    });
    // Implement navigation logic here (e.g., GoRouter)
    // context.go('/path'); but since paths map to bottom nav, we need a mapping.
    // For now, we are just switching the "Shell" but GoRouter usually handles the switching of the child.
    // However, the prompt implies this shell wraps dynamic content.
    // Typically with GoRouter's ShellRoute, the child is passed in.
  }

  @override
  Widget build(BuildContext context) {
    // Check for tablet/desktop
    final isWideScreen = MediaQuery.of(context).size.width > 600;

    if (isWideScreen) {
      return Scaffold(
        body: Row(
          children: [
            NavigationRail(
              destinations: widget.navigationService.getRailDestinations(),
              selectedIndex: _selectedIndex,
              onDestinationSelected: _onDestinationSelected,
              labelType: NavigationRailLabelType.all,
            ),
            const VerticalDivider(thickness: 1, width: 1),
            Expanded(child: widget.child),
          ],
        ),
      );
    } else {
      return Scaffold(
        body: widget.child,
        bottomNavigationBar: NavigationBar(
          destinations: widget.navigationService.getBottomNavItems(),
          selectedIndex: _selectedIndex,
          onDestinationSelected: _onDestinationSelected,
        ),
      );
    }
  }
}
