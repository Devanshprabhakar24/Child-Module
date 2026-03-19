// Script to delete the duplicate childregistrations collection (without underscore)
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wombto18';

async function deleteDuplicateCollection() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check both collections first
        const ChildRegistrationWithUnderscore = mongoose.model('ChildRegistration_with', new mongoose.Schema({}, { strict: false, collection: 'child_registrations' }));
        const ChildRegistrationWithoutUnderscore = mongoose.model('ChildRegistration_without', new mongoose.Schema({}, { strict: false, collection: 'childregistrations' }));

        const countWith = await ChildRegistrationWithUnderscore.countDocuments();
        const countWithout = await ChildRegistrationWithoutUnderscore.countDocuments();

        console.log('\n📊 Current state:');
        console.log(`   child_registrations (with underscore): ${countWith} documents`);
        console.log(`   childregistrations (without underscore): ${countWithout} documents`);

        console.log('\n🗑️  Dropping childregistrations collection (without underscore)...');

        try {
            await mongoose.connection.db.dropCollection('childregistrations');
            console.log('✅ Successfully dropped childregistrations collection!');
        } catch (dropError) {
            if (dropError.message.includes('ns not found')) {
                console.log('✅ Collection does not exist or already removed.');
            } else {
                throw dropError;
            }
        }

        console.log('\n📊 Final state:');
        console.log(`   child_registrations (with underscore): ${countWith} documents ✅`);
        console.log(`   childregistrations (without underscore): DELETED ✅`);

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        console.log('\n💡 The correct collection to use is: child_registrations (with underscore)');
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
    }
}

deleteDuplicateCollection();
