const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const summarySchema = new Schema({
    userId: { type: String, required: true },
    orderId: { type: String, required: false },
    summary: { type: String, required: true }
}, { timestamps: true });

const Summary = mongoose.model('summary', summarySchema);
module.exports = Summary;
