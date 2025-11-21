# AWS Architecture Diagram Prompt - ESADE Career Platform (Updated 2024)

Create a high-resolution landscape AWS architecture diagram that reproduces the structure EXACTLY like the reference image, with NO changes to logic or flows. The layout, positions, arrows, and relationships must be identical, but visually improved (cleaner arrows, modern AWS icons, rounded shapes, readable labels, spaced correctly). Use AWS official 2024 service icons for every AWS component. Below is the exact layout to recreate:

---

## 🔵 1. TOP SECTION — TERRAFORM

At the very top center, create a purple rounded rectangle containing:

**'Terraform IaC – Infrastructure Provisioning'**

Include the official Terraform logo inside the box.

From this top Terraform box, draw three dotted arrows labeled **'Manages All Resources'** pointing downward to:
- the Backend Processing block,
- the Data Layer block,
- and the Frontend Layer block.

These dotted arrows must be thin, grey, evenly spaced, and clearly curved to avoid overlapping.

---

## 🔵 2. Backend Processing Section (Top Right — Large Box)

Create a large light-grey rounded rectangle titled:

**"Backend Processing – AWS Lambda"**

Place the AWS logo and AWS Lambda icon in the header.

Inside this large backend box, add the following components arranged vertically:

### 2.1 Job Ingestion
An orange rounded rectangle labeled:

**"Job Ingestion Lambda – Adzuna Fetcher"**

Include an icon representing Lambda function or data ingestion.

Arrow from this block → label **"Store Jobs"** → goes out of the backend box into DynamoDB (jobs-live table).

### 2.2 NLP Enrichment
Create an orange rounded rectangle:

**"NLP Enrichment Lambda – Skill Extractor"**

Arrows:
- From Skill Extractor → skill-trends table (DynamoDB)
- From Skill Extractor ← Amazon Comprehend (External Services)

### 2.3 Recommendations Engine
Create an orange rounded rectangle:

**"Recommendations Lambda – Match Engine"**

Arrows:
- From Match Engine → recommendations table (DynamoDB)
- From Match Engine ← user-profiles table (DynamoDB)
- From Match Engine ← jobs-live table (DynamoDB)
- From Match Engine → User Notifications Lambda (for job match alerts)

### 2.4 User Notifications Lambda
Create an orange rounded rectangle:

**"User Notifications Lambda"**

Arrows:
- From Recommendations Lambda → User Notifications Lambda (job match trigger)
- From Cognito Post-Confirmation → User Notifications Lambda (welcome email)
- From User Notifications Lambda → Amazon SES (send emails)

### 2.5 Weekly Digest Lambda
Create an orange rounded rectangle:

**"Weekly Digest Lambda"**

Arrows:
- From EventBridge Schedule → Weekly Digest Lambda (weekly trigger)
- From Weekly Digest Lambda → DynamoDB (read jobs and skills)
- From Weekly Digest Lambda → Amazon SES (send digest emails)

### 2.6 Cognito Triggers
Create two small orange rounded rectangles:

**"Pre-Signup Lambda – Email Domain Validator"**
- Arrow: From Cognito → Pre-Signup Lambda (validate @esade.edu domain)

**"Cognito Email Sender Lambda"**
- Arrow: From Cognito → Cognito Email Sender Lambda (custom email sending)
- Arrow: From Cognito Email Sender Lambda → Amazon SES (send verification/reset codes)

---

## 🔵 3. External Services Section (Below Backend)

Create a small section titled:

**"External Services"**

(use a light border)

Inside place THREE green rounded rectangles:

1. **Adzuna Jobs API**
   - Icon: API or external data source icon
   - Arrow: From Job Ingestion Lambda → Adzuna Jobs API labeled **"Get Jobs (6 cities)"**

2. **Amazon Comprehend NLP Service**
   - Include official AWS Comprehend icon
   - Arrow: From NLP Enrichment Lambda → Comprehend labeled **"Analyze Text / Extract Skills"**

3. **AWS Secrets Manager**
   - Official Secrets Manager icon
   - Arrow: From Job Ingestion Lambda → Secrets Manager labeled **"Get API Credentials"**

---

## 🔵 4. Data Layer – Amazon DynamoDB (Far Right Large Box)

Create a large white/grey rounded rectangle titled:

**"Data Layer – Amazon DynamoDB"**

Include AWS DynamoDB icon in the header.

Inside the box, include FOUR blue cylinder databases (official AWS DynamoDB style):

