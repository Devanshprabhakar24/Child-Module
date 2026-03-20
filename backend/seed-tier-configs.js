/**
 * Seed Tier Configurations for Go Green Credit System
 * Run: node seed-tier-configs.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const tierConfigSchema = new mongoose.Schema({
    level: { type: String, required: true, unique: true },
    minCredits: { type: Number, required: true },
    maxCredits: { type: Number, required: true },
    treeType: { type: String, required: true },
    co2Absorption: { type: Number, required: true, default: 0 },
    certificateType: { type: String, required: true },
    badgeIcon: { type: String, required: true },
    color: { type: String, required: true },
    benefits: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
});

const TierConfig = mongoose.model('TierConfig', tierConfigSchema, 'tier_configs');

const tierConfigs = [
    {
        level: 'SEEDLING',
        minCredits: 0,
        maxCredits: 499,
        treeType: 'Virtual Tree',
        co2Absorption: 0,
        certificateType: 'DIGITAL_BADGE',
        badgeIcon: '🌱',
        color: '#94a3b8',
        benefits: ['Digital badge', 'Progress tracking'],
        isActive: true,
    },
    {
        level: 'SAPLING',
        minCredits: 500,
        maxCredits: 999,
        treeType: 'Neem (Azadirachta indica)',
        co2Absorption: 15,
        certificateType: 'BRONZE',
        badgeIcon: '🌿',
        color: '#10b981',
        benefits: ['Tree planting', 'Bronze certificate', 'CO₂ tracking'],
        isActive: true,
    },
    {
        level: 'YOUNG',
        minCredits: 1000,
        maxCredits: 1999,
        treeType: 'Peepal (Ficus religiosa)',
        co2Absorption: 30,
        certificateType: 'SILVER',
        badgeIcon: '🌳',
        color: '#3b82f6',
        benefits: ['Tree planting', 'Silver certificate', 'E-Certificate + Badge'],
        isActive: true,
    },
    {
        level: 'MATURE',
        minCredits: 2000,
        maxCredits: 3499,
        treeType: 'Banyan (Ficus benghalensis)',
        co2Absorption: 50,
        certificateType: 'GOLD',
        badgeIcon: '🌲',
        color: '#eab308',
        benefits: ['Tree planting', 'Gold certificate', 'Printed Certificate'],
        isActive: true,
    },
    {
        level: 'GUARDIAN',
        minCredits: 3500,
        maxCredits: 4999,
        treeType: 'Grove (3 trees)',
        co2Absorption: 100,
        certificateType: 'PLATINUM',
        badgeIcon: '🌴',
        color: '#a855f7',
        benefits: ['Grove planting', 'Platinum certificate', 'Printed + Plaque'],
        isActive: true,
    },
    {
        level: 'FOREST',
        minCredits: 5000,
        maxCredits: 999999,
        treeType: 'Mini Forest (5 trees)',
        co2Absorption: 200,
        certificateType: 'DIAMOND',
        badgeIcon: '🏆',
        color: '#ec4899',
        benefits: ['Mini forest', 'Diamond certificate', 'Physical Plaque + Wall of Fame'],
        isActive: true,
    },
];

async function seedTierConfigs() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wombto18';
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        console.log('🌱 Seeding Tier Configurations...\n');

        // Clear existing configs
        const deleteResult = await TierConfig.deleteMany({});
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing tier configs\n`);

        // Insert new configs
        const result = await TierConfig.insertMany(tierConfigs);
        console.log(`✅ Successfully seeded ${result.length} tier configurations:\n`);

        result.forEach((tier) => {
            console.log(`${tier.badgeIcon} ${tier.level}`);
            console.log(`   Credits: ${tier.minCredits} - ${tier.maxCredits}`);
            console.log(`   Tree: ${tier.treeType}`);
            console.log(`   CO₂: ${tier.co2Absorption} kg/year`);
            console.log(`   Certificate: ${tier.certificateType}`);
            console.log(`   Color: ${tier.color}`);
            console.log('');
        });

        console.log('🎉 Tier configuration seeding completed!\n');
    } catch (error) {
        console.error('❌ Error seeding tier configs:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

seedTierConfigs();
