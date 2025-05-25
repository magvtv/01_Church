const crypto = require('crypto');

// Generate a secure random string for JWT secret
const generateSecret = () => {
    return crypto.randomBytes(64).toString('hex');
};

console.log('\nYour JWT Secret:');
console.log('================');
console.log(generateSecret());
console.log('\nAdd this to your .env file as JWT_SECRET=your-generated-secret\n'); 