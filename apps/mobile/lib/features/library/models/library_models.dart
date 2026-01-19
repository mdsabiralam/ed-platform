// 1. Book Model
enum BookStatus { available, issued, lost }

class Book {
  final String id;
  final String isbn;
  final String title;
  final String author;
  final String category;
  final String rackLocation;
  final BookStatus status;

  Book({
    required this.id,
    required this.isbn,
    required this.title,
    required this.author,
    required this.category,
    required this.rackLocation,
    required this.status,
  });
}

// 2. Circulation Model
class Circulation {
  final String id;
  final String bookId;
  final String studentId;
  final DateTime issueDate;
  final DateTime dueDate;
  final DateTime? returnDate;
  final double fineAmount;

  Circulation({
    required this.id,
    required this.bookId,
    required this.studentId,
    required this.issueDate,
    required this.dueDate,
    this.returnDate,
    this.fineAmount = 0.0,
  });
}
