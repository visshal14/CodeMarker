const mongoose = require('mongoose');

const changeHistorySchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['comment', 'code-change'],
        required: true,
    },
    detail: {
        type: String,
        required: true
    },
    snippetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Snippet',
        required: true,
    },
});
module.exports = mongoose.model('ChangeHistory', changeHistorySchema);