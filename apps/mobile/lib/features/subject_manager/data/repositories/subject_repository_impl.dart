import 'package:dartz/dartz.dart';
import 'package:mobile/core/error/failures.dart';
import 'package:mobile/features/subject_manager/domain/repositories/subject_repository.dart';

class SubjectRepositoryImpl implements SubjectRepository {
  @override
  Future<Either<Failure, void>> assignSubject(
    String classId,
    String subjectId,
  ) async {
    // final response = await apiClient.post('/api/academic/subject/assign', {
    //   'classId': classId,
    //   'subjectId': subjectId,
    // });

    // if (response.statusCode == 200) {
    //   return Right(null);
    // } else if (response.statusCode == 400 && response.data['message'] == 'Physics cannot be assigned to Grade 1') {
    //   return Left(ServerFailure(response.data['message']));
    // } else {
    //   return Left(ServerFailure('Something went wrong'));
    // }
    print('Assigning subject $subjectId to class $classId');
    if (classId == '1' && subjectId == 'phy') {
      return const Left(ServerFailure('Physics cannot be assigned to Grade 1'));
    }
    await Future.delayed(const Duration(seconds: 1));
    return const Right(unit);
  }
}
