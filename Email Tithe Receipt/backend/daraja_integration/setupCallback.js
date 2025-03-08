/*
- trying to integrate with MPesa Daraja API to receive real-time transaction notifications
and store them in PostgreSQL
- set up callback URLs for confirmation (and optional validation) using the 
C2B register URL API. 
A callback URL is like a mailbox address you give to MPesa. 
When someone sends a tithe using your paybill number (522800) and account number (0101020203030404), MPesa needs to tell your server about the transaction. 
The callback URL is the web address where MPesa will send this information. 


*/
const axios = require('axios');
require('dotenv').config(); // Load environment variables

const config = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE,
    confirmationURL: process.env.MPESA_CALLBACK_URL,
    validationURL: process.env.MPESA_VALIDATION_URL
};

async function getAccessToken() {
    const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
    const response = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        { headers: { Authorization: `Basic ${auth}` } }
    );
    return response.data.access_token;
}

async function registerURLs() {
    const token = await getAccessToken();
    await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl',
        {
            ShortCode: config.shortcode,
            ResponseType: 'Completed',
            ConfirmationURL: config.confirmationURL,
            ValidationURL: config.validationURL
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Callback URLs registered successfully');
}

registerURLs().catch(console.error);