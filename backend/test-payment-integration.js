/**
 * Razorpay Payment Integration Test Script
 * 
 * This script tests the complete payment flow:
 * 1. Create order
 * 2. Simulate payment
 * 3. Verify payment
 * 
 * Usage: node test-payment-integration.js <registrationId>
 */

const crypto = require('crypto');

const API_BASE = 'http://localhost:8000';
const RAZORPAY_KEY_SECRET = 'ew1iBL70jaPnfoNO5bHW2Nu4';

async function testPaymentIntegration(registrationId) {
    console.log('🧪 Testing Razorpay Payment Integration\n');
    console.log('═'.repeat(60));

    try {
        // STEP 1: Create Order
        console.log('\n📦 STEP 1: Creating Razorpay Order...');
        console.log('─'.repeat(60));

        const createOrderResponse = await fetch(`${API_BASE}/payments/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 999,
                registrationId: registrationId,
                childName: 'Test Child',
            }),
        });

        const orderData = await createOrderResponse.json();

        if (!orderData.success) {
            throw new Error(`Order creation failed: ${orderData.message}`);
        }

        console.log('✅ Order created successfully!');
        console.log(`   Order ID: ${orderData.data.orderId}`);
        console.log(`   Amount: ₹${orderData.data.amount / 100} (${orderData.data.amount} paise)`);
        console.log(`   Currency: ${orderData.data.currency}`);
        console.log(`   Key ID: ${orderData.data.keyId}`);

        // STEP 2: Simulate Payment
        console.log('\n💳 STEP 2: Simulating Payment...');
        console.log('─'.repeat(60));

        const orderId = orderData.data.orderId;
        const paymentId = `pay_test_${Date.now()}`;

        console.log(`   Simulated Payment ID: ${paymentId}`);

        // Generate signature (same as Razorpay does)
        const body = orderId + '|' + paymentId;
        const signature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        console.log(`   Generated Signature: ${signature.substring(0, 20)}...`);

        // STEP 3: Verify Payment
        console.log('\n🔍 STEP 3: Verifying Payment...');
        console.log('─'.repeat(60));

        const verifyResponse = await fetch(`${API_BASE}/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                razorpay_order_id: orderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature,
            }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyData.success) {
            throw new Error(`Payment verification failed: ${verifyData.message}`);
        }

        console.log('✅ Payment verified successfully!');
        console.log(`   Verified: ${verifyData.data.verified}`);
        console.log(`   Registration ID: ${verifyData.data.registrationId}`);
        console.log(`   Payment ID: ${verifyData.data.paymentId}`);

        // STEP 4: Check Registration Status
        console.log('\n📋 STEP 4: Checking Registration Status...');
        console.log('─'.repeat(60));

        const regResponse = await fetch(`${API_BASE}/registration/${registrationId}`);
        const regData = await regResponse.json();

        if (regData.success) {
            console.log('✅ Registration updated successfully!');
            console.log(`   Payment Status: ${regData.data.paymentStatus}`);
            console.log(`   Razorpay Order ID: ${regData.data.razorpayOrderId}`);
            console.log(`   Razorpay Payment ID: ${regData.data.razorpayPaymentId}`);
        }

        // SUCCESS
        console.log('\n' + '═'.repeat(60));
        console.log('🎉 ALL TESTS PASSED! Payment integration is working correctly.');
        console.log('═'.repeat(60));

    } catch (error) {
        console.error('\n' + '═'.repeat(60));
        console.error('❌ TEST FAILED:', error.message);
        console.error('═'.repeat(60));
        console.error('\nError details:', error);
        process.exit(1);
    }
}

// Get registration ID from command line
const registrationId = process.argv[2];

if (!registrationId) {
    console.error('❌ Please provide a registration ID');
    console.log('\nUsage: node test-payment-integration.js <registrationId>');
    console.log('Example: node test-payment-integration.js CHD-UP-20260320-000001');
    process.exit(1);
}

console.log(`Testing with Registration ID: ${registrationId}\n`);
testPaymentIntegration(registrationId);
