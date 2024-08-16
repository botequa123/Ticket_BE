const db = require('../models');
const User = db.user;
const Role = db.role;
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    const { page = 1, limit = 10, role } = req.query;

    try {
        let query = {};
        if (role) {
            const roleDoc = await Role.findOne({ name: role });
            if (roleDoc) {
                query.roles = roleDoc._id;
            } else {
                return res.status(404).send({ message: "Vai trò không tìm thấy" });
            }
        }

        const users = await User.find(query)
            .populate("roles", "-__v")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await User.countDocuments(query);

        res.status(200).send({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).send(roles);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, roles } = req.body;

        // Kiểm tra trùng lặp tài khoản hoặc email
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).send({ message: "Tên người dùng hoặc email đã tồn tại." });
        }

        const user = new User({
            username,
            email,
            password: bcrypt.hashSync(password, 8)
        });

        if (roles) {
            const foundRoles = await Role.find({ name: { $in: roles } });
            user.roles = foundRoles.map(role => role._id);
        } else {
            const role = await Role.findOne({ name: "user" });
            user.roles = [role._id];
        }

        await user.save();
        res.status(201).send({ message: "Tạo người dùng thành công!" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        res.status(200).send({ message: "Xóa người dùng thành công!" });
    } catch (error) {
        res.status(500).send({ message: "Không thể xóa người dùng!", error: error.message });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const { username, email, password, roles } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send({ message: "Không tìm thấy người dùng." });
        }

        // Kiểm tra trùng lặp tài khoản hoặc email, user
        if (username || email) {
            const existingUser = await User.findOne({
                $or: [
                    { username, _id: { $ne: user._id } },
                    { email, _id: { $ne: user._id } }
                ]
            });
            if (existingUser) {
                return res.status(400).send({ message: "Tên người dùng hoặc email đã tồn tại." });
            }
        }

        user.username = username || user.username;
        user.email = email || user.email;
        if (password) {
            user.password = bcrypt.hashSync(password, 8);
        }

        if (roles) {
            const foundRoles = await Role.find({ name: { $in: roles } });
            user.roles = foundRoles.map(role => role._id);
        }

        await user.save();
        res.status(200).send({ message: "Cập nhật người dùng thành công!" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.updateUserRoles = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: "Không tìm thấy người dùng." });
        }
        const roles = await Role.find({ name: { $in: req.body.roles } });
        user.roles = roles.map(role => role._id);
        await user.save();
        res.status(200).send({ message: "Cập nhật vai trò thành công" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
exports.getTotalUsers = async (_req, res) => {
    try {
        const count = await User.countDocuments();
        res.status(200).send({ totalUsers: count });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};