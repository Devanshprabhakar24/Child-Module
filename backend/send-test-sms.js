/**
 * Script to send a test SMS
 * Usage: node send-test-sms.js <phone_number> [message]
 */

require('dotenv').config();

const API_BASE = process.env.APP_BASE_URL || 'http://localhost:8000';

async function sendTestSms() {
    try {
        console.log('📱 WombTo18 - Send Test SMS');
        console.log('='.repeat(70));
        console.log('');

        // Get phone number from command line or use default
        const phoneNumber = process.argv[2];
        const customMessage = process.argv.slice(3).join(' ');

        if (!phoneNumber) {
            console.log('❌ Please provide a phone number');
            console.log('');
            console.log('Usage:');
            console.log('  node send-test-sms.js <phone_number> [custom_message]');
            console.log('');
            console.log('Examples:');
            console.log('  node send-test-sms.js 9876543210');
            console.log('  node send-test-sms.js +919876543210 "Hello from WombTo18!"');
            console.log('  node send-test-sms.js 9876543210 "Test message"');
            console.log('');
            process.exit(1);
        }

        console.log(`📋 Phone Number: ${phoneNumber}`);
        console.log('');

        // Check Twilio configuration
        const twilioSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

        console.log('🔍 Checking Twilio Configuration:');
        if (twilioSid && twilioToken && twilioPhone) {
            console.log('   ✅ TWILIO_ACCOUNT_SID: Configured');
            console.log('   ✅ TWILIO_AUTH_TOKEN: Configured');
            console.log(`   ✅ TWILIO_PHONE_NUMBER: ${twilioPhone}`);
            console.log('');
        } else {
            console.log('   ❌ Twilio is NOT configured!');
            console.log('');
            console.log('To enable SMS sending, add to .env:');
            console.log('   TWILIO_ACCOUNT_SID=your_account_sid');
            console.log('   TWILIO_AUTH_TOKEN=your_auth_token');
            console.log('   TWILIO_PHONE_NUMBER=+18392187843');
            console.log('');
            console.log('Get your credentials from: https://console.twilio.com/');
            console.log('');
            process.exit(1);
        }

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

        // Prepare message
        const message = customMessage || `Hello! This is a test SMS from WombTo18. Your child health tracking platform. Visit wombto18.com`;

        console.log('📤 Sending SMS...');
        console.log(`   To: ${phoneNumber}`);
        console.log(`   Message: ${message}`);
        console.log('');

        // Use Twilio directly
        const twilio = require('twilio');
        const client = new twilio(twilioSid, twilioToken);

        // Format phone number
        let formattedPhone = phoneNumber.replace(/\D/g, '');
        if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
            formattedPhone = `+91${formattedPhone}`;
        } else if (formattedPhone.startsWith('91')) {
            formattedPhone = `+${formattedPhone}`;
        } else {
            formattedPhone = `+${formattedPhone}`;
        }

        console.log(`   Formatted: ${formattedPhone}`);
        console.log('');

        const result = await client.messages.create({
            body: message,
            from: twilioPhone,
            to: formattedPhone,
        });

        console.log('='.repeat(70));
        console.log('✅ SMS SENT SUCCESSFULLY!');
        console.log('='.repeat(70));
        console.log('');
        console.log('Message Details:');
        console.log(`   SID: ${result.sid}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   To: ${result.to}`);
        console.log(`   From: ${result.from}`);
        console.log(`   Date: ${result.dateCreated}`);
        console.log('');
        console.log('Check your phone for the SMS!');
        console.log('');
        console.log('Note: SMS delivery may take a few seconds to a minute.');
        console.log('');

    } catch (error) {
        console.error('');
        console.error('❌ Failed to send SMS:');
        console.error(`   ${error.message}`);
        console.error('');

        if (error.code) {
            console.error(`Twilio Error Code: ${error.code}`);
            console.error('');

            // Common error codes
            if (error.code === 21211) {
                console.error('Invalid phone number format.');
                console.error('Make sure the number is in correct format: +919876543210');
            } else if (error.code === 21608) {
                console.error('The phone number is not verified with Twilio.');
                console.error('For trial accounts, you need to verify the number first.');
                console.error('Visit: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
            } else if (error.code === 20003) {
                console.error('Authentication failed. Check your Twilio credentials.');
            }
            console.error('');
        }

        process.exit(1);
    }
}

sendTestSms();
