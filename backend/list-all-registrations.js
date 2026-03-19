require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function listAllRegistrations() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Get the child registration model
        const ChildRegistration = mongoose.model('ChildRegistration', new mongoose.Schema({}, { strict: false, collection: 'child_registrations' }));

        console.log('📋 Listing ALL Child Registrations:\n');

        const children = await ChildRegistration.find({}).lean();

        if (children.length === 0) {
            console.log('❌ No child registrations found in database!');
        } else {
            console.log(`✅ Found ${children.length} child registration(s):\n`);

            children.forEach((child, index) => {
                console.log(`${index + 1}. Registration ID: ${child.registrationId}`);
                console.log(`   Name: ${child.childName}`);
                console.log(`   Gender: ${child.childGender}`);
                console.log(`   DOB: ${child.dateOfBirth}`);
                console.log(`   Mother: ${child.motherName}`);
                console.log(`   State: ${child.state}`);
                console.log(`   Payment Status: ${child.paymentStatus || 'PENDING'}`);
                console.log(`   Email: ${child.email || 'N/A'}`);
                console.log(`   Go Green Cert Sent: ${child.goGreenCertSent ? 'YES' : 'NO'}`);
                console.log(`   Created: ${child.createdAt}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

listAllRegistrations();
