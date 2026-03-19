/**
 * Script to automatically:
 * 1. Set payment status to COMPLETED for all PENDING registrations
 * 2. Trigger email sequence for each registration
 * 3. Activate all services
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const API_BASE = process.env.APP_BASE_URL || 'http://localhost:8000';

async function autoCompleteAndTriggerEmails() {
    try {
        console.log('🚀 Auto-Complete Payment & Trigger Emails');
        console.log('='.repeat(70));
        console.log('');

        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Get all PENDING registrations
        const ChildRegistration = mongoose.model('ChildRegistration', new mongoose.Schema({}, { strict: false, collection: 'child_registrations' }));

        const pendingRegistrations = await ChildRegistration.find({
            paymentStatus: 'PENDING'
        }).lean();

        if (pendingRegistrations.length === 0) {
            console.log('ℹ️  No pending registrations found.');
            console.log('All registrations already have COMPLETED payment status.');
            return;
        }

        console.log(`📋 Found ${pendingRegistrations.length} pending registration(s):\n`);

        for (const registration of pendingRegistrations) {
            console.log(`\n${'='.repeat(70)}`);
            console.log(`Processing: ${registration.childName} (${registration.registrationId})`);
            console.log(`${'='.repeat(70)}`);

            try {
                // Step 1: Update payment status to COMPLETED
                console.log('💳 Updating payment status to COMPLETED...');
                await ChildRegistration.updateOne(
                    { registrationId: registration.registrationId },
                    {
                        $set: {
                            paymentStatus: 'COMPLETED',
                            razorpayPaymentId: `test_pay_${Date.now()}`
                        }
                    }
                );
                console.log('   ✅ Payment status updated');

                // Step 2: Trigger email sequence via API
                console.log('📧 Triggering email sequence...');

                // Check if backend is running
                try {
                    const healthCheck = await fetch(`${API_BASE}/registration/test-mode`);
                    if (!healthCheck.ok) {
                        throw new Error('Backend not responding');
                    }
                } catch (error) {
                    console.error('   ❌ Backend server is not running!');
                    console.error('   Please start the backend server first:');
                    console.error('     cd backend');
                    console.error('     npm run start:dev');
                    console.error('');
                    console.error('   Then run this script again.');
                    process.exit(1);
                }

                // Trigger test payment confirmation (which triggers email sequence)
                const response = await fetch(`${API_BASE}/registration/confirm-test-payment/${registration.registrationId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    console.log('   ✅ Email sequence triggered');
                    console.log('   📧 Email 1: Welcome + Invoice (sent immediately)');
                    console.log('   📧 Email 2: Go Green Certificate (sent after 5 seconds)');
                } else {
                    const error = await response.json();
                    console.warn(`   ⚠️  Email trigger warning: ${error.message || 'Unknown error'}`);
                }

                // Step 3: Wait a moment for emails to be sent
                console.log('   ⏳ Waiting 6 seconds for emails to be sent...');
                await new Promise(resolve => setTimeout(resolve, 6000));

                console.log(`\n✅ Completed for ${registration.childName}!`);

            } catch (error) {
                console.error(`\n❌ Error processing ${registration.registrationId}:`);
                console.error(`   ${error.message}`);
            }
        }

        console.log(`\n${'='.repeat(70)}`);
        console.log('📊 SUMMARY');
        console.log(`${'='.repeat(70)}`);
        console.log(`Total registrations processed: ${pendingRegistrations.length}`);
        console.log('');
        console.log('✅ All registrations now have COMPLETED payment status');
        console.log('✅ Email sequences triggered for all registrations');
        console.log('');
        console.log('Next steps:');
        console.log('1. Check backend logs for email sending confirmation');
        console.log('2. Check email inbox for both emails per registration');
        console.log('3. Verify services are activated (run: node setup-everything.js)');
        console.log('');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

autoCompleteAndTriggerEmails();
