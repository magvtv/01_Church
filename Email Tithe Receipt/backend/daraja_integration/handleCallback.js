/*
- set up an endpoint to receive transaction details from MPesa and store them in PostgreSQL

After a member sends KES 400 via MPesa using paybill 522800 and account number 0101020203030404, 
MPesa sends a confirmation message to their phone. At the same time, it sends a POST request to your registered callback URL
Your server needs to catch this data, save it (e.g., to a database), and tell MPesa, “Got it!”


*/
const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

// Connect to your PostgreSQL database
const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL
});

// Handle the confirmation callback
app.post('/confirmation', async (req, res) => {
    const data = req.body; // The transaction details from MPesa
    const { TransID, TransTime, TransAmount, BillRefNumber, MSISDN } = data;

    try {
        // Save the transaction to the database
        await pool.query(
            'INSERT INTO tithes (transaction_date, transaction_id, amount, sender_phone, account_number) VALUES ($1, $2, $3, $4, $5)',
            [new Date(TransTime), TransID, TransAmount, MSISDN, BillRefNumber]
        );
        // Tell MPesa we received it
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
        console.error('Error:', error);
        res.json({ ResultCode: 1, ResultDesc: 'Error' });
    }
});

// Start the server on port 5000
app.listen(5000, () => console.log('Server running on port 5000'));