require('dotenv').config();
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

// Initialize SES client
const sesClient = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function sendTestEmail() {
    try {
        // Recipient email - use your own email for testing
        const recipientEmail = process.env.TEST_RECIPIENT_EMAIL || process.env.SES_SENDER_EMAIL;
        
        const emailParams = {
            Destination: {
                ToAddresses: [recipientEmail]
            },
            Message: {
                Body: {
                    Html: {
                        Data: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2>AWS SES Email Deliverability Test</h2>
                                <p>Dear Administrator,</p>
                                
                                <p>This is a test email from the Karen Springs SDA Church Tithe Receipt System using AWS SES.</p>
                                
                                <p>If you're seeing this email in your primary inbox, the AWS SES configuration is working correctly!</p>
                                
                                <p>If this email was delivered to your spam folder, please check:</p>
                                <ol>
                                    <li>SPF records for your domain (automatically handled by SES)</li>
                                    <li>DKIM configuration in the SES console</li>
                                    <li>DMARC policy for your domain</li>
                                    <li>SES sending reputation</li>
                                    <li>SES production access status (out of sandbox)</li>
                                </ol>
                                
                                <p>Configuration used:</p>
                                <ul>
                                    <li>AWS Region: ${process.env.AWS_REGION || "us-east-1"}</li>
                                    <li>Sender: ${process.env.SES_SENDER_EMAIL}</li>
                                </ul>
                                
                                <p>Blessings,<br>Karen Springs SDA Church System</p>
                                
                                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                                <p style="font-size: 12px; color: #666;">
                                    This is a test message. No action is required.
                                </p>
                                <p style="font-size: 11px; color: #999;">
                                    To unsubscribe from these notifications, please reply with "UNSUBSCRIBE" in the subject line.
                                </p>
                            </div>
                        `,
                        Charset: "UTF-8"
                    },
                    Text: {
                        Data: `
AWS SES Email Deliverability Test

Dear Administrator,

This is a test email from the Karen Springs SDA Church Tithe Receipt System using AWS SES.

If you're seeing this email in your primary inbox, the AWS SES configuration is working correctly!

If this email was delivered to your spam folder, please check:
1. SPF records for your domain (automatically handled by SES)
2. DKIM configuration in the SES console
3. DMARC policy for your domain
4. SES sending reputation
5. SES production access status (out of sandbox)

Configuration used:
- AWS Region: ${process.env.AWS_REGION || "us-east-1"}
- Sender: ${process.env.SES_SENDER_EMAIL}

Blessings,
Karen Springs SDA Church System

This is a test message. No action is required.
To unsubscribe from these notifications, please reply with "UNSUBSCRIBE" in the subject line.
                        `,
                        Charset: "UTF-8"
                    }
                },
                Subject: {
                    Data: "Test Email - Karen Springs SDA Church",
                    Charset: "UTF-8"
                }
            },
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
                }
            ]
        };

        const command = new SendEmailCommand(emailParams);
        const response = await sesClient.send(command);
        
        console.log('Test email sent successfully!');
        console.log('Message ID:', response.MessageId);
        console.log('From:', process.env.SES_SENDER_EMAIL);
        console.log('To:', recipientEmail);
        console.log('\nTroubleshooting tips if email goes to spam:');
        console.log('1. Add the sender to your contacts');
        console.log('2. Move the email from spam to inbox and mark as "not spam"');
        console.log('3. Reply to the email (engagement helps inbox placement)');
        console.log('4. Verify your domain in the SES console');
        console.log('5. Enable DKIM for your verified domain in SES');
        console.log('6. Request production access to move out of the SES sandbox');

    } catch (error) {
        console.error('Failed to send test email:', error);
        console.log('\nPossible solutions:');
        console.log('1. Verify your AWS credentials are correct');
        console.log('2. Check if your SES_SENDER_EMAIL is verified in the SES console');
        console.log('3. Make sure you have the necessary SES sending permissions');
        console.log('4. If in sandbox mode, verify that your recipient email is also verified');
    }
}

// Run the test
sendTestEmail(); 