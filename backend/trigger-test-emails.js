/**
 * Script to trigger test emails for a registration
 * This will send both emails (Welcome + Invoice, and Go Green Certificate)
 * Useful for testing the email sequence without completing a new registration
 */

require('dotenv').config();

const API_BASE = process.env.APP_BASE_URL || 'http://localhost:8000';

async function triggerTestEmails() {
    try {
        console.log('📧 Triggering Test Emails');
        console.log('='.repeat(70));
        console.log('');

        // Get registration ID from command line or use default
        const registrationId = process.argv[2];

        if (!registrationId) {
            console.log('❌ Please provide a registration ID');
            console.log('');
            console.log('Usage:');
            console.log('  node trigger-test-emails.js CHD-UP-20220607-000001');
            console.log('');
            console.log('To find registration IDs:');
            console.log('  node list-all-registrations.js');
            console.log('');
            process.exit(1);
        }

        console.log(`📋 Registration ID: ${registrationId}`);
        console.log('');

        // Check if backend is running
        console.log('📡 Checking backend server...');
        try {
            const healthCheck = await fetch(`${API_BASE}/registration/test-mode`);
            if (!healthCheck.ok) {
                throw new Error('Backend not responding');
            }
            console.log('✅ Backend server is running\n');
        } catch (error) {
            console.error('❌ Backend server is not running!');
            console.error('');
            console.error('Please start the backend server first:');
            console.error('  cd backend');
            console.error('  npm run start:dev');
            console.error('');
            process.exit(1);
        }

        // Trigger test payment confirmation (which triggers email sequence)
        console.log('🔧 Triggering email sequence...');
        console.log('This will:');
        console.log('1. Confirm payment (if not already confirmed)');
        console.log('2. Send Email 1: Welcome + Invoice (immediate)');
        console.log('3. Send Email 2: Go Green Certificate (5 seconds later)');
        console.log('');

        const response = await fetch(`${API_BASE}/registration/confirm-test-payment/${registrationId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Failed to trigger emails:');
            console.error(`   ${error.message || 'Unknown error'}`);
            console.error('');
            console.error('Possible reasons:');
            console.error('1. Registration ID not found');
            console.error('2. Payment already confirmed');
            console.error('3. PAYMENT_TEST_MODE is not enabled in .env');
            console.error('');
            console.error('To enable test mode, add to .env:');
            console.error('  PAYMENT_TEST_MODE=true');
            process.exit(1);
        }

        const result = await response.json();

        console.log('='.repeat(70));
        console.log('✅ EMAIL SEQUENCE TRIGGERED');
        console.log('='.repeat(70));
        console.log('');
        console.log('Registration Details:');
        console.log(`   Registration ID: ${result.data.registrationId}`);
        console.log(`   Child Name: ${result.data.childName}`);
        console.log(`   Payment Status: ${result.data.paymentStatus}`);
        console.log('');

        console.log('📧 Expected Emails:');
        console.log('');
        console.log('Email 1 (Immediate):');
        console.log('   To: ' + (result.data.email || '[email from registration]'));
        console.log('   Subject: "🎉 Welcome to WombTo18 - Registration Successful!"');
        console.log('   Contains: Welcome message, payment details, invoice PDF');
        console.log('   Status: Should be sent now');
        console.log('');
        console.log('Email 2 (5 seconds later):');
        console.log('   To: ' + (result.data.email || '[email from registration]'));
        console.log('   Subject: "🌱 ' + result.data.childName + '\'s Go Green Participation Certificate"');
        console.log('   Contains: Tree planting message, certificate PDF');
        console.log('   Status: Will be sent in 5 seconds');
        console.log('');

        console.log('⏳ Waiting 6 seconds for both emails to be sent...');
        await new Promise(resolve => setTimeout(resolve, 6000));

        console.log('');
        console.log('='.repeat(70));
        console.log('✅ EMAIL SEQUENCE COMPLETE');
        console.log('='.repeat(70));
        console.log('');
        console.log('Next Steps:');
        console.log('1. Check backend logs for email sending confirmation:');
        console.log('   Look for: "✅ Welcome email with invoice sent"');
        console.log('   Look for: "✅ Go Green certificate sent"');
        console.log('');
        console.log('2. Check email inbox for both emails');
        console.log('   (If SMTP is configured in .env)');
        console.log('');
        console.log('3. If emails not received, check:');
        console.log('   - SMTP configuration in .env');
        console.log('   - Backend logs for errors');
        console.log('   - Spam/junk folder');
        console.log('');

    } catch (error) {
        console.error('');
        console.error('❌ Error triggering emails:');
        console.error(error.message);
        console.error('');
        process.exit(1);
    }
}

triggerTestEmails();
