import 'package:flutter/material.dart';

class ContextService {
  // Mock data for Holidays and TimeSlots
  // In real app, this would come from local DB synced from backend

  static final List<DateTime> _holidays = [
    DateTime(2024, 12, 25), // Christmas
    DateTime(2024, 1, 1),   // New Year
  ];

  static bool isHoliday(DateTime date) {
    // Check if Sunday
    if (date.weekday == DateTime.sunday) {
      return true;
    }

    // Check specific holidays
    for (final holiday in _holidays) {
      if (DateUtils.isSameDay(date, holiday)) {
        return true;
      }
    }
    return false;
  }

  // Returns a RoutineEntry ID if current time matches a slot
  static String? getCurrentRoutineEntry() {
    final now = DateTime.now();
    // Mock logic: If time is between 10:00 and 11:00, return 'math-101'
    if (now.hour == 10) {
      return 'math-101'; // Routine ID for 10 AM class
    }
    return null;
  }
}
