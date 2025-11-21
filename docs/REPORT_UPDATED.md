# ESADE Career Intelligence Platform - Technical Report
## Updated Version - All Enhancements Included

---

## 1. Executive Summary

### 1.1 Project Overview

The Career Intelligence ESADE Platform is a production-ready, serverless, cloud-native solution designed to provide ESADE students and alumni with real-time, personalized job recommendations across Europe. The platform fetches real job postings from the Adzuna API across 6 European cities, performs NLP-based skill extraction using Amazon Comprehend, and delivers personalized recommendations through a secure, HTTPS-enabled frontend. The platform is built with a modular AWS architecture using serverless managed services including Cognito, DynamoDB, Lambda functions, Comprehend, Secrets Manager, S3, CloudFront, SES, SNS, CloudWatch, EventBridge, and API Gateway. The entire platform is developed in the cloud, applying event-driven processing, Infrastructure as Code (IaC), comprehensive monitoring, and enterprise-grade security standards.

### 1.2 Problem Statement

Students and alumni struggle to navigate an increasingly complex job market that is highly competitive in today's environment, making the process of finding suitable opportunities a challenging task. Job information is scattered across different sources, often inconsistent, and rarely personalized. Moreover, the diversity of roles, industries, and required skills makes it difficult for candidates to identify the opportunities where they would truly be the best fit. This gap reduces the efficiency of career decision-making and limits access to high-quality, relevant opportunities.

### 1.3 Purpose & Value for ESADE

The platform addresses ESADE's recruiting and career-services challenges, where students and alumni struggle to navigate and find suitable jobs for their skill set in a fragmented job market. This solution supports them by interpreting and extracting both their skills and the requirements of real-world job offers, enabling more accurate matches.

The three main values provided to ESADE members are:

1. **Data-driven career support** that improves the relevance and efficiency of job matching through AI-powered skill extraction and personalized scoring algorithms.

2. **Ongoing alumni engagement** through continued access to personalized recommendations, weekly job digests, and job match notifications.

3. **Showcase of ESADE's innovation** in cloud, AI, and applied technology, demonstrating production-ready serverless architecture with enterprise-grade security and monitoring.

### 1.4 Technologies Used

The platform is built entirely on AWS serverless managed services, ensuring high scalability, minimal operational overhead, and pay-per-use efficiency. Its core components include:

- **Compute**: AWS Lambda for event-driven compute (7 functions)
- **Storage**: Amazon DynamoDB for serverless NoSQL data storage with Point-in-Time Recovery (PITR)
- **Frontend**: Amazon S3 for static website hosting, Amazon CloudFront for HTTPS CDN delivery
- **Authentication**: Amazon Cognito for secure authentication, email verification, and password reset
- **Email Services**: Amazon SES for transactional emails (verification, password reset, welcome, job matches, weekly digests)
- **API**: Amazon API Gateway with caching for REST API endpoints
- **AI/ML**: Amazon Comprehend for NLP-based skill extraction
- **Monitoring**: Amazon CloudWatch for logs, metrics, alarms, and dashboards
- **Notifications**: Amazon SNS for alarm notifications
- **Scheduling**: Amazon EventBridge for weekly job digest automation
- **Security**: AWS Secrets Manager for API credentials, IAM for least-privilege access
- **Infrastructure**: Terraform for Infrastructure as Code (IaC)

All infrastructure is provisioned through Terraform, enabling reproducible deployments, modular design, and full Infrastructure-as-Code governance.

---

## 2. System Architecture Overview

### 2.1 System Goals & Design Principles

The system is designed to deliver real-time job information through a cost-efficient, fully serverless architecture that minimizes operational effort. The platform prioritizes simplicity, both in its internal structure and in the user experience, ensuring that interaction with the system feels intuitive and natural. To maintain reliability and consistency, all resources are provisioned through Infrastructure as Code using Terraform, allowing reproducible deployments and structured version control. Security and access control are central design considerations, with ESADE-only authentication, strong password enforcement, automated verification workflows, HTTPS encryption, and comprehensive monitoring managed natively by AWS. Finally, the architecture follows a modular, extensible design where each component operates independently, enabling straightforward updates, future enhancements, and efficient scaling as user demand grows.

### 2.2 High-Level Architecture Diagram

The architecture diagram (see `docs/architecture/`) illustrates a complete serverless architecture with:

- **Terraform IaC** managing all resources
- **CloudFront CDN** providing HTTPS frontend delivery
- **S3** hosting static website assets
- **7 Lambda functions** for backend processing
- **4 DynamoDB tables** with PITR enabled
- **API Gateway** with caching enabled
- **Cognito** with SES integration for email services
- **CloudWatch & SNS** for monitoring and alerting
- **EventBridge** for scheduled automation

### 2.3 Why Serverless

The decision to adopt a serverless architecture is driven by the need for a scalable, cost-efficient, and easily maintainable system capable of supporting real-time data processing. Serverless services such as AWS Lambda, DynamoDB, Cognito, S3, CloudFront, SES, and API Gateway remove the operational burden of provisioning, updating, and monitoring servers, allowing the platform to benefit from automatic scaling, managed security, and pay-per-use pricing. This approach ensures that the system can seamlessly handle fluctuating workloads, particularly in processes such as job ingestion, authentication, recommendation generation, email delivery, and scheduled tasks, without requiring manual intervention.

### 2.4 Core Components and Interactions

The platform is composed of a comprehensive set of serverless components that operate together to support real-time job ingestion, NLP enrichment, secure authentication, email notifications, scheduled digests, and a modern user interface. Each element plays a specific role, and the system functions through clear, well-defined interactions across the architecture.

#### 2.4.1 Frontend Layer

The interface is deployed as a static web application on Amazon S3 and served globally through Amazon CloudFront with HTTPS encryption. The frontend consists of `index.html`, associated stylesheets, and JavaScript logic for authentication, dashboard behavior, job browsing, favorites, filters, and statistics (see `frontend/` directory).

