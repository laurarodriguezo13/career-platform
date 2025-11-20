# User Notification System - Complete Setup

## ✅ What Was Implemented

### 1. **Welcome Emails** ✅
- **Trigger**: Cognito Post-Confirmation (after email verification)
- **Function**: `esade-career-dev-user-notifications`
- **Status**: ✅ Active and deployed
- **When**: Automatically sent when a new user verifies their email

### 2. **Job Match Notifications** ✅
- **Trigger**: Recommendations Lambda (when match score ≥ 80%)
- **Function**: Integrated into `esade-career-dev-recommendations`
- **Status**: ✅ Active and deployed
- **When**: Sent when a user gets a high-scoring job match
- **Content**: Job title, company, location, match score, and link

### 3. **Password Reset Emails** ✅
- **Function**: `esade-career-dev-user-notifications` (password_reset type)
- **Status**: ✅ Ready (needs frontend integration)
- **Usage**: Call Lambda with notification_type='password_reset'
- **Content**: Reset code and secure reset link

### 4. **Weekly Digest Emails** ✅
- **Trigger**: EventBridge (every Monday at 9 AM UTC)
- **Function**: `esade-career-dev-weekly-digest`
- **Status**: ✅ Scheduled and active
- **Content**: Top 5 job matches + trending skills

## 📧 Email Templates

All emails use professional HTML templates with:
- Responsive design
- ESADE branding colors
- Clear call-to-action buttons
- Mobile-friendly layout

## 🔧 Technical Details

### Lambda Functions Created/Updated:
1. **esade-career-dev-user-notifications** (Updated)
   - Handles all notification types
   - Uses `notification_service.py` module
   - Connected to Cognito Post-Confirmation trigger

2. **esade-career-dev-recommendations** (Updated)
   - Now sends job match notifications
   - Calculates match scores
   - Filters by location and skills

3. **esade-career-dev-weekly-digest** (New)
   - Sends weekly job digests
   - Scheduled via EventBridge
   - Aggregates top jobs and skill trends

### IAM Permissions:
- ✅ SES email sending permissions
- ✅ Lambda invoke permissions
- ✅ DynamoDB read permissions
- ✅ EventBridge trigger permissions

### EventBridge Schedule:
- **Rule**: `esade-career-weekly-digest`
- **Schedule**: Every Monday at 9:00 AM UTC
- **Target**: `esade-career-dev-weekly-digest` Lambda

## 📋 How to Use

### Welcome Emails
**Automatic** - No action needed. Sent when users verify email.

### Job Match Notifications
**Automatic** - Sent when:
- User requests recommendations via API
- Match score is ≥ 80%
- `user_email` parameter is provided in API call

### Password Reset
**Manual** - Call the notification Lambda:
```python
import boto3
lambda_client = boto3.client('lambda')
lambda_client.invoke(
    FunctionName='esade-career-dev-user-notifications',
    InvocationType='Event',
    Payload=json.dumps({
        'notification_type': 'password_reset',
        'user_email': 'user@example.com',
        'reset_code': '123456',
        'reset_url': 'https://d3c9hkwje42pil.cloudfront.net?reset=123456'
    })
)
```

### Weekly Digest
**Automatic** - Runs every Monday at 9 AM UTC. Sends to all users in `user-profiles` table.

## 🚀 SES Production Access

**Current Status**: Sandbox Mode (can only send to verified emails)

**To Request Production Access**:
1. See `SES_PRODUCTION_ACCESS.md` for detailed instructions
2. Go to AWS SES Console → Request production access
3. Fill out the form with your use case
4. Approval typically takes 24-48 hours

**Verified Email**: `laura.rodriguez15@alumni.esade.edu` ✅

## 📊 Monitoring

All notifications are logged in CloudWatch Logs:
- `/aws/lambda/esade-career-dev-user-notifications`
- `/aws/lambda/esade-career-dev-weekly-digest`

Check logs for:
- Email send success/failure
- Notification triggers
- Error messages

## 🔍 Testing

### Test Welcome Email:
1. Create a new user account
2. Verify the email
3. Check inbox for welcome email

### Test Job Match:
1. Call recommendations API with `user_email` parameter
2. Ensure match score ≥ 80%
3. Check inbox for job match email

### Test Weekly Digest:
1. Manually invoke `esade-career-dev-weekly-digest`
2. Check CloudWatch logs for results
3. Verify emails sent to users

## 📝 Files Created/Modified

### New Files:
- `backend/user_notifications/notification_service.py` - All email templates
- `backend/user_notifications/job_match_notification.py` - Job match logic
- `backend/weekly_digest/lambda_function.py` - Weekly digest handler
- `SES_PRODUCTION_ACCESS.md` - SES setup instructions
- `USER_NOTIFICATIONS_SETUP.md` - This file

### Modified Files:
- `backend/user_notifications/lambda_function.py` - Multi-purpose handler
- `backend/recommendations/lambda_function.py` - Added notification integration

## 🎯 Next Steps

1. **Request SES Production Access** (see `SES_PRODUCTION_ACCESS.md`)
2. **Test all notification types** with verified emails
3. **Integrate password reset** in frontend (optional)
4. **Monitor email delivery** in CloudWatch
5. **Add more users** to `user-profiles` table for weekly digest

## 📞 Support

If notifications aren't working:
1. Check CloudWatch Logs for errors
2. Verify SES email is verified
3. Check IAM permissions
4. Ensure Lambda functions are deployed correctly

---

**Status**: ✅ All notification types implemented and deployed!
**Last Updated**: November 20, 2025

