"""Level 1: Core module"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from py_level2.middleware import level2_function

def level1_core_function():
    return level2_function() + " -> L1:core"

def level1_helper_a():
    return "L1:helper_a"

def level1_helper_b():
    return "L1:helper_b"
