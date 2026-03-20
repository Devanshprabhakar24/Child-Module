require('dotenv').config();
const mongoose = require('mongoose');

async function checkUsers() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wombto18';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        const User = mongoose.model(
            'User',
            new mongoose.Schema({}, { strict: false }),
            'users'
        );

        const users = await User.find({})
            .select('email name phone registrationIds')
            .limit(10);

        console.log(`Found ${users.length} users:\n`);
        users.forEach((u, i) => {
            console.log(`${i + 1}. ${u.email}`);
            console.log(`   Name: ${u.name || 'N/A'}`);
            console.log(`   Phone: ${u.phone || 'N/A'}`);
            console.log(`   Registration IDs: ${u.registrationIds?.join(', ') || 'None'}`);
            console.log('');
        });

        if (users.length === 0) {
            console.log('⚠️  No users found in database!');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkUsers();
