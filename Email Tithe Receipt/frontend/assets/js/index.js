/*
1. Dynamic biblical and EGW quotes and church member information
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
    const randomBase = Math.floor(Math.random() * 3000) + 500; // Range: 500 to 3499
    return Math.round(randomBase / 10) * 10; // Round to nearest 10
}

// Function to populate the receipt
async function populateReceipt() {
    try {
        // First try to fetch from backend API if it's running
        let members, quotes;

        try {
            // Attempt to fetch from backend API
            const [membersResponse, quotesResponse] = await Promise.all([
                fetch('http://localhost:5000/api/members'),
                fetch('http://localhost:5000/api/quotes')
            ]);
            
            if (membersResponse.ok && quotesResponse.ok) {
                members = await membersResponse.json();
                quotes = await quotesResponse.json();
                console.log("Using data from backend API");
            } else {
                throw new Error("Backend API not available");
            }
        } catch (apiError) {
            console.log("Falling back to local JSON files", apiError);
            // Fallback to local JSON files
            const [membersResponse, quotesResponse] = await Promise.all([
                fetch('assets/data/churchMembers.json'),
                fetch('assets/data/shortQuotes.json')
            ]);

            if (!membersResponse.ok || !quotesResponse.ok) {
                throw new Error('Failed to fetch data from local files');
            }

            members = await membersResponse.json();
            quotes = await quotesResponse.json();
        }

        // Select random member and quote
        const randomMember = members[Math.floor(Math.random() * members.length)];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        // Get first name for personalized greeting
        const firstName = randomMember.name ? randomMember.name.split(' ')[0] : 
                        (randomMember.firstName || "Valued Member");

        // Set member name
        document.getElementById('memberName').textContent = firstName;

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
        document.getElementById('memberName').textContent = 'Valued Member';
        document.getElementById('titheAmount').textContent = 'KES 0.00';
        document.getElementById('quoteDetail').textContent = 'Error loading quote';
        document.querySelector('.quote__source').textContent = '';
    }
}

// Function to set the current year in the copyright
function setCurrentYear() {
    const currentYear = new Date().getFullYear();
    document.getElementById('currentYear').textContent = currentYear;
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    populateReceipt();
    setCurrentYear();
});