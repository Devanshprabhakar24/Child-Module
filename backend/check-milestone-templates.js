require('dotenv').config();
const mongoose = require('mongoose');

async function checkTemplates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const MilestoneTemplate = mongoose.model('MilestoneTemplate', new mongoose.Schema({}, { strict: false, collection: 'milestone_templates' }));

        const templates = await MilestoneTemplate.find({}).lean();
        console.log(`\nTotal templates: ${templates.length}`);

        // Group by age group
        const byAgeGroup = {};
        templates.forEach(t => {
            if (!byAgeGroup[t.ageGroup]) byAgeGroup[t.ageGroup] = [];
            byAgeGroup[t.ageGroup].push(t);
        });

        console.log('\nTemplates by age group:');
        Object.keys(byAgeGroup).sort().forEach(ageGroup => {
            console.log(`  ${ageGroup}: ${byAgeGroup[ageGroup].length} templates`);
            console.log(`    Sample: ${byAgeGroup[ageGroup][0].title}`);
        });

        // Check for 0-1 years specifically
        const infantTemplates = await MilestoneTemplate.find({ ageGroup: '0-1 years' }).lean();
        console.log(`\n🔍 Checking "0-1 years" age group:`);
        console.log(`   Found ${infantTemplates.length} templates`);
        if (infantTemplates.length > 0) {
            console.log(`   First template: ${infantTemplates[0].title}`);
            console.log(`   Age group value: "${infantTemplates[0].ageGroup}"`);
        }

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

checkTemplates();
