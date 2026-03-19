// Script to seed milestone templates in the database
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wombto18';

const milestoneTemplates = [
    // 0-1 Years (INFANT)
    { ageGroup: '0-1 years', title: 'Lifts head', description: 'Can lift head while lying on tummy', type: 'PHYSICAL', order: 1, expectedAgeMonths: 3, tips: 'Give tummy time daily', isActive: true },
    { ageGroup: '0-1 years', title: 'Rolls over', description: 'Rolls from tummy to back', type: 'PHYSICAL', order: 2, expectedAgeMonths: 4, tips: 'Encourage movement with toys', isActive: true },
    { ageGroup: '0-1 years', title: 'Sits without support', description: 'Sits independently', type: 'PHYSICAL', order: 3, expectedAgeMonths: 6, tips: 'Practice sitting with support', isActive: true },
    { ageGroup: '0-1 years', title: 'Crawls', description: 'Moves around by crawling', type: 'PHYSICAL', order: 4, expectedAgeMonths: 8, tips: 'Create safe crawling space', isActive: true },
    { ageGroup: '0-1 years', title: 'Stands with support', description: 'Pulls to standing position', type: 'PHYSICAL', order: 5, expectedAgeMonths: 9, tips: 'Provide stable furniture', isActive: true },
    { ageGroup: '0-1 years', title: 'First words', description: 'Says mama or dada', type: 'LANGUAGE', order: 6, expectedAgeMonths: 10, tips: 'Talk to baby frequently', isActive: true },
    { ageGroup: '0-1 years', title: 'Responds to name', description: 'Turns when name is called', type: 'COGNITIVE', order: 7, expectedAgeMonths: 7, tips: 'Use name often', isActive: true },
    { ageGroup: '0-1 years', title: 'Smiles socially', description: 'Smiles at people', type: 'SOCIAL', order: 8, expectedAgeMonths: 2, tips: 'Smile and interact often', isActive: true },

    // 1-3 Years (TODDLER)
    { ageGroup: '1-3 years', title: 'Walks independently', description: 'Walks without support', type: 'PHYSICAL', order: 1, expectedAgeMonths: 14, tips: 'Provide safe walking space', isActive: true },
    { ageGroup: '1-3 years', title: 'Runs', description: 'Runs with coordination', type: 'PHYSICAL', order: 2, expectedAgeMonths: 18, tips: 'Encourage outdoor play', isActive: true },
    { ageGroup: '1-3 years', title: 'Climbs stairs', description: 'Climbs stairs with help', type: 'PHYSICAL', order: 3, expectedAgeMonths: 20, tips: 'Practice with supervision', isActive: true },
    { ageGroup: '1-3 years', title: 'Kicks ball', description: 'Kicks ball forward', type: 'PHYSICAL', order: 4, expectedAgeMonths: 24, tips: 'Play ball games', isActive: true },
    { ageGroup: '1-3 years', title: 'Two-word phrases', description: 'Combines two words', type: 'LANGUAGE', order: 5, expectedAgeMonths: 20, tips: 'Model simple sentences', isActive: true },
    { ageGroup: '1-3 years', title: 'Names objects', description: 'Points to and names familiar objects', type: 'COGNITIVE', order: 6, expectedAgeMonths: 22, tips: 'Read picture books together', isActive: true },
    { ageGroup: '1-3 years', title: 'Plays alongside others', description: 'Parallel play with peers', type: 'SOCIAL', order: 7, expectedAgeMonths: 24, tips: 'Arrange playdates', isActive: true },
    { ageGroup: '1-3 years', title: 'Shows independence', description: 'Wants to do things alone', type: 'EMOTIONAL', order: 8, expectedAgeMonths: 26, tips: 'Allow safe independence', isActive: true },

    // 3-5 Years (PRESCHOOL)
    { ageGroup: '3-5 years', title: 'Hops on one foot', description: 'Balances and hops', type: 'PHYSICAL', order: 1, expectedAgeMonths: 42, tips: 'Practice hopping games', isActive: true },
    { ageGroup: '3-5 years', title: 'Draws shapes', description: 'Draws circle and square', type: 'PHYSICAL', order: 2, expectedAgeMonths: 44, tips: 'Provide drawing materials', isActive: true },
    { ageGroup: '3-5 years', title: 'Speaks in sentences', description: 'Uses 4-5 word sentences', type: 'LANGUAGE', order: 3, expectedAgeMonths: 40, tips: 'Have conversations', isActive: true },
    { ageGroup: '3-5 years', title: 'Counts to 10', description: 'Counts objects to 10', type: 'COGNITIVE', order: 4, expectedAgeMonths: 48, tips: 'Practice counting daily', isActive: true },
    { ageGroup: '3-5 years', title: 'Plays cooperatively', description: 'Plays with other children', type: 'SOCIAL', order: 5, expectedAgeMonths: 45, tips: 'Encourage group play', isActive: true },
    { ageGroup: '3-5 years', title: 'Understands emotions', description: 'Identifies basic emotions', type: 'EMOTIONAL', order: 6, expectedAgeMonths: 46, tips: 'Talk about feelings', isActive: true },
    { ageGroup: '3-5 years', title: 'Follows rules', description: 'Understands and follows simple rules', type: 'SOCIAL', order: 7, expectedAgeMonths: 50, tips: 'Set clear, consistent rules', isActive: true },

    // 5-12 Years (SCHOOL)
    { ageGroup: '5-12 years', title: 'Rides bicycle', description: 'Rides bike without training wheels', type: 'PHYSICAL', order: 1, expectedAgeMonths: 72, tips: 'Practice with safety gear', isActive: true },
    { ageGroup: '5-12 years', title: 'Reads independently', description: 'Reads age-appropriate books', type: 'COGNITIVE', order: 2, expectedAgeMonths: 78, tips: 'Encourage daily reading', isActive: true },
    { ageGroup: '5-12 years', title: 'Solves problems', description: 'Uses logic to solve problems', type: 'COGNITIVE', order: 3, expectedAgeMonths: 84, tips: 'Provide puzzles and challenges', isActive: true },
    { ageGroup: '5-12 years', title: 'Makes friends', description: 'Forms friendships independently', type: 'SOCIAL', order: 4, expectedAgeMonths: 80, tips: 'Support social activities', isActive: true },
    { ageGroup: '5-12 years', title: 'Shows empathy', description: 'Understands others feelings', type: 'EMOTIONAL', order: 5, expectedAgeMonths: 90, tips: 'Discuss emotions and perspectives', isActive: true },
    { ageGroup: '5-12 years', title: 'Takes responsibility', description: 'Completes tasks independently', type: 'SOCIAL', order: 6, expectedAgeMonths: 96, tips: 'Assign age-appropriate chores', isActive: true },

    // 13-18 Years (TEEN)
    { ageGroup: '13-18 years', title: 'Abstract thinking', description: 'Thinks abstractly and hypothetically', type: 'COGNITIVE', order: 1, expectedAgeMonths: 168, tips: 'Discuss complex topics', isActive: true },
    { ageGroup: '13-18 years', title: 'Identity formation', description: 'Develops sense of self', type: 'EMOTIONAL', order: 2, expectedAgeMonths: 180, tips: 'Support self-exploration', isActive: true },
    { ageGroup: '13-18 years', title: 'Peer relationships', description: 'Values peer opinions', type: 'SOCIAL', order: 3, expectedAgeMonths: 174, tips: 'Respect friendships', isActive: true },
    { ageGroup: '13-18 years', title: 'Future planning', description: 'Plans for future goals', type: 'COGNITIVE', order: 4, expectedAgeMonths: 192, tips: 'Discuss goals and aspirations', isActive: true },
    { ageGroup: '13-18 years', title: 'Manages emotions', description: 'Better emotional regulation', type: 'EMOTIONAL', order: 5, expectedAgeMonths: 204, tips: 'Model healthy coping strategies', isActive: true },
];

