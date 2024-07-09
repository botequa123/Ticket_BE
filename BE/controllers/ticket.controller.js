const db = require("../models");
const Ticket = db.ticket;

// Create and Save a new Ticket
exports.create = async (req, res) => {
    if (!req.body.title) {
        return res.status(400).send({ message: "Content can not be empty!" });
    }

    const ticket = new Ticket({
        title: req.body.title,
        description: req.body.description,
        department: req.body.department,
        priority: req.body.priority,
        status: req.body.status,
        handlingContent: req.body.handlingContent,
        handler: req.body.handler
    });

    try {
        const data = await ticket.save();
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Ticket."
        });
    }
};


// Retrieve all Tickets from the database.
exports.findAll = async (req, res) => {
    const { page = 1, limit = 10, title, department, priority, status } = req.query;

    let filter = {};
    if (title) filter.title = { $regex: new RegExp(title, "i") };
    if (department) filter.department = department;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    try {
        const tickets = await Ticket.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Ticket.countDocuments(filter);

        res.status(200).send({
            tickets,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


// Update a Ticket by the id in the request
exports.update = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    try {
        const ticket = await Ticket.findById(id);
        if (!ticket) {
            res.status(404).send({ message: `Cannot update Ticket with id=${id}. Maybe Ticket was not found!` });
            return;
        }

        const updatedData = { ...req.body, title: ticket.title, description: ticket.description };

        if (req.body.handlingContent !== undefined) {
            updatedData.handlingContent = req.body.handlingContent;
        }
        if (req.body.handler !== undefined) {
            updatedData.handler = req.body.handler;
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(id, updatedData, { useFindAndModify: false, new: true });
        res.send(updatedTicket);
    } catch (err) {
        res.status(500).send({
            message: "Error updating Ticket with id=" + id
        });
    }
};

// Delete a Ticket with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Ticket.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Ticket with id=${id}. Maybe Ticket was not found!`
                });
            } else {
                res.send({
                    message: "Ticket was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Ticket with id=" + id
            });
        });
};
exports.getTotalTickets = async (req, res) => {
    try {
        const count = await Ticket.countDocuments();
        res.status(200).send({ totalTickets: count });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};