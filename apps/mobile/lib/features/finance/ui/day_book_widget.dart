import 'package:flutter/material.dart';
import 'package:mobile/core/api_client.dart';

// 12.G.07 Day Book (Cash Summary)

class DayBookWidget extends StatelessWidget {
  const DayBookWidget({Key? key}) : super(key: key);

  Future<Map<String, dynamic>> _fetchDayBook() async {
    // 12.G.07 GET /finance/day-book
    final apiClient = ApiClient();
    try {
      final response = await apiClient.get('/finance/day-book');
      if (response.statusCode == 200 && response.data != null) {
        // Assuming response.data is a Map
        final data = response.data;
        return {
          "cash": (data['cash'] ?? 0.0).toDouble(),
          "cheques": (data['cheques'] ?? 0.0).toDouble(),
          "online": (data['online'] ?? 0.0).toDouble(),
        };
      }
    } catch (e) {
      // debugPrint("Error fetching Day Book: $e");
    }

    // Fallback or empty if failed
    return {
      "cash": 0.0,
      "cheques": 0.0,
      "online": 0.0,
    };
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _fetchDayBook(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final data = snapshot.data ?? {"cash": 0, "cheques": 0, "online": 0};

        return Card(
          elevation: 4,
          color: Colors.blueGrey[50],
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Day Book (Read-Only)", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const Divider(),
                _buildRow("Total Cash Collected", data['cash']),
                _buildRow("Total Cheques", data['cheques']),
                _buildRow("Online Transfers", data['online']),
                const Divider(),
                _buildRow("Grand Total", (data['cash'] + data['cheques'] + data['online'])),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRow(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text("\$${value.toString()}", style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
