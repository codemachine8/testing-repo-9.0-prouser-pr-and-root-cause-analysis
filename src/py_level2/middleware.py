"""Level 2: Middleware module"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from py_level3.services import level3_service
from py_level3.utils import level3_utils

def level2_function():
    return level3_service() + " -> L2:middleware"

def level2_processor_a():
    return level3_utils() + " -> L2:processor_a"

def level2_processor_b():
    return "L2:processor_b"
