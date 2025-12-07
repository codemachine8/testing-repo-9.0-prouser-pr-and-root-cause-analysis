"""Level 3: Services module"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from py_level4.database import level4_database

def level3_service():
    return level4_database() + " -> L3:service"

def level3_api_call():
    return "L3:api_call"
