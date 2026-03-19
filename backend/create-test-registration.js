// Script to create a test registration for CHD-KL-20260306-000001
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wombto18';

async function createTestRegistration() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const ChildRegistration = mongoose.model('ChildRegistration', new mongoose.Schema({}, { strict: false, collection: 'child_registrations' }));

        // Check if registration already exists
        const existing = await ChildRegistration.findOne({ registrationId: 'CHD-KL-20260306-000001' });

        if (existing) {
            console.log('✅ Registration CHD-KL-20260306-000001 already exists!');
            console.log('   Child Name:', existing.childName);
            console.log('   Mother Name:', existing.motherName);
            console.log('   Email:', existing.email);
        } else {
            // Create new registration
            const newRegistration = await ChildRegistration.create({
                registrationId: 'CHD-KL-20260306-000001',
                childName: 'Test Child',
                childGender: 'MALE',
                dateOfBirth: new Date('2026-03-06'),
                ageGroup: '0-5',
                ageInYears: 0,
                motherName: 'Test Mother',
                fatherName: 'Test Father',
                email: 'test@example.com',
                phone: '+919999999999',
                address: 'Test Address',
                state: 'Kerala',
                pincode: '682001',
                greenCohort: true,
                paymentStatus: 'COMPLETED',
                registrationType: 'DIRECT',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            console.log('✅ Created test registration successfully!');
            console.log('   Registration ID: CHD-KL-20260306-000001');
            console.log('   Child Name: Test Child');
            console.log('   Mother Name: Test Mother');
            console.log('   Email: test@example.com');
            console.log('\n💡 You can now upload health records for this child!');
            console.log('   URL: http://localhost:3000/dashboard/records?id=CHD-KL-20260306-000001');
        }

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createTestRegistration();
