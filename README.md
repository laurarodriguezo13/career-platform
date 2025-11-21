# ESADE Career Intelligence Platform
A production-ready, serverless career-intelligence platform built entirely on AWS and developed as part of the ESADE Cloud Solutions coursework.

## Overview
The platform helps ESADE students and alumni explore job opportunities across 6 European cities through secure HTTPS authentication, real-time job-market insights, personalized recommendations, and automated email notifications. The platform features a modern, responsive frontend served via CloudFront CDN, comprehensive backend processing with 7 Lambda functions, and enterprise-grade monitoring and security.

---

## Architecture Summary

### Frontend (Amazon S3 + CloudFront CDN)
- **HTTPS-enabled** static website served via CloudFront CDN
- Modern, responsive UI with statistics dashboard, advanced filters, job favorites, and job detail modals
- Cognito authentication (signup, email verification, login, password reset)
- Real-time job search and personalized recommendations via API Gateway
- **Live demo (HTTPS)**:  
  **https://d3c9hkwje42pil.cloudfront.net**

### Authentication & Security (Amazon Cognito + SES)
- ESADE-only signup enforced via Pre-Signup Lambda trigger
- Email verification via Amazon SES (custom email templates)
- **Password reset functionality** with email code verification
- Welcome emails sent automatically after verification
- Client-side session handling through Cognito tokens
- Strong password policy enforcement

### Data Layer (Amazon DynamoDB)
Provisioned with Terraform, **all tables have Point-in-Time Recovery (PITR) enabled**:

- `jobs-live` — normalized job postings from 6 European cities (~72 jobs)
- `skill-trends` — aggregated skill frequencies updated via NLP enrichment
- `user-profiles` — user preferences and profile data
- `recommendations` — pre-computed job recommendations (future use)

TTL is enabled for automatic item expiration on `jobs-live` and `recommendations` tables.

### Backend Processing (AWS Lambda - 7 Functions)
All Lambda functions are deployed and operational:

- `job-ingestion` — retrieves job data from Adzuna API (6 cities: Barcelona, Madrid, London, Paris, Berlin, Amsterdam)
- `nlp-enrichment` — extracts skills using Amazon Comprehend NLP
- `recommendations` — filters and scores jobs, triggers notifications for high matches (≥80%)
- `user-notifications` — sends welcome emails, job match alerts, and weekly digests via SES
- `weekly-digest` — scheduled weekly job digest emails via EventBridge
- `cognito-trigger` — enforces ESADE email-domain restriction
- `cognito-email-sender` — custom email sender for verification and password reset codes

### API & Integration
- **Amazon API Gateway** with caching enabled (300s TTL) for `/jobs` endpoint
- **Amazon Comprehend** for NLP-based skill extraction
- **Adzuna Jobs API** integration for real-time job data
- **AWS Secrets Manager** for secure API credential storage

### Email Services (Amazon SES)
- Verification codes for signup
- Password reset codes
- Welcome emails after verification
- Job match notifications (when match score ≥80%)
- Weekly job digests (scheduled via EventBridge)

### Monitoring & Alerting
- **Amazon CloudWatch**: Logs, metrics, alarms, and custom dashboard
- **Amazon SNS**: Alarm notifications via email
- Alarms configured for: Lambda errors, DynamoDB throttles, API Gateway 5xx errors
- Comprehensive observability for all components

### Infrastructure as Code (Terraform)
- Fully modular IaC (Cognito, Lambda, IAM, DynamoDB, S3, CloudFront, API Gateway, EventBridge)
- Dev environment under `terraform/environments/dev/`
- Automated Lambda packaging + deployment
- All resources version-controlled and reproducible  

---

## Platform Features (Current Implementation)

### ✅ Fully Functional
- **Authentication**: Complete signup, email verification, login, and password reset flows
- **Job Ingestion**: Automated fetching from Adzuna API across 6 European cities
- **NLP Enrichment**: Amazon Comprehend-based skill extraction from job descriptions
- **Job Recommendations**: Server-side filtering and scoring via API Gateway
- **Email Notifications**: Welcome emails, job match alerts, and weekly digests
- **HTTPS Security**: CloudFront CDN with TLS encryption
- **Advanced Frontend**: Statistics dashboard, filters, favorites, search, and job detail views
- **Monitoring**: CloudWatch alarms, metrics, dashboard, and SNS notifications
- **Data Protection**: Point-in-Time Recovery (PITR) enabled on all DynamoDB tables

### 📊 Key Metrics
- **72 jobs** ingested from 6 European cities
- **7 Lambda functions** for backend processing
- **4 DynamoDB tables** with PITR enabled
- **5 email notification types** via SES
- **13+ AWS services** integrated

---

## Repository Structure

