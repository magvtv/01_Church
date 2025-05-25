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
        const emailParams = {
            Destination: {
                ToAddresses: [process.env.SES_SENDER_EMAIL] // Send to yourself first
            },
            Message: {
                Body: {
                    Html: {
                        Data: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2>AWS SES Test Email</h2>
                                <p>If you're reading this, your AWS SES configuration is working correctly!</p>
                                <p>Configuration used:</p>
                                <ul>
                                    <li>Region: ${process.env.AWS_REGION}</li>
                                    <li>Sender: ${process.env.SES_SENDER_EMAIL}</li>
                                </ul>
                            </div>
                        `
                    }
                },
                Subject: {
                    Data: "Test Email - Karen Springs SDA Tithe System"
                }
            },
            Source: `Karen Springs SDA Church <${process.env.SES_SENDER_EMAIL}>`
        };

        const command = new SendEmailCommand(emailParams);
        await sesClient.send(command);
        console.log('Test email sent successfully!');
        console.log('Check your inbox at:', process.env.SES_SENDER_EMAIL);

    } catch (error) {
        console.error('Failed to send test email:', error);
        console.log('\nTroubleshooting tips:');
        console.log('1. Verify your email address is verified in SES');
        console.log('2. Check your AWS credentials');
        console.log('3. Make sure you\'re in the correct region');
        console.log('4. Ensure your account is out of the sandbox (if sending to non-verified emails)');
    }
}

sendTestEmail(); 