require('dotenv').config();
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const fs = require('fs');
const path = require('path');

// Initialize SES client
const sesClient = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Sample member data
const member = {
    name: "PH Nyarang'o",
    email: "blvckngjr@gmail.com"
};

// Sample tithe data
const tithe = {
    amount: 100,
    date: new Date(),
    paymentMethod: "M-Pesa",
    weeklyTotal: 350 // Added weekly cumulative amount
};

// Sample quote
const quote = {
    quote: "Bring the whole tithe into the storehouse, that there may be food in my house.",
    source: "Malachi 3:10 (NKJV)"
};

async function sendHTMLEmail() {
    try {
        // Format date in a user-friendly way
        const formattedDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Get first name for personalized greeting
        const firstName = member.name.split(' ')[0];

        // Current year for copyright
        const currentYear = new Date().getFullYear();

        // Create HTML email content based on the frontend template with requested changes
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Tithe Receipt</title>
            <style>
                /* Base font size for relative em calculations */
                html {
                    font-size: 16px;
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f9f9f9;
                    max-width: 37.5em; /* 600px / 16px = 37.5em */
                    margin: 0 auto;
                    padding: 1.25em; /* 20px / 16px = 1.25em */
                    font-size: 1em; /* 16px */
                }
                
                .container {
                    max-width: 50em; /* 800px / 16px = 50em */
                    margin: 0 auto;
                    background-color: white;
                    padding: 2.5em; /* 40px / 16px = 2.5em */
                    box-shadow: 0 0 0.625em rgba(0, 0, 0, 0.05); /* 10px / 16px = 0.625em */
                }
                
                /* Header */
                header h1 {
                    text-align: center;
                    color: #1A1A1A;
                    background: #f4f4f4;
                    padding: 1.175em; /* 18.8px / 16px = 1.175em */
                    border-radius: 0.625em; /* 10px / 16px = 0.625em */
                    text-transform: capitalize;
                    font-size: 1.75em; /* 28px / 16px = 1.75em */
                }
                
                /* Main Content */
                main {
                    padding: 1.25em 0; /* 20px / 16px = 1.25em */
                    font-size: 1.0625em; /* 17px / 16px = 1.0625em */
                }
                
                .greeting {
                    margin: 1.875em 0 0.625em 0; /* 30px / 16px = 1.875em, 10px / 16px = 0.625em */
                    font-size: 1.0625em; /* 17px / 16px = 1.0625em */
                }
                
                .opener {
                    margin: 0.625em 0 1.25em 0; /* 10px / 16px = 0.625em, 20px / 16px = 1.25em */
                    line-height: 1.7;
                }
                
                .tithe-amount {
                    color: #007f2e;
                    font-weight: 700;
                }
                
                /* Quote Section */
                .quote {
                    background-color: #e8f4ff;
                    padding: 1.25em; /* 20px / 16px = 1.25em */
                    margin: 1.875em 0; /* 30px / 16px = 1.875em */
                    border-left: 0.25em solid #1a75d2; /* 4px / 16px = 0.25em */
                    font-style: italic;
                    line-height: 1.7;
                    font-size: 1.15em;
                }
                
                .quote p {
                    margin: 0;
                    padding: 0;
                    font-size: inherit;
                }
                
                .quote__source {
                    display: block;
                    margin-top: 0.625em; /* 10px / 16px = 0.625em */
                    font-style: italic;
                    color: #666;
                    text-align: right;
                    font-size: inherit;
                }
                
                /* Transaction Details - exactly matching quote styling */
                .transaction-details {
                    background-color: #e8f4ea;
                    border-left: 0.25em solid #007f2e; /* 4px / 16px = 0.25em */
                    padding: 1.25em; /* 20px / 16px = 1.25em */
                    margin: 1.875em 0; /* 30px / 16px = 1.875em */
                    font-style: italic;
                    line-height: 1.7;
                    font-size: 1.15em;
                }
                
                .transaction-details p {
                    margin: 0.3125em 0; /* 5px / 16px = 0.3125em */
                    font-size: inherit;
                }
                
                .transaction-amount {
                    font-weight: 700;
                    color: #007f2e;
                }
                
                /* Appreciation Section */
                .appreciation {
                    margin: 1.875em 0; /* 30px / 16px = 1.875em */
                    line-height: 1.8;
                }
                
                /* Footer */
                footer {
                    background-color: #f4f4f4;
                    border-radius: 0.25em; /* 4px / 16px = 0.25em */
                    padding: 1em; /* 16px / 16px = 1em */
                    text-align: center;
                    margin-top: 1.875em; /* 30px / 16px = 1.875em */
                }
                
                footer p {
                    font-weight: 600;
                    padding: 0.5em 0; /* 8px / 16px = 0.5em */
                    font-size: 0.9em; /* 14.4px / 16px = 0.9em */
                    margin: 0;
                }
                
                .phone-contact {
                    font-weight: 500;
                    font-size: 0.9em; /* 14.4px / 16px = 0.9em */
                    margin: 0.625em 0; /* 10px / 16px = 0.625em */
                }
                
                .copyright {
                    margin-top: 1.5em; /* 24px / 16px = 1.5em */
                    text-align: center;
                    font-size: 0.8em; /* 12.8px / 16px = 0.8em */
                    color: #888;
                    padding: 0.5em 0; /* 8px / 16px = 0.5em */
                    border-top: 0.0625em solid #e5e5e5; /* 1px / 16px = 0.0625em */
                }
                
                .copyright p {
                    font-weight: 500;
                    font-size: 0.8em; /* 12.8px / 16px = 0.8em */
                }
                
                .unsubscribe {
                    text-align: center;
                    font-size: 0.75em;
                    color: #999;
                    margin-top: 1em;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>
                        Thank You For Your Tithe
                    </h1>
                </header>

                <main>
                    <p class="greeting">
                        Dear ${firstName},
                    </p>

                    <p class="opener">
                        We are grateful for your generous contribution of 
                        <span class="tithe-amount">${formatCurrency(tithe.amount)}</span> which is a true blessing to the church.
                        This empowers us to spread God's love, support our community outreach and sustain programs that uplift those in need.
                    </p>

                    <div class="transaction-details">
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        <p><strong>Payment Method:</strong> ${tithe.paymentMethod}</p>
                        <p><strong>This Contribution:</strong> <span class="transaction-amount">${formatCurrency(tithe.amount)}</span></p>
                        <p><strong>Weekly Total:</strong> <span class="transaction-amount">${formatCurrency(tithe.weeklyTotal)}</span></p>
                    </div>

                    <div class="quote">
                        <p>"${quote.quote}"</p>
                        <span class="quote__source">- ${quote.source}</span>
                    </div>

                    <div class="appreciation">
                        <p>
                            We are deeply thankful for your faithfulness and commitment to our shared mission. 
                            Your support strengthens our church family and honors God.
                        </p>
                        <br>
                        <p>
                            Regards,
                            <br>
                            Tech staff.
                        </p>
                    </div>
                </main>

                <footer>
                    <p>
                        This is an official receipt of your church contribution. 
                        Kindly retain it for reference purposes.
                    </p>
                    
                    <p class="phone-contact">
                        <strong>Contact Phone:</strong> +254 747 649 768
                    </p>
                </footer>
                
                <div class="copyright">
                    <p>
                        300 Sky Dale - Miotoni - Karen
                    </p>
                    <p>&copy; ${currentYear} Karen Springs SDA Home Church. All rights reserved.</p>
                </div>
                
                <div class="unsubscribe">
                    <p>To unsubscribe from these notifications, please reply with "UNSUBSCRIBE" in the subject line.</p>
                </div>
            </div>
        </body>
        </html>
        `;
        
        // Create plain text version of the email (important for avoiding spam filters)
        const plainTextContent = `
Thank You For Your Tithe

Dear ${firstName},

We are grateful for your generous contribution of ${formatCurrency(tithe.amount)} which is a true blessing to the church.
This empowers us to spread God's love, support our community outreach and sustain programs that uplift those in need.

TRANSACTION DETAILS:
Date: ${formattedDate}
Payment Method: ${tithe.paymentMethod}
This Contribution: ${formatCurrency(tithe.amount)}
Weekly Total: ${formatCurrency(tithe.weeklyTotal)}

"${quote.quote}"
- ${quote.source}

We are deeply thankful for your faithfulness and commitment to our shared mission. 
Your support strengthens our church family and honors God.

Regards,
Tech staff.

This is an official receipt of your church contribution. Kindly retain it for reference purposes.

Contact Phone: +254 747 649 768

300 Sky Dale - Miotoni - Karen
© ${currentYear} Karen Springs SDA Home Church. All rights reserved.

To unsubscribe from these notifications, please reply with "UNSUBSCRIBE" in the subject line.
        `;

        const emailParams = {
            Destination: {
                ToAddresses: [member.email] // Send to blvckngjr@gmail.com
            },
            Message: {
                Body: {
                    Html: {
                        Data: htmlContent,
                        Charset: "UTF-8"
                    },
                    Text: {
                        Data: plainTextContent,
                        Charset: "UTF-8"
                    }
                },
                Subject: {
                    Data: `Your Tithe Receipt - ${formatCurrency(tithe.amount)}`, // Clear, specific subject line
                    Charset: "UTF-8"
                }
            },
            // Use full proper name in From field to reduce spam likelihood
            Source: `Karen Springs SDA Church <${process.env.SES_SENDER_EMAIL}>`,
            // Add headers to help avoid spam filters
            Headers: [
                {
                    Name: "List-Unsubscribe",
                    Value: `<mailto:${process.env.SES_SENDER_EMAIL}?subject=unsubscribe>`
                },
                {
                    Name: "Precedence", 
                    Value: "bulk"
                },
                {
                    Name: "X-Auto-Response-Suppress",
                    Value: "OOF"
                },
                {
                    Name: "X-Priority",
                    Value: "3"
                },
                {
                    Name: "Importance",
                    Value: "Normal"
                },
                {
                    Name: "X-Report-Abuse",
                    Value: `Please report abuse to: ${process.env.SES_SENDER_EMAIL}`
                }
            ],
            // Configure return path for bounces
            ReturnPath: process.env.SES_SENDER_EMAIL
        };

        const command = new SendEmailCommand(emailParams);
        await sesClient.send(command);
        console.log('Email sent successfully!');
        console.log('From:', process.env.SES_SENDER_EMAIL);
        console.log('To:', member.email);
        console.log('Subject: Your Tithe Receipt');
        console.log('Amount:', formatCurrency(tithe.amount));

    } catch (error) {
        console.error('Failed to send email:', error);
        console.log('\nTroubleshooting tips:');
        console.log('1. Verify that blvckngjr@gmail.com is verified in your SES console');
        console.log('2. Check your AWS credentials');
        console.log('3. Make sure you\'re in the correct region (currently using:', process.env.AWS_REGION, ')');
        console.log('4. If emails go to spam, ask recipients to:');
        console.log('   - Add your sender address to their contacts');
        console.log('   - Mark your emails as "not spam" if they find them in spam folder');
        console.log('   - Reply to one of your emails (engagement helps inbox placement)');
    }
}

sendHTMLEmail();