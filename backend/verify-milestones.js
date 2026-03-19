require('dotenv').config();
const mongoose = require('mongoose');

async function verifyMilestones() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const DevelopmentMilestone = mongoose.model('DevelopmentMilestone', new mongoose.Schema({}, { strict: false, collection: 'development_milestones' }));

        // Check for specific registration
        const registrationId = 'CHD-ML-20260306-000001';
        const milestones = await DevelopmentMilestone.find({ registrationId }).lean();

        console.log(`📋 Registration: ${registrationId}`);
        console.log(`   Total development milestones: ${milestones.length}\n`);

        if (milestones.length > 0) {
            console.log('   Milestones:');
            milestones.forEach((m, i) => {
                console.log(`   ${i + 1}. ${m.title} (${m.type}) - ${m.ageGroup}`);
            });
        } else {
            console.log('   ⚠️  No milestones found!');
        }

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

verifyMilestones();
