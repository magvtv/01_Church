# Email Tithe Receipt System

## 📌 Overview

The **Email Tithe Receipt System** is my digital-first approach to managing tithing records and automating receipts for church members. It ensures that every tither receives a **weekly summary email** of their contributions, eliminating the need for physical receipts while improving transparency, record-keeping, and sustainability.

Additionally, the system will incorporate **M-Pesa Paybill tracking** to log soft cash contributions, ensuring real-time updates for mobile money transactions while also allowing manual entry of hard cash contributions given during church service.

## ✨ Key Features

### 1️⃣ **Automated Weekly Email Receipts**

- Every Sunday morning, contributors receive a **summary email** with their total tithes for the week.
- Helps maintain accountability and financial transparency.
- Encourages continued giving by providing a personalized experience.

### 2️⃣ **Immediate Confirmation for Every Contribution**

- Upon making a tithe payment, contributors receive an **instant email confirmation**.

### 3️⃣ **M-Pesa Paybill Tracking (Soft Cash)**

- Uses **M-Pesa Daraja API** to track **mobile payments** made via the church's Paybill number.
- Automatically logs:
  - **M-Pesa Transaction ID** (10-character code)
  - **Sender’s Name**
  - **Amount Given**
  - **Timestamp**

### 4️⃣ **Hard Cash Contribution Logging**

- Manual entry for **in-person cash donations**, ensuring full tracking of all tithe payments.

### 5️⃣ **Minimalistic Data Storage**

- Stores only **essential details**: Name, Amount, and Date.
- Optimized to **reduce database storage costs** while ensuring fast retrieval.

## 🛠️ Technologies Used

### **Backend**

- **Node.js + Express.js** → API & server logic
- **MongoDB + Mongoose** → Database for storing tithe records
- **Nodemailer** → Sending automated email receipts
- **node-cron** → Scheduling weekly summary emails
- **M-Pesa Daraja API** → Tracking mobile transactions

### **Frontend**

- **HTML, CSS, JavaScript** → Dynamic email templates

### **Security & Best Practices**

- **JWT Authentication** (future enhancement for admin access)
- **Environment Variables** (`dotenv`) to protect API keys & database credentials
- **Rate Limiting** to prevent abuse of API endpoints

## 🏗️ Developer Journey

### **🎯 Inspiration**

The inspiration came from the **challenges of manual tithe collection** in churches:

- Paper receipts were cumbersome and often lost.
- Contributors had no easy way to track their payments.
- Church administration lacked an automated system for efficient reporting.

### **🚀 Expectations**

- Ensure **every contributor receives a digital receipt**.
- Build a **lightweight yet scalable solution**.
- Provide **real-time tracking** for both soft and hard cash tithes.

### **📍 Current State**

✅ **Backend API completed** with MongoDB for data storage.

✅ **Email automation set up** using Nodemailer.

✅ **M-Pesa webhook integration** ready for real-time tracking.

✅ **Cron job successfully automates Sunday summary emails.**

### **🔮 Future Enhancements**

🚀 **Admin Dashboard** → Web portal to track and manage contributions.
🚀 **PDF Receipts** → Generate downloadable PDFs for records.
🚀 **Mobile App Support** → Access tithing history on smartphones.
🚀 **SMS Notifications** → Alternative to email for instant updates.

## 📜 How to Set Up

### **1️⃣ Clone the Repository**

```sh
git clone https://github.com/magvtv/01_church.git
cd Email Tithe Receipt
```

### **2️⃣ Install Dependencies**

```sh
npm install
```

### **3️⃣ Set Up Environment Variables**

Create a `.env` file and add:

```ini
MONGO_URI=your_mongodb_connection_string
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
MPESA_SHORTCODE=your_paybill_number
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-server.com/mpesa-callback
```

### **4️⃣ Start the Server**

```sh
node server.js
```

OR for live reload:

```sh
nodemon server.js
```

## 🎯 Conclusion

This project **bridges the gap between tradition and technology**, making tithing **seamless, digital, and accountable**. With automation and smart integrations, church members and administrators can **focus more on worship and community impact** rather than paperwork. 🙌

Want to contribute? Feel free to fork this repo and send PRs! 🚀
