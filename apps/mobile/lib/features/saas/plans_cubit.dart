import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/api/api_client.dart';

class PlansCubit extends Cubit<void> {
  final ApiClient apiClient;

  PlansCubit(this.apiClient) : super(null);
}
