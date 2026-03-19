// Quick script to check registrations in the database
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wombto18';

async function checkRegistrations() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check both possible collection names
        const collections = ['childregistrations', 'child_registrations'];

        for (const collectionName of collections) {
            console.log(`\n📂 Checking collection: ${collectionName}`);
            const ChildRegistration = mongoose.model(`ChildRegistration_${collectionName}`, new mongoose.Schema({}, { strict: false, collection: collectionName }));

            const count = await ChildRegistration.countDocuments();
            console.log(`   Total registrations: ${count}`);

            if (count > 0) {
                const registrations = await ChildRegistration.find().select('registrationId childName motherName email phone paymentStatus').limit(10).sort({ createdAt: -1 });
                console.log(`\n📋 Recent registrations in ${collectionName}:`);
                registrations.forEach((reg, index) => {
                    console.log(`\n${index + 1}. Registration ID: ${reg.registrationId}`);
                    console.log(`   Child Name: ${reg.childName}`);
                    console.log(`   Mother Name: ${reg.motherName}`);
                    console.log(`   Email: ${reg.email}`);
                    console.log(`   Phone: ${reg.phone}`);
                    console.log(`   Payment Status: ${reg.paymentStatus}`);
                });

                console.log('\n\n💡 To use health records, copy one of the Registration IDs above');
                console.log('   and use it in the URL: http://localhost:3000/dashboard/records?id=CHD-XX-XXXXXXXX-XXXXXX');
            }
        }

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\n💡 Make sure:');
        console.error('   1. MongoDB Atlas credentials are correct in .env');
        console.error('   2. Your IP is whitelisted in MongoDB Atlas');
        console.error('   3. Network connection is working');
    }
}

checkRegistrations();