**CloudFront Integration**: The platform uses CloudFront as the primary entry point, providing:
- **HTTPS encryption** for all user interactions
- **Global CDN caching** for improved performance
- **Custom domain support** (optional)
- **DDoS protection** and security headers

The CloudFront distribution is configured to:
- Cache static assets (HTML, CSS, JS) with appropriate TTLs
- Forward API requests to API Gateway
- Serve the S3-hosted website with HTTPS

**User Interface Features**:
- Modern, responsive design with statistics dashboard
- Advanced filtering (location, job type, match score)
- Job favorites functionality
- Job detail modal views
- Real-time search capabilities
- Toast notifications for user feedback

All interaction with AWS services occurs client-side, and session data is maintained in the browser using Cognito SDK tokens.

#### 2.4.2 Authentication Layer

User identity is managed through Amazon Cognito, which enforces ESADE-restricted email domains, password policies, email verification, and password reset functionality. The authentication system includes:

**Pre-Signup Lambda Trigger**: Validates email domain before account creation (only @esade.edu and @alumni.esade.edu allowed).

**Cognito Email Sender Lambda**: Custom email sender that sends verification codes and password reset codes via Amazon SES, providing branded email templates and improved deliverability.

**Post-Confirmation Lambda Trigger**: Automatically sends welcome emails to new users after email verification.

**Password Reset Flow**: Complete forgot password functionality allowing users to reset their password via email verification codes.

Cognito issues session tokens used client-side to render the authenticated dashboard. The full configuration is provisioned through Terraform with SES integration for email delivery.

#### 2.4.3 Backend Processing

The backend relies on seven independent Lambda functions responsible for job ingestion, NLP enrichment, recommendations, user notifications, weekly digests, Cognito triggers, and custom email sending. They operate independently and store results in DynamoDB.

**API Gateway Integration**: Provides the interface between the frontend and backend with:
- **REST API endpoint** (`/jobs`) with GET method
- **Caching enabled** (300-second TTL) for improved performance
- **CORS configuration** for cross-origin requests
- **Integration with Recommendations Lambda** for job filtering and scoring

The current implementation exposes a `/jobs` endpoint that retrieves job postings from DynamoDB and applies server-side filtering based on user-selected preferences. This endpoint is backed by the recommendations Lambda, which returns filtered and scored job data.

#### 2.4.4 Data Layer

All persistent data (job postings, user profiles, skill trends, and recommendation outputs) is stored in DynamoDB tables provisioned through Terraform. All four tables have **Point-in-Time Recovery (PITR) enabled** for data protection and compliance.

**Active Tables**:
- **jobs-live**: Actively populated with ~72 jobs from 6 European cities
- **skill-trends**: Updated by NLP enrichment Lambda
- **user-profiles**: Available for future user preference persistence
- **recommendations**: Available for future pre-computed recommendations

TTL and secondary indexes support the required access patterns. The jobs-live table is actively populated, and skill-trends is updated during NLP enrichment.

#### 2.4.5 Email Services

The platform includes a comprehensive email notification system powered by Amazon SES:

**Email Types**:
1. **Verification Codes** - Sent during signup via Cognito Email Sender Lambda
2. **Password Reset Codes** - Sent when users request password recovery
3. **Welcome Emails** - Sent after successful email verification
4. **Job Match Notifications** - Sent when a job matches user profile with ≥80% match score
5. **Weekly Job Digests** - Sent weekly via EventBridge schedule

**SES Configuration**:
- From address: `laura.rodriguez15@alumni.esade.edu`
- Production access: Pending (currently in sandbox mode)
- Custom email templates for all notification types

#### 2.4.6 Monitoring & Alerting

The platform includes comprehensive monitoring and alerting:

**CloudWatch**:
- Logs for all Lambda functions
- Metrics for Lambda, DynamoDB, and API Gateway
- Alarms for:
  - Lambda function errors
  - DynamoDB throttling
  - API Gateway 5xx errors
- Custom dashboard for key metrics visualization

**SNS**:
- Topic for alarm notifications
- Email subscriptions for critical alerts
- Integration with CloudWatch alarms

#### 2.4.7 Summary of Interactions

The user accesses the CloudFront-distributed frontend (HTTPS), authenticates through Cognito (with email verification via SES), and the dashboard retrieves data through API Gateway (with caching). API Gateway invokes the Recommendations Lambda, which queries DynamoDB and returns filtered, scored job results. High-match jobs trigger User Notifications Lambda to send email alerts. Weekly digests are automatically sent via EventBridge-triggered Weekly Digest Lambda.

---

## 3. Frontend Layer

The frontend layer is a modern, responsive, client-side application built entirely with HTML, CSS, and JavaScript. It acts as the visual entry point to the platform and is responsible for handling user interactions, triggering authentication flows, presenting job data, and providing advanced filtering and personalization features.

### 3.1 Amazon S3 Static Hosting & CloudFront CDN

The entire UI is deployed as a static website on Amazon S3, where all frontend assets (HTML, CSS, and JavaScript) are stored. The platform uses **Amazon CloudFront** as the primary entry point, providing:

- **HTTPS encryption** for secure communication
- **Global CDN** for improved performance and reduced latency
- **Custom error handling** for invalid routes
- **Cache optimization** for static assets

Static hosting and routing behavior are defined through Terraform in the S3 module. The CloudFront distribution is configured to:
- Serve content from the S3 bucket origin
- Enable HTTPS (TLS 1.2+)
- Cache static assets appropriately
- Forward API requests to API Gateway

The publicly accessible entry point is the CloudFront distribution domain (HTTPS), and a custom error document (`error.html`) handles invalid routes.

### 3.2 File Structure (HTML, CSS, JS, Config)

