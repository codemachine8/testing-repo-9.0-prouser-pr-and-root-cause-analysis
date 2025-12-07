"""Level 4: Logger (deepest)"""
import random

def level4_logger():
    return "L4:logger"

def level4_log_error():
    """Flaky - fails 20% of the time"""
    if random.random() < 0.2:
        raise Exception("Logger failed")
    return "L4:log_error"
