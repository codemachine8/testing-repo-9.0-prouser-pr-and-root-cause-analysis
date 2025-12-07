"""Test: 4-level deep import chain in Python
Validates that changes at ANY level trigger hash change
L1 -> L2 -> L3 -> L4
"""
import pytest
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../src'))

from py_level1.core import level1_core_function, level1_helper_a
from py_level2.middleware import level2_processor_a
from py_level4.database import level4_transaction, level4_query
from py_level4.logger import level4_log_error

class TestDeepImportChain:
    def test_4_level_import_chain(self):
        """Test depends on: L1 -> L2 -> L3 -> L4
        If L4 changes, hash should change"""
        result = level1_core_function()
        assert "L4:database" in result
        assert "L1:core" in result

    def test_4_level_flaky_transaction(self):
        """Flaky: L4 database transaction fails 30% of time
        Tests dependency tracking with flaky deep import"""
        try:
            result = level4_transaction()
            assert result == "L4:transaction"
        except Exception as e:
            # Expected flakiness from deep dependency
            assert "transaction failed" in str(e)

    def test_4_level_logger_flaky(self):
        """Flaky: L4 logger fails 20% of time"""
        try:
            result = level4_log_error()
            assert result == "L4:log_error"
        except Exception as e:
            assert "Logger failed" in str(e)

    def test_multiple_deep_imports(self):
        """Tests that importing multiple deep chains works"""
        a = level1_helper_a()
        b = level2_processor_a()
        c = level4_query()

        assert a == "L1:helper_a"
        assert "L4:logger" in b
        assert c == "L4:query"

    def test_stable_with_deep_deps(self):
        """Stable test with deep dependencies
        Verifies hash calculation includes all levels"""
        result = level1_core_function()
        assert isinstance(result, str)
        assert len(result) > 0
