import 'package:intl/intl.dart';
class AppDateUtils {
  static String formatDate(DateTime date) {
    return DateFormat('dd MMM yyyy').format(date);
  }
  static String formatDateTime(DateTime date) {
    return DateFormat('dd MMM yyyy, h:mm a').format(date);
  }
}
