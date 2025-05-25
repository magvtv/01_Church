const mongoose = require('mongoose');

const TitheSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['MPESA', 'CASH', 'BANK_TRANSFER'],
        required: true
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true // Only required for MPESA transactions
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'COMPLETED'
    },
    receiptSent: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: String,
    // For MPESA specific details
    mpesaDetails: {
        senderPhone: String,
        senderName: String,
        referenceNumber: String
    }
});

// Index for efficient querying
TitheSchema.index({ member: 1, date: -1 });
TitheSchema.index({ transactionId: 1 }, { sparse: true });

module.exports = mongoose.model('Tithe', TitheSchema); 