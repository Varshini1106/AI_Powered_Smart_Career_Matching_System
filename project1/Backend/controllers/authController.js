const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// ✅ REGISTER
async function registerUser(req, res) {
    try {
        await client.connect();
        const db = client.db("CareerMatcherDB");

        const { name, email, password, role } = req.body;

        const existingUser = await db.collection("users").findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        await db.collection("users").insertOne({
            name,
            email: email.toLowerCase(),
            password, // ⚠️ plain text (consider hashing later)
            role: role || "user"
        });

        res.status(201).json({
            message: "User registered successfully ✅"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// ✅ LOGIN
async function loginUser(req, res) {
    try {
        await client.connect();
        const db = client.db("CareerMatcherDB");

        const { email, password } = req.body;

        // allow login via email OR username
        const user = await db.collection("users").findOne({
            $or: [
                { email: email.toLowerCase() },
                { name: email }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            "secretkey",
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful ✅",
            user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
            },
            token
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { registerUser, loginUser };