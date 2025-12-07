# Python helper module - for testing Python import parsing
import random

def flaky_function():
    """Returns True 70% of the time"""
    return random.random() > 0.3

def stable_function():
    """Always returns True"""
    return True

class UserService:
    def __init__(self):
        self.users = {}

    def create_user(self, user_id, name):
        self.users[user_id] = {'name': name}
        return self.users[user_id]

    def get_user(self, user_id):
        return self.users.get(user_id)
