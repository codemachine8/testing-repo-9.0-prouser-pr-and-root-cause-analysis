# Python tests with imports - validates Python import parsing
import pytest
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from helpers import flaky_function, stable_function, UserService

class TestWithDependencies:
    def test_flaky_with_import(self):
        """Flaky test that imports from helpers.py"""
        # If helpers.py changes, hash should change
        result = flaky_function()
        assert result == True, "Flaky function failed"

    def test_stable_with_import(self):
        """Stable test that imports from helpers.py"""
        result = stable_function()
        assert result == True

    def test_user_service_flaky(self):
        """Flaky test using imported class"""
        service = UserService()
        service.create_user('user1', 'Alice')

        # Flaky: forgets to clear state
        user = service.get_user('user1')
        assert user is None, "User should not exist"
