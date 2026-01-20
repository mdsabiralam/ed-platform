import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/api_response.dart';
import '../models/event_duty.dart';
import '../api_client.dart'; // Assuming you have this base client

class EventsService {
  final ApiClient _client;

  EventsService(this._client);

  Future<List<EventDuty>> getMyDuties(String profileId) async {
    try {
      // API call to backend
      final response = await _client.get(
        '/api/event/my-duties?profileId=$profileId',
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => EventDuty.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load duties');
      }
    } catch (e) {
      throw Exception('Error fetching duties: $e');
    }
  }
}
