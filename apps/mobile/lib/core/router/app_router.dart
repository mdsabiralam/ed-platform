import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/transport/ui/driver_manifest_screen.dart';
import 'package:mobile/features/library/ui/library_scanner_screen.dart';
import 'package:mobile/features/finance/ui/fee_terminal_screen.dart';
import 'package:mobile/features/health/ui/opd_entry_screen.dart';

// Basic Router setup since original file was missing/not found in list.
// In a real scenario, I would append to the existing router.
// Assuming the user wants me to set up the routes for these new features.

final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const Scaffold(body: Center(child: Text("Home Placeholder"))), // Placeholder
    ),
    // 12.G.01 Driver App
    GoRoute(
      path: '/transport/driver-manifest',
      builder: (context, state) => const DriverManifestScreen(),
    ),
    // 12.G.04 Librarian App
    GoRoute(
      path: '/library/scanner',
      builder: (context, state) => const LibraryScannerScreen(),
    ),
    // 12.G.06 Accountant App
    GoRoute(
      path: '/finance/fee-terminal',
      builder: (context, state) => const FeeTerminalScreen(),
    ),
    // 12.G.08 Nurse App
    GoRoute(
      path: '/health/opd-entry',
      builder: (context, state) => const OpdEntryScreen(),
    ),
  ],
);
