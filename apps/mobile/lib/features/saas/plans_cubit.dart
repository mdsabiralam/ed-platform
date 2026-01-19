import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/core/api_client.dart';

// --- State ---
abstract class PlansState extends Equatable {
  const PlansState();

  @override
  List<Object> get props => [];
}

class PlansInitial extends PlansState {}
class PlansLoading extends PlansState {}
class PlansLoaded extends PlansState {
  final List<Plan> plans;
  const PlansLoaded(this.plans);
}
class PlansError extends PlansState {
  final String message;
  const PlansError(this.message);
}

// --- Model ---
class Plan {
  final String id;
  final String name;
  final double priceMonthly;
  final List<String> features;

  Plan({required this.id, required this.name, required this.priceMonthly, required this.features});

  factory Plan.fromJson(Map<String, dynamic> json) {
    return Plan(
      id: json['id'],
      name: json['name'],
      priceMonthly: (json['priceMonthly'] as num).toDouble(),
      features: List<String>.from(json['features'] ?? []),
    );
  }
}

// --- Cubit ---
class PlansCubit extends Cubit<PlansState> {
  final ApiClient apiClient;

  PlansCubit(this.apiClient) : super(PlansInitial());

  Future<void> loadPlans() async {
    try {
      emit(PlansLoading());
      final response = await apiClient.get('/plans');
      final plans = (response.data as List).map((p) => Plan.fromJson(p)).toList();
      emit(PlansLoaded(plans));
    } catch (e) {
      emit(PlansError(e.toString()));
    }
  }
}
