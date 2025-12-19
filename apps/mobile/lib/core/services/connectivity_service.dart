import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  final Connectivity _connectivity = Connectivity();
  final StreamController<bool> _connectionChangeController = StreamController<bool>.broadcast();

  ConnectivityService() {
    _connectivity.onConnectivityChanged.listen(_connectionChange);
  }

  Stream<bool> get connectionChange => _connectionChangeController.stream;

  Future<void> _connectionChange(List<ConnectivityResult> results) async {
    // Check if any result indicates a connection (mobile, wifi, or ethernet)
    bool isConnected = results.any((result) => 
      result == ConnectivityResult.mobile || 
      result == ConnectivityResult.wifi || 
      result == ConnectivityResult.ethernet
    );
    
    _connectionChangeController.add(isConnected);
  }

  Future<bool> get isConnected async {
    final results = await _connectivity.checkConnectivity();
     return results.any((result) => 
      result == ConnectivityResult.mobile || 
      result == ConnectivityResult.wifi || 
      result == ConnectivityResult.ethernet
    );
  }
  
  void dispose() {
    _connectionChangeController.close();
  }
}