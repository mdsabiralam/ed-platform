import 'package:flutter/material.dart';

class NavigationService {
  final List<String> _permissions;

  NavigationService(this._permissions);

  List<NavigationDestination> getBottomNavItems() {
    final items = <NavigationDestination>[
      const NavigationDestination(
        icon: Icon(Icons.home),
        label: 'Home',
      ),
    ];

    if (_hasPermission('VIEW_ACADEMIC')) {
      items.add(const NavigationDestination(
        icon: Icon(Icons.school),
        label: 'Academic',
      ));
    }

    if (_hasPermission('VIEW_FINANCE')) {
      items.add(const NavigationDestination(
        icon: Icon(Icons.attach_money),
        label: 'Fees',
      ));
    }

    if (_hasPermission('VIEW_LIBRARY')) {
      items.add(const NavigationDestination(
        icon: Icon(Icons.library_books),
        label: 'Library',
      ));
    }

    if (_hasPermission('SEARCH_BOOKS')) {
      items.add(const NavigationDestination(
        icon: Icon(Icons.search),
        label: 'Search Book',
      ));
    }

    // Add more based on permissions
     items.add(const NavigationDestination(
        icon: Icon(Icons.settings),
        label: 'Settings',
      ));


    return items;
  }

  List<NavigationRailDestination> getRailDestinations() {
      final items = <NavigationRailDestination>[
      const NavigationRailDestination(
        icon: Icon(Icons.home),
        label: Text('Home'),
      ),
    ];

    if (_hasPermission('VIEW_ACADEMIC')) {
      items.add(const NavigationRailDestination(
        icon: Icon(Icons.school),
        label: Text('Academic'),
      ));
    }

    if (_hasPermission('VIEW_FINANCE')) {
      items.add(const NavigationRailDestination(
        icon: Icon(Icons.attach_money),
        label: Text('Fees'),
      ));
    }
     items.add(const NavigationRailDestination(
        icon: Icon(Icons.settings),
        label: Text('Settings'),
      ));

    return items;
  }


  bool _hasPermission(String permission) {
    return _permissions.contains(permission);
  }
}
