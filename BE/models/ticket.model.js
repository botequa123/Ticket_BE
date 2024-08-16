const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    department: {
        type: String,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
    },
    status: {
        type: String,
        enum: ['Chưa xử lý', 'Đang xử lý', 'Đã xử lý'],
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    handlingContent: {
        type: String
    },
    handler: {
        type: String
    }
});

const Ticket = mongoose.model("Ticket", TicketSchema);
module.exports = Ticket;
