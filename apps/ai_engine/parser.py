import re

class Parser:
    def parse(self, raw_text_list: list) -> dict:
        """
        Parses raw text list from OCR into a structured JSON object.
        Args:
            raw_text_list: List of dictionaries with 'text' and 'box' keys.
        Returns:
            Structured dictionary.
        """
        # Join all text for easier regex matching
        full_text = " ".join([item['text'] for item in raw_text_list])

        parsed_data = {}

        # Name: [A-Z ]+
        # Adjust regex to stop at known keywords if needed or handle cleaner matching
        # Assuming format like "Name: Joy Class: 5"

        # More robust regex that stops before other keywords if possible,
        # or just takes next few words.
        # Here we assume it might be followed by 'Class' or 'Roll No' or 'DOB'
        name_pattern = r"Name:\s*([A-Za-z ]+?)(?=\s+(?:Class|Roll|DOB)|$)"
        name_match = re.search(name_pattern, full_text, re.IGNORECASE)

        if not name_match:
             # Fallback to original greedy if lookahead fails
             name_match = re.search(r"Name:\s*([A-Za-z ]+)", full_text, re.IGNORECASE)

        if name_match:
            parsed_data['studentName'] = name_match.group(1).strip()

        # DOB: \d{2}/\d{2}/\d{4}
        dob_match = re.search(r"DOB:\s*(\d{2}/\d{2}/\d{4})", full_text)
        if dob_match:
            parsed_data['dob'] = dob_match.group(1).strip()

        # Roll No: \d+
        roll_match = re.search(r"Roll No:\s*(\d+)", full_text, re.IGNORECASE)
        if roll_match:
            parsed_data['rollNo'] = roll_match.group(1).strip()

        # Class: \d+ or [A-Za-z0-9]+
        class_match = re.search(r"Class:\s*([A-Za-z0-9]+)", full_text, re.IGNORECASE)
        if class_match:
            parsed_data['class'] = class_match.group(1).strip()

        # Fallback if raw list is just strings
        if not parsed_data and raw_text_list and isinstance(raw_text_list[0], str):
             # Handle case where list might be simple strings (not from OCR service dicts)
             # But our OCR service returns dicts.
             pass

        return parsed_data
