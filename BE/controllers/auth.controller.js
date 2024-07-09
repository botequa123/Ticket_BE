const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");


exports.signin = async (req, res) => {
    const { username, password } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!username || !password) {
        return res.status(400).send({ message: "Thiếu tài khoản hoặc mật khẩu" });
    }

    try {
        const user = await User.findOne({ username: username }).populate("roles", "-__v");

        if (!user) {
            return res.status(404).send({ message: "Tài khoản không tồn tại" });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({ message: "Sai mật khẩu" });
        }

        const token = jwt.sign({ id: user.id }, config.secret, {
            algorithm: 'HS256',
            allowInsecureKeySizes: true,
            expiresIn: 86400, // 24 hours
        });

        const authorities = user.roles.map(role => role.name);

        req.session.token = token;

        res.status(200).send({
            id: user._id,
            username: user.username,
            email: user.email,
            roles: authorities,
            accessToken: token,
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.signout = async (req, res) => {
    try {
        req.session = null;
        return res.status(200).send({ message: "Bạn đã đăng xuất!" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
