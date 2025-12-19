import 'package:intl/intl.dart';
class AppCurrencyUtils {
  static String formatBDT(double amount) {
    final format = NumberFormat.currency(
      locale: 'en_BD', 
      symbol: '৳', 
      decimalDigits: 0
    );
    return format.format(amount);
  }
}
