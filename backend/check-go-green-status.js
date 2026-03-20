/**
 * Check Go Green certificate status for all registrations
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function checkGoGreenStatus() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wombto18';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        const ChildRegistration = mongoose.model(
            'ChildRegistration',
            new mongoose.Schema({}, { strict: false }),
            'child_registrations'
        );

        const registrations = await ChildRegistration.find({ paymentStatus: 'COMPLETED' })
            .sort({ createdAt: -1 })
            .limit(10);

        console.log(`Found ${registrations.length} completed registrations:\n`);

        for (const reg of registrations) {
            console.log(`📋 ${reg.registrationId}`);
            console.log(`   Child: ${reg.childName}`);
            console.log(`   Mother: ${reg.motherName}`);
            console.log(`   Email: ${reg.email}`);
            console.log(`   Phone: ${reg.phone}`);
            console.log(`   Payment: ${reg.paymentStatus}`);
            console.log(`   Go Green Cert Sent: ${reg.goGreenCertSent ? '✅ YES' : '❌ NO'}`);
            console.log(`   Created: ${reg.createdAt}`);
            console.log('');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkGoGreenStatus();
