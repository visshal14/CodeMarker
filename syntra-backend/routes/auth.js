const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../modals/user");



router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const userExist = await User.findOne({ username });
        if (userExist) {
            return res.status(400).json({ message: "User already exists!" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, role });
        await user.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ error: `Error creating user: ${error.message}` });
    }
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Invalid username or password.' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: `Error logging in: ${error.message}` });
    }
});


router.get('/users', async (req, res) => {
    try {
        const { role } = req.query;
        if (!role) {
            return res.status(400).json({ message: 'Role query parameter is required.' });
        }

        const users = await User.find({ role }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: `Error fetching users: ${error.message}` });
    }
});

module.exports = router;