1. **jobs-live** (with PITR enabled icon/badge)
2. **user-profiles** (with PITR enabled icon/badge)
3. **skill-trends** (with PITR enabled icon/badge)
4. **recommendations** (with PITR enabled icon/badge)

Add arrows EXACTLY like the source diagram:

**Required arrows:**
- Job Ingestion Lambda → jobs-live (Store Jobs)
- Recommendations Lambda → jobs-live (Read Jobs)
- Recommendations Lambda → recommendations (Store Matches)
- NLP Enrichment Lambda → skill-trends (Store Trends)
- Recommendations Lambda ← user-profiles (Read User Preferences)
- Weekly Digest Lambda → jobs-live (Read Jobs)
- Weekly Digest Lambda → skill-trends (Read Trends)

Arrows must be:
- clean, curved,
- not crossing excessively,
- labelled exactly as shown.

---

## 🔵 5. Frontend Layer – Amazon S3 + CloudFront (Bottom Left Large Box)

Make a light-grey rounded rectangle titled:

**"Frontend Layer – Amazon S3 + CloudFront CDN"**

Include AWS S3 and CloudFront logos.

Inside place these components:

### 5.1 CloudFront Distribution
A blue rounded rectangle at the top:
- **"CloudFront Distribution (HTTPS)"**
- Official CloudFront icon
- Arrow: User Browser → CloudFront (labeled **"1. Access Website (HTTPS)"**)
- Arrow: CloudFront → S3 Bucket (labeled **"Cache & Serve"**)

### 5.2 S3 Bucket
An orange rounded rectangle:
- **"S3 Static Website Hosting"**
- Official S3 icon
- Inside show: **"Static Website (HTML/CSS/JS)"**

### 5.3 Cognito SDK
An orange rounded rectangle:
- **"Cognito SDK Authentication"**
- Use the AWS Cognito logo
- Arrow: Static Website → Cognito SDK
- Arrow: Cognito SDK → Cognito User Pool

### 5.4 Job Dashboard
An orange rounded rectangle:
- **"Job Dashboard / Client Recommendations"**
- Arrow: Static Website → Job Dashboard
- Arrow: Job Dashboard → API Gateway (labeled **"GET /jobs"**)

---

## 🔵 6. API Gateway Section (Center Bottom)

Create a rounded rectangle titled:

**"Amazon API Gateway"**

Include official API Gateway icon.

Inside show:
- **"REST API Endpoint"**
- **"/jobs (GET) - Cached"** (with caching badge/icon)
- **"CORS Enabled"**

Arrows:
- From Job Dashboard → API Gateway (labeled **"API Requests"**)
- From API Gateway → Recommendations Lambda (labeled **"Invoke Lambda"**)
- Arrow showing cache: API Gateway → Cache (labeled **"300s TTL"**)

---

## 🔵 7. Authentication & Security Section (Bottom Center)

Create a large rounded rectangle titled:

**"Authentication & Security"**

Inside add these AWS service blocks:

### 7.1 Amazon Cognito User Pool
- Official Cognito icon
- Label: **"Cognito User Pool"**
- Features shown:
  - Email/Password Auth
  - Email Verification (via SES)
  - Password Reset
  - Domain Restriction (@esade.edu, @alumni.esade.edu)

Arrows:
- From Sign Up → Cognito User Pool
- From Cognito User Pool → Pre-Signup Lambda (labeled **"Pre-Signup Trigger"**)
- From Cognito User Pool → Cognito Email Sender Lambda (labeled **"Custom Email Trigger"**)
- From Cognito User Pool → User Notifications Lambda (labeled **"Post-Confirmation Trigger"**)
- From Cognito User Pool → Amazon SES (labeled **"Send Verification/Reset Codes"**)

### 7.2 AWS Secrets Manager
- Official Secrets Manager icon
- Label: **"Secrets Manager – Adzuna API Credentials"**
- Arrow: From Job Ingestion Lambda → Secrets Manager

---

## 🔵 8. Email Services Section (Center Right)

Create a rounded rectangle titled:

**"Email Services – Amazon SES"**

Include official SES icon.

Inside show:
- **"SES Configuration"**
- **"From: laura.rodriguez15@alumni.esade.edu"**
- **"Production Access: Pending"** (or "Sandbox Mode" badge)

Arrows:
- From Cognito Email Sender Lambda → SES (labeled **"Verification Codes"**)
- From Cognito User Pool → SES (labeled **"Password Reset Codes"**)
- From User Notifications Lambda → SES (labeled **"Welcome Emails"**)
- From User Notifications Lambda → SES (labeled **"Job Match Notifications"**)
- From Weekly Digest Lambda → SES (labeled **"Weekly Digests"**)