The frontend follows a structured organization:

- **index.html**: Contains the interface layout, authentication modal, dashboard containers, statistics cards, filter sidebar, job detail modal, and toast notifications.
- **error.html**: Provides the error page rendered by CloudFront/S3 on invalid paths.
- **auth.js**: Manages Cognito sign-up, email verification, sign-in, password reset, and session retrieval.
- **app.js**: Handles dashboard rendering, API data fetching, search functionality, user preference logic, job favorites, statistics calculation, trending skills extraction, and filter management.
- **config.js**: Stores Cognito User Pool ID, Client ID, and API Gateway endpoint configuration.
- **styles.css**: Provides modern styling with gradients, animations, responsive design, card layouts, and professional UI components.

This structure separates concerns clearly: layout (HTML), styling (CSS), authentication logic (auth.js), application logic (app.js), and configuration (config.js).

### 3.3 CORS Configuration

To allow the frontend to communicate with Cognito and the API Gateway endpoint, the S3 bucket and API Gateway apply permissive CORS policies. The configuration allows GET and HEAD methods, all origins, and all headers. The CORS rules are provisioned automatically through Terraform, ensuring consistency and avoiding manual changes.

### 3.4 Cognito Authentication Flow from the Frontend

Authentication is handled entirely client-side using the `amazon-cognito-identity-js` SDK loaded in `index.html`.

The flow is the following:

1. The user initiates the process through the modal in `index.html`.
2. `auth.js` sends the credentials to Cognito using the User Pool ID and Client ID defined in `config.js`.
3. In the case of new users, Cognito triggers the Cognito Email Sender Lambda, which sends a verification code to the ESADE email via SES.
4. After successful verification, `auth.js` retrieves the session tokens via the SDK.
5. The UI dynamically switches between the welcome view and the dashboard based on session validity.
6. For password reset, users can click "Forgot Password?" and receive a reset code via email.

No passwords or sensitive credentials are stored locally at any point.

### 3.5 Local Storage & Session Handling

Session validation is managed directly through Cognito's SDK, which retrieves stored tokens on page load. In addition to this, the frontend stores non-sensitive user preferences (skills, locations, industries) and job favorites using `localStorage`, enabling persistent personalization across visits. All persistence and preference logic is handled exclusively in `app.js`.

### 3.6 Frontend Features

The frontend includes advanced features:

- **Statistics Dashboard**: Displays total jobs, average match rate, saved jobs count, and cities available
- **Advanced Filters**: Location, job type, and match score filtering
- **Job Favorites**: Users can save favorite jobs for later review
- **Job Detail Modal**: Detailed view of job information with company details and application links
- **Trending Skills**: Displays most frequently mentioned skills across all jobs
- **Real-time Search**: Search jobs by title, company, location, or skills
- **Toast Notifications**: User feedback for actions (favorites, filters, etc.)
- **Responsive Design**: Works on desktop, tablet, and mobile devices

---

## 4. Authentication & Identity Management

The authentication layer is implemented through Amazon Cognito, which provides secure user management, verification, password enforcement, password reset, and token-based session handling. Cognito operates as the central identity provider of the platform and ensures that only verified ESADE users can access the dashboard and personalized job data.

### 4.1 Amazon Cognito User Pool Overview

The platform uses an Amazon Cognito User Pool to register, authenticate, and manage users. The User Pool is provisioned through Terraform in the Cognito module, which defines the pool configuration, password policies, email verification templates, and the associated User Pool Client.

**Key Features**:
- Email/password authentication
- Email verification via SES (custom email sender)
- Password reset functionality
- Domain restriction (@esade.edu and @alumni.esade.edu)
- Strong password policy enforcement
- Session token management

Cognito handles credential storage, identity validation, and token issuance, allowing the platform to delegate all authentication responsibilities to a managed service without storing any sensitive information on the frontend.

### 4.2 Signup Flow (Verification Email)

The signup flow is fully automated and follows Cognito's standard verification mechanism with custom email sending:

1. When a new user registers through the frontend, Cognito triggers the **Pre-Signup Lambda** to validate the email domain.
2. If the domain is valid, Cognito triggers the **Cognito Email Sender Lambda**, which sends a six-digit verification code to the ESADE email via Amazon SES.
3. The user must confirm the account using this code before being allowed to sign in.
4. After verification, Cognito triggers the **Post-Confirmation Lambda** (User Notifications Lambda), which sends a welcome email via SES.

The entire verification logic is handled through Cognito and Lambda triggers, with email delivery managed by SES for improved deliverability and branding.

### 4.3 Domain Restriction Logic

To ensure that only ESADE community members can access the platform, registration requests are validated through a Cognito Pre-Signup Lambda trigger. The trigger checks whether the provided email belongs to one of the approved domains (`@esade.edu` or `@alumni.esade.edu`) and rejects any signup attempt that does not meet this requirement. All validation events are logged for auditing.

### 4.4 Password Reset Flow

The platform includes a complete password reset functionality:

1. Users click "Forgot Password?" on the sign-in form.
2. They enter their ESADE email address.
3. Cognito triggers the Cognito Email Sender Lambda, which sends a password reset code via SES.
4. Users enter the code and their new password.
5. The password is reset, and users can sign in with their new credentials.

This flow is fully integrated with Cognito's account recovery system and uses SES for email delivery.

### 4.5 Authentication Tokens (ID, Access, Refresh)

Once a user is verified and signs in, Cognito issues a set of authentication tokens (ID, access, and refresh). These tokens are retrieved and managed by the Cognito SDK in the frontend, which validates their expiration and updates the session automatically. No tokens are stored manually or handled outside the SDK.

### 4.6 Security Policies & Password Requirements

Cognito enforces all password and account security requirements defined in the Terraform configuration of the User Pool.

The password policy includes:
- Minimum of 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

