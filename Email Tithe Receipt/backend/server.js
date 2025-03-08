require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

// Initialize Express App
const app = express();
app.use(cors());
app.use(bodyParser.json());

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, {
// }).then(() => console.log("MongoDB Connected"))
//   .catch(err => console.error("DB Connection Error:", err));

// // Define Mongoose Schema & Model
// const TitheSchema = new mongoose.Schema({
//     name: String,
//     amount: Number,
//     date: { type: Date, default: Date.now }
// });
// const Tithe = mongoose.model('Tithe', TitheSchema);

// PostgreSQL connection
const pool = new Pool({
    user: process.env.SUPABASE_DB_USER,
    host: process.env.SUPAPASE_DB_HOST,
    database: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    port: 6543
});


// // Setup Nodemailer Transporter
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.SMTP_EMAIL,
//         pass: process.env.SMTP_PASSWORD
//     }
// });


// Confirmation callback endpoint
app.post('/confirmation', async (req, res) => {
    console.log('Received MPesa callback:', req.body); // Log the incoming data
    const data = req.body;

    // Example MPesa data structure (adjust based on actual payload)
    const { TransactionType, TransID, TransTime, TransAmount, BusinessShortCode, BillRefNumber, MSISDN } = data;

    try {
        // Save to PostgreSQL
        await pool.query(
            'INSERT INTO tithes (transaciton_date, transaction_id, amount,  sender_phone, account_number) VALUES ($1, $2, $3, $4, $5)',
            [new Date(TransTime), TransID, MSISDN, TransAmount, MSISDN, BillRefNumber]
        );
        console.log('Transaction saved:', TransID);
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
        console.error('Error saving transaction:', error);
        res.json({ ResultCode: 1, ResultDesc: 'Error' });
    }
});


// // API Route to Store Tithe Contribution
// app.post('/tithe', async (req, res) => {
//     try {
//         const { name, amount } = req.body;

//         // Save to database
//         const newTithe = new Tithe({ name, amount });
//         await newTithe.save();

//         res.json({ success: true, message: "Tithe recorded successfully!" });
//     } catch (error) {
//         console.error("Error processing tithe:", error);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// });

// // API Route to Retrieve Past Contributions
// app.get('/tithes', async (req, res) => {
//     try {
//         const { email } = req.query;
//         const records = await Tithe.find({ email }).sort({ date: -1 });
//         res.json(records);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching records" });
//     }
// });

// Start Server
const PORT = process.env.PORT || 6543;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));