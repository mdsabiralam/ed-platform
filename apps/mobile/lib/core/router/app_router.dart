import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/screens/splash_screen.dart';
import 'package:mobile/features/auth/screens/login_screen.dart';
import 'package:mobile/features/home/screens/dashboard_screen.dart';
import 'package:mobile/features/fees/screens/fees_screen.dart';
import 'package:mobile/features/transport/screens/bus_tracking_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DashboardScreen(parentId: 'user-123'), // Mock ID
    ),
    GoRoute(
      path: '/fees/:studentId',
      builder: (context, state) {
        final studentId = state.pathParameters['studentId']!;
        return FeesScreen(studentId: studentId);
      },
    ),
    GoRoute(
      path: '/tracking/:vehicleId',
      builder: (context, state) {
        final vehicleId = state.pathParameters['vehicleId']!;
        return BusTrackingScreen(vehicleId: vehicleId);
      },
    ),
  ],
);
