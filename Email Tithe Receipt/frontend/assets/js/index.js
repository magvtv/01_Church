/*
1. want to have a manner for having dynamic biblical and egw quotes

*/

// Function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
    }).format(amount);
}

// Function to get random tithe amount (for demo purposes)
function getRandomTitheAmount() {
    const randomBase = Math.floor(Math.random() * 5000) + 500; // Range: 500 to 5499
    return Math.round(randomBase / 10) * 10; // Round to nearest 10
}

// Function to populate the receipt
async function populateReceipt() {
    try {
        // Fetch both JSON files
        const [membersResponse, quotesResponse] = await Promise.all([
            fetch('../data/churchMembers.json'),
            fetch('../data/shortQuotes.json')
        ]);

        if (!membersResponse.ok || !quotesResponse.ok) {
            throw new Error('Failed to fetch data');
        }

        const members = await membersResponse.json();
        const quotes = await quotesResponse.json();

        // Select random member and quote
        const randomMember = members[Math.floor(Math.random() * members.length)];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        // Get first name for personalized greeting
        const firstName = randomMember.name.split(' ')[0];

        // Set member name
        document.getElementById('memberName').textContent = firstName + ',';

        // Set random tithe amount
        const titheAmount = getRandomTitheAmount();
        document.getElementById('titheAmount').textContent = 
            formatCurrency(titheAmount);

        // Set quote
        document.getElementById('quoteDetail').textContent = `"${randomQuote.quote}"`;
        document.querySelector('.quote__source').textContent = `- ${randomQuote.source}`;

    } catch (error) {
        console.error('Error loading data:', error);
        // Show fallback data in case of error
        document.getElementById('memberName').textContent = 'Valued Member,';
        document.getElementById('titheAmount').textContent = 'KES 0.00';
        document.getElementById('quoteDetail').textContent = 'Error loading quote';
        document.querySelector('.quote__source').textContent = '';
    }
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', populateReceipt);