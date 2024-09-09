const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;

const app = express();
app.use(express.json());

// email transporter setup
const transporter = nodemailer.createTransport({
	// Configure your email service here
});

// Load email template
let emailTemplate;
fs.readFile('path/to/email-template.html', 'utf8')
	.then((data) => {
		emailTemplate = data;
	})
	.catch((err) => console.error('Error loading email template:', err));

app.post('/submit-tithe', async (req, res) => {
	const { name, email, amount, date } = req.body;

	// Replace placeholders in the template
	const personalizedEmail = emailTemplate.replace('{name}', name).replace('{amount}', amount).replace('{date}', date);
	// Add more replacements as needed

	try {
		await transporter.sendMail({
			from: 'your-church@example.com',
			to: email,
			subject: 'Tithe Receipt',
			html: personalizedEmail,
		});

		res.status(200).json({ message: 'Receipt sent successfully' });
	} catch (error) {
		console.error('Error sending email:', error);
		res.status(500).json({ message: 'Error sending receipt' });
	}
});

app.listen(3000, () => console.log('Server running on port 3000'));
