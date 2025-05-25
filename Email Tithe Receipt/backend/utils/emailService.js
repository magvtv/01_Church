const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

// Initialize SES client
const sesClient = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Helper function to get discreet subject lines
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

/**
 * Send email using AWS SES
 * @param {Object} member - Member object with email and name
 * @param {Object} tithe - Tithe object with amount and date
 * @returns {Promise<boolean>} - Success status
 */
async function sendReceiptEmail(member, tithe) {
    try {
        // Only send if there's an actual contribution
        if (!tithe || tithe.amount <= 0) {
            return false;
        }

        const emailParams = {
            Destination: {
                ToAddresses: [member.email]
            },
            Message: {
                Body: {
                    Html: {
                        Data: `
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
                    }
                },
                Subject: {
                    Data: getDiscreetSubject()
                }
            },
            Source: `Karen Springs SDA Church <${process.env.SES_SENDER_EMAIL}>`
        };

        const command = new SendEmailCommand(emailParams);
        await sesClient.send(command);
        return true;

    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

/**
 * Send weekly summary email
 * @param {Array} tithes - Array of tithe records for the week
 * @returns {Promise<boolean>} - Success status
 */
async function sendWeeklySummary(tithes) {
    try {
        const totalAmount = tithes.reduce((sum, tithe) => sum + tithe.amount, 0);
        const contributorCount = new Set(tithes.map(t => t.member)).size;

        const emailParams = {
            Destination: {
                ToAddresses: [process.env.WEEKLY_SUMMARY_RECIPIENT]
            },
            Message: {
                Body: {
                    Html: {
                        Data: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2>Weekly Tithe Summary</h2>
                                <p>Period: ${new Date(tithes[0].date).toLocaleDateString()} - ${new Date(tithes[tithes.length-1].date).toLocaleDateString()}</p>
                                
                                <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0;">
                                    <p>Total Contributions: KES ${totalAmount.toLocaleString()}</p>
                                    <p>Number of Contributors: ${contributorCount}</p>
                                </div>

                                <p>This is an automated summary. Please check the system for detailed records.</p>
                            </div>
                        `
                    }
                },
                Subject: {
                    Data: "Weekly Tithe Summary Report"
                }
            },
            Source: `Karen Springs SDA Church <${process.env.SES_SENDER_EMAIL}>`
        };

        const command = new SendEmailCommand(emailParams);
        await sesClient.send(command);
        return true;

    } catch (error) {
        console.error('Failed to send weekly summary:', error);
        return false;
    }
}

module.exports = {
    sendReceiptEmail,
    sendWeeklySummary
}; 