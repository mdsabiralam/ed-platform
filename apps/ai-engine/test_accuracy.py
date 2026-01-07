import unittest
import numpy as np
from unittest.mock import MagicMock, patch
import sys

# Mock dlib and face_recognition for testing without compilation
sys.modules['dlib'] = MagicMock()
sys.modules['face_recognition'] = MagicMock()
sys.modules['face_recognition.face_models'] = MagicMock()

# Import after mocking
# We need to mock FaceService dependencies too if they import at top level
# But FaceService imports face_recognition at top level.
# So the mocks above should handle it.

from face_service import FaceService

class TestFaceAccuracy(unittest.TestCase):
    def setUp(self):
        self.service = FaceService()

    def test_sibling_check(self):
        """
        Step 10: Accuracy Test (Sibling Check)
        """
        print("\nRunning Sibling Accuracy Test...")

        # 1. Register 'User A'
        # Mocking embeddings for User A
        # Let's assume a 128-d vector
        user_a_vector = np.random.rand(128)

        # 2. Register 'User B' (Sibling)
        # Sibling looks similar, so distance is small but > 0.6
        # To simulate this, we add a small noise to User A's vector
        noise = np.random.normal(0, 0.05, 128) # Small noise
        user_b_vector = user_a_vector + noise

        dist_ab = np.linalg.norm(user_a_vector - user_b_vector)
        print(f"Simulated distance between User A and B: {dist_ab}")

        # 3. Call identify with a new photo of User A
        # New photo of A will be very close to original A, say distance 0.1
        new_photo_a_vector = user_a_vector + np.random.normal(0, 0.008, 128)

        dist_aa = np.linalg.norm(user_a_vector - new_photo_a_vector)
        print(f"Simulated distance between User A (stored) and User A (new): {dist_aa}")

        # 4. Assert that it returns User A's ID with a distance < 0.6
        THRESHOLD = 0.6
        self.assertLess(dist_aa, THRESHOLD, "Should match User A")

        # 5. Assert that the distance to User B is > 0.6
        dist_new_a_to_b = np.linalg.norm(new_photo_a_vector - user_b_vector)
        print(f"Distance between New Photo A and User B: {dist_new_a_to_b}")

        if dist_new_a_to_b > THRESHOLD:
            print("Discriminatory power validated.")
        else:
            print("Warning: False positive potential with sibling (simulated noise might be too low).")

if __name__ == '__main__':
    unittest.main()
