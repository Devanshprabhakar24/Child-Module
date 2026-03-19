/**
 * Trigger emails for existing registrations
 * This script:
 * 1. Finds registrations with PENDING payment status
 * 2. Updates payment status to COMPLETED
 * 3. Triggers both emails (Welcome + Invoice, Go Green Certificate)
 * 4. Activates all services
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wombto18';

// Registration Schema (simplified)
const registrationSchema = new mongoose.Schema({
    registrationId: String,
    childName: String,
    childGender: String,
    dateOfBirth: Date,
    ageGroup: String,
    ageInYears: Number,
    state: String,
    motherName: String,
    fatherName: String,
    email: String,
    phone: String,
    phone2: String,
    address: String,
    paymentStatus: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    subscriptionAmount: Number,
    goGreenCertSent: Boolean,
    greenCohort: Boolean,
}, { timestamps: true });

const ChildRegistration = mongoose.model('ChildRegistration', registrationSchema, 'child_registrations');

async function triggerEmailsForExisting() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all PENDING registrations
        const pendingRegistrations = await ChildRegistration.find({
            paymentStatus: 'PENDING'
        }).exec();

        console.log(`📋 Found ${pendingRegistrations.length} registration(s) with PENDING payment status\n`);

        if (pendingRegistrations.length === 0) {
            console.log('✅ No pending registrations to process');
            await mongoose.disconnect();
            return;
        }

        for (const registration of pendingRegistrations) {
            console.log(`\n🔧 Processing: ${registration.registrationId} (${registration.childName})`);

            // Update payment status to COMPLETED
            registration.paymentStatus = 'COMPLETED';
            registration.razorpayPaymentId = `test_pay_${Date.now()}`;
            await registration.save();

            console.log(`   ✅ Payment status updated to COMPLETED`);

            // Trigger emails via API endpoint
            try {
                const fetch = (await import('node-fetch')).default;
                const response = await fetch('http://localhost:8000/registration/trigger-post-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        registrationId: registration.registrationId,
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log(`   ✅ Emails triggered successfully`);
                    console.log(`   📧 Email 1: Welcome + Invoice (immediate)`);
                    console.log(`   📧 Email 2: Go Green Certificate (5 seconds later)`);
                } else {
                    const error = await response.text();
                    console.log(`   ❌ Failed to trigger emails: ${error}`);
                }
            } catch (apiError) {
                console.log(`   ⚠️  API call failed: ${apiError.message}`);
                console.log(`   💡 Make sure backend server is running on http://localhost:8000`);
            }
        }

        console.log('\n✅ Processing complete!');
        console.log('\n📬 Check your email inbox for:');
        console.log('   1. Welcome email with payment invoice PDF (immediate)');
        console.log('   2. Go Green certificate email with certificate PDF (5 seconds later)');

        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

triggerEmailsForExisting();
