const mongoose = require('mongoose');
const snippetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    language: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reviewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['Pending Review', 'Reviewed'],
        default: 'Pending Review',
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model("Snippet", snippetSchema);