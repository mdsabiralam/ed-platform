class AiService {
  Future<Map<String, dynamic>> generateContent(String instructions) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 2));

    return {
      'title': 'Chapter 5 Summary',
      'description': 'Comprehensive summary of Chapter 5 covering key concepts.',
      'questions': [
        'What are the main themes discussed in this chapter?',
        'Explain the significance of the protagonist\'s decision.',
        'How does this chapter relate to the previous one?',
        'Identify three key terms defined in the text.',
        'Summarize the conclusion in your own words.',
      ],
    };
  }
}
