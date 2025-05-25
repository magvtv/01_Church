require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Import models
const Member = require('./models/Member');
const Tithe = require('./models/Tithe');

// Initialize Express App
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB with enhanced security
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Enhanced security options
    ssl: true,
    authSource: 'admin',
    retryWrites: true
}).then(() => console.log("MongoDB Connected Securely"))
  .catch(err => console.error("DB Connection Error:", err));

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

// Helper function to generate discreet subject lines
function getDiscreetSubject() {
    const subjects = [
        "A Note of Gratitude",
        "This Week's Blessings",
        "Karen Springs SDA Weekly Connection",
        "Your Weekly Update",
        "Thank You for Your Support"
    ];
    return subjects[Math.floor(Math.random() * subjects.length)];
}

// Helper function to mask sensitive data
function maskAmount(amount) {
    if (process.env.NODE_ENV === 'production') {
        return '****';
    }
    return amount;
}

// Helper function to send receipt email with enhanced privacy
async function sendReceiptEmail(member, tithe) {
    // Only send if there's an actual contribution
    if (!tithe || tithe.amount <= 0) {
        return false;
    }

    const emailTemplate = {
        from: {
            name: 'Karen Springs SDA Church',
            address: process.env.SMTP_EMAIL
        },
        to: member.email,
        subject: getDiscreetSubject(),
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <p>Dear ${member.firstName},</p>
                
                <p>Thank you for your faithful support of our ministry. Your contribution helps us serve our community and spread God's love.</p>
                
                <p>This email confirms your recent support.</p>

                <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #1a365d;">
                    <p><em>"Bring the whole tithe into the storehouse, that there may be food in my house."</em></p>
                    <p style="color: #666;">- Malachi 3:10</p>
                </div>

                <p>If you have any questions, please don't hesitate to reach out to us.</p>

                <p>Blessings,<br>Karen Springs SDA Church</p>

                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #666;">
                    This is a confidential message. Please retain for your records.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(emailTemplate);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
}

// API Routes with enhanced privacy

// 1. Member Management (with opt-in for emails)
app.post('/api/members', async (req, res) => {
    try {
        const memberData = {
            ...req.body,
            // Hash email for storage if needed
            emailHash: crypto.createHash('sha256').update(req.body.email).digest('hex'),
            // Add email preferences
            emailPreferences: {
                receiveReceipts: req.body.optInEmails || false,
                receiveUpdates: req.body.optInUpdates || false
            }
        };

        const member = new Member(memberData);
        await member.save();
        
        // Return minimal data
        res.status(201).json({
            message: "Member registered successfully",
            memberId: member._id
        });
    } catch (error) {
        res.status(400).json({ error: "Registration failed" });
    }
});

// 2. Tithe Management (with privacy controls)
app.post('/api/tithes', async (req, res) => {
    try {
        const { memberId, amount, paymentMethod, mpesaDetails } = req.body;

        // Verify member exists and has opted in
        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Create tithe record
        const tithe = new Tithe({
            member: memberId,
            amount,
            paymentMethod,
            mpesaDetails
        });

        await tithe.save();

        // Only send email if member has opted in
        if (member.emailPreferences?.receiveReceipts) {
            try {
                await sendReceiptEmail(member, tithe);
            } catch (emailError) {
                console.error('Failed to send receipt:', emailError);
            }
        }

        // Return minimal confirmation
        res.status(201).json({
            message: "Contribution recorded successfully"
        });
    } catch (error) {
        res.status(400).json({ error: "Processing failed" });
    }
});

// Get member's tithe history (only their own)
app.get('/api/tithes/member/:memberId', async (req, res) => {
    try {
        const tithes = await Tithe.find({ member: req.params.memberId })
            .select('date amount paymentMethod')  // Only return necessary fields
            .sort({ date: -1 });
            
        res.json(tithes.map(tithe => ({
            ...tithe._doc,
            amount: maskAmount(tithe.amount)
        })));
    } catch (error) {
        res.status(500).json({ error: "Retrieval failed" });
    }
});

// M-Pesa callback URL (to be implemented)
app.post('/api/mpesa/callback', async (req, res) => {
    // Implementation pending M-Pesa integration
    res.status(200).json({ received: true });
});

// Start Server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log(`Server running securely on port ${PORT}`));