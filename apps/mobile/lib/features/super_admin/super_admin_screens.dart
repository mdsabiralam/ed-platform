import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:local_auth/local_auth.dart';
import 'package:dio/dio.dart';

// Real API Client
class ApiClient {
  final Dio _dio = Dio(BaseOptions(baseUrl: 'http://10.0.2.2:3000')); // Android Emulator Localhost

  Future<List<dynamic>> getTenants() async {
    try {
      final response = await _dio.get('/tenants');
      return response.data as List<dynamic>;
    } catch (e) {
      return [];
    }
  }
  Future<Map<String, dynamic>> impersonate(String tenantId) async {
     final response = await _dio.post('/auth/impersonate', data: {'tenantId': tenantId});
     return response.data as Map<String, dynamic>;
  }
  Future<void> suspendTenant(String tenantId) async {
     await _dio.patch('/tenants/$tenantId/suspend');
  }
  Future<Map<String, dynamic>> getRevenueAnalytics() async {
     try {
       final response = await _dio.get('/super-admin/analytics');
       return response.data as Map<String, dynamic>;
     } catch (e) {
       return {};
     }
  }
}

// 1. Tenant Manager List (Super Admin)
class TenantListScreen extends StatefulWidget {
  const TenantListScreen({super.key});

  @override
  State<TenantListScreen> createState() => _TenantListScreenState();
}

class _TenantListScreenState extends State<TenantListScreen> {
  final ApiClient _apiClient = ApiClient(); // In real app, via DI
  List<dynamic> _tenants = [];
  List<dynamic> _filteredTenants = [];
  String _filterStatus = 'All'; // Active, Suspended, Trial
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchTenants();
  }

  Future<void> _fetchTenants() async {
    // Mock data fetching
    final tenants = await _apiClient.getTenants();
    // Populated from backend GET /tenants
    setState(() {
        _tenants = tenants;
        _filteredTenants = tenants;
    });
  }

  void _filterList() {
    setState(() {
      _filteredTenants = _tenants.where((t) {
        final matchesSearch = t['name'].toString().toLowerCase().contains(_searchController.text.toLowerCase()) ||
                              t['id'].toString().contains(_searchController.text);
        final matchesStatus = _filterStatus == 'All' ||
                              (_filterStatus == 'Active' && t['isActive'] == true) ||
                              (_filterStatus == 'Suspended' && t['isActive'] == false); // Simplified logic
        return matchesSearch && matchesStatus;
      }).toList();
    });
  }

  // 2. Impersonation Logic
  Future<void> _impersonate(String tenantId) async {
      try {
          final response = await _apiClient.impersonate(tenantId);
          final token = response['access_token'];

          // 1. Securely store token (Mocked)
          // await TokenStorage.save(token);

          // 2. Clear state & 3. Hot Restart (Navigation Reset)
          if (mounted) {
             context.go('/dashboard'); // Assuming this reloads based on new token
          }
      } catch (e) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Impersonation failed: $e')));
      }
  }

  // 4. Global Suspend Action
  void _showSuspendDialog(String tenantId) {
      final controller = TextEditingController();
      showDialog(context: context, builder: (context) => AlertDialog(
          title: const Text('Suspend Tenant', style: TextStyle(color: Colors.red)),
          content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                  const Text('Type "SUSPEND" to confirm this dangerous action.'),
                  TextField(controller: controller, decoration: const InputDecoration(hintText: 'SUSPEND')),
              ],
          ),
          actions: [
              TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
              TextButton(
                  onPressed: () async {
                      if (controller.text == 'SUSPEND') {
                          await _apiClient.suspendTenant(tenantId);
                          Navigator.pop(context);
                          _fetchTenants(); // Refresh
                      }
                  },
                  style: TextButton.styleFrom(foregroundColor: Colors.red),
                  child: const Text('CONFIRM'),
              ),
          ],
      ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tenant Manager')),
      body: Column(
        children: [
            Padding(
                padding: const EdgeInsets.all(8.0),
                child: TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(labelText: 'Search by Name or ID', prefixIcon: Icon(Icons.search)),
                    onChanged: (_) => _filterList(),
                ),
            ),
            SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                    children: ['All', 'Active', 'Suspended', 'Trial'].map((status) => Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                        child: FilterChip(
                            label: Text(status),
                            selected: _filterStatus == status,
                            onSelected: (selected) {
                                setState(() { _filterStatus = status; _filterList(); });
                            },
                        ),
                    )).toList(),
                ),
            ),
            Expanded(
                child: CustomScrollView(
                    slivers: [
                        SliverList(
                            delegate: SliverChildBuilderDelegate(
                                (context, index) {
                                    final tenant = _filteredTenants[index];
                                    return ListTile(
                                        title: Text(tenant['name']),
                                        subtitle: Text('Plan: ${tenant['subscription']?['plan']?['name'] ?? 'None'} • Users: ${tenant['_count']?['profiles'] ?? 0}'),
                                        trailing: PopupMenuButton(
                                            itemBuilder: (context) => [
                                                PopupMenuItem(
                                                    child: const Text('Login as Admin'),
                                                    onTap: () => _impersonate(tenant['id']),
                                                ),
                                                PopupMenuItem(
                                                    child: const Text('Suspend Tenant', style: TextStyle(color: Colors.red)),
                                                    onTap: () => Future.delayed(Duration.zero, () => _showSuspendDialog(tenant['id'])),
                                                ),
                                            ],
                                        ),
                                    );
                                },
                                childCount: _filteredTenants.length,
                            ),
                        ),
                    ],
                ),
            ),
        ],
      ),
    );
  }
}

