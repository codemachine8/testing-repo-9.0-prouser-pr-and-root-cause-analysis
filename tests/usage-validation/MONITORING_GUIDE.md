# Usage System Validation Guide

This guide explains how to validate that the new usage/billing system works correctly.

## Configuration Files

All billing and system parameters are centralized in config files:

| Config File | Purpose | Key Settings |
|-------------|---------|--------------|
| `src/shared/config/billing.config.ts` | Plan limits, pricing, conversion triggers | `aiAnalysesPerMonth`, `prsPerMonth`, `warningThreshold` |
| `src/shared/config/flake-detection.config.ts` | Flake detection thresholds | `minRunsForFlakeScore`, `passRateThreshold` |
| `src/shared/config/llm.config.ts` | AI/LLM settings | `maxImports`, `maxTokensForContext`, `confidenceThreshold` |

### Quick Reference: Change Plan Limits
```typescript
// In billing.config.ts
plans: {
  free: {
    aiAnalysesPerMonth: 10,  // ← Change this to 20
    prsPerMonth: 3,          // ← Or this to 5
  },
  starter: { ... },
  pro: { ... },
}  
```

### Environment Variable Overrides
You can also override via env vars without code changes:
```bash 
FREE_AI_ANALYSES=20
FREE_PRS=5
STARTER_AI_ANALYSES=200
BILLING_WARNING_THRESHOLD=0.75
```

---

## New Billing Model

### What Gets Counted
| Event | Counts As | When |
|-------|-----------|------|
| Test results from CI | **FREE** (unlimited) | Every CI run |
| Flake detection | **FREE** (unlimited) | Automatic |
| Dashboard access | **FREE** (unlimited) | Always |
| AI Root Cause Analysis | **1 AI analysis** | When flaky test is analyzed |
| Fix PR Generated | **1 PR** | When AI creates a fix PR |

### Free Tier Limits (Configurable)
- **10 AI analyses/month** (env: `FREE_AI_ANALYSES`)
- **3 fix PRs/month** (env: `FREE_PRS`)
- Unlimited test monitoring

---

## Dashboard Monitoring Checklist

### 1. Main Dashboard (`/`)
- [ ] **Health Score** - Should update as tests run
- [ ] **Tests monitored** - Should count ALL tests (unlimited)
- [ ] **PRs Created** - Should match your PR limit usage

### 2. Settings Page (`/settings`)
Check the **Usage** section:
- [ ] "AI Analyses Used" - Should show X/10 for free tier
- [ ] "PRs Generated" - Should show X/3 for free tier
- [ ] Progress bars should fill as usage increases

### 3. Admin Dashboard (`/admin`)
Look for these metrics:
- [ ] **AI Analyses This Month** - Total across all users
- [ ] **PRs Generated This Month** - Total across all users  
- [ ] **Tests Analyzed** - This is different from AI analyses!
- [ ] **Usage by User** - Check individual breakdowns

### 4. Individual Test Pages (`/tests/[id]`)
For each test, verify:
- [ ] **Consistently Failing** tests show "Not a Flaky Test" badge
- [ ] **Stable** tests show "Stable" badge
- [ ] **Flaky** tests show analysis and may have fix PRs
- [ ] Reanalyze button should increment AI analysis counter

### 5. Fixes Page (`/fixes`)
- [ ] Only flaky tests (5-95% pass rate) should have fix attempts
- [ ] Consistently failing tests should NOT have fix attempts
- [ ] Stable tests should NOT have fix attempts

---

## Validation Steps

### Step 1: Run Tests Multiple Times
```bash
# Run CI workflow 5+ times to build test history
# The system needs multiple runs to detect flakiness
```

### Step 2: Check Test Classification
After 5+ runs, verify in the dashboard:

| Test Type | Expected Pass Rate | Expected Behavior |
|-----------|-------------------|-------------------|
| `timing_dependent_api_call` | ~50% | Should be marked as FLAKY |
| `async_race_condition` | ~30-50% | Should be marked as FLAKY |
| `deterministic_calculation` | 100% | Should be marked as STABLE |
| `always_fails_assertion` | 0% | Should be marked as CONSISTENTLY FAILING |
| `borderline_flaky_low` | ~92% | Should be marked as FLAKY (barely) |
| `borderline_flaky_high` | ~8% | Should be marked as CONSISTENTLY FAILING |

### Step 3: Verify AI Analysis Triggering
1. Note your current "AI Analyses Used" count
2. Navigate to a FLAKY test page
3. Click "Reanalyze" button
4. Verify "AI Analyses Used" increased by 1
5. Verify STABLE tests don't trigger analysis
6. Verify CONSISTENTLY FAILING tests don't trigger analysis

### Step 4: Verify PR Generation
1. Note your current "PRs Generated" count
2. After AI analysis of a flaky test, check if PR was created
3. Verify PRs are NOT created for:
   - Stable tests (>95% pass rate)
   - Consistently failing tests (<5% pass rate)
4. Verify "PRs Generated" count increased only for flaky tests

### Step 5: Verify Limits
1. Use up your free tier (10 analyses, 3 PRs)
2. Try to trigger another analysis
3. Verify you see an "upgrade" prompt or limit message
4. Verify the system doesn't process more than your limit

---

## Expected Test Behaviors

### Tests That SHOULD Trigger AI Analysis + PR
```
✅ timing_dependent_api_call
✅ async_race_condition  
✅ network_latency_variance
✅ async_ordering_dependency
✅ All flaky_batch1_* tests
✅ All flaky_batch2_* tests
✅ All pr_trigger_* tests
```

### Tests That Should NOT Trigger AI Fix (Stable)
```
❌ deterministic_calculation (100% pass)
❌ string_concatenation (100% pass)
❌ array_operations (100% pass)
❌ object_manipulation (100% pass)
```

### Tests That Should NOT Trigger AI Fix (Broken)
```
❌ always_fails_assertion (0% pass)
❌ missing_dependency_error (0% pass)
❌ borderline_flaky_high (~8% pass - below 5% threshold? Check!)
```

---

## Troubleshooting

### "AI analysis count not increasing"
- Check if the test is actually FLAKY (5-95% pass rate)
- Verify the test has enough runs (need 5+ for detection)
- Check backend logs for errors

### "PR not generated for flaky test"
- Check if you've hit your PR limit (3/month free)
- Verify the test pass rate is between 5-95%
- Check if AI analysis completed successfully

### "Wrong test classification"
- Ensure enough CI runs have completed (5+ recommended)
- Check the pass rate calculation in test details
- Verify test outcomes are being recorded

---

## Database Queries for Validation

If you have database access, run these to verify:

```sql
-- Check AI analysis events this month
SELECT COUNT(*) as ai_analyses
FROM usage_events 
WHERE event_type = 'ai_analysis' 
AND created_at >= date_trunc('month', CURRENT_DATE);

-- Check PR creation events this month
SELECT COUNT(*) as prs_created
FROM usage_events 
WHERE event_type = 'pr_created' 
AND created_at >= date_trunc('month', CURRENT_DATE);

-- Verify test categories
SELECT 
  test_name,
  pass_rate,
  CASE 
    WHEN pass_rate < 0.05 THEN 'CONSISTENTLY_FAILING'
    WHEN pass_rate > 0.95 THEN 'STABLE'
    ELSE 'FLAKY'
  END as category
FROM tests
WHERE repo_id = 'YOUR_REPO_ID';
```

---

## Success Criteria

✅ **Usage system is working if:**

1. Running 100 tests does NOT use up 100 analyses (unlimited monitoring)
2. Only FLAKY tests trigger AI analysis
3. Only FLAKY tests get fix PRs
4. Consistently failing tests show "Debug This" message
5. Stable tests show "No action needed" message
6. Usage counters accurately reflect AI analyses and PRs only
7. Hitting limits prevents further processing (not crashes)

---

*Last updated: December 2024*