---

## 🔵 9. Monitoring & Alerting Section (Top Left)

Create a rounded rectangle titled:

**"Monitoring & Alerting"**

Include CloudWatch and SNS icons.

### 9.1 Amazon CloudWatch
- Official CloudWatch icon
- Show:
  - **"CloudWatch Alarms"**
  - Lambda Error Alarms
  - DynamoDB Throttle Alarms
  - API Gateway 5xx Alarms
- Arrow: From Lambda Functions → CloudWatch (labeled **"Metrics & Logs"**)
- Arrow: From DynamoDB → CloudWatch (labeled **"Table Metrics"**)
- Arrow: From API Gateway → CloudWatch (labeled **"API Metrics"**)

### 9.2 Amazon SNS
- Official SNS icon
- Label: **"SNS Topic – Alarm Notifications"**
- Arrow: From CloudWatch Alarms → SNS Topic (labeled **"Trigger Alerts"**)
- Arrow: From SNS Topic → Email (labeled **"Email Alerts"**)

### 9.3 CloudWatch Dashboard
- Small icon/label: **"CloudWatch Dashboard"**
- Arrow: From CloudWatch → Dashboard (visualization)

---

## 🔵 10. EventBridge Section (Center)

Create a small rounded rectangle:

**"Amazon EventBridge"**

Include official EventBridge icon.

Show:
- **"Weekly Schedule (Cron)"**
- Arrow: From EventBridge → Weekly Digest Lambda (labeled **"Weekly Trigger"**)

---

## 🔵 11. User Browser Section (Center Left)

Create a small magenta box labeled:

**"User Browser"**

Add a small browser icon.

Arrows (numbered flow):
- **'1. Access Website (HTTPS)'** → CloudFront Distribution
- **'2. Sign Up / Login'** → Cognito User Pool
- **'3. Email Verification'** → Cognito (via SES email)
- **'4. Browse Jobs'** → Job Dashboard
- **'5. API Request'** → API Gateway
- **'6. Receive Recommendations'** ← API Gateway

These arrows must follow the same approximate directions as the uploaded image but should be clean and curve smoothly.

---

## 🔵 12. Styling Requirements

To ensure the diagram looks professional:

- **Format**: Landscape (16:9 ratio)
- **Spacing**: Very clear spacing, minimal overlap
- **Shapes**: Rounded rectangles everywhere
- **Connectors**: Thin dark grey connectors with labels
- **Icons**: Consistent AWS official 2024 iconography
- **Effects**: Soft shadows under boxes
- **Readability**: High contrast, readable fonts
- **Colors**:
  - Terraform: Purple
  - Lambda Functions: Orange
  - DynamoDB: Blue cylinders
  - S3/CloudFront: Light blue/orange
  - Cognito: Red/Orange
  - SES: Green
  - CloudWatch/SNS: Yellow/Orange
  - External Services: Green
- **Background**: White or very light grey
- **Labels**: Clear, concise, professional
- **Arrows**: Curved, labeled, color-coded by flow type

---

## 🔵 13. Key Features to Highlight

Add small badges/icons to show:
- ✅ **PITR Enabled** on all DynamoDB tables
- ✅ **Caching Enabled** on API Gateway
- ✅ **HTTPS** on CloudFront
- ✅ **CORS Enabled** on API Gateway
- ✅ **Email Verification** via SES
- ✅ **Password Reset** via SES
- ✅ **6 European Cities** (Barcelona, Madrid, London, Paris, Berlin, Amsterdam)
- ✅ **72 Jobs** ingested from Adzuna

---

## 🔵 14. Component Summary

**Exact component names to use:**
- Terraform IaC
- Job Ingestion Lambda
- NLP Enrichment Lambda
- Recommendations Lambda
- User Notifications Lambda
- Weekly Digest Lambda
- Pre-Signup Lambda
- Cognito Email Sender Lambda
- Amazon Cognito User Pool
- Amazon S3
- Amazon CloudFront
- Amazon API Gateway
- Amazon DynamoDB (jobs-live, user-profiles, skill-trends, recommendations)
- Amazon SES
- Amazon SNS
- Amazon CloudWatch
- Amazon EventBridge
- AWS Secrets Manager
- Amazon Comprehend
- Adzuna Jobs API

**Keep EXACT component names**
**Preserve EXACT structure and flows**
**Improve arrow routing for clarity**

---

This diagram should represent the complete, production-ready ESADE Career Intelligence Platform architecture with all enhancements including CloudFront, SES, SNS, CloudWatch, EventBridge, and the full notification system.

