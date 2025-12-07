"""Level 3: Utils module"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from py_level4.logger import level4_logger

def level3_utils():
    return level4_logger() + " -> L3:utils"

def level3_transform():
    return "L3:transform"
