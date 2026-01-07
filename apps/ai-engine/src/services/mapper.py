class CommandMapper:
    def __init__(self):
        self.routes = {
            "VIEW_FEES": "/finance/student-dues",
            "VIEW_REPORT": "/academic/result", # Assuming this based on context
            "VIEW_ATTENDANCE": "/attendance/calendar",
            "LOGOUT": "/auth/logout"
        }

    def get_redirect_url(self, intent: str, entities: dict) -> str:
        """
        Constructs the redirect URL with query parameters.
        """
        base_url = self.routes.get(intent)
        if not base_url:
            return None

        # Construct query params
        params = []
        if "class" in entities:
            params.append(f"class={entities['class']}")
        if "section" in entities:
            params.append(f"section={entities['section']}")
        if "month" in entities:
            params.append(f"month={entities['month']}")

        if params:
            return f"{base_url}?{'&'.join(params)}"
        return base_url
