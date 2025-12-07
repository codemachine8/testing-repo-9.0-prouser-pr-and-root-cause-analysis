# E2E Test Scenarios

This test suite validates all critical functionality of the Flaky Test Autopilot system.

## Test Categories

### 1. **Tests with Dependencies** (`tests/with-deps/`)
Tests that import from source files to validate:
- ✅ Import parsing works correctly
- ✅ Dependency hashing includes imported code
- ✅ Hash changes when dependency code changes
- ✅ Hash stays same when unrelated code changes
 
**Files:**
- `auth-with-deps.test.js` → imports `src/auth-helper.js`
- `api-with-deps.test.js` → imports `src/api-client.js`
- `database-with-deps.test.js` → imports `src/database.js`

### 2. **Flaky Patterns** (`tests/patterns/`)
Realistic flaky test patterns found in production:

**Timing Issues:**
- Race conditions
- Timeout sensitivity
- Missing await

**Randomness:**
- Random data generation
- Non-deterministic behavior
- Unstable array ordering

**External Dependencies:**
- Network calls
- File system operations

### 3. **Python Tests with Imports** (`tests/python-deps/`)
Validates Python-specific functionality:
- ✅ Python import parsing (`from .helpers import ...`)
- ✅ Dependency tracking for Python modules
- ✅ Hash calculation for Python test files

### 4. **Multi-Framework Support**
Tests across multiple testing frameworks:
- Jest (JavaScript)
- Pytest (Python)

## Expected Behaviors

### Hash Invalidation Test
1. Run tests → Record hashes
2. Modify `src/auth-helper.js`
3. Run tests again → Hash should change for `auth-with-deps.test.js`
4. Modify unrelated file
5. Run tests again → Hash should stay same

### Flaky Detection Test
Expected flaky tests (should be detected):
- `test_email_validation_flaky` - 70% pass rate
- `test_api_call_with_retry` - 70% pass rate (network flakiness)
- `test_user_update_flaky` - 60% pass rate (state pollution)
- `test_race_condition_flaky` - 50% pass rate
- `test_missing_await_flaky` - Variable pass rate
- `test_random_number_flaky` - 50% pass rate
- `test_network_call_flaky` - 70% pass rate
- `test_flaky_with_import` (Python) - 70% pass rate

Expected stable tests:
- `test_password_hashing_stable`
- `test_user_read_stable`
- `test_proper_await_stable`
- `test_stable_with_import` (Python)

### Import Parsing Test
Action logs should show:
```
🔍 Calculating dependency hash for: test_email_validation_flaky
  📦 Test: auth-with-deps.test.js
  🔗 Found 1 local import(s)
     ✅ auth-helper.js
  🔐 Combined hash: abc123...
```

### XML Output Test
Should generate:
- `test-results/junit.xml` (Jest tests)
- `test-results/pytest-junit.xml` (Python tests)

All test results should be parsed and sent to API.

## Running the Tests

```bash
# Run all JavaScript tests
npm test

# Run Python tests
pytest tests/python-deps/

# Run full CI pipeline
# Push to GitHub and check Actions tab
```

## Validation Checklist

After running CI pipeline, verify:

1. **XML Generation**
   - [ ] Both `junit.xml` and `pytest-junit.xml` created
   - [ ] All tests appear in XML files

2. **Import Parsing**
   - [ ] Tests with dependencies show "Found N local import(s)"
   - [ ] Dependency files are listed with ✅

3. **Hash Calculation**
   - [ ] Each test has unique hash
   - [ ] Hash changes when dependency changes
   - [ ] Hash stays same when unrelated code changes

4. **Flaky Detection** (after multiple runs)
   - [ ] Flaky tests detected with correct pass rate
   - [ ] Stable tests not flagged as flaky
   - [ ] Dashboard shows flaky tests

5. **Framework Support**
   - [ ] Jest tests parsed correctly
   - [ ] Pytest tests parsed correctly
   - [ ] All test results sent to API

## Performance Metrics

Target performance:
- Parse 100 tests: < 2 seconds
- Calculate hashes: < 1 second per test
- Send to API: < 5 seconds

Monitor CI logs for timing information.
