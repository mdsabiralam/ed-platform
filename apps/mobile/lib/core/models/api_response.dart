class ApiResponse<T> {
  final int statusCode;
  final String message;
  final T? data;
  final String timestamp;

  ApiResponse({
    required this.statusCode,
    required this.message,
    this.data,
    required this.timestamp,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) {
    return ApiResponse<T>(
      statusCode: json['statusCode'] as int,
      message: json['message'] as String,
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      timestamp: json['timestamp'] as String,
    );
  }
}