Automatic email verification is required before activation, and user-existence errors are protected to avoid leaking information about registered accounts. Together, these measures ensure secure access control while maintaining a simple user experience.

---

## 5. Backend Lambda Functions

The backend layer of the platform is composed of seven AWS Lambda functions, each designed with a single responsibility and deployed as individual serverless units through Terraform. These functions run independently and form a comprehensive data pipeline that ingests external data, enriches it, applies validation rules during user registration, sends email notifications, generates weekly digests, and retrieves filtered job recommendations. All functions rely on DynamoDB as their data store and use CloudWatch for logging and observability.

### 5.1 job-ingestion (Adzuna API Integration)

The job-ingestion Lambda is responsible for retrieving job postings from the Adzuna API and loading them into the `jobs-live` table in DynamoDB.

**Functionality**:
- Retrieves API credentials from AWS Secrets Manager
- Sends targeted API queries across **6 European cities** (Barcelona, Madrid, London, Paris, Berlin, Amsterdam) and 4 job categories (data scientist, consultant, product manager, analyst)
- Normalizes responses into a consistent schema including title, company, description, location, industry, skills, URL, posted date, and an `expirationTime` attribute for TTL-based cleanup
- Writes approximately **72 job postings** per run
- Performs keyword extraction to identify skills mentioned in job descriptions
- Handles missing fields defensively and logs all ingestion outcomes to CloudWatch

**IAM Permissions**:
- Read access to Secrets Manager for Adzuna credentials
- Write access to the `jobs-live` DynamoDB table

This function establishes the platform's data foundation by ensuring that current job information is periodically available across all target European markets.

### 5.2 nlp-enrichment (Comprehend Keyphrase Extraction)

The nlp-enrichment Lambda enhances each job description with additional skills extracted through Amazon Comprehend.

**Functionality**:
- Scans items in the `jobs-live` table
- Applies Amazon Comprehend's `DetectKeyPhrases` to job descriptions
- Merges extracted tokens with existing skills lists
- Updates enriched jobs in DynamoDB
- Updates skill trends in the `skill-trends` table
- Logs processed items, NLP latency, and any Comprehend errors for debugging

**IAM Permissions**:
- Read/write access to `jobs-live` and `skill-trends` DynamoDB tables
- Permission to call the Amazon Comprehend API

This function ensures that job postings have comprehensive skill information for accurate matching and trending analysis.

### 5.3 recommendations (Job Filtering & Scoring)

The recommendations Lambda retrieves job postings from DynamoDB and applies server-side filtering and scoring based on user preferences. It is integrated with API Gateway and serves as the primary backend endpoint for the frontend application.

**Functionality**:
- Accepts query parameters:
  - `location` – filters jobs by the specified city
  - `skills` – comma-separated list of skills to match against job postings
  - `user_email` – optional, for triggering job match notifications
- **Scoring Algorithm**:
  - Base match score: 75%
  - Skill match boost: +5% per matching skill
  - Maximum score: 95%
- Queries the `jobs-live` table
- Filters results by location if specified
- Calculates match scores based on skill overlap
- Sorts jobs by score in descending order
- **Triggers User Notifications Lambda** for jobs with match score ≥80%
- Returns results as JSON with CORS headers

**IAM Permissions**:
- Read access to `jobs-live` and `user-profiles` DynamoDB tables
- Invoke permission for User Notifications Lambda

**Example API Calls**:
- `GET /jobs` → Returns all jobs
- `GET /jobs?location=madrid` → Returns Madrid jobs
- `GET /jobs?skills=python,sql` → Returns jobs with boosted Python/SQL scores
- `GET /jobs?location=london&skills=python` → Returns London jobs filtered by location + Python boost

### 5.4 user-notifications (Email Notification Service)

The user-notifications Lambda handles all user-facing email communications via Amazon SES.

**Functionality**:
- **Welcome Emails**: Triggered by Cognito Post-Confirmation event after email verification
- **Job Match Notifications**: Triggered by Recommendations Lambda when a job matches with ≥80% score
- **Password Reset Emails**: Can be triggered for password reset workflows
- **Weekly Digest Emails**: Can be invoked by Weekly Digest Lambda

**Email Types**:
1. Welcome emails with platform introduction
2. Job match notifications with job details and match score
3. Password reset emails with reset codes
4. Weekly digest emails with top jobs and trending skills

**IAM Permissions**:
- Send email via Amazon SES
- Read access to DynamoDB for job/user data (if needed)

This function ensures users receive timely, relevant notifications about job opportunities and platform updates.

### 5.5 weekly-digest (Scheduled Job Digest)

The weekly-digest Lambda sends weekly job digest emails to all active users.

**Functionality**:
- Triggered by Amazon EventBridge on a weekly schedule (every Monday at 9 AM)
- Retrieves all active jobs from `jobs-live` table
- Calculates trending skills from `skill-trends` table
- Retrieves user profiles from `user-profiles` table (or Cognito)
- Generates personalized digest for each user with:
  - Top job recommendations
  - Trending skills for the week
  - Platform statistics
- Sends digest emails via User Notifications Lambda and SES

**IAM Permissions**:
- Read access to `jobs-live`, `skill-trends`, and `user-profiles` DynamoDB tables
- Invoke permission for User Notifications Lambda

This function ensures ongoing user engagement through regular, personalized job updates.

### 5.6 cognito-trigger (Domain-Level Signup Validation)

The cognito-trigger Lambda enforces strict domain access control during user registration.

**Functionality**:
- Executed as a Pre-Signup Trigger by Amazon Cognito
- Inspects the email used during sign-up
- Verifies that it belongs to one of the approved ESADE domains:
  - `@esade.edu`
  - `@alumni.esade.edu`
- If the domain does not match, throws an exception that immediately blocks account creation
- If valid, returns the event unchanged to allow normal verification flow

