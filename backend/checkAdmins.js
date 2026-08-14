require('dotenv').config();

const mongoose = require('mongoose');
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {

        const admins = await Admin.find(
            {},
            {
                name: 1,
                email: 1,
                role: 1
            }
        );

        console.log(admins);

        process.exit();
    });