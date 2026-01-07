# Manual Test Plan for Localization & Voice Input

## 1. Localization Check
1.  Open the App.
2.  Navigate to **Settings** screen.
3.  Check the current language (Default should be English).
4.  Change language to **Hindi**.
5.  Verify that UI elements (e.g., 'Attendance' -> 'উপস্থিতি (Upasthiti)') update immediately.
6.  Restart the App.
7.  Verify that the language persists as Hindi.

## 2. Voice Input Setup
1.  Ensure Internet is enabled (for online speech recognition).
2.  Grant Microphone permission when prompted.

## 3. Locale-Aware Voice Input
1.  Set App Language to **English**.
2.  Tap the Mic icon on the "Remarks" field in Settings.
3.  Speak "Hello World".
4.  Verify text "Hello World" is appended.
5.  Set App Language to **Hindi**.
6.  Tap the Mic icon.
7.  Speak a Hindi sentence (e.g., "नमस्ते").
8.  Verify Hindi text is transcribed.

## 4. Manual Voice Language Override
1.  Set App Language to **Hindi**.
2.  Tap the Mic icon.
3.  In the Bottom Sheet overlay, change the Dropdown from "Hindi" to "English".
4.  Speak "Testing Override".
5.  Verify English text is transcribed despite App Language being Hindi.

## 5. Offline Hindi Dictation Test
1.  **Prerequisite**: Ensure the device has the Hindi offline language pack installed in Google Voice Typing settings.
2.  Set the device to **Airplane Mode**.
3.  Change App Language to **Hindi**.
4.  Open the 'Remarks' field and tap the Mic.
5.  Speak a Hindi sentence.
6.  Verify if the text is transcribed. (Success depends on device capabilities).

## 6. Error Handling
1.  Deny Microphone permission or disable Microphone access.
2.  Tap Mic icon.
3.  Verify "Voice input failed" SnackBar appears.
4.  Verify keyboard pops up as fallback.
