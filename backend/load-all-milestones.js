/**
 * Script to load all age group milestones for existing registrations
 * Run: node load-all-milestones.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const REGISTRATION_ID = 'CHD-MP-20210619-000001'; // Update this with your registration ID

const AGE_GROUPS = [
    '0-1 years',
    '1-3 years',
    '3-5 years',
    '5-12 years',
    '13-18 years'
];

async function loadAllMilestones() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Fetch milestone templates for each age group
        const MilestoneTemplate = mongoose.model('MilestoneTemplate', new mongoose.Schema({}, { strict: false }), 'milestone_templates');
        const DevelopmentMilestone = mongoose.model('DevelopmentMilestone', new mongoose.Schema({}, { strict: false }), 'development_milestones');

        for (const ageGroup of AGE_GROUPS) {
            console.log(`\n📋 Processing ${ageGroup}...`);

            // Check if milestones already exist for this age group
            const existingCount = await DevelopmentMilestone.countDocuments({
                registrationId: REGISTRATION_ID,
                ageGroup: ageGroup
            });

            if (existingCount > 0) {
                console.log(`  ✓ Already has ${existingCount} milestones for ${ageGroup}`);
                continue;
            }

            // Fetch templates for this age group
            const templates = await MilestoneTemplate.find({ ageGroup: ageGroup }).lean();

            if (templates.length === 0) {
                console.log(`  ⚠️  No templates found for ${ageGroup}`);
                continue;
            }

            console.log(`  📥 Found ${templates.length} templates`);

            // Create milestones from templates
            const milestones = templates.map(template => ({
                registrationId: REGISTRATION_ID,
                ageGroup: ageGroup,
                title: template.title,
                description: template.description,
                type: template.type,
                status: 'NOT_STARTED',
                order: template.order || 0,
                expectedAgeMonths: template.expectedAgeMonths || 12,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }));

            // Insert milestones
            await DevelopmentMilestone.insertMany(milestones);
            console.log(`  ✅ Created ${milestones.length} milestones for ${ageGroup}`);
        }

        // Summary
        console.log('\n📊 Summary:');
        for (const ageGroup of AGE_GROUPS) {
            const count = await DevelopmentMilestone.countDocuments({
                registrationId: REGISTRATION_ID,
                ageGroup: ageGroup
            });
            console.log(`  ${ageGroup}: ${count} milestones`);
        }

        const totalCount = await DevelopmentMilestone.countDocuments({
            registrationId: REGISTRATION_ID
        });
        console.log(`\n🎉 Total milestones: ${totalCount}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

loadAllMilestones();
