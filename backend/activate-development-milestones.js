/**
 * Activate development milestones for all existing registrations
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wombto18';

async function activateDevelopmentMilestones() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Call the API endpoint to activate services for all registrations
        const fetch = (await import('node-fetch')).default;

        console.log('🚀 Activating development milestones for all registrations...\n');

        const response = await fetch('http://localhost:8000/registration/activate-all-incomplete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Success!');
            console.log(`   Message: ${result.message}`);
            console.log(`   Activated: ${result.activatedRegistrations.length} registration(s)`);

            if (result.activatedRegistrations.length > 0) {
                console.log('\n📋 Activated registrations:');
                result.activatedRegistrations.forEach((id, index) => {
                    console.log(`   ${index + 1}. ${id}`);
                });
            }

            if (result.errors && result.errors.length > 0) {
                console.log('\n⚠️  Errors:');
                result.errors.forEach((error, index) => {
                    console.log(`   ${index + 1}. ${error}`);
                });
            }
        } else {
            const error = await response.text();
            console.log(`❌ Failed: ${error}`);
        }

        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

activateDevelopmentMilestones();
