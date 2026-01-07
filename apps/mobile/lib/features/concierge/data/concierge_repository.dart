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

  Future<ConciergeRequest?> getRequestById(String id) async {
    try {
      final response = await _apiClient.dio.get('/concierge_requests/$id');
      if (response.data != null) {
        return ConciergeRequest.fromJson(response.data);
      }
      return null;
    } catch (e) {
      print('Error fetching concierge request $id: $e');
      return null;
    }
  }

  Future<void> publishAssignment(String id, Map<String, dynamic> data) async {
    try {
      await _apiClient.dio.post('/concierge_requests/$id/publish', data: data);
    } catch (e) {
      print('Error publishing assignment for $id: $e');
      rethrow;
    }
  }

  Future<void> rejectRequest(String id) async {
    try {
      await _apiClient.dio.post('/concierge_requests/$id/reject');
    } catch (e) {
      print('Error rejecting request $id: $e');
      rethrow;
    }
  }
}
