# Architecture Updates Summary - What's New in the Diagram

## 🆕 New Components Added

### 1. **CloudFront CDN** (Frontend Layer)
- Added CloudFront distribution for HTTPS and CDN caching
- Sits between User Browser and S3
- Provides secure, fast content delivery

### 2. **Amazon SES** (Email Services)
- New dedicated section for email services
- Handles:
  - Email verification codes
  - Password reset codes
  - Welcome emails
  - Job match notifications
  - Weekly digest emails

### 3. **User Notifications Lambda**
- New Lambda function for sending user emails
- Triggered by:
  - Cognito Post-Confirmation (welcome emails)
  - Recommendations Lambda (job match alerts)
- Sends emails via SES

### 4. **Weekly Digest Lambda**
- New Lambda function for weekly job digests
- Triggered by EventBridge schedule
- Reads jobs and skills from DynamoDB
- Sends digest emails via SES

### 5. **Cognito Email Sender Lambda**
- New Lambda function for custom Cognito email sending
- Handles verification and password reset codes
- Sends via SES

### 6. **Amazon EventBridge**
- New service for scheduling
- Triggers Weekly Digest Lambda weekly

### 7. **Amazon SNS** (Monitoring & Alerting)
- New service for alarm notifications
- Receives CloudWatch alarms
- Sends email alerts

### 8. **Amazon CloudWatch** (Enhanced)
- Expanded section with:
  - Alarms for Lambda errors
  - Alarms for DynamoDB throttles
  - Alarms for API Gateway 5xx errors
  - Dashboard for visualization

### 9. **API Gateway** (Enhanced)
- Now shows caching configuration
- 300s TTL cache badge
- CORS enabled badge

### 10. **DynamoDB** (Enhanced)
- All tables show PITR (Point-in-Time Recovery) enabled
- 4 tables: jobs-live, user-profiles, skill-trends, recommendations

## 🔄 Updated Flows

### Email Flow
1. User signs up → Cognito
2. Cognito → Cognito Email Sender Lambda → SES → User (verification code)
3. User verifies → Cognito Post-Confirmation → User Notifications Lambda → SES → User (welcome email)

### Password Reset Flow
1. User clicks "Forgot Password" → Cognito
2. Cognito → Cognito Email Sender Lambda → SES → User (reset code)
3. User enters code → Password reset complete

### Job Match Notification Flow
1. Recommendations Lambda finds high match (≥80%)
2. Recommendations Lambda → User Notifications Lambda
3. User Notifications Lambda → SES → User (job match email)

### Weekly Digest Flow
1. EventBridge (weekly schedule) → Weekly Digest Lambda
2. Weekly Digest Lambda → DynamoDB (read jobs & skills)
3. Weekly Digest Lambda → SES → Users (weekly digest email)

### Monitoring Flow
1. Lambda/DynamoDB/API Gateway → CloudWatch (metrics)
2. CloudWatch Alarms → SNS Topic
3. SNS Topic → Email alerts

## 📊 Key Enhancements Highlighted

- ✅ **HTTPS** via CloudFront
- ✅ **PITR Enabled** on all DynamoDB tables
- ✅ **Caching Enabled** on API Gateway (300s TTL)
- ✅ **Email Verification** via SES
- ✅ **Password Reset** via SES
- ✅ **6 European Cities** (Barcelona, Madrid, London, Paris, Berlin, Amsterdam)
- ✅ **72 Jobs** ingested from Adzuna
- ✅ **CloudWatch Alarms** for monitoring
- ✅ **SNS Notifications** for alerts
- ✅ **Weekly Digests** via EventBridge

## 🎨 Visual Improvements

- Cleaner arrow routing
- Color-coded components
- Professional badges/icons
- Clear flow labels
- Modern AWS 2024 icons
- Rounded shapes throughout
- Soft shadows for depth

---

**Use this summary alongside the main prompt to understand what's new!**

