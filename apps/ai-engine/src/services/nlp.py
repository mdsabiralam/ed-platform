import re

class NLPService:
    def __init__(self):
        self.intents = {
            "VIEW_FEES": [r"fees", r"dues", r"payment", r"cost", r"taka"],
            "VIEW_REPORT": [r"result", r"marks", r"report card", r"score", r"grade"],
            "VIEW_ATTENDANCE": [r"attendance", r"present", r"absent"],
            "LOGOUT": [r"logout", r"sign out", r"exit"]
        }

    def determine_intent(self, text: str) -> str:
        """
        Determines the intent based on keywords in the text.
        """
        text_lower = text.lower()
        for intent, patterns in self.intents.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    return intent
        return "UNKNOWN"

    def extract_entities(self, text: str) -> dict:
        """
        Extracts entities like Class, Section, etc.
        """
        entities = {}
        text_lower = text.lower()

        # Extract Class (e.g., "Class 5", "Class 10")
        class_match = re.search(r"class\s+(\d+)", text_lower)
        if class_match:
            entities["class"] = class_match.group(1)

        # Extract Section (e.g., "Section B", "Section A")
        section_match = re.search(r"section\s+([a-z])", text_lower)
        if section_match:
            entities["section"] = section_match.group(1).upper()

        # Extract Month (simple list for example)
        months = ["january", "february", "march", "april", "may", "june",
                  "july", "august", "september", "october", "november", "december"]
        for month in months:
            if month in text_lower:
                entities["month"] = month.capitalize()
                break

        return entities