**IAM Permissions**:
- CloudWatch logging only (minimal IAM footprint)

All allowed domains are hard-coded to prevent misconfiguration, and every validation event is logged for auditing and troubleshooting.

### 5.7 cognito-email-sender (Custom Email Delivery)

The cognito-email-sender Lambda provides custom email sending for Cognito verification and password reset codes.

**Functionality**:
- Triggered by Cognito for:
  - `CustomEmailSender_SignUp` – verification code emails
  - `CustomEmailSender_ResendCode` – resend verification codes
  - Password reset code emails
- Sends branded HTML email templates via Amazon SES
- Includes verification/reset codes in formatted email body
- Provides better deliverability and branding compared to Cognito default emails

**IAM Permissions**:
- Send email via Amazon SES
- CloudWatch logging

This function ensures professional, branded email communications for all authentication-related emails.

---

## 6. Data Model & Storage Architecture

The platform uses Amazon DynamoDB as its primary data store, supporting a serverless, low-maintenance architecture that matches the project's event-driven design. The system contains four tables, all with **Point-in-Time Recovery (PITR) enabled** for data protection and compliance.

### 6.1 Why DynamoDB Instead of SQL

DynamoDB was selected over relational SQL databases due to its scalability, flexibility, and alignment with the platform's serverless approach. As a fully managed NoSQL service, it removes the need for provisioning servers, performing schema migrations, or managing availability, which is suitable for a student- and alumni-facing platform with highly irregular usage patterns. Its on-demand pricing model is cost-efficient, charging only for actual read/write operations and avoiding the continuous compute costs typical of SQL instances.

DynamoDB's flexible schema accommodates the semi-structured job data retrieved from Adzuna, where optional fields vary across postings. Native features such as Time to Live (TTL) for automatic data expiration, Global Secondary Indexes for alternative query patterns, and Point-in-Time Recovery for data protection provide a scalable foundation for system evolution.

### 6.2 Table Designs

#### 6.2.1 jobs-live

The `jobs-live` table is the central table in the platform. It stores job postings retrieved by the job-ingestion Lambda, each uniquely identified by `jobId`. Key attributes include:
- `jobId` (PK)
- `title`
- `company`
- `location`
- `description`
- `industry`
- `skills` (array)
- `salary`
- `workModel`
- `experienceLevel`
- `url`
- `postedDate`
- `expirationTime` (TTL attribute)

The `expirationTime` attribute serves as a TTL, enabling automatic removal of outdated entries. **PITR is enabled** for data protection.

#### 6.2.2 skill-trends

The `skill-trends` table provides a continuously updated view of skills that are gaining or declining in relevance across the job market. It aggregates skill occurrences from live job postings and computes trend metrics.

**Key attributes**:
- `skillName` (PK)
- `jobCount`
- `trendScore`
- `lastUpdated`

The table is refreshed through the NLP enrichment Lambda. **PITR is enabled**.

#### 6.2.3 user-profiles

The `user-profiles` table stores user-specific information necessary to generate personalized job recommendations. It combines static background data with dynamic preference indicators.

**Key attributes**:
- `userId` (PK)
- `email`
- `skills` (array)
- `interests`
- `experienceLevel`
- `preferredLocations` (array)

**Note**: In the current implementation, user preferences are also stored in browser `localStorage` for immediate frontend functionality. The table is available for future backend-driven personalization. **PITR is enabled**.

#### 6.2.4 recommendations

The `recommendations` table stores pre-computed job recommendations for each user using a composite key structure.

**Key attributes**:
- `userId` (PK)
- `jobId` (SK)
- `matchScore`
- `generatedAt`
- `expirationTime` (TTL)

Because the recommendations Lambda currently returns filtered job data in real-time, this table exists primarily for future system expansion and caching. **PITR is enabled**.

### 6.3 Partition Keys, Sort Keys, Indexes

DynamoDB's key design plays a central role in supporting efficient querying and predictable performance. Each table uses a purpose-built partition key (PK) to optimize access patterns and maintain even workload distribution.

#### 6.3.1 Partition Keys (PK)

- `jobs-live`: `jobId`
- `skill-trends`: `skillName`
- `user-profiles`: `userId`
- `recommendations`: `userId`

#### 6.3.2 Sort Keys (SK)

A sort key is used only in the `recommendations` table, where `jobId` acts as the SK. This allows multiple recommended jobs to be stored under the same `userId` while preserving uniqueness and order within each partition.

#### 6.3.3 Global Secondary Indexes (GSIs)

Several GSIs support additional query patterns:

| Table | Index Name | Purpose | Key Schema |
|-------|------------|---------|------------|
| jobs-live | IndustryIndex | Query by Industry | PK: Industry |
| jobs-live | LocationIndex | Query by location | PK: Location |
| recommendations | MatchScoreIndex | Sort by score | PK: userId, SK: matchScore |

These indexes support real user behaviors such as filtering by industry or location, which cannot be done efficiently on a table keyed only by `jobId`.

### 6.4 TTL for Data Expiration

To maintain a lightweight database and ensure that users always receive up-to-date information, the platform employs DynamoDB's TTL feature on two tables:
- `jobs-live.expirationTime`
- `recommendations.expirationTime`

These TTL attributes automatically remove items once they reach their defined expiration timestamp, eliminating the need for manual cleanup scripts. DynamoDB handles TTL deletions asynchronously without requiring backend intervention.

### 6.5 Point-in-Time Recovery (PITR)

**All four DynamoDB tables have PITR enabled**, providing:
- Continuous backups with 35-day retention
- Point-in-time restore capability
- Protection against accidental deletions or data corruption
- Compliance with data protection requirements

This ensures that the platform can recover from data loss incidents with minimal data loss.

### 6.6 Access Patterns

The DynamoDB architecture is shaped by the platform's predictable access patterns, ensuring fast performance across both frontend and backend operations.