```
esade-career-platform/
├── aws_architecture.html
├── backend/
│   ├── cognito_trigger/
│   ├── cognito_email_sender/
│   ├── job_ingestion/
│   ├── nlp_enrichment/
│   ├── recommendations/
│   ├── user_notifications/
│   └── weekly_digest/
├── docs/
│   ├── architecture/        # Architecture diagrams and design docs
│   ├── aws/                 # AWS service-specific documentation
│   ├── email/               # Email troubleshooting guides
│   └── setup/               # Setup and configuration guides
├── frontend/
│   ├── css/
│   ├── js/
│   ├── index.html
│   └── error.html
└── terraform/
    ├── environments/
    │   └── dev/
    └── modules/
        ├── cognito/
        ├── dynamodb/
        ├── iam/
        ├── lambda/
        ├── s3/
        └── cloudfront/
```

**📚 Documentation:** See [`docs/README.md`](docs/README.md) for complete documentation index.

---

## Technologies

### AWS Services (13+)
**Compute & Processing:**
- AWS Lambda (7 functions)
- Amazon API Gateway (with caching)

**Storage & Database:**
- Amazon S3 (static website hosting)
- Amazon DynamoDB (4 tables with PITR)

**Networking & CDN:**
- Amazon CloudFront (HTTPS CDN)

**Authentication & Security:**
- Amazon Cognito (user management)
- AWS IAM (least-privilege access)
- AWS Secrets Manager (API credentials)

**AI/ML:**
- Amazon Comprehend (NLP skill extraction)

**Email & Notifications:**
- Amazon SES (transactional emails)
- Amazon SNS (alarm notifications)

**Monitoring & Scheduling:**
- Amazon CloudWatch (logs, metrics, alarms, dashboard)
- Amazon EventBridge (weekly scheduling)

### External Services
- **Adzuna Jobs API** - Real-time job postings from 6 European cities

### DevOps & Infrastructure
- **Terraform** - Infrastructure as Code
- **GitHub** - Version control

### Languages
- **JavaScript** - Frontend (HTML/CSS/JS)
- **Python 3.11** - Lambda functions
- **HCL** - Terraform configuration

## Documentation
All project documentation is organized in the [`docs/`](docs/) directory:
- **Architecture:** AWS architecture diagrams and design docs
- **Setup Guides:** Configuration and setup instructions
- **AWS Services:** Service-specific documentation (SES, CloudWatch, etc.)
- **Troubleshooting:** Email verification and other issue fixes
- **Technical Report:** Complete technical documentation

See [`docs/README.md`](docs/README.md) for the complete documentation index.

### Quick Links
- [Complete Technical Report](docs/REPORT_UPDATED.md) - Full platform documentation
- [Architecture Diagram](docs/architecture/AWS_ARCHITECTURE_DIAGRAM_PROMPT.md) - Visual architecture
- [Setup Guides](docs/setup/) - Configuration instructions
- [AWS Documentation](docs/aws/) - Service-specific guides  

---

## Quick Start

### Access the Platform
- **Live URL (HTTPS)**: https://d3c9hkwje42pil.cloudfront.net
- **Sign up** with an ESADE email (@esade.edu or @alumni.esade.edu)
- **Verify** your email with the code sent via SES
- **Browse jobs** from 6 European cities with personalized recommendations

### Key Features
- 🔐 **Secure Authentication** - ESADE-only access with email verification
- 🔑 **Password Reset** - Forgot password functionality via email
- 📧 **Email Notifications** - Welcome emails, job matches, weekly digests
- 📊 **Statistics Dashboard** - Real-time job metrics and trends
- 🔍 **Advanced Filters** - Location, job type, and match score filtering
- ⭐ **Job Favorites** - Save jobs for later review
- 🚀 **HTTPS Security** - CloudFront CDN with TLS encryption
- 📈 **Comprehensive Monitoring** - CloudWatch alarms and dashboards

---

## Platform Status

✅ **Production-Ready** - All core features implemented and operational  
✅ **7 Lambda Functions** - Complete backend processing pipeline  
✅ **13+ AWS Services** - Comprehensive serverless architecture  
✅ **6 European Cities** - Barcelona, Madrid, London, Paris, Berlin, Amsterdam  
✅ **72 Jobs** - Real-time job postings from Adzuna API  
✅ **PITR Enabled** - Data protection on all DynamoDB tables  
✅ **HTTPS Enabled** - Secure communication via CloudFront  
✅ **Email Services** - 5 notification types via SES  

---

## Team
Lorena Pinillos, Laura Rodriguez, Margi Ivanova, Kim Schäfer & Tasnim El Faghloumi  
*Educational project developed for ESADE Business School.*

---

## License
This project is developed for educational purposes as part of ESADE Business School coursework.