// 3. Revenue Analytics Widget
class RevenueChartWidget extends StatelessWidget {
  const RevenueChartWidget({super.key});

  @override
  Widget build(BuildContext context) {
    // Fetch data from _apiClient.getRevenueAnalytics() in a real implementation
    return Card(
        margin: const EdgeInsets.all(16),
        child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
                children: [
                    const Text('MRR (Last 12 Months)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    SizedBox(
                        height: 200,
                        child: LineChart(
                            LineChartData(
                                lineBarsData: [
                                    LineChartBarData(
                                        spots: const [FlSpot(0, 5000), FlSpot(1, 5500), FlSpot(2, 6000) /* ... */],
                                        isCurved: true,
                                        color: Colors.blue, // Brand color
                                        dotData: const FlDotData(show: false),
                                    ),
                                ],
                                titlesData: const FlTitlesData(show: true),
                            ),
                        ),
                    ),
                    const SizedBox(height: 20),
                    const Text('Signups vs Churn', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    SizedBox(
                        height: 200,
                        child: BarChart(
                            BarChartData(
                                barGroups: [
                                    BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: 10, color: Colors.green), BarChartRodData(toY: 1, color: Colors.red)]),
                                    // ...
                                ],
                            ),
                        ),
                    ),
                ],
            ),
        ),
    );
  }
}

// 8. Feature Toggle UI
class ModuleSettingsScreen extends StatefulWidget {
  final String tenantId;
  const ModuleSettingsScreen({super.key, required this.tenantId});

  @override
  State<ModuleSettingsScreen> createState() => _ModuleSettingsScreenState();
}

class _ModuleSettingsScreenState extends State<ModuleSettingsScreen> {
  final Map<String, bool> _modules = {'Transport': true, 'Hostel': false, 'AI': true};

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text('Module Settings')),
        body: ListView(
            children: _modules.keys.map((key) {
                return SwitchListTile(
                    title: Text(key),
                    value: _modules[key]!,
                    onChanged: (val) {
                        setState(() => _modules[key] = val);
                        // Call API to update
                    },
                );
            }).toList(),
        ),
    );
  }
}

// 9. Biometric Security Layer
class SuperAdminApp extends StatefulWidget {
    const SuperAdminApp({super.key});
    @override
    State<SuperAdminApp> createState() => _SuperAdminAppState();
}

class _SuperAdminAppState extends State<SuperAdminApp> {
    bool _isAuthenticated = false;
    final LocalAuthentication auth = LocalAuthentication();

    @override
    void initState() {
        super.initState();
        _authenticate();
    }

    Future<void> _authenticate() async {
        try {
            final bool didAuthenticate = await auth.authenticate(
                localizedReason: 'Please authenticate to access Super Admin Console',
                options: const AuthenticationOptions(biometricOnly: true),
            );
            if (didAuthenticate) {
                setState(() => _isAuthenticated = true);
            } else {
                // Force Logout or Exit
            }
        } catch (e) {
            // Handle error
        }
    }

    @override
    Widget build(BuildContext context) {
        if (!_isAuthenticated) return const Scaffold(body: Center(child: CircularProgressIndicator()));
        return const TenantListScreen(); // Entry point
    }
}