**Frontend Access**:
- All job data is retrieved exclusively through the API Gateway `/jobs` endpoint (with caching).
- Users view their stored skills and preferences from `localStorage`, with the DynamoDB `user-profiles` table available for future backend integration.

**Backend Lambda Access**:
- `job-ingestion`: Writes new items to `jobs-live`.
- `nlp-enrichment`: Enriches stored jobs and updates `skill-trends`.
- `recommendations`: Scans `jobs-live` with optional filters and returns sorted results.
- `weekly-digest`: Reads from `jobs-live` and `skill-trends` for digest generation.
- `user-notifications`: May read from DynamoDB for personalized email content.

---

## 7. External API Integration

The ESADE Career Intelligence Platform integrates with the Adzuna Jobs API to obtain real-time job market data across Europe. The integration is implemented inside the job-ingestion Lambda and designed to be secure, rate-limit aware, and resilient to data inconsistencies.

### 7.1 Adzuna API Overview

The platform uses the Adzuna Jobs API as its primary external data source. Adzuna provides JSON-based job listings with rich metadata including titles, descriptions, companies, locations, categories, salaries, and posting dates.

The job-ingestion Lambda initiates multiple requests across **6 European cities** (Barcelona, Madrid, London, Paris, Berlin, Amsterdam) and 4 job categories to generate a diverse dataset for ESADE users. The API responses are parsed and transformed into the platform's internal schema before being written to DynamoDB.

### 7.2 API Parameters

Each Adzuna request is constructed using the required `app_id` and `app_key`, along with several standard parameters.

The most relevant parameters are:
- `what` – job title or keyword (e.g., "data scientist", "consultant")
- `where` – geographic location (e.g., "Barcelona", "London")
- `results_per_page` – fixed to 3 to comply with free-tier limits
- `content_type` – JSON format returned by the API

**Geographic Coverage (6 cities)**:
- **Spain**: Barcelona, Madrid
- **United Kingdom**: London
- **France**: Paris
- **Germany**: Berlin
- **Netherlands**: Amsterdam

This parameter design allows the ingestion pipeline to sample multiple categories and locations while staying within Adzuna's query constraints, producing a curated dataset of approximately **72 jobs** for skill-based analysis.

### 7.3 Rate Limit Handling

Because the Adzuna free tier enforces strict limits, the ingestion Lambda incorporates several defensive strategies to remain within the allowed quota:
- Requests only small batches of 3 results per query
- Multiplies these across selected job titles and locations to reduce total call volume
- Limits itself to a minimal set of ESADE-relevant job families
- Performs explicit error monitoring for HTTP 429 responses
- Issues all API calls sequentially rather than in parallel

Together, these techniques ensure that the ingestion pipeline operates consistently within the constraints of the Adzuna free tier.

### 7.4 Normalization of Job Data

Adzuna responses vary across industries and sometimes omit optional fields. To ensure consistency, each raw job object is transformed into a strict schema before being written to DynamoDB.

The job-ingestion Lambda maps Adzuna fields to:
- `jobId` (derived from Adzuna ID)
- `title`
- `company`
- `location`
- `description`
- `skills` (extracted via keyword matching)
- `url`
- `postedDate`
- `expirationTime` (DynamoDB TTL attribute)

This normalized schema ensures that downstream components, particularly NLP enrichment and recommendation scoring, receive structured, predictable data without additional defensive checks.

### 7.5 Secrets Manager Usage

The Adzuna API requires authentication using a pair of credentials (`app_id` and `app_key`). These are stored securely in AWS Secrets Manager under the name `esade-career-dev-adzuna-api`.

During execution, the ingestion Lambda retrieves the secret with `GetSecretValue` and injects the credentials into request headers at runtime.

This approach provides:
- AES-256 encryption at rest
- Centralized credential management
- Strict IAM scoping limiting access to the ingestion Lambda
- No exposure of credentials in code, logs, or S3

Secrets Manager therefore enforces a secure and auditable integration pattern.

---

## 8. Email Services & Notifications

The platform includes a comprehensive email notification system powered by Amazon SES, providing transactional emails for authentication, user engagement, and job matching.

### 8.1 Amazon SES Configuration

**Current Setup**:
- From address: `laura.rodriguez15@alumni.esade.edu`
- Email sending account: DEVELOPER (using SES)
- Production access: Pending (currently in sandbox mode)
- Region: eu-west-1

**Integration Points**:
- Cognito User Pool (for verification and password reset codes)
- Cognito Email Sender Lambda (custom email templates)
- User Notifications Lambda (for welcome, job match, and digest emails)

### 8.2 Email Types

#### 8.2.1 Verification Codes
- Sent during user signup
- Triggered by Cognito Custom Email Sender Lambda
- Includes 6-digit verification code
- Branded HTML template

#### 8.2.2 Password Reset Codes
- Sent when users request password recovery
- Triggered by Cognito Custom Email Sender Lambda
- Includes 6-digit reset code
- Expires after 1 hour

#### 8.2.3 Welcome Emails
- Sent after successful email verification
- Triggered by Cognito Post-Confirmation event
- Includes platform introduction and getting started guide
- Sent via User Notifications Lambda

#### 8.2.4 Job Match Notifications
- Sent when a job matches user profile with ≥80% match score
- Triggered by Recommendations Lambda
- Includes job title, company, location, match score, and application link
- Sent via User Notifications Lambda

#### 8.2.5 Weekly Job Digests
- Sent weekly via EventBridge schedule (every Monday at 9 AM)
- Triggered by Weekly Digest Lambda
- Includes top job recommendations, trending skills, and platform statistics
- Sent via User Notifications Lambda

### 8.3 Email Templates

All emails use professional HTML templates with:
- ESADE branding and colors
- Responsive design for mobile and desktop
- Clear call-to-action buttons
- Unsubscribe links (for marketing emails)

