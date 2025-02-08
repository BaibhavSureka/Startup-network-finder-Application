# 🚀 Startup Network Finder Application

## Overview
The **Startup Network Finder Application** is a full-stack platform that helps startup founders find **investors** and **mentors** based on their specific needs. Users can search for relevant mentors/investors and interact with the system using AI-powered responses.

## 🌟 Features

### ✅ Authentication
* Users must log in using **Google Authentication** (Gmail).

### 🔍 Search Functionality
* Users enter a query in a **search box** after logging in
* The system matches the query with **database entries** and forwards it to **Gemini API** or **ChatGPT API** for a suitable response

### 🎟️ Credit System
* Each user starts with **5 credits**
* Every search **reduces 1 credit**
* If the credits **reach 0**, users receive an error:  
  `"Your credits are exhausted. Please check your email to recharge."`
* An automatic email is sent requesting them to recharge

### ✉️ Recharge System
* Users can **send an email** with the subject: `"recharge 5 credits"`
* The backend detects this email using the **Gmail API** and adds **5 credits** to the user's account
* If the same user requests a **second recharge**, they receive an email:  
  `"Sorry, we are not offering additional credits at this time."`

## 🛠️ Tech Stack

| Component | Technology Used |
|-----------|----------------|
| Frontend | React.js / Next.js |
| Backend | Node.js / Nest.js|
| Database | Supabase |
| Authentication | Google OAuth (NextAuth.js) |
| AI Integration | Gemini API / OpenAI ChatGPT API |
| Email Handling | Gmail API |

## 📂 Database Structure

### Investors & Mentors Table (Example Data)

| Name | Category | Type |
|------|----------|------|
| Ria | AI | Investor |
| Martin | Blockchain | Mentor |
| Leo | EV | Mentor |
| Zack | Ecommerce | Mentor |
| Honia | Video | Investor |

### Users Table

| Email | Credits | Timestamp |
|-------|---------|-----------|
| Georgie@gmail.com | 5 | 2025-02-02T00:02:02 |
| Hash@gmail.com | 5 | 2025-02-03T05:28:27 |

## 📌 How to Run the Project Locally

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/startup-network-finder.git
cd startup-network-finder
```

### 2️⃣ Set Up Environment Variables
Create a `.env.local` file in the root directory and add:
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Gmail API Configuration
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key

# Email Server Configuration
EMAIL_SERVER_USER=your_email_server_user
EMAIL_SERVER_PASSWORD=your_email_server_password
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_FROM=noreply@example.com
```

### Important Notes:
* Never commit your `.env.local` file to version control
* Keep your API keys and secrets secure
* For development, use `http://localhost:3000` as your `NEXTAUTH_URL`
* Make sure to enable the necessary Google Cloud Console APIs for Gmail and OAuth
* Configure your email server settings according to your provider

### 3️⃣ Install Dependencies
```bash
npm install
```

### 4️⃣ Run the Development Server
```bash
npm run dev
```
Visit http://localhost:3000 to access the application.

## 📜 License
This project is licensed under the MIT License.

## 📞 Contact
For any queries, reach out to:  
✉️ baibhavsureka1@gmail.com

## 🔥 Developed by
Baibhav Sureka
