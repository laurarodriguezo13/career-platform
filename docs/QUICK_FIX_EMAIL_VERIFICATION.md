# Quick Fix for Email Verification - Demo Mode

## Problem
Email verification codes are not being delivered because SES is still in sandbox mode (awaiting production access approval). This prevents new users from signing up during demos.

## Solution
**Temporary Auto-Verification** - ESADE emails are now automatically verified during signup for demo purposes.

## What Changed

### Pre-Signup Lambda Update
The `cognito_trigger` Lambda now auto-verifies ESADE emails, allowing users to sign up immediately without needing verification codes.

**Code Change:**
```python
# Auto-verify ESADE emails to bypass SES sandbox mode
event['response']['autoConfirmUser'] = True
event['response']['autoVerifyEmail'] = True
```

### How It Works
1. User enters ESADE email (@esade.edu or @alumni.esade.edu)
2. Pre-Signup Lambda validates the domain
3. Email is **automatically verified** (no code needed)
4. User can sign in immediately

### Benefits for Demo
- ✅ No verification codes needed
- ✅ Instant signup for ESADE users
- ✅ No SES production access required
- ✅ Works for all demos and testing

## Reverting After SES Approval

Once SES production access is approved, you can revert this by:

### Option 1: Environment Variable
Set Lambda environment variable:
```bash
aws lambda update-function-configuration \
  --function-name esade-career-dev-cognito-trigger \
  --environment Variables="{AUTO_VERIFY_ENABLED=false}" \
  --region eu-west-1
```

### Option 2: Update Lambda Code
Change in `backend/cognito_trigger/lambda_function.py`:
```python
AUTO_VERIFY_ENABLED = os.environ.get('AUTO_VERIFY_ENABLED', 'false').lower() == 'true'
```

Then redeploy the Lambda.

## Current Status
- ✅ **Demo Mode**: Auto-verification enabled
- ⚠️ **SES Status**: Sandbox mode (awaiting production access)
- ✅ **Domain Validation**: Still enforced (@esade.edu, @alumni.esade.edu)

## Testing
1. Go to the platform: https://d3c9hkwje42pil.cloudfront.net
2. Click "Sign Up"
3. Enter an ESADE email (e.g., `test@esade.edu`)
4. Enter password (meets requirements)
5. Click "Sign Up"
6. **No verification code needed** - can sign in immediately!

## Notes
- This is a **temporary fix** for demo purposes
- Domain validation is still enforced (ESADE emails only)
- Once SES production access is approved, we can revert to code-based verification
- All security measures remain in place (password policy, domain restriction)

---

**Status**: Active for demos
**Last Updated**: 2025-01-20

