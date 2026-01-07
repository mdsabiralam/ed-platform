from urllib.parse import urlencode

class CommandMapper:
    def get_action(self, intent_data: dict):
        """
        Step 5: Action Mapping (Navigation Logic)
        """
        intent = intent_data.get("intent")
        entities = intent_data.get("entities", {})

        base_path = "/"
        params = {}

        if intent == "VIEW_FEES":
            base_path = "/finance/student-dues"
        elif intent == "VIEW_ATTENDANCE":
            base_path = "/attendance/calendar"
        elif intent == "VIEW_REPORT":
            # Assuming logic for report route
            base_path = "/academic/result"
        elif intent == "LOGOUT":
            base_path = "/auth/logout"
        else:
            # Fallback
            base_path = "/dashboard"

        # Add entities as query params
        if entities:
            params.update(entities)

        redirect_url = base_path
        if params:
            redirect_url += "?" + urlencode(params)

        return {
            "intent": intent,
            **entities,
            "redirectUrl": redirect_url
        }

command_mapper = CommandMapper()
