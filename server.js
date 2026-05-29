
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


// USER SCHEMA
const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String
});

const User = mongoose.model('User', userSchema);


// SIGNUP ROUTE
app.post('/signup', async (req, res) => {

    try {

        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.json({
                success: false,
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.json({
            success: true,
            message: 'Signup successful'
        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


// LOGIN ROUTE
app.post('/login', async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: 'Invalid Email'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({
                success: false,
                message: 'Invalid Password'
            });
        }

        res.json({
            success: true,
            message: 'Login Successful',
            user: {
                name: user.name,
                email: user.email
            }
        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


// STATIC FILES MUST COME AFTER ROUTES
app.use(express.static(path.join(__dirname, 'public')));


// HOMEPAGE
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});