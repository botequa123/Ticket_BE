const { authJwt } = require("../middlewares");
const controller = require("../controllers/ticket.controller");

module.exports = function (app) {
    app.use(function (_req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept, Authorization"
        );
        next();
    });

    app.post("/api/tickets", [authJwt.verifyToken], controller.create);
    app.get("/api/tickets", [authJwt.verifyToken], controller.findAll);
    app.put("/api/tickets/:id", [authJwt.verifyToken, isIT], controller.update);
    app.delete("/api/tickets/:id", [authJwt.verifyToken, isIT], controller.delete);
    app.get('/api/tickets/total', [authJwt.verifyToken], controller.getTotalTickets);
};