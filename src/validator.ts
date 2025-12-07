// TypeScript validator for testing ES6 import detection

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];

  if (username.length < 3) {
    errors.push('Username too short');
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username contains invalid characters');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateAge(age: number): ValidationResult {
  const errors: string[] = [];

  if (age < 0) {
    errors.push('Age cannot be negative');
  }

  if (age > 150) {
    errors.push('Age is unrealistic');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
