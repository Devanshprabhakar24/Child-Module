/**
 * Test script to verify payment email with invoice functionality
 * Run with: node test-payment-email.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testPaymentEmailFlow() {
    console.log('🧪 Testing Payment Email with Invoice Flow\n');

    try {
        // Step 1: Check test mode status
        console.log('1️⃣ Checking payment configuration...');
        const statusResponse = await axios.get(`${BASE_URL}/payments/test-mode-status`);
        console.log('✅ Payment Status:', statusResponse.data);
        console.log('');

        // Step 2: Create a test order
        console.log('2️⃣ Creating test payment order...');
        const orderData = {
            registrationId: `TEST-${Date.now()}`,
            childName: 'Test Child'
        };

        const orderResponse = await axios.post(`${BASE_URL}/payments/create-order`, orderData);
        console.log('✅ Order Created:', orderResponse.data);
        console.log('');

        if (statusResponse.data.testMode) {
            console.log('🎯 Test Mode Active: Invoice should be generated immediately');
            console.log('📧 Check email for payment confirmation with PDF attachment');
            console.log('');

            // Step 3: Try to download the invoice
            console.log('3️⃣ Attempting to download invoice...');
            try {
                const invoiceResponse = await axios.get(
                    `${BASE_URL}/payments/${orderData.registrationId}/invoice`,
                    { responseType: 'arraybuffer' }
                );

                if (invoiceResponse.data.byteLength > 0) {
                    console.log(`✅ Invoice PDF generated (${invoiceResponse.data.byteLength} bytes)`);
                } else {
                    console.log('❌ Invoice PDF is empty');
                }
            } catch (invoiceError) {
                console.log('⚠️ Invoice not yet available:', invoiceError.response?.data || invoiceError.message);
            }
        } else {
            console.log('🔄 Production Mode: Webhook required for invoice generation');
            console.log('💡 Simulate webhook or complete actual payment to test email');
        }

        console.log('');
        console.log('✅ Test completed successfully!');
        console.log('');
        console.log('📋 What to verify:');
        console.log('   • Email received with payment confirmation');
        console.log('   • PDF invoice attached to email');
        console.log('   • Invoice contains correct payment details');
        console.log('   • Professional formatting and branding');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testPaymentEmailFlow();