### 8.4 Production Access

SES is currently in sandbox mode, which limits email sending to verified email addresses. A production access request has been submitted to AWS to enable sending to all ESADE email addresses (@esade.edu and @alumni.esade.edu). Once approved, all email types will work automatically for all ESADE community members.

---

## 9. Monitoring & Observability

Monitoring for the platform is handled comprehensively through AWS CloudWatch, Amazon SNS, and DynamoDB's built-in operational features. Given that all backend components run as serverless functions, observability is automatically integrated into the execution environment. The objective is to ensure that ingestion, enrichment, authentication, email delivery, and API operations can be validated, debugged, and tracked consistently as the platform evolves.

### 9.1 CloudWatch Logs

Each Lambda function automatically publishes execution logs to Amazon CloudWatch. These logs capture key operational details such as:
- API calls and responses
- Data transformations
- Cognito trigger validations
- Email sending status
- Exceptions and errors

**Log Groups**:
- `/aws/lambda/esade-career-dev-job-ingestion`
- `/aws/lambda/esade-career-dev-nlp-enrichment`
- `/aws/lambda/esade-career-dev-recommendations`
- `/aws/lambda/esade-career-dev-user-notifications`
- `/aws/lambda/esade-career-dev-weekly-digest`
- `/aws/lambda/esade-career-dev-cognito-trigger`
- `/aws/lambda/esade-career-dev-cognito-email-sender`

This logging behavior enables traceability during testing and provides visibility into errors without requiring additional instrumentation.

### 9.2 CloudWatch Metrics

AWS generates standard metrics automatically for:
- **Lambda Functions**: Invocation count, duration, errors, throttles, cold starts
- **DynamoDB Tables**: Read/write throughput, throttling, item count, consumed capacity, TTL deletions
- **API Gateway**: Request count, latency, 4xx/5xx errors, cache hits/misses
- **SES**: Send, bounce, complaint, delivery rates

These metrics help verify:
- Whether ingestion runs successfully
- Whether API calls introduce latency spikes
- Whether the recommendations function responds correctly
- Whether email delivery is successful
- Whether DynamoDB tables are performing within limits

### 9.3 CloudWatch Alarms

The platform includes CloudWatch alarms for critical issues:

**Lambda Function Alarms**:
- Error rate thresholds for all Lambda functions
- Throttle detection
- Duration anomalies

**DynamoDB Alarms**:
- Throttling events
- Read/write capacity issues
- Item count anomalies

**API Gateway Alarms**:
- 5xx error rate
- Latency spikes
- Cache performance

All alarms are configured to send notifications to an SNS topic for immediate alerting.

### 9.4 CloudWatch Dashboard

A custom CloudWatch dashboard provides visualization of key metrics:
- Lambda function health
- DynamoDB table performance
- API Gateway request patterns
- Email delivery statistics
- Error rates and trends

This dashboard enables quick assessment of system health and performance.

### 9.5 SNS Notifications

An SNS topic is configured to receive CloudWatch alarm notifications and send email alerts to administrators. This ensures that critical issues are immediately communicated for rapid response.

### 9.6 DynamoDB Native Monitoring

DynamoDB tables in the platform inherit built-in operational metrics such as read/write throughput, throttling, item count, and consumed capacity. Because all tables use on-demand billing mode, capacity scaling is managed automatically. Operational monitoring focuses mainly on verifying that job-ingestion and nlp-enrichment functions update records correctly.

TTL behavior on `jobs-live` and `recommendations` can be monitored through the "TimeToLiveDeletedItemCount" metric, confirming that expired data is being removed as intended.

### 9.7 Cognito Log Events

Amazon Cognito generates event logs for authentication and signup flows, including:
- Failed password attempts
- Invalid email domains
- Verification errors
- Password reset requests

These events are automatically forwarded to CloudWatch Logs, providing a single location to review registration issues, especially during domain validation and password policy enforcement.

### 9.8 Debugging Strategy

Debugging relies on a combination of Lambda logs, CloudWatch metrics, alarms, and controlled test inputs. During development, each function was tested independently by simulating Cognito events, API responses, and DynamoDB updates. The frontend also logs client-side errors in the browser console to support session troubleshooting.

Because the platform is serverless and stateless, debugging focuses on observing execution traces rather than inspecting running servers, allowing issues to be resolved by examining short function-level logs instead of persistent logs or system state.

---

## 10. API Gateway & Caching

The platform uses Amazon API Gateway to provide a RESTful API interface between the frontend and backend Lambda functions.

### 10.1 API Gateway Configuration

**Endpoint**: `https://x5xepr4bsc.execute-api.eu-west-1.amazonaws.com/dev`

**Resources**:
- `/jobs` (GET) – Primary endpoint for job recommendations

**Features**:
- **CORS enabled** for cross-origin requests from CloudFront
- **Lambda integration** with Recommendations Lambda
- **Request/response transformation** for query parameter handling
- **Error handling** with appropriate HTTP status codes

### 10.2 Caching Configuration

**Caching is enabled** on the `/jobs` endpoint with:
- **Cache cluster size**: 0.5 GB
- **TTL**: 300 seconds (5 minutes)
- **Cache key**: Based on query parameters (location, skills)

This caching configuration:
- Reduces Lambda invocations for repeated requests
- Improves response times for users
- Lowers API Gateway and Lambda costs
- Maintains data freshness with 5-minute TTL

**Cache Behavior**:
- Cache hits return cached responses immediately
- Cache misses invoke the Recommendations Lambda
- Cache invalidation can be performed manually if needed

### 10.3 API Usage Patterns

The API Gateway endpoint supports the following usage patterns:

**Get All Jobs**:
```
GET /jobs
```

**Filter by Location**:
```
GET /jobs?location=madrid
```

**Filter by Skills**:
```
GET /jobs?skills=python,sql
```

