# Flaky Test Autopilot - E2E Test Suite

This repository contains comprehensive E2E tests to validate all critical functionality of the Flaky Test Autopilot system.

## 📁 Test Structure

```
tests/
├── with-deps/              # Tests with dependencies (validates import parsing)
│   ├── auth-with-deps.test.js
│   ├── api-with-deps.test.js
│   └── database-with-deps.test.js
├── patterns/               # Common flaky test patterns
│   ├── timing-sensitive.test.js 
│   ├── async-await.test.js
│   ├── random-data.test.js
│   └── external-dependency.test.js
├── python-deps/            # Python tests with imports
│   ├── helpers.py
│   └── test_with_imports.py
└── [existing tests]        # Original test files

src/
├── auth-helper.js          # Dependency for testing import parsing
├── api-client.js           # Dependency for testing import parsing
└── database.js             # Dependency for testing import parsing
```

## 🎯 What This Tests

### 1. Import Parsing & Dependency Tracking ✅

**Test Files:**
- `tests/with-deps/auth-with-deps.test.js`
- `tests/with-deps/api-with-deps.test.js`
- `tests/with-deps/database-with-deps.test.js`
- `tests/python-deps/test_with_imports.py`

**Validates:**
- Action correctly parses `require()` statements in JavaScript
- Action correctly parses `from ... import` statements in Python
- Dependency hashes include imported file content
- Hash changes when dependency changes
- Hash stays same when unrelated code changes

**Expected CI Output:**
```
🔍 Calculating dependency hash for: test_email_validation_flaky
  📦 Test: auth-with-deps.test.js
  🔗 Found 1 local import(s)
     ✅ auth-helper.js
  🔐 Combined hash: abc123...
```

### 2. Flaky Test Detection ✅

**Test Files:**
- `tests/patterns/timing-sensitive.test.js` - Race conditions, timeouts
- `tests/patterns/async-await.test.js` - Missing await
- `tests/patterns/random-data.test.js` - Non-deterministic data
- `tests/patterns/external-dependency.test.js` - Network/filesystem flakiness

**Validates:**
- System detects tests with intermittent failures
- Pass rate calculated correctly
- Flaky tests distinguished from broken tests
- Stable tests not flagged as flaky

**Expected Flaky Tests (after multiple runs):**
| Test Name | Expected Pass Rate | Pattern |
|-----------|-------------------|---------|
| `test_email_validation_flaky` | ~70% | Random condition |
| `test_api_call_with_retry` | ~70% | Network flakiness |
| `test_user_update_flaky` | ~60% | State pollution |
| `test_race_condition_flaky` | ~50% | Race condition |
| `test_missing_await_flaky` | Variable | Missing await |
| `test_random_number_flaky` | ~50% | Random data |
| `test_network_call_flaky` | ~70% | Network error |
| `test_flaky_with_import` | ~70% | Random (Python) |

### 3. XML Output Generation ✅

**Validates:**
- Jest generates `test-results/junit.xml`
- Pytest generates `test-results/pytest-junit.xml`
- All tests appear in XML files
- Test names, status, timing captured correctly

### 4. Hash Invalidation ✅

**Test Scenario:**
1. Run tests → Record hash for `auth-with-deps.test.js`
2. Modify `src/auth-helper.js` (change function logic)
3. Run tests → Hash should change
4. Revert `src/auth-helper.js` back
5. Run tests → Hash should return to original
6. Modify unrelated file (e.g., `src/database.js`)
7. Run tests → Hash should NOT change

**How to Test:**
```bash
# First run
npm test
# Note hash in CI output

# Modify dependency
echo "// CHANGED" >> src/auth-helper.js
npm test
# Hash should be different

# Revert
git checkout src/auth-helper.js
npm test
# Hash should match original
```

### 5. Multi-Framework Support ✅

**Frameworks Tested:**
- ✅ Jest (JavaScript)
- ✅ Pytest (Python)

**Validates:**
- Both frameworks generate XML correctly
- Import parsing works for both languages
- All test results sent to API

### 6. Performance ✅

**Validates:**
- Action completes in reasonable time
- Parsing 20+ tests < 5 seconds
- Hash calculation efficient

## 🚀 Running Tests Locally

