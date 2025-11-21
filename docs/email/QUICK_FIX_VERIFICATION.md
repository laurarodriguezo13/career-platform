# Quick Fix for Email Verification

## The Problem
Cognito is not sending verification codes. The error "Cannot resend codes. Auto verification not turned on" appears.

## Immediate Solution

### For Existing Unconfirmed Users:
I've manually verified `bruno.marco@alumni.esade.edu`. They can now sign in directly.

### For New Signups:
The issue is that Cognito's default email service (`COGNITO_DEFAULT`) may have limitations. 

## Quick Workarounds

### Option 1: Manual Verification (Admin)
For any user who signs up but doesn't receive a code:

```bash
aws cognito-idp admin-update-user-attributes \
  --user-pool-id eu-west-1_ezRebP9qf \
  --username user@alumni.esade.edu \
  --user-attributes Name=email_verified,Value=true \
  --region eu-west-1
```

Then they can sign in directly.

### Option 2: Delete and Re-signup
1. Delete the unconfirmed user
2. Have them sign up again
3. Check if code is sent this time

### Option 3: Use AWS Console
1. Go to Cognito Console → User Pools → esade-career-dev-user-pool
2. Find the user
3. Click "Resend verification code" or "Mark email as verified"

## Root Cause
Cognito's default email service may not be reliably sending verification emails. The configuration shows:
- `EmailSendingAccount: COGNITO_DEFAULT` (not SES)
- `AutoVerifiedAttributes: null` (should allow codes)

## Permanent Fix Needed
We should configure Cognito to use SES instead of the default email service. This requires:
1. SES email verified ✅ (already done)
2. IAM role for Cognito to use SES ✅ (created)
3. Update Cognito to use SES email configuration

## Testing
Try signing up with a NEW email address and see if the code arrives. If not, we'll need to:
1. Configure Cognito to use SES properly
2. Or use the manual verification workaround

---

**Current Status**: Workarounds available, permanent fix in progress
**Test User**: bruno.marco@alumni.esade.edu - manually verified, can sign in now

