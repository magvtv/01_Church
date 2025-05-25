require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("DB Connection Error:", err));

// Define Schema for Church Members
const MemberSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String
});
const Member = mongoose.model('Member', MemberSchema);

// Read JSON File
const members = JSON.parse(fs.readFileSync('./data/churchMembers.json', 'utf-8'));

// Insert Data into MongoDB
const importData = async () => {
    try {
        await Member.insertMany(members);
        console.log("Church members imported successfully!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error importing members:", error);
    }
};

// Run the Import Function
importData();
