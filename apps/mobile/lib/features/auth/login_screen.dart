import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:easy_localization/easy_localization.dart';
import 'bloc/auth_bloc.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('school_name'.tr())),
      body: Center(
        child: BlocConsumer<AuthBloc, AuthState>(
          listener: (context, state) {
            if (state is AuthAuthenticated) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('success_msg'.tr())),
              );
            }
          },
          builder: (context, state) {
            if (state is AuthLoading) {
              return const CircularProgressIndicator();
            }
            return Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'login_title'.tr(),
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    context.read<AuthBloc>().add(
                      AuthLoginRequested('user', 'password'),
                    );
                  },
                  child: Text('login_btn'.tr()),
                ),
                const SizedBox(height: 40),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        context.setLocale(const Locale('en'));
                      },
                      child: const Text('English'),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        context.setLocale(const Locale('bn'));
                      },
                      child: const Text('বাংলা'),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        context.setLocale(const Locale('hi'));
                      },
                      child: const Text('हिंदी'),
                    ),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}