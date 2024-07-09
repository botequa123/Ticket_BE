const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);  // Remove Bearer from string
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!",
            });
        }
        req.userId = decoded.id;
        next();
    });
};

isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).exec();
        const roles = await Role.find({ _id: { $in: user.roles } }).exec();

        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "admin") {
                next();
                return;
            }
        }

        res.status(403).send({ message: "Cần có quyền Admin" });
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

isIT = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).exec();
        const roles = await Role.find({ _id: { $in: user.roles } }).exec();

        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "IT" || roles[i].name === "admin") {
                next();
                return;
            }
        }

        res.status(403).send({ message: "Cần có quyền IT hoặc admin" });
    } catch (err) {
        res.status(500).send({ message: err });
    }
};
const authJwt = {
    verifyToken,
    isAdmin,
    isIT,
};

module.exports = authJwt;
