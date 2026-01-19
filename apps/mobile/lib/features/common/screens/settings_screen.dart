import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

// --- Dependencies (Mocked/Shells as per Critical Rule to ensure compilability) ---

// 1. AuthService
class AuthService {
  static Future<void> logout() async {
    // Simulate API call
    await Future.delayed(const Duration(milliseconds: 500));
    // Clear tokens logic would go here
    print("Tokens cleared. User logged out.");
  }
}

// 2. LocaleProvider
class LocaleProvider extends ChangeNotifier {
  Locale _locale = const Locale('en');

  Locale get locale => _locale;

  void setLocale(Locale locale) {
    if (_locale != locale) {
      _locale = locale;
      notifyListeners();
    }
  }
}

// 3. ThemeProvider
class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;

  ThemeMode get themeMode => _themeMode;

  bool get isDarkMode => _themeMode == ThemeMode.dark;

  void toggleTheme(bool isDark) {
    _themeMode = isDark ? ThemeMode.dark : ThemeMode.light;
    notifyListeners();
  }
}

// --- Settings Profile Screen ---

class SettingsProfileScreen extends StatelessWidget {
  const SettingsProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Responsive Layout Builder
    return Scaffold(
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 600) {
            // Web/Desktop View
            return Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 600),
                child: Card(
                  elevation: 4,
                  margin: const EdgeInsets.all(24),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: const _SettingsContent(),
                ),
              ),
            );
          } else {
            // Mobile View
            return const _SettingsContent();
          }
        },
      ),
    );
  }
}

class _SettingsContent extends StatelessWidget {
  const _SettingsContent();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const _ProfileHeader(),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(vertical: 8),
            children: [
              _buildSectionHeader(context, "Account Settings"),
              _buildListTile(
                context,
                icon: Icons.person_outline,
                title: "Edit Profile",
                subtitle: "Name, Phone",
                onTap: () {
                  // Navigate to Edit Profile
                },
              ),
              _buildListTile(
                context,
                icon: Icons.lock_outline,
                title: "Change Password",
                onTap: () {
                   // Navigate to Change Password
                },
              ),
              const Divider(),
              _buildSectionHeader(context, "App Preferences"),
              // Language Dropdown
              Consumer<LocaleProvider>(
                builder: (context, provider, child) {
                  return ListTile(
                    leading: const Icon(Icons.language, color: Colors.grey),
                    title: const Text("Language"),
                    trailing: DropdownButton<String>(
                      value: provider.locale.languageCode,
                      underline: const SizedBox(),
                      items: const [
                        DropdownMenuItem(value: 'en', child: Text("English")),
                        DropdownMenuItem(value: 'bn', child: Text("Bangla")),
                      ],
                      onChanged: (String? newValue) {
                        if (newValue != null) {
                          provider.setLocale(Locale(newValue));
                        }
                      },
                    ),
                  );
                },
              ),
              // Dark Mode Switch
              Consumer<ThemeProvider>(
                builder: (context, provider, child) {
                  return SwitchListTile(
                    secondary: const Icon(Icons.dark_mode_outlined, color: Colors.grey),
                    title: const Text("Dark Mode"),
                    value: provider.isDarkMode,
                    onChanged: (bool value) {
                      provider.toggleTheme(value);
                    },
                  );
                },
              ),
              const Divider(),
              _buildSectionHeader(context, "Danger Zone"),
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.redAccent),
                title: const Text(
                  "Logout",
                  style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w600),
                ),
                onTap: () => _handleLogout(context),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: Colors.grey[600],
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
            ),
      ),
    );
  }

  Widget _buildListTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.grey),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle) : null,
      trailing: const Icon(Icons.chevron_right, size: 20, color: Colors.grey),
      onTap: onTap,
    );
  }

  Future<void> _handleLogout(BuildContext context) async {
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Logout"),
        content: const Text("Are you sure you want to log out?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: Colors.redAccent),
            child: const Text("Logout"),
          ),
        ],
      ),
    );

    if (shouldLogout == true) {
      // Call Business Logic
      await AuthService.logout();

      if (context.mounted) {
        // Clear stack and navigate to login
        context.go('/login');
      }
    }
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.only(top: 48, bottom: 24, left: 24, right: 24),
      decoration: const BoxDecoration(
        color: Color(0xFF0D47A1), // Deep Blue
      ),
      child: Column(
        children: [
          const CircleAvatar(
            radius: 40,
            backgroundImage: NetworkImage('https://i.pravatar.cc/150?img=12'), // Placeholder
            backgroundColor: Colors.white24,
            child: Icon(Icons.person, size: 40, color: Colors.white), // Fallback
          ),
          const SizedBox(height: 16),
          const Text(
            "User Name", // Dynamic Data
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              "Teacher", // Dynamic Role
              style: TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
