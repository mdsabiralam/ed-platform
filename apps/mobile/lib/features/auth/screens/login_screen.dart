import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/core/services/auth_service.dart';
import 'package:mobile/core/ui/responsive_layout.dart';
import 'package:mobile/features/auth/logic/login_cubit.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => LoginCubit(AuthService()),
      child: const Scaffold(
        body: ResponsiveLayout(
          mobileBody: _MobileLoginView(),
          desktopBody: _DesktopLoginView(),
          tabletBody: _DesktopLoginView(), // Tablet can use split view or specific one, using Desktop for now
        ),
      ),
    );
  }
}

class _MobileLoginView extends StatelessWidget {
  const _MobileLoginView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Top 30%
        Expanded(
          flex: 3,
          child: Container(
            width: double.infinity,
            color: const Color(0xFFF1F5F9), // Slate 100
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.school, size: 64, color: Color(0xFF0D47A1)),
                const SizedBox(height: 16),
                Text(
                  'Welcome Back',
                  style: GoogleFonts.poppins(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF0D47A1),
                  ),
                ),
                Text(
                  'Sign in to continue',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ),
        // Bottom 70%
        const Expanded(
          flex: 7,
          child: Padding(
            padding: EdgeInsets.all(24.0),
            child: _LoginForm(),
          ),
        ),
      ],
    );
  }
}

class _DesktopLoginView extends StatelessWidget {
  const _DesktopLoginView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Left Half - Hero Image/Overlay
        Expanded(
          child: Container(
            color: const Color(0xFF0D47A1),
            child: Stack(
              fit: StackFit.expand,
              children: [
                // Placeholder for Hero Image
                // Image.asset('assets/images/school_hero.jpg', fit: BoxFit.cover),
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        const Color(0xFF0D47A1).withOpacity(0.8),
                        const Color(0xFF0D47A1),
                      ],
                    ),
                  ),
                ),
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.school, size: 100, color: Colors.white),
                      const SizedBox(height: 24),
                      Text(
                        'ed. Platform',
                        style: GoogleFonts.poppins(
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Empowering Education Management',
                        style: GoogleFonts.inter(
                          fontSize: 18,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        // Right Half - Form
        Expanded(
          child: Container(
            color: Colors.white,
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 400),
                child: const Card(
                  elevation: 0, // Flat on desktop usually looks cleaner or use mild elevation
                  color: Colors.transparent,
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                         Text(
                          'Login',
                          style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0D47A1),
                          ),
                        ),
                         SizedBox(height: 32),
                         _LoginForm(),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _LoginForm extends StatefulWidget {
  const _LoginForm({Key? key}) : super(key: key);

  @override
  State<_LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<_LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordVisible = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      context.read<LoginCubit>().login(
            _emailController.text.trim(),
            _passwordController.text.trim(),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<LoginCubit, LoginState>(
      listener: (context, state) {
        if (state is LoginFailure) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.error),
              backgroundColor: Colors.red,
            ),
          );
        } else if (state is LoginSuccess) {
          // Role-Based Redirection
          switch (state.role) {
            case 'SUPER_ADMIN':
              context.go('/admin/dashboard');
              break;
            case 'PRINCIPAL':
              context.go('/principal/dashboard');
              break;
            case 'TEACHER':
              context.go('/teacher/dashboard');
              break;
            case 'PARENT':
              context.go('/parent/dashboard');
              break;
            default:
              context.go('/'); // Fallback
          }
        }
      },
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Email Field
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Email Address',
                prefixIcon: Icon(Icons.email_outlined),
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter your email';
                }
                // Simple regex for email
                if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                  return 'Please enter a valid email';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            // Password Field
            TextFormField(
              controller: _passwordController,
              obscureText: !_isPasswordVisible,
              decoration: InputDecoration(
                labelText: 'Password',
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  icon: Icon(
                    _isPasswordVisible
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                  ),
                  onPressed: () {
                    setState(() {
                      _isPasswordVisible = !_isPasswordVisible;
                    });
                  },
                ),
                border: const OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter your password';
                }
                if (value.length < 6) {
                  return 'Password must be at least 6 characters';
                }
                return null;
              },
            ),
            const SizedBox(height: 8),
            // Forgot Password
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () {
                   // Navigate to Forgot Password Screen (Placeholder)
                   // context.push('/forgot-password');
                },
                child: const Text('Forgot Password?'),
              ),
            ),
            const SizedBox(height: 24),
            // Login Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: BlocBuilder<LoginCubit, LoginState>(
                builder: (context, state) {
                  return ElevatedButton(
                    onPressed: state is LoginLoading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0D47A1),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: state is LoginLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Text(
                            'Login',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