```bash
# Install dependencies
npm install
pip install pytest pytest-asyncio

# Run JavaScript tests
npm test

# Run Python tests
pytest tests/test_async.py tests/python-deps/

# Run specific test suites
npm run test:deps       # Only tests with dependencies
npm run test:patterns   # Only pattern tests
```

## 🔬 CI Pipeline Validation

When you push to GitHub, the CI pipeline will:

1. **Run all tests** (JavaScript + Python)
2. **Generate XML files**
3. **Send results to Flaky Autopilot**
4. **Calculate dependency hashes**
5. **Parse imports**

### Check CI Logs For:

✅ **Import Parsing:**
```
🔗 Found 1 local import(s)
   ✅ auth-helper.js
```

✅ **Hash Calculation:**
```
🔐 Combined hash: abc123...
```

✅ **XML Generation:**
```
📦 Found 2 test result file(s)
  Parsing: test-results/pytest-junit.xml
  Parsing: test-results/junit.xml
✅ Parsed 25+ test(s)
```

✅ **API Submission:**
```
📤 Sending 25 test results to API...
✅ Results sent successfully
```

## 📊 Expected Outcomes After Multiple Runs

After running CI 10+ times, you should see in the dashboard:

### Flaky Tests Detected (8-10 tests):
- `test_email_validation_flaky` - ~70% pass
- `test_api_call_with_retry` - ~70% pass
- `test_user_update_flaky` - ~60% pass
- `test_race_condition_flaky` - ~50% pass
- `test_random_number_flaky` - ~50% pass
- `test_random_array_flaky` - Variable pass
- `test_network_call_flaky` - ~70% pass
- `test_flaky_with_import` - ~70% pass

### Stable Tests (15+ tests):
- All tests with "stable" in name
- All tests in original test suite that are properly written

### AI-Generated Fix PRs:
System should create PRs with fixes for:
- Missing `await` keywords
- Race condition fixes (proper synchronization)
- Random data fixes (use deterministic seeds)
- State pollution fixes (proper cleanup)

## 🧪 Manual Test Scenarios

### Scenario 1: Validate Import Parsing

1. Push code to GitHub
2. Check CI logs
3. Look for tests with dependencies
4. Verify you see: `🔗 Found N local import(s)`
5. Verify dependency files listed with ✅

### Scenario 2: Validate Hash Invalidation

1. Note hash for `auth-with-deps.test.js` in CI logs
2. Modify `src/auth-helper.js`:
   ```javascript
   function validateEmail(email) {
     console.log('MODIFIED'); // Add this line
     return email && email.includes('@');
   }
   ```
3. Push and run CI
4. Verify hash changed in logs
5. Revert change and verify hash returns to original

### Scenario 3: Validate Flaky Detection

1. Trigger CI workflow 10 times (use workflow_dispatch or push 10 times)
2. Check dashboard after all runs complete
3. Verify flaky tests detected with correct pass rates
4. Verify stable tests not flagged as flaky

### Scenario 4: Validate PR Fixes

1. Wait for flaky tests to be detected
2. Check for incoming PRs from AI
3. Review PR descriptions and fixes
4. Merge PR and verify test becomes stable

## 📈 Success Criteria

✅ All test files run successfully in CI
✅ XML files generated for both Jest and Pytest
✅ Import parsing shows correct dependency count
✅ Hashes calculated for all tests
✅ Hashes change when dependencies change
✅ Flaky tests detected after multiple runs
✅ Dashboard shows accurate test data
✅ System handles rate limits gracefully
✅ CI pipeline never breaks due to flaky autopilot

## 🐛 Troubleshooting

**No XML files generated:**
- Check test framework configuration
- Verify output directory exists
- Check test command in CI workflow

**Import parsing shows 0 dependencies:**
- Verify test files actually import from src/
- Check import syntax is correct
- Look for warnings in CI logs

**Hashes not changing:**
- Verify you're modifying the correct dependency file
- Check that test actually imports that file
- Clear any caches

**Flaky tests not detected:**
- Run more CI builds (need 10+ runs)
- Verify tests actually fail intermittently
- Check API submission succeeded

## 📝 Next Steps

After validating E2E tests:
1. Run CI pipeline 10-15 times to collect data
2. Review dashboard for detected flaky tests
3. Evaluate AI-generated fix PRs
4. Measure accuracy of flaky detection
5. Validate hash invalidation works correctly
6. Document any issues found
