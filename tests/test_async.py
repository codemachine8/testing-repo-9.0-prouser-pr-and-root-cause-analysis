# Python test file for multi-language support

import pytest
import random
import asyncio

class MockUser:
    def __init__(self, email):
        self.email = email
        self.is_logged_in = random.random() > 0.3  # Flaky: 30% chance of failure

async def login_user(email):
    """Async login function that's flaky"""
    await asyncio.sleep(0.01)  # Simulate async operation
    return MockUser(email)

class TestAsyncFixture:
    def test_async_fixture(self):
        """Test with async fixture that's flaky"""
        # This test is intentionally flaky - missing async handling
        result = asyncio.run(login_user('test@example.com'))
        assert result.is_logged_in == True

