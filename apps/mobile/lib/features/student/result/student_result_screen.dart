import 'package:flutter/material.dart';
import 'dart:ui'; // For ImageFilter
import 'package:dio/dio.dart';
import '../../../core/api_client.dart';

class StudentResultScreen extends StatefulWidget {
  final String studentId;
  final String examId;

  const StudentResultScreen({Key? key, required this.studentId, required this.examId}) : super(key: key);

  @override
  _StudentResultScreenState createState() => _StudentResultScreenState();
}

class _StudentResultScreenState extends State<StudentResultScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  bool _isLocked = false;
  String _lockReason = '';
  final ApiClient _apiClient = ApiClient();

  @override
  void initState() {
    super.initState();
    _fetchResult();
  }

  Future<void> _fetchResult() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _isLocked = false;
    });

    try {
      // Use caching endpoint with responseType bytes to verify access
      // The content itself isn't displayed here (just preview), but we check access.
      await _apiClient.dio.get(
        '/academic/marksheet/pdf/${widget.studentId}',
        queryParameters: {'examId': widget.examId},
        options: Options(responseType: ResponseType.bytes),
      );

      setState(() {
        _isLoading = false;
      });
    } on DioException catch (e) {
      if (e.response?.statusCode == 403) {
        setState(() {
          _isLocked = true;
          final msg = e.response?.data.toString() ?? '';
          if (msg.contains('Fee') || msg.contains('FEE')) {
            _lockReason = 'FEES_PENDING';
          } else {
            _lockReason = 'OTHER';
          }
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = e.message ?? 'Unknown Error';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _navigateToPayment() {
    // Mock navigation to Payment Gateway
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Redirecting to Payment Gateway...')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Result View')),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(child: Text('Error: $_errorMessage'));
    }

    return Stack(
      children: [
        // Result Content (Blurred if locked)
        ImageFiltered(
          imageFilter: ImageFilter.blur(
            sigmaX: _isLocked ? 10.0 : 0.0,
            sigmaY: _isLocked ? 10.0 : 0.0,
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.description, size: 100, color: Colors.blue),
                Text('Exam Result Preview', style: TextStyle(fontSize: 24)),
                // Placeholder for actual result data
                Text('Marks: 95/100'),
                Text('Grade: A'),
              ],
            ),
          ),
        ),

        // Lock Overlay
        if (_isLocked)
          Container(
            color: Colors.black.withOpacity(0.3),
            child: Center(
              child: Card(
                margin: EdgeInsets.symmetric(horizontal: 20),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.lock, size: 50, color: Colors.red),
                      SizedBox(height: 10),
                      Text(
                        'Result Locked',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 10),
                      Text(
                        _lockReason == 'FEES_PENDING'
                            ? 'Outstanding fees detected. Please clear dues to view result.'
                            : 'Access restricted.',
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 20),
                      if (_lockReason == 'FEES_PENDING')
                        ElevatedButton(
                          onPressed: _navigateToPayment,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            foregroundColor: Colors.white,
                          ),
                          child: Text('Pay Now to Unlock Result'),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
