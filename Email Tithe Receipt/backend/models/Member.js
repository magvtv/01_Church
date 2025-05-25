const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        select: false
    },
    emailHash: {
        type: String,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        select: false
    },
    membershipNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    dateJoined: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    emailPreferences: {
        receiveReceipts: {
            type: Boolean,
            default: false
        },
        receiveUpdates: {
            type: Boolean,
            default: false
        }
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    updatedBy: String
});

MemberSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

MemberSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.email;
    delete obj.phoneNumber;
    delete obj.emailHash;
    return obj;
};

module.exports = mongoose.model('Member', MemberSchema); 