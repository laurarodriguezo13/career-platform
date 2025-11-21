# Request SES Production Access - Step by Step

## Why This is Needed
Currently, SES is in **sandbox mode**, which means it can only send emails to verified email addresses. To send verification codes and password reset emails to **ALL ESADE emails**, we need production access.

## How to Request Production Access

### Option 1: AWS Console (Recommended - Easiest)

1. **Go to AWS SES Console**
   - Navigate to: https://eu-west-1.console.aws.amazon.com/ses/home?region=eu-west-1
   - Or search "SES" in AWS Console

2. **Request Production Access**
   - Click on **"Account dashboard"** in the left sidebar
   - Look for **"Request production access"** button (usually at the top)
   - Click it

3. **Fill Out the Form**
   - **Mail Type**: Select **"Transactional"**
   - **Website URL**: `https://d3c9hkwje42pil.cloudfront.net`
   - **Use case description**: 
     ```
     ESADE Career Platform - Sending transactional emails to ESADE students and alumni.
     
     Use cases:
     - Email verification codes for new user signups
     - Password reset codes for account recovery
     - Welcome emails after email verification
     - Job match notifications
     - Weekly job digest emails
     
     All users are ESADE community members with verified email domains:
     - @esade.edu (current students)
     - @alumni.esade.edu (alumni)
     
     Users are authenticated and verified before receiving emails.
     ```
   - **Expected sending volume**: Start with **1,000 emails/month**
   - **Bounce/complaint handling**: 
     ```
     We will handle bounces and complaints properly:
     - Remove bounced emails from our system
     - Honor unsubscribe requests
     - Monitor bounce rates
     - Follow AWS SES best practices
     ```
   - **Additional contact email**: `laura.rodriguez15@alumni.esade.edu`

4. **Submit the Request**
   - Review all information
   - Click **"Submit"**
   - AWS typically approves within **24-48 hours**

### Option 2: AWS CLI (Alternative)

If the console doesn't work, you can try:

```bash
aws sesv2 put-account-details \
  --region eu-west-1 \
  --mail-type TRANSACTIONAL \
  --website-url https://d3c9hkwje42pil.cloudfront.net \
  --use-case-description "ESADE Career Platform transactional emails for verified ESADE community members" \
  --additional-contact-email-addresses laura.rodriguez15@alumni.esade.edu \
  --production-access-enabled
```

## After Approval

Once approved:
- ✅ Can send to **any email address** (not just verified ones)
- ✅ Can send to all ESADE emails (@esade.edu and @alumni.esade.edu)
- ✅ Higher sending limits
- ✅ All verification codes will work
- ✅ Password reset emails will work

## Current Status

- **SES Status**: Sandbox mode (can only send to verified emails)
- **Production Access**: Not yet approved
- **Workaround**: Manual verification for users who don't receive codes

## Testing

After production access is approved:
1. Try signing up with a new ESADE email
2. Check if verification code arrives
3. Test password reset functionality
4. All should work automatically!

---

**Next Step**: Go to AWS SES Console and request production access using the form above.

