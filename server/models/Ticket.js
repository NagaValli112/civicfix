const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true,
        required: true,
        default: () => `T-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    },
    imageUrl: {
        type: String,
        required: true
    },
    userDescription: {
        type: String,
    },
    aiAnalysis: {
        category: String, // e.g., Infrastructure, Sanitation
        issueType: String, // e.g., Pothole, Garbage
        severity: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },
        description: String, // AI refined description
        impact: String,      // AI generated impact analysis
        recommendation: String, // AI generated recommended action
        confidence: Number
    },
    location: {
        lat: Number,
        lng: Number,
        address: String
    },
    department: {
        name: String,
        assignedAt: Date
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Duplicate', 'Rejected'],
        default: 'Open'
    },
    reporter: {
        name: {
            type: String,
            required: true
        },
        contact: {
            type: String,
            required: true
        }
    },
    voteCount: {
        type: Number,
        default: 1
    },
    sla: {
        expectedResolutionDate: Date,
        estimatedHours: Number,
        breachWarning: Boolean
    },
    duplicateOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updates: [{
        reporter: { name: String, contact: String },
        userDescription: String,
        imageUrl: String,
        severity: String, // Track if this update had a specific severity
        timestamp: { type: Date, default: Date.now }
    }]
});

// Create geospatial index for location duplicate search
TicketSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Ticket', TicketSchema);
