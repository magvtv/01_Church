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

// Helper function to format currency
function formatCurrency(amount) {
    return amount.toLocaleString('en-KE', { 
        style: 'currency', 
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

// Helper function to get a random quote
function getRandomQuote() {
    const quotes = [
        {
            quote: "Bring the whole tithe into the storehouse, that there may be food in my house.",
            source: "Malachi 3:10"
        },
        {
            quote: "The generous soul will be made rich and he who waters will also be watered.",
            source: "Proverbs 11:25"
        },
        {
            quote: "Lay up for yourselves treasures in heaven... For where your treasure is, there your heart will be also.",
            source: "Matthew 6:20-21"
        }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
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
        
        // Get a random inspirational quote
        const quote = getRandomQuote();
        
        // Format date in a user-friendly way
        const formattedDate = new Date(tithe.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const emailParams = {
            Destination: {
                ToAddresses: [member.email]
            },
            Message: {
                Body: {
                    Html: {
                        Data: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="display: flex; align-items: center; justify-content: center; padding: 15px 0; margin: 0 0 20px 0;">
                                    <span style="font-size: 1.35rem; text-align: center; text-transform: capitalize; font-weight: 600; color: #1a365d;">Karen Springs SDA Church</span>
                                </div>
                                
                                <div style="text-align: center; padding: 1.175rem; background: #f4f4f4; border-radius: 10px; margin-bottom: 20px;">
                                    <h1 style="color: #1A1A1A; text-transform: capitalize; font-size: 1.75rem; margin: 0;">Tithe Receipt</h1>
                                </div>
                                
                                <p style="margin: 10px 0 0 0;">Dear ${member.firstName || member.name.split(' ')[0]},</p>
                                
                                <p style="margin: 20px 0; line-height: 1.7;">
                                    Thank you for your faithful contribution of ${formatCurrency(tithe.amount)} 
                                    which is a true blessing to the church. Your generous support helps our ministry 
                                    continue to serve our community and spread God's love.
                                </p>
                                
                                <div style="background-color: #e8f4ff; padding: 20px; margin: 30px 0; border-left: 4px solid #1a75d2; font-style: italic; line-height: 1.7;">
                                    <p style="margin: 0;">"${quote.quote}"</p>
                                    <span style="display: block; margin-top: 10px; color: #666; text-align: right;">- ${quote.source}</span>
                                </div>
                                
                                <p style="margin: 30px 0; line-height: 1.8;">
                                    We appreciate your commitment to supporting our church's mission through 
                                    your tithes and offerings. May God continue to bless you abundantly.
                                </p>
                                
                                <p>Received on: ${formattedDate}</p>
                                <p>Payment method: ${tithe.paymentMethod || 'Electronic Transfer'}</p>

                                <div style="background-color: #f4f4f4; border-radius: 0.25rem; padding: 0.5rem 1rem; margin-top: 30px;">
                                    <p style="text-align: center; font-weight: 600; padding: 0.5rem 0; font-size: 0.75rem;">Karen Springs SDA Church</p>
                                    <div style="margin: 0.5rem auto; padding: 0 0.5rem 0 0; display: flex; flex-direction: row; justify-content: space-evenly;">
                                        <span style="font-weight: 500; font-size: 0.75rem; text-align: center; padding: 0.25rem;">Email: karenspringshomechurch@gmail.com</span>
                                        <span style="font-weight: 500; font-size: 0.75rem; text-align: center; padding: 0.25rem;">Phone: +254 722 000 000</span>
                                    </div>
                                </div>
                                
                                <div style="margin-top: 1.5rem; text-align: center; font-size: 0.7rem; color: #888; padding: 0.5rem 0; border-top: 1px solid #e5e5e5;">
                                    <p style="font-weight: 500;">This is a confidential message. Please retain for your records.</p>
                                </div>
                            </div>
                        `,
                        Charset: "UTF-8"
                    }
                },
                Subject: {
                    Data: getDiscreetSubject(),
                    Charset: "UTF-8"
                }
            },
            Source: `Karen Springs SDA Church <${process.env.SES_SENDER_EMAIL}>`,
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
        await sesClient.send(command);
        console.log(`Receipt email sent successfully to ${member.email}`);
        return true;

    } catch (error) {
        console.error('Failed to send receipt email:', error);
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
        if (!tithes || tithes.length === 0) {
            console.log('No tithes to summarize for the week');
            return false;
        }

        const totalAmount = tithes.reduce((sum, tithe) => sum + tithe.amount, 0);
        const contributorCount = new Set(tithes.map(t => t.member)).size;
        
        // Format date range
        const startDate = new Date(tithes[0].date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric'
        });
        
        const endDate = new Date(tithes[tithes.length-1].date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        const emailParams = {
            Destination: {
                ToAddresses: [process.env.WEEKLY_SUMMARY_RECIPIENT || process.env.SES_SENDER_EMAIL]
            },
            Message: {
                Body: {
                    Html: {
                        Data: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="text-align: center; padding: 1.175rem; background: #f4f4f4; border-radius: 10px; margin-bottom: 20px;">
                                    <h1 style="color: #1A1A1A; font-size: 1.75rem; margin: 0;">Weekly Tithe Summary</h1>
                                </div>
                                
                                <p>Dear Church Administrator,</p>
                                
                                <p>Here is the weekly summary of tithes received during the period of ${startDate} - ${endDate}:</p>
                                
                                <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border: 1px solid #e9ecef; border-radius: 5px;">
                                    <p style="font-size: 1.2rem; font-weight: bold; margin-bottom: 15px;">Summary Statistics:</p>
                                    <p style="margin: 10px 0;"><strong>Total Contributions:</strong> ${formatCurrency(totalAmount)}</p>
                                    <p style="margin: 10px 0;"><strong>Number of Contributors:</strong> ${contributorCount}</p>
                                    <p style="margin: 10px 0;"><strong>Average Contribution:</strong> ${formatCurrency(totalAmount / contributorCount)}</p>
                                </div>

                                <p style="margin-top: 30px;">This is an automated summary. Please check the system for detailed records.</p>
                                
                                <p>Blessings,<br>Karen Springs SDA Church System</p>
                                
                                <div style="margin-top: 1.5rem; text-align: center; font-size: 0.7rem; color: #888; padding: 0.5rem 0; border-top: 1px solid #e5e5e5;">
                                    <p style="font-weight: 500;">This is a confidential administrative message.</p>
                                </div>
                            </div>
                        `,
                        Charset: "UTF-8"
                    }
                },
                Subject: {
                    Data: "Weekly Tithe Summary Report",
                    Charset: "UTF-8"
                }
            },
            Source: `Karen Springs SDA Church <${process.env.SES_SENDER_EMAIL}>`,
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
        await sesClient.send(command);
        console.log('Weekly summary email sent successfully');
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