**Combined Filters**:
```
GET /jobs?location=london&skills=python&user_email=user@esade.edu
```

All responses include CORS headers and are formatted as JSON.

---

## 11. Limitations & Future Enhancements

Although the platform provides a functional, production-ready end-to-end architecture for job ingestion, filtering, authentication, and notifications, there are opportunities for future enhancements that would extend its capabilities, security posture, and analytical depth.

### 11.1 Current Limitations

#### 11.1.1 SES Production Access
SES is currently in sandbox mode, limiting email delivery to verified addresses. Production access approval will enable sending to all ESADE emails automatically.

#### 11.1.2 Basic Skill Matching Algorithm
The current recommendation scoring uses simple keyword matching and linear score boosting. While functional, it could be enhanced with:
- Machine learning-based personalization
- Semantic similarity matching
- User behavior learning
- Weighted skill importance

#### 11.1.3 Limited User Profile Persistence
User preferences are currently stored in browser `localStorage`. While this works for client-side personalization, backend-driven profile persistence would enable:
- Cross-device synchronization
- Historical preference tracking
- Backend-driven personalization improvements

### 11.2 Future Enhancements

#### 11.2.1 Additional API Gateway Endpoints
Future enhancements would add:
- `/profile` (GET/POST): Load and save user preferences to DynamoDB
- `/skills` (GET): Retrieve trending skills from the `skill-trends` table
- `/favorites` (GET/POST): Manage user job favorites in DynamoDB

#### 11.2.2 Complete Recommendation Algorithm
The scoring algorithm could be extended with:
- Weighted skill importance based on market demand
- Location preference matching with proximity scoring
- Industry relevance factors
- Experience level compatibility
- Machine learning-based personalization using user interaction data

#### 11.2.3 Step Functions for Orchestration
AWS Step Functions could unify ingestion and NLP enrichment into a single workflow, improving:
- Error visibility
- Retry handling
- Sequencing and dependencies
- Pipeline resilience

#### 11.2.4 DynamoDB Streams for Real-Time Enrichment
DynamoDB Streams can trigger `nlp-enrichment` automatically whenever a new job is added to `jobs-live`. This would:
- Remove the need for scheduled scans
- Ensure near real-time skill extraction
- Improve data freshness

#### 11.2.5 Advanced NLP with Amazon Comprehend
Enhanced integration with Amazon Comprehend would enable:
- Semantic keyphrase extraction (beyond current implementation)
- Entity recognition for companies and technologies
- Sentiment analysis on job descriptions
- More accurate skill identification

#### 11.2.6 User Profile Synchronization
Connecting the frontend to a `/profile` API endpoint would enable:
- Persistent preferences across devices
- Backend-driven personalization
- Historical preference tracking
- Profile-based recommendation improvements

#### 11.2.7 Additional Monitoring
Enhanced monitoring could include:
- Custom business metrics (job match rates, user engagement)
- Cost tracking and budget alarms
- Performance optimization recommendations
- User behavior analytics

---

## 12. Conclusion

The ESADE Career Intelligence Platform demonstrates a complete, production-ready, serverless cloud architecture capable of acquiring real-time job data across 6 European cities, enriching it through NLP, authenticating users through domain-controlled identity management, and delivering personalized job recommendations through a secure, HTTPS-enabled frontend. Built entirely with AWS managed services and deployed through Terraform, the system achieves a high level of modularity, operational simplicity, security, and observability while remaining cost-efficient and scalable.

The platform includes comprehensive features such as:
- **HTTPS delivery** through CloudFront CDN
- **Email notifications** for verification, password reset, welcome, job matches, and weekly digests
- **Advanced frontend** with statistics, filters, favorites, and modern UI
- **Comprehensive monitoring** with CloudWatch alarms, metrics, dashboards, and SNS notifications
- **Data protection** with DynamoDB Point-in-Time Recovery
- **API optimization** with Gateway caching
- **Automated scheduling** with EventBridge for weekly digests

The project highlights the value of adopting a serverless-first approach for student- and alumni-oriented applications with irregular traffic patterns. It also demonstrates that modular Terraform infrastructure, combined with modern frontend design and comprehensive monitoring, enables rapid iteration while maintaining architectural clarity, security, and operational excellence.

With the current implementation, the platform provides a robust, production-ready tool for supporting career development across the ESADE community. Future enhancements can further extend its capabilities in personalization, analytics, and user engagement.

---

## Annexes

### Annex A: Architecture Diagrams
- See `docs/architecture/AWS_ARCHITECTURE_DIAGRAM_PROMPT.md` for complete architecture diagram
- See `docs/architecture/DIAGRAM_VERIFICATION.md` for verification details

### Annex B: Frontend Code
- `frontend/index.html` – Main HTML structure
- `frontend/js/auth.js` – Authentication logic
- `frontend/js/app.js` – Application logic
- `frontend/js/config.js` – Configuration
- `frontend/css/styles.css` – Styling

### Annex C: Backend Lambda Functions
- `backend/job_ingestion/lambda_function.py` – Job ingestion
- `backend/nlp_enrichment/lambda_function.py` – NLP enrichment
- `backend/recommendations/lambda_function.py` – Recommendations
- `backend/user_notifications/lambda_function.py` – Email notifications
- `backend/weekly_digest/lambda_function.py` – Weekly digests
- `backend/cognito_trigger/lambda_function.py` – Domain validation
- `backend/cognito_email_sender/lambda_function.py` – Custom email sender

### Annex D: Infrastructure as Code
- `terraform/environments/dev/` – Terraform configuration
- `terraform/modules/` – Modular resource definitions

### Annex E: Documentation
- `docs/` – Complete documentation directory
- `README.md` – Project overview

---

**Report Version**: 2.0 (Updated with all enhancements)  
**Last Updated**: 2025  
**Platform Status**: Production-Ready

