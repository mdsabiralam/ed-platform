import 'package:dio/dio.dart';
import 'package:mobile/core/api_client.dart';
import 'package:mobile/features/concierge/models/concierge_request.dart';

class ConciergeRepository {
  final ApiClient _apiClient;

  ConciergeRepository(this._apiClient);

  Future<List<ConciergeRequest>> getRequests() async {
    try {
      final response = await _apiClient.dio.get('/concierge_requests');
      if (response.data is List) {
        return (response.data as List)
            .map((e) => ConciergeRequest.fromJson(e))
            .toList();
      }
      return [];
    } catch (e) {
      // Handle error appropriately
      print('Error fetching concierge requests: $e');
      return [];
    }
  }
}
