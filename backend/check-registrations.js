require('dotenv').config();
const mongoose = require('mongoose');

async function checkRegistrations() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wombto18';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        const ChildRegistration = mongoose.model(
            'ChildRegistration',
            new mongoose.Schema({}, { strict: false }),
            'child_registrations'
        );

        const children = await ChildRegistration.find({})
            .select('registrationId childName email')
            .limit(10);

        console.log(`Found ${children.length} registrations:\n`);
        children.forEach((c, i) => {
            console.log(`${i + 1}. ${c.registrationId}`);
            console.log(`   Name: ${c.childName}`);
            console.log(`   Email: ${c.email}`);
            console.log('');
        });

        if (children.length === 0) {
            console.log('⚠️  No registrations found in database!');
            console.log('   Run: node create-test-registration.js');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkRegistrations();
