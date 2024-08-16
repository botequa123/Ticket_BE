const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const fs = require('fs');
const https = require('https');
const http = require('http');


const app = express();
const db = require("./BE/models");
const Role = db.role;

// Cấu hình CORS
var corsOptions = {
    origin: '*',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cookieSession({
        name: "TriNguyen_session",
        keys: ["COOKIE_SECRET"],
        httpsOnly: true
    })
);

// Kết nối tới MongoDB
db.mongoose
    .connect(`mongodb+srv://nguyenhuunhantri2003:tringuyen@ticket.ho2lc.mongodb.net/?retryWrites=true&w=majority&appName=Ticket`)
    .then(() => {
        console.log("Successfully connected to MongoDB.");
        initial();
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

async function initial() {
    try {
        const count = await Role.estimatedDocumentCount();
        if (count === 0) {
            await new Role({ name: "user" }).save();
            console.log("added 'user' to roles collection");

            await new Role({ name: "IT" }).save();
            console.log("added 'IT' to roles collection");

            await new Role({ name: "admin" }).save();
            console.log("added 'admin' to roles collection");
        }
    } catch (err) {
        console.log("error", err);
    }
}

app.get("/", (_req, res) => {
    res.json({ message: "Welcome " });
});

// routes
require('./BE/routes/auth.routes')(app);
require('./BE/routes/user.routes')(app);
require('./BE/routes/ticket.routes')(app);

// Đường dẫn tới các file chứng chỉ SSL
const sslServer = https.createServer({
    key: fs.readFileSync('./BE/192.168.47.3+1-key.pem'),
    cert: fs.readFileSync('./BE/192.168.47.3+1.pem')
}, app);

// Lắng nghe trên cổng 8080 (HTTPS)
sslServer.listen(443, () => {
    console.log(`Secure server is running on port 443.`);
});
const PORT = process.env.PORT || 8080;
http.createServer(app).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});