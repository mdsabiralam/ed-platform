import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/core/api/api_client.dart';

// States
abstract class PlansState extends Equatable {
  const PlansState();
  @override
  List<Object> get props => [];
}

class PlansInitial extends PlansState {}
class PlansLoading extends PlansState {}
class PlansLoaded extends PlansState {
  final List<dynamic> plans;
  const PlansLoaded(this.plans);
  @override
  List<Object> get props => [plans];
}
class PlansError extends PlansState {
  final String message;
  const PlansError(this.message);
  @override
  List<Object> get props => [message];
}

// Cubit
class PlansCubit extends Cubit<PlansState> {
  final ApiClient apiClient;

  PlansCubit(this.apiClient) : super(PlansInitial());

  Future<void> loadPlans() async {
    emit(PlansLoading());
    try {
      final response = await apiClient.get('/saas/plans');
      emit(PlansLoaded(response.data['data'] ?? []));
    } catch (e) {
      emit(PlansError(e.toString()));
    }
  }
}
