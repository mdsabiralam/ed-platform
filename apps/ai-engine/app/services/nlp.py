import re

class NlpService:
    def extract_intent(self, text: str):
        """
        Step 3 & 4: Intent Classification and Entity Extraction
        """
        text_lower = text.lower()

        intent = "UNKNOWN"
        entities = {}

        # Step 3: Intent Classification
        if "fees" in text_lower or "dues" in text_lower or "payment" in text_lower:
            intent = "VIEW_FEES"
        elif "result" in text_lower or "marks" in text_lower or "report" in text_lower or "grade" in text_lower:
            intent = "VIEW_REPORT"
        elif "attendance" in text_lower or "present" in text_lower or "absent" in text_lower:
            intent = "VIEW_ATTENDANCE"
        elif "logout" in text_lower or "sign out" in text_lower:
            intent = "LOGOUT"

        # Step 4: Entity Extraction
        # Class Entity
        class_match = re.search(r'class\s+(\d+|[a-z]+)', text_lower)
        if class_match:
            entities["class"] = class_match.group(1)

        # Section Entity
        section_match = re.search(r'section\s+([a-z])', text_lower)
        if section_match:
            entities["section"] = section_match.group(1).upper()

        # Month Entity (Simple list)
        months = ["january", "february", "march", "april", "may", "june",
                  "july", "august", "september", "october", "november", "december"]
        for m in months:
            if m in text_lower:
                entities["month"] = m.capitalize()
                break

        return {"intent": intent, "entities": entities}

nlp_service = NlpService()
