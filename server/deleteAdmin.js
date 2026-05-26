require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB Connected');
})
.catch((err) => {
    console.log('MongoDB connection error:', err);
});

const deleteAdmin = async () => {
    try {

        const deletedUser = await User.findOneAndDelete({
            username: 'admin'
        });

        if (!deletedUser) {
            console.log('Admin not found');
            process.exit();
        }

        console.log('Admin deleted successfully');
        console.log(deletedUser);

        process.exit();

    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

deleteAdmin();