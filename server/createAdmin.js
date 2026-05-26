require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB Connected');
})
.catch((err) => {
    console.log(err);
});

const createAdmin = async () => {
    try {

        const existingAdmin = await User.findOne({
            username: 'admin'
        });

        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit();
        }

       

        const admin = await User.create({
            username: 'admin',
            password: 'admin123',
            role: 'Admin',
        });

        console.log('Admin created successfully');
        console.log(admin);

        process.exit();

    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

createAdmin();