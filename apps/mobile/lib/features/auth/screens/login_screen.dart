import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/bloc/auth_bloc.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _storage = const FlutterSecureStorage();

  @override
  Widget build(BuildContext context) {
    // Removed local BlocProvider. Assuming AuthBloc is provided at app root (main.dart).

    return BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) async {
        if (state is AuthSuccess) {
          if (state.profiles.length > 1) {
            _showProfileSelection(context, state.profiles, state.token);
          } else if (state.profiles.isNotEmpty) {
            await _saveAndNavigate(context, state.profiles[0], state.token);
          } else {
             ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No profiles found')));
          }
        } else if (state is AuthFailure) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.error)));
        }
      },
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(title: const Text('Login')),
          body: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _passwordController,
                  decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder()),
                  obscureText: true,
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: state is AuthLoading
                      ? null
                      : () {
                          // Using global AuthBloc
                          context.read<AuthBloc>().add(AuthLoginRequested(
                            email: _emailController.text,
                            password: _passwordController.text
                          ));
                        },
                    child: state is AuthLoading
                      ? const CircularProgressIndicator()
                      : const Text('Login'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showProfileSelection(BuildContext context, List<Map<String, dynamic>> profiles, String token) {
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Select Profile', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              ...profiles.map((profile) => ListTile(
                title: Text(profile['name']),
                subtitle: Text(profile['role']),
                onTap: () {
                  Navigator.pop(ctx);
                  _saveAndNavigate(context, profile, token);
                },
              )),
            ],
          ),
        );
      },
    );
  }

  Future<void> _saveAndNavigate(BuildContext context, Map profile, String token) async {
    await _storage.write(key: 'access_token', value: token);
    await _storage.write(key: 'profile_id', value: profile['id']);
    await _storage.write(key: 'user_role', value: profile['role']);

    if (context.mounted) {
       context.go('/dashboard');
    }
  }
}
