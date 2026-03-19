require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function testDashboardEndpoint() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Get the child registration model
        const ChildRegistration = mongoose.model('ChildRegistration', new mongoose.Schema({}, { strict: false, collection: 'child_registrations' }));

        // Test registration IDs
        const testIds = [
            'CHD-GJ-20260301-000001',
            'CHD-KL-20260306-000001'
        ];

        console.log('📋 Testing Dashboard Endpoint Data:\n');

        for (const regId of testIds) {
            console.log(`\n🔍 Testing Registration ID: ${regId}`);
            console.log('─'.repeat(60));

            const child = await ChildRegistration.findOne({ registrationId: regId }).lean();

            if (!child) {
                console.log(`❌ Child not found for ${regId}`);
                continue;
            }

            console.log(`✅ Child Found:`);
            console.log(`   Name: ${child.childName}`);
            console.log(`   Gender: ${child.childGender}`);
            console.log(`   DOB: ${child.dateOfBirth}`);
            console.log(`   Mother: ${child.motherName}`);
            console.log(`   Father: ${child.fatherName || 'N/A'}`);
            console.log(`   Phone: ${child.phone}`);
            console.log(`   State: ${child.state}`);
            console.log(`   Age Group: ${child.ageGroup}`);
            console.log(`   Green Cohort: ${child.greenCohort ? 'Yes' : 'No'}`);
            console.log(`   Profile Picture: ${child.profilePictureUrl || 'None'}`);

            // Calculate age
            const currentAge = Math.floor(
                (Date.now() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
            );
            console.log(`   Calculated Age: ${currentAge} years`);
        }

        console.log('\n\n✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

testDashboardEndpoint();