async function seedMilestoneTemplates() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const MilestoneTemplate = mongoose.model('MilestoneTemplate', new mongoose.Schema({}, { strict: false, collection: 'milestone_templates' }));

        // Check if templates already exist
        const count = await MilestoneTemplate.countDocuments();

        if (count > 0) {
            console.log(`\n⚠️  ${count} milestone templates already exist.`);
            console.log('   Deleting existing templates and reseeding...');
            await MilestoneTemplate.deleteMany({});
        }

        // Insert milestone templates
        await MilestoneTemplate.insertMany(milestoneTemplates);

        console.log(`\n✅ Successfully seeded ${milestoneTemplates.length} milestone templates!`);
        console.log('\n📊 Templates by age group:');
        console.log(`   0-1 years: ${milestoneTemplates.filter(m => m.ageGroup === '0-1 years').length} milestones`);
        console.log(`   1-3 years: ${milestoneTemplates.filter(m => m.ageGroup === '1-3 years').length} milestones`);
        console.log(`   3-5 years: ${milestoneTemplates.filter(m => m.ageGroup === '3-5 years').length} milestones`);
        console.log(`   5-12 years: ${milestoneTemplates.filter(m => m.ageGroup === '5-12 years').length} milestones`);
        console.log(`   13-18 years: ${milestoneTemplates.filter(m => m.ageGroup === '13-18 years').length} milestones`);

        console.log('\n💡 Now you can load milestones for any age group!');
        console.log('   The system will automatically seed child-specific milestones when needed.');

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
    }
}

seedMilestoneTemplates();
