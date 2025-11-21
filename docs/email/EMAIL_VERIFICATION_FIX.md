# Email Verification Code Issue - Fix Guide

## Problem
Users are not receiving verification codes when signing up. Error: "Cannot resend codes. Auto verification not turned on"

## Root Cause
The Cognito user pool configuration has a mismatch between Terraform settings and actual AWS configuration. The `auto_verified_attributes` setting is preventing proper code delivery.

## Solutions Applied

### 1. Updated Cognito Configuration
- Removed `auto_verified_attributes = ["email"]` from Terraform
- Configured verification message template properly
- Set up SES for email sending (more reliable than Cognito default)

### 2. Enhanced Frontend Error Handling
- Better error messages for verification issues
- Auto-retry code sending if initial delivery fails
- Improved logging for debugging

### 3. Created Custom Email Sender (Optional)
- Lambda function created: `esade-career-dev-cognito-email-sender`
- Can be used as backup if Cognito default fails

## Immediate Fix Steps

### Option 1: Manual Code Resend (For Existing Users)
If a user already signed up but didn't receive a code:

1. Go to AWS Cognito Console
2. Find the user in the user pool
3. Click "Resend verification code"
4. Or use AWS CLI:
```bash
aws cognito-idp admin-create-user \
  --user-pool-id eu-west-1_ezRebP9qf \
  --username user@alumni.esade.edu \
  --message-action RESEND \
  --region eu-west-1
```

### Option 2: Delete and Re-signup
1. Delete the unconfirmed user from Cognito
2. Have them sign up again
3. The code should be sent automatically

### Option 3: Manual Verification (Admin)
```bash
aws cognito-idp admin-update-user-attributes \
  --user-pool-id eu-west-1_ezRebP9qf \
  --username user@alumni.esade.edu \
  --user-attributes Name=email_verified,Value=true \
  --region eu-west-1
```

## Testing Verification

1. **Sign up with a new email**
2. **Check email inbox** (and spam folder)
3. **If no code received:**
   - Click "Resend Code" button
   - Check browser console for errors
   - Check CloudWatch Logs for Cognito

## Current Configuration

- **User Pool**: `eu-west-1_ezRebP9qf`
- **Email Service**: SES (configured)
- **From Email**: `laura.rodriguez15@alumni.esade.edu` (verified)
- **Verification Method**: Code-based (CONFIRM_WITH_CODE)

## Next Steps

1. **Test with a new signup** - Try creating a new account
2. **Check email delivery** - Verify codes are being sent
3. **Monitor CloudWatch** - Check for any errors
4. **If still not working**: Consider using custom email sender Lambda

## Troubleshooting

### Check if code was sent:
```bash
aws cognito-idp admin-get-user \
  --user-pool-id eu-west-1_ezRebP9qf \
  --username user@alumni.esade.edu \
  --region eu-west-1
```

### Check SES sending:
- Go to SES Console → Sending Statistics
- Check for bounces or complaints
- Verify email is still verified

### Check Cognito Logs:
- CloudWatch → Log Groups → `/aws/cognito/userpool/eu-west-1_ezRebP9qf`

---

**Status**: Configuration updated, testing needed
**Last Updated**: November 20, 2025

