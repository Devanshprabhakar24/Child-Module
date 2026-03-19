/**
 * Test script to register a new child and verify both emails are sent immediately
 */

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testNewRegistration() {
    console.log('🧪 Testing new registration with immediate email sending...\n');

    const registrationData = {
        childName: 'Test Child 2',
        childGender: 'FEMALE',
        dateOfBirth: '2023-06-20', // 2 years old
        state: 'MH', // Maharashtra
        motherName: 'Test Mother 2',
        fatherName: 'Test Father 2',
        email: 'test2.registration@wombto18.org', // Different email
        phone: '+919777777777',
        address: 'Test Address, Mumbai',
    };

    try {
        console.log('📝 Registering new child...');
        console.log(`   Child: ${registrationData.childName}`);
        console.log(`   Mother: ${registrationData.motherName}`);
        console.log(`   Email: ${registrationData.email}`);
        console.log(`   Phone: ${registrationData.phone}\n`);

        const response = await fetch('http://localhost:8000/registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registrationData),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Registration failed:', error);
            return;
        }

        const result = await response.json();

        console.log('✅ Registration successful!');
        console.log(`   Registration ID: ${result.data.registrationId}`);
        console.log(`   Payment Status: ${result.data.paymentStatus}`);
        console.log(`   Test Mode: ${result.data.testMode}`);
        console.log(`   Green Cohort: ${result.data.greenCohort}\n`);

        console.log('📧 Both emails should be sent immediately:');
        console.log('   1. Welcome + Payment Invoice PDF (immediate)');
        console.log('   2. Go Green Certificate PDF (immediate - no delay)\n');

        console.log('📬 Check your email inbox at: test2.registration@wombto18.org');
        console.log('   (Also check spam/junk folder)\n');

        console.log('🔍 Check backend logs for:');
        console.log('   - "📧 Sending Email 1: Welcome + Invoice"');
        console.log('   - "✅ Email 1 sent: Welcome + Invoice"');
        console.log('   - "📧 Sending Email 2: Go Green Certificate"');
        console.log('   - "✅ Email 2 sent: Go Green Certificate"');
        console.log('   - "🎉 Both emails sent and all services activated"');
        console.log('\n⚠️  NOTE: Registration confirmation email has been REMOVED');
        console.log('   Only 2 emails will be sent (not 3)\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testNewRegistration();
