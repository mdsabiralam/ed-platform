import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SuperAdminShell extends StatelessWidget {
  final Widget child;
  const SuperAdminShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return Row(
              children: [
                NavigationRail(
                  selectedIndex: _calculateSelectedIndex(context),
                  onDestinationSelected: (int index) => _onItemTapped(index, context),
                  labelType: NavigationRailLabelType.all,
                  destinations: const [
                    NavigationRailDestination(
                      icon: Icon(Icons.dashboard),
                      label: Text('Dashboard'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.school),
                      label: Text('Schools'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.monetization_on),
                      label: Text('Plans'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.people),
                      label: Text('Admins'),
                    ),
                  ],
                ),
                Expanded(child: child),
              ],
            );
          }
          return child;
        },
      ),
      bottomNavigationBar: MediaQuery.of(context).size.width <= 800
          ? BottomNavigationBar(
              currentIndex: _calculateSelectedIndex(context),
              onTap: (index) => _onItemTapped(index, context),
              type: BottomNavigationBarType.fixed,
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Dashboard'),
                BottomNavigationBarItem(icon: Icon(Icons.school), label: 'Schools'),
                BottomNavigationBarItem(icon: Icon(Icons.monetization_on), label: 'Plans'),
                BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Admins'),
              ],
            )
          : null,
    );
  }

  int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).uri.toString();
    if (location.startsWith('/super-admin/tenants')) return 1;
    if (location.startsWith('/super-admin/plans')) return 2;
    if (location.startsWith('/super-admin/users')) return 3;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/super-admin');
        break;
      case 1:
        context.go('/super-admin/tenants');
        break;
      case 2:
        context.go('/super-admin/plans');
        break;
      case 3:
        context.go('/super-admin/users');
        break;
    }
  }
}
