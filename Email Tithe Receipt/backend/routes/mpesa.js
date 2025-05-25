const express = require('express');
const router = express.Router();
const Tithe = require('../models/Tithe');
const Member = require('../models/Member');

// M-Pesa callback handler
router.post('/callback', async (req, res) => {
    try {
        const {
            TransactionType,
            TransID,
            TransTime,
            TransAmount,
            BusinessShortCode,
            BillRefNumber, // This can be your member ID
            PhoneNumber,
            FirstName
        } = req.body;

        // Verify this is a valid M-Pesa transaction
        if (BusinessShortCode !== process.env.MPESA_SHORTCODE) {
            throw new Error('Invalid business code');
        }

        // Find member by phone number
        const member = await Member.findOne({ 
            phoneNumber: PhoneNumber.replace('+254', '0') 
        });

        // Create tithe record
        const tithe = new Tithe({
            member: member ? member._id : null,
            amount: TransAmount,
            paymentMethod: 'MPESA',
            mpesaDetails: {
                transactionId: TransID,
                senderPhone: PhoneNumber,
                senderName: FirstName,
                referenceNumber: BillRefNumber
            },
            date: new Date(TransTime)
        });

        await tithe.save();

        // Send receipt if member exists and has opted in
        if (member && member.emailPreferences?.receiveReceipts) {
            // Import your email sending function
            const { sendReceiptEmail } = require('../utils/email');
            await sendReceiptEmail(member, tithe);
        }

        // Acknowledge receipt to Safaricom
        res.json({
            ResultCode: 0,
            ResultDesc: "Success"
        });

    } catch (error) {
        console.error('M-Pesa callback error:', error);
        res.status(500).json({
            ResultCode: 1,
            ResultDesc: "Internal Server Error"
        });
    }
});

module.exports = router; 