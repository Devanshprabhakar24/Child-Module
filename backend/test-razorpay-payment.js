/**
 * Test script to verify Razorpay payment flow
 * 
 * This script helps test the payment verification endpoint
 * Usage: node test-razorpay-payment.js <registrationId>
 */

const crypto = require('crypto');

const RAZORPAY_KEY_SECRET = 'ew1iBL70jaPnfoNO5bHW2Nu4';
const API_BASE = 'http://localhost:8000';

async function testPaymentVerification(registrationId) {
    try {
        console.log('🔍 Testing payment verification for:', registrationId);

        // 1. Get registration details
        console.log('\n1️⃣ Fetching registration details...');
        const regResponse = await fetch(`${API_BASE}/registration/${registrationId}`);
        const regData = await regResponse.json();

        if (!regResponse.ok) {
            throw new Error(`Failed to fetch registration: ${regData.message}`);
        }

        const razorpayOrderId = regData.razorpayOrderId;
        console.log('✅ Order ID:', razorpayOrderId);
        console.log('   Payment Status:', regData.paymentStatus);

        // 2. Simulate a test payment
        console.log('\n2️⃣ Simulating test payment...');
        const testPaymentId = `pay_test_${Date.now()}`;

        // 3. Generate signature (for test mode, this is optional but good to test)
        const body = razorpayOrderId + '|' + testPaymentId;
        const signature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        console.log('   Payment ID:', testPaymentId);
        console.log('   Signature:', signature);

        // 4. Verify payment
        console.log('\n3️⃣ Verifying payment...');
        const verifyResponse = await fetch(`${API_BASE}/registration/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: testPaymentId,
                razorpay_signature: signature,
            }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyResponse.ok) {
            console.log('✅ Payment verified successfully!');
            console.log('   Registration ID:', verifyData.data.registrationId);
            console.log('   Payment Status:', verifyData.data.paymentStatus);

            // 5. Check final registration status
            console.log('\n4️⃣ Checking final registration status...');
            const finalRegResponse = await fetch(`${API_BASE}/registration/${registrationId}`);
            const finalRegData = await finalRegResponse.json();

            console.log('   Payment Status:', finalRegData.paymentStatus);
            console.log('   Payment ID:', finalRegData.razorpayPaymentId);
            console.log('   Go Green Cert Sent:', finalRegData.goGreenCertSent);

            console.log('\n🎉 Payment flow test completed successfully!');
        } else {
            console.error('❌ Payment verification failed:', verifyData);
        }

    } catch (error) {
        console.error('💥 Test failed:', error.message);
        console.error(error);
    }
}

// Get registration ID from command line
const registrationId = process.argv[2];

if (!registrationId) {
    console.error('❌ Please provide a registration ID');
    console.log('Usage: node test-razorpay-payment.js <registrationId>');
    process.exit(1);
}

testPaymentVerification(registrationId);
