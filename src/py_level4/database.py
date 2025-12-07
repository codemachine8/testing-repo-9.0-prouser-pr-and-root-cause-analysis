"""Level 4: Database (deepest)"""
import random

def level4_database():
    return "L4:database"

def level4_query():
    return "L4:query"

def level4_transaction():
    """Flaky - fails 30% of the time"""
    if random.random() < 0.3:
        raise Exception("Database transaction failed")
    return "L4:transaction"
