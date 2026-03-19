// Simple script to activate all services for existing registrations
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wombto18';

async function activateAllServices() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Define models
        const ChildRegistration = mongoose.model('ChildRegistration', new mongoose.Schema({}, { strict: false, collection: 'child_registrations' }));
        const MilestoneTemplate = mongoose.model('MilestoneTemplate', new mongoose.Schema({}, { strict: false, collection: 'milestone_templates' }));
        const DevelopmentMilestone = mongoose.model('DevelopmentMilestone', new mongoose.Schema({}, { strict: false, collection: 'development_milestones' }));

        // Get all completed registrations
        const registrations = await ChildRegistration.find({ paymentStatus: 'COMPLETED' }).lean();
        console.log(`Found ${registrations.length} completed registrations\n`);

        // Check if milestone templates exist
        const templateCount = await MilestoneTemplate.countDocuments();
        console.log(`Milestone templates in database: ${templateCount}`);

        if (templateCount === 0) {
            console.log('⚠️  No milestone templates found. Please run: node seed-milestone-templates.js');
            await mongoose.disconnect();
            return;
        }

        // Process each registration
        for (const registration of registrations) {
            console.log(`\n📋 Processing: ${registration.registrationId} (${registration.childName})`);

            // Calculate age group
            const dob = new Date(registration.dateOfBirth);
            const ageInMonths = Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

            let ageGroup;
            if (ageInMonths < 12) ageGroup = '0-1 years';
            else if (ageInMonths < 36) ageGroup = '1-3 years';
            else if (ageInMonths < 72) ageGroup = '3-5 years';
            else if (ageInMonths < 144) ageGroup = '5-12 years';
            else ageGroup = '13-18 years';

            console.log(`   Age: ${ageInMonths} months → Age group: ${ageGroup}`);

            // Check if development milestones already exist
            const existingMilestones = await DevelopmentMilestone.countDocuments({
                registrationId: registration.registrationId,
                ageGroup: ageGroup
            });

            if (existingMilestones > 0) {
                console.log(`   ✓ Already has ${existingMilestones} development milestones for ${ageGroup}`);
                continue;
            }

            // Get templates for this age group
            const templates = await MilestoneTemplate.find({ ageGroup, isActive: true }).lean();
            console.log(`   Found ${templates.length} templates for ${ageGroup}`);

            if (templates.length === 0) {
                console.log(`   ⚠️  No templates found for age group: ${ageGroup}`);
                continue;
            }

            // Create development milestones
            const milestones = templates.map(template => ({
                registrationId: registration.registrationId,
                ageGroup: ageGroup,
                title: template.title,
                description: template.description,
                type: template.type,
                order: template.order,
                expectedAgeMonths: template.expectedAgeMonths,
                status: 'NOT_STARTED',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }));

            await DevelopmentMilestone.insertMany(milestones);
            console.log(`   ✅ Created ${milestones.length} development milestones`);
        }

        console.log('\n🎉 All services activated successfully!');
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

activateAllServices();
