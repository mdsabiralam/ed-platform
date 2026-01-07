import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mobile/core/models/user_role.dart';
import 'package:mobile/features/home/widgets/dashboard_factory.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _storage = const FlutterSecureStorage();
  UserRole _role = UserRole.unknown;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadRole();
  }

  Future<void> _loadRole() async {
    final roleString = await _storage.read(key: 'user_role');
    if (roleString != null) {
       try {
         setState(() {
           _role = UserRole.fromJson(roleString);
           _loading = false;
         });
       } catch (e) {
          setState(() {
             _role = UserRole.unknown;
             _loading = false;
          });
       }
    } else {
       // If no role found, maybe default or redirect (but splash handles redirect)
       setState(() {
         // Default for demo if logic fails
         _role = UserRole.teacher;
         _loading = false;
       });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return DashboardFactory.build(_role);
  }
}
