# Requesting SES Production Access

## Current Status
Your SES account is currently in **Sandbox Mode**, which means you can only send emails to verified email addresses.

## To Request Production Access

### Option 1: AWS Console (Recommended)
1. Go to **AWS SES Console** → **Account dashboard**
2. Click **"Request production access"**
3. Fill out the form:
   - **Mail Type**: Transactional
   - **Website URL**: https://d3c9hkwje42pil.cloudfront.net
   - **Use case description**: 
     ```
     ESADE Career Platform - Sending transactional emails to users including:
     - Welcome emails when users sign up
     - Job match notifications
     - Password reset emails
     - Weekly job digest emails
     
     Users are ESADE students and alumni with verified email addresses (@esade.edu and @alumni.esade.edu).
     ```
   - **Expected sending volume**: Start with 1,000 emails/month
   - **Bounce/complaint handling**: We will handle bounces and complaints properly
4. Submit the request
5. AWS typically approves within 24-48 hours

### Option 2: AWS CLI
```bash
aws sesv2 put-account-details \
  --region eu-west-1 \
  --mail-type TRANSACTIONAL \
  --website-url https://d3c9hkwje42pil.cloudfront.net \
  --use-case-description "ESADE Career Platform transactional emails" \
  --additional-contact-email-addresses laura.rodriguez15@alumni.esade.edu \
  --production-access-enabled
```

## After Approval
Once approved, you can:
- Send emails to any email address (not just verified ones)
- Send up to your approved daily sending quota
- Scale as needed

## Current Verified Email
- `laura.rodriguez15@alumni.esade.edu` ✅ Verified

## Testing Before Production
You can test all notification types with verified emails:
- Welcome emails (automatic on signup)
- Job match notifications (when match score ≥ 80%)
- Password reset (when implemented in frontend)
- Weekly digest (runs every Monday at 9 AM UTC)

